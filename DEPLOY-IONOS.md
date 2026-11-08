# Deploying Coveworks to IONOS (coveworks.tech)

**The live build is `coveworks-lab/`**, the five page Lab edition with the configurator
(preview: https://gensynx.github.io/Websitemaker/coveworks-lab/). It replaced the single
file sci-fi edition that went live in July 2026.

## 1. Make the upload package

```
python3 coveworks-lab/sitegen/package.py
```

This stages the whole webspace in `dist/site/` and zips it to `dist/coveworks-lab-upload.zip`
(about 50 MB, most of it the Dar Ul Amir intro films):

- `/`: the five Lab pages, `assets/` and `.htaccess`
- `/work/<slug>/`: a copy of every site in the work list (Vassallo, Dar Ul Amir and the
  five fictional brand sites), which the work list links to. `work/.htaccess` keeps them
  out of search results.

Notes, build scripts and master files are left out.

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

## Automatic uploads from GitHub

`.github/workflows/deploy-coveworks.yml` uploads the site to IONOS by itself whenever
`coveworks-lab/` changes on main, and can be run by hand from the repository's
**Actions** tab, Deploy Coveworks to IONOS, **Run workflow**. Until it has the login it
skips with a notice. To switch it on, once:

1. IONOS, Hosting, **SFTP & SSH**: note the server, the user and set a password.
2. GitHub, the repository's **Settings**, **Secrets and variables**, **Actions**,
   **New repository secret**, three times:
   - `IONOS_SFTP_HOST`: the server, without `sftp://`
   - `IONOS_SFTP_USER`: the user
   - `IONOS_SFTP_PASSWORD`: the password
3. If `index.html` sits in a folder rather than at the top of the SFTP login (for example
   `public`), open the **Variables** tab on the same page and add `IONOS_REMOTE_DIR`
   with that folder, e.g. `/public`.
4. Actions, Deploy Coveworks to IONOS, **Run workflow**. The last step checks that the
   live site serves the new files and fails loudly if not.

The workflow runs the packager and uploads `dist/site/`, folders included. Each file
carries the time of its last commit, so after the first upload only changed files are sent.
It deletes nothing on the server. Secrets are encrypted
by GitHub and never appear in logs, so this is safe on a public repository.

## Updating the site by hand

Edit `coveworks-lab/sitegen/build.py` (pages) or `coveworks-lab/assets/` (styles, scripts,
images), run `python3 coveworks-lab/sitegen/build.py`, then repeat steps 1 and 2. Uploading
only the files you changed also works.

## Notes

- Each page carries a canonical link and share tags pointing at coveworks.tech, so search
  engines treat the GitHub Pages copy as a preview, and links shared on social media show
  `assets/gen/lab-cover.jpg`.
- `.htaccess` also sets browser caching: images and fonts for 30 days to a year, pages
  always fresh.
