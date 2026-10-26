Vassallo Developments — video assets
====================================

vassallo-transformation.mp4  (COMMITTED — the site serves this file directly)
  The 12s Higgsfield (Cinema Studio) story shot: into the derelict house,
  through the decayed hallway and living room, then gliding back out as every
  room renovates itself around the camera, ending with the new front door
  closing on a fully repaired, pristine facade (end frame pinned to a
  generated photo so no exterior damage remains).
  Encoded all-intra (every frame a keyframe) at 1280x720 so scroll-scrubbing
  lands instantly on any frame. Source generation is in your Higgsfield
  account under Generations, 2026-07-13.

  To replace it later, re-encode the same way for smooth scrubbing:
    ffmpeg -i downloaded.mp4 -an -c:v libx264 -g 1 -pix_fmt yuv420p \
      -crf 20 -preset slow -movflags +faststart vassallo-transformation.mp4

vassallo-transformation-mobile.mp4  (COMMITTED, phones and narrow windows)
  The same film compressed normally (keyframe every 2 s, CRF 25): 2.8 MB
  against 11 MB, SSIM 0.983 against the all-intra file. Phones play the film
  straight through rather than scrubbing it, so they do not need a keyframe
  on every frame. index.html picks it with a media query on its <source>.
    ffmpeg -i vassallo-transformation.mp4 -an -c:v libx264 -preset slow \
      -crf 25 -g 48 -keyint_min 24 -pix_fmt yuv420p -profile:v high \
      -level 4.0 -movflags +faststart vassallo-transformation-mobile.mp4

vassallo-transformation-vertical.mp4  (OPTIONAL)
  9:16 reframe for phones (Higgsfield's "reframe" tool can make it from the
  wide clip, ~remaining credits permitting). If present, portrait phones use
  it automatically; if absent they fall back to the wide clip.
