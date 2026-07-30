# PDFs served here

Put PDFs in this folder, commit and push. Once the site redeploys, each one is live at:

```
https://gensynx.github.io/Websitemaker/qr-pdf/pdfs/<file-name>.pdf
```

Then generate a code for it with `../index.html`.

## Naming

Lower case, hyphens instead of spaces, no accents: `spring-menu.pdf`, `price-list-2026.pdf`.
Spaces survive in a URL but are easy to mistype and ugly in print.

**Pick the name carefully and keep it.** Printed codes point at an address, so replacing the
PDF under the same name updates every code already in the wild. Renaming the file breaks them all.

## Size

Anything over about 10 MB is a slow download on mobile data. Compress before committing if you can.
