<?php
/* Coveworks · shared helpers for the two endpoints in this folder.
   Nothing here is secret: the repository is public and so is this file. */

const CW_TO = 'sales@coveworks.tech';      // where leads are emailed, and the sender address
const CW_SITE = 'https://www.coveworks.tech';
const CW_KEEP_DAYS = 365;                  // how long a saved lead is kept; the privacy page says the same

function cw_json(int $status, array $body): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* The data folder holds leads, the rate limiter and the site reader's cache. Its .htaccess
   refuses every web request, and each file in it is also a PHP file that exits at once,
   so nothing in it can be read from outside even if that .htaccess were ever lost. */
function cw_data_dir(): string {
    $dir = getenv('CW_DATA_DIR') ?: __DIR__ . '/data';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    if (!is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    }
    return $dir;
}

function cw_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/* At most $max calls per $window seconds from one address. Addresses are stored hashed. */
function cw_rate_ok(string $bucket, int $max, int $window): bool {
    $dir = cw_data_dir() . '/rate';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $slot = intdiv(time(), $window);
    $file = $dir . '/' . $bucket . '-' . hash('sha256', cw_ip() . '|' . $slot) . '.txt';
    $n = (int) @file_get_contents($file);
    if ($n >= $max) return false;
    @file_put_contents($file, (string) ($n + 1), LOCK_EX);
    foreach (glob($dir . '/*.txt') ?: [] as $f) if (@filemtime($f) < time() - 7200) @unlink($f);   // nothing here outlives two hours of activity
    return true;
}

/* One line of plain text: no control characters, collapsed spaces, capped length. */
function cw_line($v, int $max): string {
    if (!is_string($v) && !is_numeric($v)) return '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string) $v) ?? '';
    $s = trim(preg_replace('/\s+/u', ' ', $s) ?? '');
    return mb_substr($s, 0, $max);
}

/* Several lines of plain text: keeps line breaks, drops other control characters. */
function cw_text($v, int $max): string {
    if (!is_string($v)) return '';
    $s = str_replace(["\r\n", "\r"], "\n", $v);
    $s = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
