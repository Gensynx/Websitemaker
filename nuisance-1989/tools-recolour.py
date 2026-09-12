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

SRC = "Screenshot 2026-09-12 122943.png"
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

# --- the printed wordmark: dark ink, in the band where the print actually is
band = (yy > H*0.37) & (yy < H*0.56) & (xx > W*0.405) & (xx < W*0.715)
local = ndimage.uniform_filter(lum, size=61)          # cloth brightness nearby
ink = solid & band & (lum < local*0.62)
ink = ndimage.binary_closing(ink, np.ones((3, 3)))
lab2, n2 = ndimage.label(ink)
if n2:
    s2 = ndimage.sum(ink, lab2, range(1, n2+1))
    ink = np.isin(lab2, [i+1 for i, v in enumerate(s2) if v >= 55])
print(f"print mask          {ink.sum():>8,} px  ({n2} components found)")

g_soft = np.asarray(Image.fromarray((solid*255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(1.6))).astype(np.float32)/255.0
p_soft = np.asarray(Image.fromarray((ink*255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255.0

cl = solid & ~ink
p3, p97 = np.percentile(lum[cl], 3), np.percentile(lum[cl], 97)
LO, HI = 0.032, 0.215
t = np.clip((lum - p3) / max(p97 - p3, 1e-6), 0, 1)
print(f"cloth luminance     {p3:.3f}..{p97:.3f}  ->  {LO:.3f}..{HI:.3f}")

TINT = np.array([1.00, 0.985, 0.95])
INK  = np.array([0.929, 0.906, 0.859])
dark = np.clip((LO + t*(HI-LO))[..., None] * TINT, 0, 1)

out = a*(1-g_soft[..., None]) + dark*g_soft[..., None]
out = out*(1-p_soft[..., None]) + INK*p_soft[..., None]
rng = np.random.default_rng(1989)
out = np.clip(out + rng.normal(0, 0.009, out.shape)*g_soft[..., None], 0, 1)

Image.fromarray((out*255).astype(np.uint8)).save("tee-asphalt-back.jpg", quality=93)
im.save("look-01.jpg", quality=93)
im.save("tee-bone-back.jpg", quality=93)

SC = "/tmp/claude-0/-home-user-Websitemaker/968dd78d-823a-50e1-8c57-38bfbf455297/scratchpad/"
ov = a.copy(); ov[..., 1] = np.clip(ov[..., 1] + solid*0.45, 0, 1); ov[..., 0] = np.clip(ov[..., 0] + ink*0.9, 0, 1)
Image.fromarray((ov*255).astype(np.uint8)).save(SC+"mask-check.png")
Image.fromarray((out*255).astype(np.uint8)).save(SC+"recolour-check.png")
print("wrote               tee-asphalt-back.jpg, tee-bone-back.jpg, look-01.jpg")
