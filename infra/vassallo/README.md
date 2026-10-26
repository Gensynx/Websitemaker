# Moving vassallodevelopments.com to AWS

Written and checked (cfn-lint, a dry run of the deploy script, the
CloudFront function's redirects), but not yet deployed: that needs the AWS
account. Nothing here holds a secret.

| File | What it makes |
| --- | --- |
| `site.yaml` | A private S3 bucket that only CloudFront can read, CloudFront with HTTPS and the security headers GitHub Pages cannot send, and www redirected to the bare domain |
| `dns.yaml` | A Route 53 zone with the website records, the Google Workspace email records copied across, DMARC, and a CAA record |
| `deploy.sh` | Scans the files for keys, uploads them with sensible cache lifetimes, adds `security.txt`, refreshes CloudFront |

If the domain's DNS is already on Cloudflare (see `infra/cloudflare/`), skip
`dns.yaml` and steps 6 and 7: point the domain at the CloudFront address in
Cloudflare instead, as a DNS-only record.

CloudFront and S3 answer byte-range requests themselves, so the intro film
plays on iPhones without the extra Worker the Cloudflare set-up needs
(`infra/cloudflare/worker.js`).

## The order matters

Email keeps working throughout only if the steps run in this order.

1. **Account first** (snag list A-01, A-05): two-factor on the root login,
   no access keys for it, a separate admin user, a budget alarm at £5.
2. **Certificate.** In ACM, region **us-east-1**, request a public
   certificate for `vassallodevelopments.com` and `www.vassallodevelopments.com`
   with DNS validation. Add the CNAME ACM shows to Squarespace's DNS page.
   Wait for "Issued". Keep the CNAME name and value for step 6.
3. **Site.** In **eu-west-2**:
   `aws cloudformation deploy --template-file infra/vassallo/site.yaml --stack-name vassallo-site --parameter-overrides CertificateArn=<arn from step 2>`
4. **Upload.** `BUCKET=… DISTRIBUTION_ID=… infra/vassallo/deploy.sh`, with
   both values from the stack's outputs.
5. **Test** on the `dxxxx.cloudfront.net` address: the page, the
   configurator, the enquiry form, and the headers
   (`curl -sI https://dxxxx.cloudfront.net/`).
6. **DNS zone.**
   `aws cloudformation deploy --template-file infra/vassallo/dns.yaml --stack-name vassallo-dns --parameter-overrides DistributionDomainName=dxxxx.cloudfront.net CertificateValidationName=<…> CertificateValidationValue=<…>`
   Before going on, compare every record on Squarespace's DNS page with the
   new zone. Anything else there (another service's verification record, for
   example) must be added to the zone too.
7. **Switch.** In Squarespace, change the domain's nameservers to the four in
   the `vassallo-dns` stack's `NameServers` output. This also clears out
   every old Squarespace record at once (snag list D-08). Keep the domain
   registered with Squarespace; only its DNS moves.
8. **After a day**, check mail still arrives, then send a test from a Gmail
   account and confirm `dmarc=pass` in its headers.

## Costs

The CloudFront free allowance (1 TB and 10 million requests a month) covers
a site this size. S3 storage is pennies. The Route 53 zone is about $0.50 a
month.

## Not yet included

Payments, booking and the enquiry endpoint come later, with their own rate
limiting (snag list R-01). Their keys go in Parameter Store, never in these
files.
