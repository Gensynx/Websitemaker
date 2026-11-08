"""Zip Coveworks Lab for upload to the IONOS webspace behind coveworks.tech.

    python3 coveworks-lab/sitegen/package.py

Writes dist/coveworks-lab-upload.zip at the repository root (dist/ is gitignored):
the five pages, assets/ and .htaccess, laid out to sit at the root of the webspace.
README, CREDITS and this sitegen folder stay out.
"""
import os, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'dist', 'coveworks-lab-upload.zip')
PAGES = ['index.html', 'work.html', 'configurator.html', 'studio.html', 'contact.html', '.htaccess']

os.makedirs(os.path.dirname(OUT), exist_ok=True)
n = 0
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in PAGES:
        z.write(os.path.join(ROOT, p), p); n += 1
    for base, _dirs, files in os.walk(os.path.join(ROOT, 'assets')):
        for f in sorted(files):
            if f.endswith('.txt'):
                continue
            full = os.path.join(base, f)
            z.write(full, os.path.relpath(full, ROOT)); n += 1
print('wrote', os.path.relpath(OUT, os.path.dirname(ROOT)), n, 'files', os.path.getsize(OUT) // 1024, 'KB')
