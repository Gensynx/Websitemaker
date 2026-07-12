Vassallo Developments — video assets
====================================

vassallo-transformation.mp4  (ADD THIS FILE — required for reliable hosting)
  The 12s Higgsfield (Kling 3.0) shot: derelict townhouse rebuilt floor by
  floor, ending on the new front door closing. Download it from:
  https://d8j0ntlcm91z4.cloudfront.net/user_3GMvo3e1s3xJXyaDvyljaVxMslN/hf_20260712_231517_788a0cb5-0f4c-40ab-bbf1-8b80c0e08f66.mp4
  (also in your Higgsfield account under Generations, 2026-07-12)
  Save it here as vassallo-transformation.mp4. Until the file exists the site
  streams it straight from the Higgsfield CDN — fine for previewing, but that
  URL can expire, so commit the file before real launch.

  For the smoothest scroll-scrubbing, re-encode it all-intra first
  (every frame a keyframe — same treatment as the Dar Ul Amir intro):
    ffmpeg -i downloaded.mp4 -an -c:v libx264 -g 1 -pix_fmt yuv420p \
      -crf 21 -preset slow -movflags +faststart vassallo-transformation.mp4

vassallo-transformation-vertical.mp4  (OPTIONAL)
  9:16 reframe for phones (Higgsfield's "reframe" tool can make it from the
  wide clip, ~remaining credits permitting). If present, portrait phones use
  it automatically; if absent they fall back to the wide clip.
