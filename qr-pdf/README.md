# QR to PDF (`qr-pdf/`)

A tool page that generates a QR code pointing at a PDF, plus an optional landing page the code
can point at instead of the raw file. Static, self-contained, no build step and no network calls —
the QR encoder is written from scratch in `qr.js`.

Open `qr-pdf/index.html` directly, or serve the repo root.

## The two ways to use it

**The PDF is already online.** Paste its address. Style the code, download it. Done — nothing
needs to live in this repo.

**You want to host the PDF here.** Drop the file into `qr-pdf/pdfs/`, commit, push. The tool
builds the address for you from the site's published location and the file name, e.g.
`https://gensynx.github.io/Websitemaker/qr-pdf/pdfs/spring-menu.pdf`.

A QR code carries an address, not a file, so the PDF has to be reachable from a phone. A path on
your own computer (`file:///Users/…`) will not work for anyone else.

## Direct link or landing page

A code can point straight at the PDF, or at `view.html?f=spring-menu.pdf&t=Spring%20menu`, which
shows a title, a preview on desktop, and Open/Download buttons. The landing page reads better on
a phone, where a raw PDF often opens in a bare viewer with no context.

`view.html` only ever opens PDFs sitting in `pdfs/` next to it — the file name is validated, so a
doctored link cannot turn it into a redirect to somewhere else.

## Replacing a PDF later

Keep the file name the same and overwrite the file. Every code already printed keeps working,
because the address has not changed. This is the main reason to think about the file name before
you print a few hundred of them.

## Output

- **PNG** — about 1600px across, enough for print and small enough to email.
- **SVG** — vector, for anything going to a real printer or being scaled up.
- **Print poster** — a full-page sheet with a heading, the code and the address underneath.
  Uses the browser print dialogue, so "Save as PDF" gets you a poster file.

The caption, if you set one, is baked into the PNG and SVG.

## Style options and what actually scans

Square modules are the safest. Rounded and dot styles keep the three finder squares solid, which
is what scanners look for first, but they still remove ink — check them before committing to a
print run.

The tool warns when contrast is thin, and when the code is lighter than its background (most
scanners refuse inverted codes). Error correction L through H trades size for damage tolerance;
the encoder quietly upgrades the level for free whenever the data still fits at the same version.

**Scan every code with a real phone before printing it.** Pale colours, dark backgrounds and
tight crops are what fail in the wild, and they all look fine on screen.

## Files

```
index.html   the tool
view.html    optional landing page a code can point at
qr.js        QR encoder — byte mode, versions 1-40, all four correction levels
pdfs/        put PDFs here
```

`qr.js` was verified against a reference decoder across all 40 versions and all four error
correction levels, at full capacity, half capacity and minimum payload.
