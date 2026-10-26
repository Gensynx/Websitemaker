#!/usr/bin/env bash
# Uploads the Vassallo site to the bucket made by site.yaml and refreshes
# CloudFront. Run from the repository root:
#
#   BUCKET=<BucketName output> DISTRIBUTION_ID=<DistributionId output> \
#     infra/vassallo/deploy.sh
#
# It stops before uploading anything if gitleaks finds something that looks
# like a key in the files about to go live (K-08), and it never uploads notes
# or patches (S-12).
set -euo pipefail

: "${BUCKET:?Set BUCKET to the BucketName output of site.yaml}"
: "${DISTRIBUTION_ID:?Set DISTRIBUTION_ID to the DistributionId output of site.yaml}"
command -v aws >/dev/null || { echo "Needs the AWS CLI" >&2; exit 1; }
command -v gitleaks >/dev/null || { echo "Needs gitleaks (github.com/gitleaks/gitleaks)" >&2; exit 1; }

SRC="vassallo"
[ -f "$SRC/index.html" ] || { echo "Run from the repository root" >&2; exit 1; }

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Only what visitors need: no README, notes or patches.
cp -R "$SRC/." "$STAGE/"
find "$STAGE" \( -name '*.txt' -o -name '*.md' -o -name '*.patch' -o -name '_headers' -o -name '.DS_Store' \) -delete

# security.txt (RFC 9116): where to report a security problem. It must carry
# an expiry date, so it is written fresh on every deploy.
mkdir -p "$STAGE/.well-known"
cat > "$STAGE/.well-known/security.txt" <<EOF
Contact: mailto:info@vassallodevelopments.com
Expires: $(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v+1y +%Y-%m-%dT%H:%M:%SZ)
Preferred-Languages: en
Canonical: https://vassallodevelopments.com/.well-known/security.txt
EOF

echo "Scanning the files about to be published for keys…"
gitleaks dir --no-banner --redact --exit-code 1 "$STAGE"

# Cache lifetimes. Configurator assets carry a fingerprint in their names, so
# a browser may keep them for a year. Everything else can change under the
# same name, so it is kept briefly.
SHORT="public, max-age=600"
DAY="public, max-age=86400"
YEAR="public, max-age=31536000, immutable"

aws s3 sync "$STAGE" "s3://$BUCKET" --delete --cache-control "$SHORT" \
  --exclude "configurator/assets/*" --exclude "images/*" --exclude "assets/*"
aws s3 sync "$STAGE/images" "s3://$BUCKET/images" --delete --cache-control "$DAY"
aws s3 sync "$STAGE/assets" "s3://$BUCKET/assets" --delete --cache-control "$DAY"
aws s3 sync "$STAGE/configurator/assets" "s3://$BUCKET/configurator/assets" --delete --cache-control "$YEAR"

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null
echo "Uploaded. CloudFront is refreshing; allow a few minutes."
