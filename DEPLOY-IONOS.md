# Deploying Coveworks to IONOS

Both Coveworks builds are single, self-contained files with no build step:

- `coveworks/index.html` (~490 KB) — the editorial brass-on-black studio site
- `coveworks-scifi/index.html` (~1.4 MB) — the newer sci-fi edition

Pick the one you want live. Everything (fonts, images) is embedded in the file, so uploading that one `index.html` is the entire deployment.

## 1. Get your webspace access

1. Log in at [login.ionos.co.uk](https://login.ionos.co.uk) (or ionos.com).
2. Go to **Menu → Hosting**. If the domain package doesn't include webspace, add a hosting plan first (any tier works; the site is one file).
3. Open **SFTP & SSH** under the hosting package to see your SFTP host, username and to set a password. IONOS SFTP is usually `access-ssh.ionos.co.uk` (shown in the panel), port **22**.

## 2. Upload the file

**Option A — IONOS File Manager (no software needed):**
Hosting → **File Manager**, then upload `index.html` into the webspace. Either put it in the root, or make a folder such as `/coveworks` and upload it there.

**Option B — SFTP client (FileZilla, Cyberduck):**
Connect with the credentials from step 1 and drag `index.html` into the target folder.

IONOS serves `index.html` automatically as the directory index, so no renaming is needed.

## 3. Point the domain at it

1. Go to **Menu → Domains & SSL**.
2. Next to your domain, choose **Use Domain / Adjust Destination → Connect to a webspace**.
3. Set the **home directory** to the folder you uploaded to (`/` or `/coveworks`).

Because the domain and the hosting are both at IONOS, DNS is wired up automatically — no manual A records needed. Allow up to an hour for it to take effect (usually minutes).

## 4. Enable HTTPS

1. In **Domains & SSL**, assign the included **SSL certificate** to the domain and wait for it to activate.
2. Force HTTPS by uploading a `.htaccess` file next to `index.html`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 5. Pre-launch checks

- The contact form is a **demo** — it doesn't send anywhere yet. Wire it to a form service (Formspree, IONOS PHP mail, etc.) or replace it with a `mailto:` link before going live.
- `hello@coveworks.studio` in the footer is a **placeholder address**. Swap in the real one, or create the mailbox under IONOS → Email.
- After upload, hard-refresh the live URL (Ctrl/Cmd+Shift+R) and test on a phone.

## Updating the site later

Edit `index.html` in this repo, then re-upload the file over the old one via File Manager or SFTP. That's the whole update.
