# Putting the configurator on your website (IONOS)

The configurator is a folder of ordinary files plus one small PHP script that
emails you each enquiry. It works in any folder of any domain; this guide
assumes `https://your-domain.co.uk/configurator/`.

**Needs:** an IONOS hosting package with PHP **8.1 or newer** (Hosting →
PHP settings), and a mailbox on the same domain to send from.

## 1. Build it (or use the zip you were sent)

On a computer with Node.js installed, in `door-window-configurator/`:

```
npm install
npm run build
```

This makes the `dist/` folder. That folder, and nothing else, is the website:

```
dist/
  index.html
  assets/                      the app (the 3D part loads after the page shows)
  enquiry.php                  receives enquiries and emails them to you
  enquiry-config.example.php   the settings file to copy (step 3)
  .htaccess                    HTTPS, compression, caching, protects the settings
```

`.htaccess` starts with a dot, so some file browsers hide it: turn on
"show hidden files" and make sure it is uploaded.

## 2. Upload it

Hosting → **File Manager** (or an SFTP client such as FileZilla, with the
details from Hosting → **SFTP & SSH**). Create a folder `configurator` in the
webspace and upload **the contents of `dist/`** into it, `.htaccess` included.

If the site should be the whole of a domain or subdomain instead, upload the
contents into that domain's folder. Nothing else changes.

## 3. Tell it where to send enquiries (once)

1. In IONOS → **Email**, create the mailbox it will send *from*, e.g.
   `configurator@your-domain.co.uk`. It must be on this website's domain, or
   mail servers (IONOS's included) will reject or junk the enquiries.
2. In the `configurator` folder on the server, **copy**
   `enquiry-config.example.php` to **`enquiry-config.php`** and edit the two
   addresses:
   - `to`: where enquiries should arrive (any address).
   - `from`: the mailbox from step 1.

`enquiry-config.php` is never part of the build, so later uploads cannot
overwrite it. Until it exists, the page tells customers that enquiries are
not set up yet and offers to copy the enquiry for them, so nothing is lost
silently.

## 4. Test it before you announce it

1. Open `https://your-domain.co.uk/configurator/` — on a phone as well.
2. Configure something, press **Review and enquire**, fill in your own
   details and send. The page should say *"Thank you — your enquiry has been
   sent."*
3. The email should arrive at the `to` address within a minute, from the
   `from` mailbox. **Reply to it**: the reply should go to the customer's
   address, not to the mailbox.
4. Open the link in the email: it should show exactly the door you configured.
5. Check the spam folder if it does not arrive; if it is not there either,
   see "If the email never arrives" below.

## Updating it later

Build again and upload the new `dist/` contents over the old ones. Leave
`enquiry-config.php` alone. Old files in `assets/` with different names can be
deleted, but do no harm if left.

## What the enquiry script does and does not do

- **Checks everything again on the server**: name, email, phone, postcode,
  consent, message length; that the request came from this site's own page;
  that the configuration is one that can be made; that the link points at
  this site. Anything from a browser can be forged, so none of the page's
  own checks are relied on.
- **Limits how often one connection can send** (5 an hour by default, `per_hour`
  in the settings). A burst of junk cannot flood your inbox.
- **Stores nothing.** The enquiry is emailed and then forgotten. The only thing
  kept is a hashed (unreadable) connection address with a count, in the
  server's temporary folder, for the hourly limit.
- **Does not re-check the door itself.** The configurator's rules are in
  TypeScript and the server runs PHP, so the server only checks that the page
  marked the configuration as makeable. Every enquiry is priced by a person
  who opens the link, and the link reopens the configuration exactly as the
  configurator's own rules see it; that is the real check.

## If the email never arrives

- Confirm the `from` mailbox exists on the same domain as the website.
- IONOS → Hosting → PHP settings: PHP 8.1 or newer.
- Some hosting packages restrict PHP's `mail()`. If the page says "sent" but
  nothing arrives, the next step is sending through the mailbox's SMTP login
  instead; that is a small change to `enquiry.php`.

## Before real customers use it

The README lists placeholders that must be replaced with your real data first
(RAL colours offered, frame sightlines, size limits, window presets), the
safety-glass rules to be checked by a competent person, and the consent
wording and a privacy notice link for the enquiry form.
