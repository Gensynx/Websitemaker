# Hosting vassallodevelopments.com on Cloudflare

The interim host until AWS. Free, and unlike GitHub Pages it sends the
security headers in `_headers` (frame protection, nosniff, and the rest).
It works as either a Worker (Cloudflare's default for new projects) or a
Pages project. Both were tested locally with Cloudflare's own `wrangler`:
every header applies, notes, repository files and missing pages return 404
with the site's own 404 page, and the configurator runs with no policy
violations.

| File | Purpose |
| --- | --- |
| `build.sh` | Cloudflare's build step: copies `vassallo/`, drops notes, adds `_headers` and `security.txt` |
| `_headers` | The security headers, and noindex on the `workers.dev` and `pages.dev` copies |
| `../../wrangler.jsonc` | Worker settings: serve only `dist/`, never the repository |

## Set-up, in this order

Email keeps working only if step 2 is checked before step 3.

1. **Cloudflare account** with two-factor sign-in on. Add the site
   `vassallodevelopments.com` on the Free plan.
2. **Check the DNS records Cloudflare imported** against Squarespace's DNS
   page. These must be there exactly, set to "DNS only" (grey cloud):
   - MX `vassallodevelopments.com` → `smtp.google.com`, priority 1
   - TXT `vassallodevelopments.com` → `v=spf1 include:_spf.google.com ~all`
   - TXT `google._domainkey` → the long `v=DKIM1; k=rsa; p=…` key
3. **Switch nameservers.** In Squarespace, Domains, vassallodevelopments.com,
   set custom nameservers to the two Cloudflare gives you. Keep the domain
   registered with Squarespace; only its DNS moves.
4. **Worker.** Workers & Pages, Create, import the `Gensynx/Websitemaker`
   repository from GitHub:
   - Name: `vassallo-developments` (must match `wrangler.jsonc`)
   - Build command: `bash infra/cloudflare/build.sh`
   - Deploy command: `npx wrangler deploy` (the default)
   - Root directory: blank

   `wrangler.jsonc` tells the deploy to upload `dist/` only. Without it,
   Wrangler guesses the whole repository, `.git` included. If you choose a
   Pages project instead, use the same build command and set the build
   output directory to `dist`.
5. **Custom domains** on the Worker (Settings, Domains & Routes) or Pages project: add `vassallodevelopments.com` and
   `www.vassallodevelopments.com`. Cloudflare replaces the old Squarespace
   records for both (snag list D-08); delete any Squarespace A or CNAME
   records that are left.
6. **www to the bare domain.** Rules, Redirect Rules, use the template
   "Redirect from WWW to root".
7. **SSL/TLS.** Always Use HTTPS on; Minimum TLS Version 1.2.
8. **Turn these off**, because each one injects a script or rewrites the
   page, which the site's security policy blocks or which breaks the enquiry
   form's address:
   - Speed, Rocket Loader
   - Scrape Shield, Email Address Obfuscation
   - Web Analytics automatic setup
9. **DMARC.** Email, DMARC Management: turn it on. It adds the DMARC record
   and shows who sends mail as your domain (snag list S-10).
10. **DNSSEC.** DNS, Settings, enable DNSSEC, then add the DS record it
    shows in Squarespace's domain settings.

## Checks after the switch

- `curl -sI https://vassallodevelopments.com/` shows `x-frame-options: DENY`
  and `content-security-policy: frame-ancestors 'none'…`
- An enquiry from your phone still reaches info@
- A test email from Gmail shows `dmarc=pass` in its headers

## Later, moving to AWS

Keep DNS on Cloudflare and point the domain at CloudFront instead of Pages;
`infra/vassallo/site.yaml` still applies, and `infra/vassallo/dns.yaml`
(Route 53) is then not needed.
