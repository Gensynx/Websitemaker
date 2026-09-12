# Nuisance 1989 — image slots

Drop files in here using the **exact filenames** below. Each slot layers over the drawn SVG flat;
if a file is absent the `<img>` removes itself and the flat shows through, so the site never breaks
and you can add photography one piece at a time.

## Product tiles — 2000 × 2500 px (4:5), JPG

| Filename | Shot |
|---|---|
| `tee-bone-front.jpg` | Bone tee, front, flat lay or ghost mannequin |
| `tee-bone-back.jpg` | Bone tee, back print — **in place** (your on-body shot, story dots cropped) |
| `tee-asphalt-front.jpg` | Black tee, front |
| `tee-asphalt-back.jpg` | Black tee, back print — **in place** (recoloured from the bone shot, see below) |
| `hoodie-bone-front.jpg` | Bone hoodie, front |
| `hoodie-bone-back.jpg` | Bone hoodie, back print |
| `hoodie-asphalt-front.jpg` | Black hoodie, front |
| `hoodie-asphalt-back.jpg` | Black hoodie, back print |

Front is the tile at rest; back is revealed on hover. Shoot both on the same background at the same
distance or the hover swap will jump.

## Lookbook

| Filename | Size | Shot |
|---|---|---|
| `look-01.jpg` | 2000 × 2500 (4:5) | On-body back print — **in place** (777 × 894, under half the target resolution) |
| `look-02.jpg` | 1600 × 1280 (5:4) | Flat lay, bone tee |
| `look-03.jpg` | 1600 × 1280 (5:4) | The ring, Ladbroke Grove |

## Shooting notes

- Supply at **2× display size**. A 400 px tile wants an 800 px+ file; these numbers already account
  for that.
- Product tiles crop with `object-fit: cover`, so leave headroom — anything within ~8% of the frame
  edge can be cut on narrow screens.
- Keep one background for the whole product grid. Mixed backgrounds across tiles is the single
  fastest way to make a drop look like a reseller listing rather than a brand.

## The black colourway — how `tee-asphalt-back.jpg` was made

Regenerate it with `python3 tools-recolour.py` from the site folder (needs `pillow numpy scipy`).

The photograph is lit from one side at night, so the garment spans luminance 0.11 in the shadowed
left to 0.76 on the lit right — no single brightness threshold holds both. Saturation separates it
instead: cloth sits at 0.06–0.28, skin and foliage at 0.46–1.00. So the script seeds on the clearly
lit cloth, grows that seed through anything unsaturated enough to be cotton, then remaps the
garment's own tonal range (0.22–0.68) into a dark one (0.03–0.22) so the folds survive rather than
crushing to a flat slab. The printed wordmark is masked separately and re-rendered in bone, because
on a black tee it is a different ink, not the same ink darkened. Fine grain is added over the
recoloured area so it sits in the same photograph as the background.

**It is a mock-up asset, not a product shot.** It is derived from a 777 px screenshot, the mask
edge against the bag at lower left is slightly blocky, and no customer should be sold a black tee
on the strength of a recoloured photo of a white one. Shoot the real black piece before launch.
