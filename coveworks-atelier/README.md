# Coveworks · Atelier edition

A new look for the Coveworks studio site, built around the studio's own line: *the web, made to measure*. The page is dressed as a tailor's atelier, and its centrepiece is the **fitting room**, where a visitor cuts a demo website for their own business and sends it to the studio as a brief.

One self contained file (`index.html`, about 0.9 MB, with fonts and work captures embedded). Same studio words as the flagship.

## The look
- Pattern paper, ink and one chalk red. Bodoni Moda for display (a high contrast fashion house serif), Archivo for text, JetBrains Mono for measurements and labels
- A tape measure runs down the left edge on desktop and slides with the page; a chalk marker reads out where you are in centimetres
- The hero headline carries a technical drawing dimension line ("Made to measure · 1 : 1") that draws itself in
- The work section is an index, not a card grid: a preview of each site trails the pointer, and each row opens with the story and a live link
- The fitting room sits on one centimetre pattern paper, introduced by a dashed "cut along the line"
- Process is a ruler with four fittings marked on it; the studio statement is set large on ink
- No custom cursor, no gradients, no glow. Motion is limited to mask reveals, the drawn dimension line, the tape and the stitch lines, and all of it respects reduced motion settings

## The fitting room
Visitors are welcomed into it from the hero ("Begin your fitting · what is your business called?") or the Book a fitting button.

1. **Name**: appears on the demo's logo, copy, footer and web address
2. **Trade**: restaurant, clinic, property, car hire, trades, boutique or professional services. Each comes with its own written copy, call to action, services, prices, questions and photography labels
3. **Cloth**: four curated looks, Savile (ivory, serif), Noir (black, bold capitals), Linen (warm sand, soft corners, italic) and Clean (white, crisp, colour led)
4. **Colour**: six accents
5. **Sections**: about, services, gallery, reviews, prices, questions and contact, switched on or off and reordered; the preview scrolls to the section you change and outlines it
6. **Headline**: optional, replaces the trade's headline

The live preview renders a full width desktop site (1280 px, scaled to fit) or a phone cut (390 px). Photography slots are labelled placeholders, and the review is marked as a sample.

**Copy link** encodes the whole fitting into the address (`?fit=`), so it reopens exactly. **Send this fitting** opens the visitor's own email app with the brief written out (trade, cloth, colour, sections in order, headline and the link) addressed to `hello@coveworks.studio`. Nothing is stored anywhere.

## Content notes
- `hello@coveworks.studio` must exist (or be replaced throughout `index.html`) before go live; both the fitting room and the contact form send to it
- The work list carries every real build in the repo; London's Aesthetics Academy shows as a private preview until it goes live
- Copy is dash free by request

## Deploy
Any static host. On GitHub Pages it lives at `/Websitemaker/coveworks-atelier/` once merged to `main`.
