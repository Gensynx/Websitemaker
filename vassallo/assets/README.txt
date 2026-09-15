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

vassallo-transformation-vertical.mp4  (OPTIONAL)
  9:16 reframe for phones (Higgsfield's "reframe" tool can make it from the
  wide clip, ~remaining credits permitting). If present, portrait phones use
  it automatically; if absent they fall back to the wide clip.
