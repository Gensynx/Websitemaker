# Deploying Coveworks to IONOS (coveworks.tech)

**The live build is `coveworks-lab/`**, the five page Lab edition with the configurator
(preview: https://gensynx.github.io/Websitemaker/coveworks-lab/). It replaced the single
file sci-fi edition that went live in July 2026.

## 1. Make the upload package

```
python3 coveworks-lab/sitegen/package.py
```

This writes `dist/coveworks-lab-upload.zip` (about 6 MB): the five pages, the `assets/`
folder and `.htaccess`, laid out to sit at the root of the webspace. Notes, credits and
the `sitegen/` scripts are left out.

## 2. Upload it

**IONOS File Manager (no software needed):** Menu, Hosting, **File Manager**.

1. Open the folder the domain points at (Domains & SSL shows it; it is `/` unless it was changed).
2. Upload the zip and use **Extract** on it, or unzip it on your computer and upload the
   contents. Either way, `index.html` and the `assets` folder must end up directly in that
   folder, not inside a `coveworks-lab-upload` subfolder.
3. Allow it to overwrite the old `index.html` and `.htaccess`. The July site was that one
   `index.html`, so nothing else needs deleting. `.htaccess` is a hidden file; turn on
   "show hidden files" if you cannot see it.
4. Delete the zip from the webspace once extracted.

**SFTP (FileZilla, Cyberduck):** the credentials are under Hosting, **SFTP & SSH**
(usually `access-ssh.ionos.co.uk`, port 22). Unzip locally and drag the contents into the
domain's folder.

## 3. Check it

- Hard refresh https://coveworks.tech (Ctrl or Cmd + Shift + R). The headline should read
  "The web, made to measure."
- Open the configurator, type "gamer site", and check a preview builds.
- `http://coveworks.tech` should redirect to `https://` (the `.htaccess` does this).
- Every contact button opens an email to `sales@coveworks.tech`: create that mailbox under
  IONOS, Email, or messages will bounce.
- Check on a phone.

## Updating the site later

Edit `coveworks-lab/sitegen/build.py` (pages) or `coveworks-lab/assets/` (styles, scripts,
images), run `python3 coveworks-lab/sitegen/build.py`, then repeat steps 1 and 2. Uploading
only the files you changed also works.

## Notes

- Each page carries a canonical link and share tags pointing at coveworks.tech, so search
  engines treat the GitHub Pages copy as a preview, and links shared on social media show
  `assets/gen/lab-cover.jpg`.
- `.htaccess` also sets browser caching: images and fonts for 30 days to a year, pages
  always fresh.
