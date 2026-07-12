Two scroll-scrubbed intro clips, both all-intra (a keyframe on every frame) so
scrubbing can seek to any position and decode one frame instantly:

  darulamir-intro.mp4           2560x1440 (16:9)  — desktop / landscape
  darulamir-intro-vertical.mp4   720x1280 (9:16)  — portrait phones

index.html loads the vertical cut on portrait/narrow viewports; object-fit:cover
fills the screen on each. Keep both all-intra when replacing them.
