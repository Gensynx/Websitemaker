#!/usr/bin/env bash
# Cloudflare Pages build for the Vassallo site. In the Pages project:
#   Build command:          bash infra/cloudflare/build.sh
#   Build output directory: dist
#   Root directory:         (leave blank)
# It publishes only what visitors need (no notes or patches, snag list S-12),
# adds the security headers and a security.txt. Every push is already scanned
# for keys by .github/workflows/secret-scan.yml before Cloudflare builds it.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f vassallo/index.html ] || { echo "vassallo/index.html not found" >&2; exit 1; }

rm -rf dist
cp -R vassallo dist
find dist \( -name '*.txt' -o -name '*.md' -o -name '*.patch' -o -name '.DS_Store' \) -delete
cp infra/cloudflare/_headers dist/_headers

mkdir -p dist/.well-known
cat > dist/.well-known/security.txt <<TXT
Contact: mailto:hello@vassallodevelopments.com
Expires: $(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)
Preferred-Languages: en
Canonical: https://vassallodevelopments.com/.well-known/security.txt
TXT

echo "Built dist/: $(find dist -type f | wc -l) files"
