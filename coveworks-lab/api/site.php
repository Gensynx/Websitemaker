<?php
/* Coveworks · reads a visitor's existing website so the configurator can rebuild it.
   GET ?url=https://example.co.uk  ->  { ok, url, host, name, title, description, h1, headings[],
                                         paragraphs[], colour, logo, image, phone, email }

   It only ever returns those few extracted fields, never the page itself. It fetches public
   web pages only: http or https on the standard ports, never an address inside a private
   network, with every redirect checked the same way, a size cap and a short timeout. */
require __DIR__ . '/lib.php';

const CW_MAX_PAGE = 900000;     // bytes of HTML read
const CW_MAX_CSS = 300000;      // bytes of each stylesheet read
const CW_UA = 'CoveworksPreview/1.0 (+https://www.coveworks.tech/configurator.html)';
const CW_GUARD = "<?php http_response_code(404); exit; ?>\n";   // first line of every cache file

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') cw_json(405, ['ok' => false, 'error' => 'Send a GET request.']);
if (!function_exists('curl_init')) cw_json(503, ['ok' => false, 'error' => 'Reading sites is not available right now.']);

$url = cw_line($_GET['url'] ?? '', 300);
if ($url !== '' && !preg_match('#^https?://#i', $url)) $url = 'https://' . $url;
if (cw_check_url($url) === null) cw_json(422, ['ok' => false, 'error' => 'That does not look like a public web address.']);

$cache = cw_data_dir() . '/cache';
if (!is_dir($cache)) @mkdir($cache, 0700, true);
$key = $cache . '/' . hash('sha256', strtolower($url)) . '.php';
if (is_file($key) && filemtime($key) > time() - 3600) {
    $hit = json_decode(substr((string) file_get_contents($key), strlen(CW_GUARD)), true);
    if (is_array($hit)) cw_json(200, $hit);
}

if (!cw_rate_ok('site', 30, 3600)) cw_json(429, ['ok' => false, 'error' => 'That is a lot of sites in one hour. Please try again later.']);

$page = cw_fetch($url, CW_MAX_PAGE);
if ($page === null) cw_json(502, ['ok' => false, 'error' => 'We could not open that site. Check the address, or describe it in words instead.']);
if (stripos($page['type'], 'html') === false && stripos($page['body'], '<html') === false) {
    cw_json(422, ['ok' => false, 'error' => 'That address is not a web page.']);
}

$out = cw_extract($page['body'], $page['url'], $page['type']);
$out = ['ok' => true, 'url' => $page['url'], 'host' => preg_replace('/^www\./', '', (string) parse_url($page['url'], PHP_URL_HOST))] + $out;
@file_put_contents($key, CW_GUARD . json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
if (mt_rand(1, 40) === 1) foreach (glob($cache . '/*.php') ?: [] as $f) if (@filemtime($f) < time() - 7200) @unlink($f);
cw_json(200, $out);

/* ---------- fetching, safely ---------- */

/* Returns [scheme, host, port, path, ip] for a URL we are willing to fetch, or null. */
function cw_check_url(string $url): ?array {
    $p = parse_url($url);
    if (!$p || empty($p['host']) || isset($p['user']) || isset($p['pass'])) return null;
    $scheme = strtolower($p['scheme'] ?? '');
    if ($scheme !== 'http' && $scheme !== 'https') return null;
    $port = $p['port'] ?? ($scheme === 'https' ? 443 : 80);
    $local = (bool) getenv('CW_ALLOW_LOCAL');                 // tests only: set on the server, never by a request
    if (!$local && $port !== 80 && $port !== 443) return null;
    $host = strtolower(trim($p['host'], '[]'));
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        $ips = [$host];
    } else {
        if (!preg_match('/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/', $host)) return null;
        $ips = gethostbynamel($host) ?: [];
    }
    if (!$ips) return null;
    foreach ($ips as $ip) {                                    // every address the name resolves to must be public
        if (!$local && !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return null;
    }
    return [$scheme, $host, $port, $ips[0]];
}

/* GET a URL, following up to four redirects, each one checked. Returns [url, type, body] or null. */
function cw_fetch(string $url, int $max): ?array {
    for ($hop = 0; $hop < 5; $hop++) {
        $ok = cw_check_url($url);
        if ($ok === null) return null;
        [, $host, $port, $ip] = $ok;
        $body = '';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => false,                   // redirects are followed by hand, below
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_RESOLVE => [$host . ':' . $port . ':' . $ip],   // connect to the address that was checked
            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            CURLOPT_PROXY => '',
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 9,
            CURLOPT_USERAGENT => CW_UA,
            CURLOPT_ENCODING => '',
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,text/css;q=0.9,*/*;q=0.5', 'Accept-Language: en-GB,en;q=0.8'],
            CURLOPT_HEADER => false,
            CURLOPT_WRITEFUNCTION => function ($c, $chunk) use (&$body, $max) {
                $body .= $chunk;
                return strlen($body) > $max ? -1 : strlen($chunk);   // stop reading past the cap
            },
        ]);
        curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $type = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $next = (string) curl_getinfo($ch, CURLINFO_REDIRECT_URL);
        curl_close($ch);
        if ($code >= 300 && $code < 400 && $next !== '') { $url = $next; continue; }
        if ($code < 200 || $code >= 300 || $body === '') return null;
        return ['url' => $url, 'type' => $type, 'body' => substr($body, 0, $max)];
    }
    return null;
}

/* ---------- reading the page ---------- */

function cw_abs(string $href, string $base): string {
    $href = trim($href);
    if ($href === '' || preg_match('#^(data|javascript|mailto|tel):#i', $href)) return '';
    if (preg_match('#^https?://#i', $href)) return $href;
    $b = parse_url($base);
    $root = $b['scheme'] . '://' . $b['host'] . (isset($b['port']) ? ':' . $b['port'] : '');
    if (strpos($href, '//') === 0) return $b['scheme'] . ':' . $href;
    if ($href[0] === '/') return $root . $href;
    $dir = preg_replace('#/[^/]*$#', '/', $b['path'] ?? '/');
    return $root . $dir . $href;
}

function cw_utf8(string $html, string $type): string {
    $cs = '';
    if (preg_match('/charset=([\w-]+)/i', $type, $m)) $cs = $m[1];
    elseif (preg_match('/<meta[^>]+charset=["\']?([\w-]+)/i', substr($html, 0, 4000), $m)) $cs = $m[1];
    if ($cs !== '' && strcasecmp($cs, 'utf-8') !== 0) {
        $conv = @mb_convert_encoding($html, 'UTF-8', $cs);
        if (is_string($conv) && $conv !== '') $html = $conv;
    } elseif (!mb_check_encoding($html, 'UTF-8')) {
        $html = mb_convert_encoding($html, 'UTF-8', 'Windows-1252');
    }
    return $html;
}

/* The business name: what the site calls itself, else the part of the title that matches the domain. */
function cw_name(string $siteName, string $title, string $host): string {
    if ($siteName !== '') return $siteName;
    $parts = array_values(array_filter(array_map('trim', preg_split('/\s+[|–—·:•-]\s+|\s*\|\s*/u', $title) ?: []), function ($p) {
        return $p !== '' && !preg_match('/^(home|homepage|home page|welcome|index)$/i', $p);
    }));
    if (!$parts) return '';
    $label = preg_replace('/[^a-z0-9]/', '', strtolower(explode('.', preg_replace('/^www\./', '', $host))[0]));
    $best = $parts[0]; $score = -1;
    foreach ($parts as $p) {
        similar_text(preg_replace('/[^a-z0-9]/', '', strtolower($p)), $label, $pct);
        if ($pct > $score) { $score = $pct; $best = $p; }
    }
    return $score >= 45 ? $best : $parts[0];
}

/* The brand colour: the declared theme colour, else the most used colour that is neither grey nor near white. */
function cw_colour(string $declared, string $css): string {
    $norm = function (string $c): string {
        $c = strtolower(ltrim(trim($c), '#'));
        if (preg_match('/^[0-9a-f]{3}$/', $c)) $c = $c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2];
        return preg_match('/^[0-9a-f]{6}$/', $c) ? $c : '';
    };
    $usable = function (string $c): bool {
        if ($c === '') return false;
        [$r, $g, $b] = [hexdec(substr($c, 0, 2)), hexdec(substr($c, 2, 2)), hexdec(substr($c, 4, 2))];
        $lum = (0.2126 * $r + 0.7152 * $g + 0.0722 * $b) / 255;
        return max($r, $g, $b) - min($r, $g, $b) >= 45 && $lum < 0.72 && $lum > 0.04;
    };
    $d = $norm($declared);
    if ($usable($d)) return '#' . strtoupper($d);
    $count = [];
    if (preg_match_all('/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/', $css, $m)) foreach ($m[1] as $c) { $c = $norm($c); if ($usable($c)) $count[$c] = ($count[$c] ?? 0) + 1; }
    if (preg_match_all('/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/', $css, $m, PREG_SET_ORDER)) {
        foreach ($m as $x) { $c = sprintf('%02x%02x%02x', min(255, $x[1]), min(255, $x[2]), min(255, $x[3])); if ($usable($c)) $count[$c] = ($count[$c] ?? 0) + 1; }
    }
    if (!$count) return '';
    arsort($count);
    return '#' . strtoupper((string) array_key_first($count));
}

function cw_extract(string $html, string $base, string $type): array {
    $html = cw_utf8($html, $type);
    $host = (string) parse_url($base, PHP_URL_HOST);
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NOWARNING | LIBXML_NOERROR | LIBXML_NONET);
    libxml_clear_errors();
    $xp = new DOMXPath($doc);
    $clean = function (?string $s, int $max): string { return cw_line(html_entity_decode((string) $s, ENT_QUOTES | ENT_HTML5, 'UTF-8'), $max); };
    $meta = function (string $q) use ($xp, $clean): string {
        $n = $xp->query($q);
        return $n && $n->length ? $clean($n->item(0)->getAttribute('content'), 400) : '';
    };
    $lc = "translate(%s,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')";

    /* styles are read for the colour before the noisy parts of the page are thrown away */
    $css = '';
    foreach ($xp->query('//style') as $s) $css .= $s->textContent . "\n";
    foreach ($xp->query('//*[@style]') as $i => $el) { if ($i > 400) break; $css .= $el->getAttribute('style') . ";\n"; }
    $sheets = 0;
    foreach ($xp->query('//link[contains(' . sprintf($lc, '@rel') . ",'stylesheet')]") as $l) {
        $href = cw_abs($l->getAttribute('href'), $base);
        if ($href === '' || $sheets >= 2) continue;
        if (preg_replace('/^www\./', '', (string) parse_url($href, PHP_URL_HOST)) !== preg_replace('/^www\./', '', $host)) continue;
        $sheets++;
        $got = cw_fetch($href, CW_MAX_CSS);
        if ($got) $css .= $got['body'] . "\n";
    }

    $title = '';
    $t = $xp->query('//title');
    if ($t && $t->length) $title = $clean($t->item(0)->textContent, 160);
    $siteName = $meta("//meta[@property='og:site_name']/@content/..");
    $desc = $meta("//meta[" . sprintf($lc, '@name') . "='description']/@content/..");
    if ($desc === '') $desc = $meta("//meta[@property='og:description']/@content/..");
    $image = $meta("//meta[@property='og:image']/@content/..");
    if ($image === '') $image = $meta("//meta[" . sprintf($lc, '@name') . "='twitter:image']/@content/..");
    $theme = $meta("//meta[" . sprintf($lc, '@name') . "='theme-color']/@content/..");

    $logo = '';
    foreach (["//link[contains(" . sprintf($lc, '@rel') . ",'apple-touch-icon')]", "//link[contains(" . sprintf($lc, '@rel') . ",'icon')][contains(@href,'.png') or contains(@href,'.svg')]"] as $q) {
        $n = $xp->query($q);
        if ($n && $n->length) { $logo = cw_abs($n->item(0)->getAttribute('href'), $base); break; }
    }
    if ($logo === '') {
        $n = $xp->query("//img[contains(" . sprintf($lc, '@src') . ",'logo') or contains(" . sprintf($lc, '@class') . ",'logo') or contains(" . sprintf($lc, '@alt') . ",'logo')]");
        if ($n && $n->length) $logo = cw_abs($n->item(0)->getAttribute('src'), $base);
    }

    $phone = $email = '';
    $n = $xp->query("//a[starts-with(" . sprintf($lc, '@href') . ",'tel:')]");
    if ($n && $n->length) $phone = $clean(preg_replace('/^tel:/i', '', $n->item(0)->getAttribute('href')), 30);
    $n = $xp->query("//a[starts-with(" . sprintf($lc, '@href') . ",'mailto:')]");
    if ($n && $n->length) $email = $clean(preg_replace('/^mailto:|\?.*$/i', '', $n->item(0)->getAttribute('href')), 120);

    foreach ($xp->query('//script|//style|//noscript|//svg|//nav|//footer|//form|//template|//iframe') as $junk) $junk->parentNode->removeChild($junk);

    $h1 = '';
    foreach ($xp->query('//h1') as $h) { $h1 = $clean($h->textContent, 140); if ($h1 !== '') break; }
    $headings = [];
    foreach ($xp->query('//h2|//h3') as $h) {
        $x = $clean($h->textContent, 90);
        if (mb_strlen($x) >= 3 && !in_array($x, $headings, true)) $headings[] = $x;
        if (count($headings) >= 8) break;
    }
    $paragraphs = [];
    foreach ($xp->query('//p') as $p) {
        $x = $clean($p->textContent, 600);
        if (mb_strlen($x) >= 70 && !preg_match('/cookie|privacy policy|all rights reserved|©/iu', $x) && !in_array($x, $paragraphs, true)) $paragraphs[] = $x;
        if (count($paragraphs) >= 3) break;
    }

    return [
        'name' => cw_line(cw_name($siteName, $title, $host), 60),
        'title' => $title,
        'description' => $desc,
        'h1' => $h1,
        'headings' => $headings,
        'paragraphs' => $paragraphs,
        'colour' => cw_colour($theme, $css),
        'logo' => $logo,
        'image' => cw_abs($image, $base),
        'phone' => $phone,
        'email' => filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '',
    ];
}
