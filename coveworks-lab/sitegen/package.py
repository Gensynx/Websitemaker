"""Stage everything that goes on the IONOS webspace behind www.coveworks.tech.

    python3 coveworks-lab/sitegen/package.py

Writes, at the repository root (dist/ is gitignored):
  dist/site/                       the webspace exactly as it should look
  dist/coveworks-lab-upload.zip    the same, zipped, for a manual upload

Layout:
  /                  Coveworks Lab: the five pages, assets/ and .htaccess
  /work/<slug>/      the portfolio sites the work list links to, kept out of search
                     engines by work/.htaccess

Source notes, build scripts and master files stay out. Each staged file carries the
time of its last commit, so the deploy workflow only uploads what has changed.
"""
import os, shutil, subprocess, zipfile

LAB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(LAB)
DIST = os.path.join(REPO, 'dist')
SITE = os.path.join(DIST, 'site')
ZIP = os.path.join(DIST, 'coveworks-lab-upload.zip')

# slug on the webspace: list of (source path in the repo, path inside the slug)
WORK = {
    'vassallo': [('vassallo', '')],
    'dar-ul-amir': [('index.html', 'index.html'), ('assets', 'assets')],
    'aesthetics-clinic': [('aesthetics-clinic', '')],
    'accountants': [('accountants', '')],
    'accountants-premium': [('accountants-premium', '')],
    'accountants-ledger': [('accountants-ledger', '')],
    'streetwear': [('streetwear', '')],
    'car-hire': [('car-hire', '')],
    'mobile-mechanic': [('mobile-mechanic', '')],
}
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
    for p in ['index.html', 'work.html', 'configurator.html', 'studio.html', 'contact.html', '.htaccess']:
        copy(os.path.join(LAB, p), os.path.join(SITE, p), times); n += 1
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
