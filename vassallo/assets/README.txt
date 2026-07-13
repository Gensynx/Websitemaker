Vassallo Developments — video assets
====================================

vassallo-transformation.mp4  (ADD THIS FILE — required for reliable hosting)
  The 12s Higgsfield (Cinema Studio) story shot: into the derelict house,
  through the decayed hallway and living room, then gliding back out as every
  room renovates itself around the camera, ending with the new front door
  closing on a fully repaired, pristine facade (end frame pinned to a
  generated photo so no exterior damage remains). Download it from:
  https://d8j0ntlcm91z4.cloudfront.net/user_3GMvo3e1s3xJXyaDvyljaVxMslN/hf_20260713_000341_dcf6480a-2ead-433e-bcb2-3c775ad56ff7.mp4
  (also in your Higgsfield account under Generations, 2026-07-13)
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
