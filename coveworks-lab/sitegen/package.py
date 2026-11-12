"""Stage everything that goes on the IONOS webspace behind www.coveworks.tech.

    python3 coveworks-lab/sitegen/package.py

Writes, at the repository root (dist/ is gitignored):
  dist/site/                       the webspace exactly as it should look
  dist/coveworks-lab-upload.zip    the same, zipped, for a manual upload

Layout:
  /                  Coveworks Lab: every page, assets/, .htaccess, sitemap.xml and robots.txt
  /api/              lead capture and the site reader (PHP); api/data/ on the server holds the
                     leads and is never uploaded, overwritten or deleted from here
  /work/<slug>/      the portfolio sites listed in sitegen/work.json, kept out of search
                     engines by work/.htaccess

Source notes, build scripts and master files stay out. Each staged file carries the
time of its last commit, so the deploy workflow only uploads what has changed.
"""
import json, os, shutil, subprocess, zipfile

LAB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(LAB)
DIST = os.path.join(REPO, 'dist')
SITE = os.path.join(DIST, 'site')
ZIP = os.path.join(DIST, 'coveworks-lab-upload.zip')

# What goes under /work/ comes from work.json, the same list the work pages are built from:
# slug on the webspace -> [(source path in the repository, path inside the slug)]
with open(os.path.join(LAB, 'sitegen', 'work.json'), encoding='utf-8') as _f:
    _doc = json.load(_f)
WORK = {w['slug']: [tuple(p) for p in w['sources']] for w in _doc['work'] + _doc.get('extra', [])}
SKIP_DIRS = {'sitegen', 'source', '.git', 'node_modules'}
SKIP_EXT = ('.md', '.mjs', '.py', '.txt')

WORK_HTACCESS = '''# Portfolio copies: viewable, but kept out of search results
<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
'''


def commit_times():
    """Last commit time of every tracked file, from one pass over the log."""
    times = {}
    try:
        out = subprocess.run(['git', '-C', REPO, 'log', '--format=@%ct', '--name-only'],
                             capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return times
    t = None
    for line in out.splitlines():
        if line.startswith('@'):
            t = int(line[1:])
        elif line and line not in times:
            times[line] = t
    return times


def copy(src, dst, times):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)
    t = times.get(os.path.relpath(src, REPO))
    if t:
        os.utime(dst, (t, t))


def stage_tree(src, dst, times, lab=False):
    n = 0
    if os.path.isfile(src):
        copy(src, dst, times)
        return 1
    for base, dirs, files in os.walk(src):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for f in sorted(files):
            if f.endswith(SKIP_EXT) and not (lab and f == '.htaccess'):
                continue
            full = os.path.join(base, f)
            copy(full, os.path.join(dst, os.path.relpath(full, src)), times)
            n += 1
    return n


def main():
    times = commit_times()
    shutil.rmtree(SITE, ignore_errors=True)
    n = 0
    pages = sorted(f for f in os.listdir(LAB) if f.endswith('.html'))          # every page build.py wrote
    for p in pages + ['.htaccess', 'sitemap.xml', 'robots.txt']:
        copy(os.path.join(LAB, p), os.path.join(SITE, p), times); n += 1
    for p in ['lib.php', 'lead.php', 'site.php', os.path.join('data', '.htaccess')]:   # the two endpoints, and the lock on their data
        copy(os.path.join(LAB, 'api', p), os.path.join(SITE, 'api', p), times); n += 1
    n += stage_tree(os.path.join(LAB, 'assets'), os.path.join(SITE, 'assets'), times, lab=True)
    for slug, parts in WORK.items():
        for src, inner in parts:
            n += stage_tree(os.path.join(REPO, src), os.path.join(SITE, 'work', slug, inner), times)
    with open(os.path.join(SITE, 'work', '.htaccess'), 'w') as f:
        f.write(WORK_HTACCESS)
    n += 1
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        for base, _dirs, files in os.walk(SITE):
            for f in sorted(files):
                full = os.path.join(base, f)
                z.write(full, os.path.relpath(full, SITE))
    size = sum(os.path.getsize(os.path.join(b, f)) for b, _d, fs in os.walk(SITE) for f in fs)
    print('staged dist/site', n, 'files', size // (1024 * 1024), 'MB; zipped to', os.path.relpath(ZIP, REPO))


if __name__ == '__main__':
    main()
