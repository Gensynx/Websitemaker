# Deploying Coveworks to IONOS

**The chosen build is `coveworks-scifi/`** (the sci-fi edition, previewable at
https://gensynx.github.io/Websitemaker/coveworks-scifi/). It is a single,
self-contained file with no build step — fonts and images are embedded — so the
whole deployment is uploading two files from the `coveworks-scifi/` folder:

- `index.html` (~1.4 MB) — the entire site
- `.htaccess` — forces HTTPS (see step 4)

## 1. Get your webspace access

1. Log in at [login.ionos.co.uk](https://login.ionos.co.uk) (or ionos.com).
2. Go to **Menu → Hosting**. If the domain package doesn't include webspace, add a hosting plan first (any tier works; the site is one file).
3. Open **SFTP & SSH** under the hosting package to see your SFTP host, username and to set a password. IONOS SFTP is usually `access-ssh.ionos.co.uk` (shown in the panel), port **22**.

## 2. Upload the files

**Option A — IONOS File Manager (no software needed):**
Hosting → **File Manager**, then upload `coveworks-scifi/index.html` and `coveworks-scifi/.htaccess` into the webspace. Either put them in the root, or make a folder such as `/coveworks` and upload them there. (`.htaccess` is a hidden file — enable "show hidden files" in your file browser if you can't see it.)

**Option B — SFTP client (FileZilla, Cyberduck):**
Connect with the credentials from step 1 and drag both files into the target folder.

IONOS serves `index.html` automatically as the directory index, so no renaming is needed.

## 3. Point the domain at it

1. Go to **Menu → Domains & SSL**.
2. Next to your domain, choose **Use Domain / Adjust Destination → Connect to a webspace**.
3. Set the **home directory** to the folder you uploaded to (`/` or `/coveworks`).

Because the domain and the hosting are both at IONOS, DNS is wired up automatically — no manual A records needed. Allow up to an hour for it to take effect (usually minutes).

## 4. Enable HTTPS

In **Domains & SSL**, assign the included **SSL certificate** to the domain and wait for it to activate. The `.htaccess` file uploaded in step 2 then redirects all plain-HTTP visits to HTTPS automatically.

## 5. Pre-launch checks

- The contact form opens the visitor's **email app** with the message pre-filled, addressed to `hello@coveworks.studio` — no backend needed. Make that address real by creating the mailbox under IONOS → **Email**, or search-and-replace `hello@coveworks.studio` in `index.html` with your actual address (it appears in the form handler, the footer, and two mailto links).
- After upload, hard-refresh the live URL (Ctrl/Cmd+Shift+R), submit a test enquiry through the form, and check the site on a phone.

## Updating the site later

Edit `coveworks-scifi/index.html` in this repo, then re-upload the file over the old one via File Manager or SFTP. That's the whole update.
