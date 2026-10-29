Vassallo Developments - trade card imagery
==========================================

IMPORTANT: these seven images are AI GENERATED, not photographs of Vassallo
projects. They were made with Higgsfield (Recraft V4.1, 2k, 4:3) on
2026-09-28 (cleaning.webp on 2026-10-29) and are placeholders standing in
for real project photography.

The section they sit in is headed "What we offer" and carries the note
"Images are illustrative, not photographs of our projects", so they do not
claim past work. Genuine photographs of completed Vassallo jobs would still
be better, and swapping them in needs no code change (see below).

To replace one, drop a 4:3 image in at the same filename and the card picks
it up with no code change. Exported at 1100x811 WebP, quality 82, which is
about 2.6x the rendered card width of roughly 420px:

  full-refurbs.webp    interior stripped back, studwork and bare brick
  minor-works.webp     an oak shelf being fitted level into an alcove
  windows-doors.webp   new window and painted timber door in a brick facade
  roofing.webp         new slate courses, chimney stack and flashing
  bathrooms.webp       finished bathroom, stone tile and brass brassware
  kitchens.webp        finished kitchen, handleless units and brass tap
  cleaning.webp        freshly cleaned empty room, polished floor, mop bucket
                       (graded after generation to match the other six:
                       lifted, desaturated and warmed)

Each card keeps its line drawing behind the photograph, so if an image ever
fails to load the card shows the icon rather than an empty box. That is why
the coming soon cards are veiled with a pseudo element over the photograph
rather than by lowering the photograph's opacity: lowering it let the icon
behind ghost through.

Total weight of all seven: about 485KB.


Logo
----
The official wordmark, supplied by the client as a JPEG on white and cut
here to transparent PNG so it sits on any ground:

  logo.png            full lockup, wordmark over the Acquisition | Design |
                      Development line. Used in the nav and the footer.
  logo-wordmark.png   wordmark only. Not currently used: the nav carries the
                      full lockup by request. Kept in case a compact mark is
                      wanted somewhere later.
  favicon-32.png      the V of the wordmark, taken from the artwork itself
  favicon-180.png     same, for apple-touch-icon

The artwork is black on transparency and is inverted by CSS wherever it sits
on a dark ground: either theme's dark mode, and the nav while it is over the
intro film. Both cases want the same invert(1), so there is no cancelling.

The V was isolated by hand: the V and A of VASSALLO interlock with no gap
between them, so a plain bounding box picks up "VA". The crop follows the
V's right stroke down to its apex.

If a vector version of the logo exists, an SVG would be better than these
PNGs: sharper at every size, and it could take the brass accent on hover.
