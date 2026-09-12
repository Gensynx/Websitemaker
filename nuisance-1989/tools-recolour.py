"""
Recolour the bone tee to asphalt without flattening the cloth.

The photograph is lit from one side at night, so the garment spans val 0.11
(shadowed left) to 0.76 (lit right) and no single brightness threshold holds
both. Saturation is the reliable separator instead: cloth sits at 0.06-0.28
while skin and foliage sit at 0.46-1.00. So: seed on the clearly-lit cloth,
grow that seed through anything unsaturated enough to be cotton, then remap
the garment's own tonal range into a dark one so the folds survive. The print
is masked separately and re-rendered light, because on a black tee it is a
different ink, not the same ink darkened.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC = "source/tee-bone-onbody-master.png"
im = Image.open(SRC).convert("RGB")
im = im.crop((0, 0, im.size[0], im.size[1] - 26))     # strip the story dots
W, H = im.size
a = np.asarray(im).astype(np.float32) / 255.0
print(f"source              {W}x{H}")

mx, mn = a.max(2), a.min(2)
val = mx
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
lum = 0.2126*a[..., 0] + 0.7152*a[..., 1] + 0.0722*a[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
box = (yy > H*0.26) & (yy < H*0.995) & (xx > W*0.16) & (xx < W*0.90)

seed    = (val > 0.46) & (sat < 0.18) & box
allowed = (val > 0.17) & (sat < 0.40) & box
seed = ndimage.binary_opening(seed, np.ones((5, 5)))
lab, n = ndimage.label(seed)
if not n:
    raise SystemExit("no seed found")
seed = (lab == int(np.argmax(ndimage.sum(seed, lab, range(1, n+1)))) + 1)
print(f"seed                {seed.sum():>8,} px  ({100*seed.mean():.1f}%)")

grown = ndimage.binary_propagation(seed, mask=allowed)
grown = ndimage.binary_closing(grown, np.ones((15, 15)))
solid = ndimage.binary_fill_holes(grown)
lab, n = ndimage.label(solid)
solid = (lab == int(np.argmax(ndimage.sum(solid, lab, range(1, n+1)))) + 1)
solid = ndimage.binary_fill_holes(solid)
print(f"garment after grow  {solid.sum():>8,} px  ({100*solid.mean():.1f}% of frame)")

# --- the printed wordmark -------------------------------------------------
# A binary threshold destroys this. The strokes are thin and anti-aliased at
# 777 px, so any hard cut eats the serifs and a component-size filter deletes
# parts of the digits. Instead take a CONTINUOUS alpha from how much darker
# each pixel is than the cloth around it: cloth -> 0, ink core -> 1, and the
# anti-aliased edge lands in between exactly as the camera recorded it.
band = (yy > H*0.36) & (yy < H*0.57) & (xx > W*0.395) & (xx < W*0.725)
local = ndimage.uniform_filter(lum, size=75)          # cloth brightness nearby
depth = np.clip((local - lum) / np.maximum(local*0.55, 1e-6), 0, 1)
depth = np.where(solid & band, depth, 0.0)

# A crease is also darker than its surround, so depth alone paints the folds as
# ink — that was the streaking. Ink bottoms out at luminance 0.03-0.07 while a
# crease only reaches 0.22-0.35, so gate the depth term with an absolute
# darkness term. Both are continuous, so anti-aliased stroke edges survive.
depth_t = np.clip((depth - 0.55) / 0.40, 0, 1)
lum_t   = np.clip((0.24 - lum) / 0.16, 0, 1)
p_soft  = ndimage.gaussian_filter(depth_t * lum_t, 0.45)
p_soft  = np.clip(p_soft * 1.25, 0, 1)
cover = float((p_soft > 0.5).sum())
print(f"print alpha         {cover:>8,.0f} px above 0.5   mean {p_soft[band].mean():.3f}")

g_soft = np.asarray(Image.fromarray((solid*255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(1.6))).astype(np.float32)/255.0

cl = solid & (p_soft < 0.25)
p3, p97 = np.percentile(lum[cl], 3), np.percentile(lum[cl], 97)
LO, HI = 0.032, 0.215
t = np.clip((lum - p3) / max(p97 - p3, 1e-6), 0, 1)
print(f"cloth luminance     {p3:.3f}..{p97:.3f}  ->  {LO:.3f}..{HI:.3f}")

TINT = np.array([1.00, 0.985, 0.95])
INK  = np.array([0.929, 0.906, 0.859])
dark = np.clip((LO + t*(HI-LO))[..., None] * TINT, 0, 1)

shade = np.clip(0.72 + 0.55*t, 0.55, 1.12)[..., None]   # the fold the print lies on
out = a*(1-g_soft[..., None]) + dark*g_soft[..., None]
out = out*(1-p_soft[..., None]) + np.clip(INK*shade, 0, 1)*p_soft[..., None]
rng = np.random.default_rng(1989)
out = np.clip(out + rng.normal(0, 0.009, out.shape)*g_soft[..., None], 0, 1)

Image.fromarray((out*255).astype(np.uint8)).save("images/tee-asphalt-back.jpg", quality=93)
im.save("images/look-01.jpg", quality=93)
im.save("images/tee-bone-back.jpg", quality=93)

SC = "/tmp/claude-0/-home-user-Websitemaker/968dd78d-823a-50e1-8c57-38bfbf455297/scratchpad/"
ov = a.copy(); ov[..., 1] = np.clip(ov[..., 1] + solid*0.45, 0, 1); ov[..., 0] = np.clip(ov[..., 0] + p_soft*0.9, 0, 1)
Image.fromarray((ov*255).astype(np.uint8)).save(SC+"mask-check.png")
Image.fromarray((out*255).astype(np.uint8)).save(SC+"recolour-check.png")
print("wrote               tee-asphalt-back.jpg, tee-bone-back.jpg, look-01.jpg")
