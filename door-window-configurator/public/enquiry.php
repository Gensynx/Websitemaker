<?php
/**
 * Receives an enquiry from the configurator and emails it to the business.
 *
 * The page sends a JSON POST (src/output/enquiry.ts, EnquiryRequest). Nothing
 * from a browser is trusted: every field is checked again here, the request
 * must come from this site, and each connection may send only a few an hour.
 * The enquiry is emailed and not stored. The only thing kept is a hashed
 * address with a count, in the server's temporary folder, for the rate limit.
 *
 * Settings (who receives it, who it is from) are in enquiry-config.php, which
 * is not part of the build, so uploading a new version never overwrites
 * them. Copy enquiry-config.example.php to create it.
 *
 * Answers JSON: { "ok": true } or { "ok": false, "error": "<shown to the
 * customer>" }, with a matching HTTP status.
 */

declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MAX_BODY_BYTES = 65536;

function answer(int $status, ?string $error = null): never
{
    http_response_code($status);
    echo json_encode($error === null ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

/* ------------------------------------------------------------------ *
 * The request itself
 * ------------------------------------------------------------------ */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    answer(405, 'Enquiries are sent from the configurator page.');
}

$configFile = __DIR__ . '/enquiry-config.php';
if (!is_file($configFile)) {
    answer(503, 'Enquiries are not set up on this website yet. Please copy the enquiry and email it to us.');
}
$config = require $configFile;
$to = (string) ($config['to'] ?? '');
$from = (string) ($config['from'] ?? '');
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    answer(503, 'Enquiries are not set up on this website yet. Please copy the enquiry and email it to us.');
}

// Only from this site's own pages. Browsers always send Origin on a POST
// from a page; its absence means a script, not a customer.
$host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$originHost = strtolower((string) (parse_url($origin, PHP_URL_HOST) ?? ''));
$originPort = parse_url($origin, PHP_URL_PORT);
if ($originPort !== null && $originPort !== false) {
    $originHost .= ':' . $originPort;
}
if ($origin === '' || $originHost !== $host) {
    answer(403, 'Enquiries are sent from the configurator page.');
}

if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
    answer(415, 'The enquiry could not be read.');
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    answer(413, 'The enquiry is too long to send.');
}
$request = json_decode($raw, true);
if (!is_array($request)) {
    answer(400, 'The enquiry could not be read.');
}

/* ------------------------------------------------------------------ *
 * Rate limit: a few an hour per connection
 * ------------------------------------------------------------------ */

$limitPerHour = (int) ($config['per_hour'] ?? 5);
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
// Hashed with this site's host: the file holds no address anyone can read back.
$bucket = sys_get_temp_dir() . '/configurator-enquiry-' . hash('sha256', $host . '|' . $ip);
$now = time();
$recent = [];
if (is_file($bucket)) {
    $stored = json_decode((string) @file_get_contents($bucket), true);
    if (is_array($stored)) {
        $recent = array_values(array_filter($stored, fn ($t) => is_int($t) && $t > $now - 3600));
    }
}
if (count($recent) >= $limitPerHour) {
    answer(429, 'Too many enquiries have been sent from this connection. Please try again in an hour.');
}

/* ------------------------------------------------------------------ *
 * Every field, checked again
 * ------------------------------------------------------------------ */

/** A single-line text field: trimmed, length-limited, no line breaks. */
function line(mixed $value, int $max): ?string
{
    if (!is_string($value)) {
        return null;
    }
    $value = trim($value);
    if (mb_strlen($value) > $max || preg_match('/[\r\n\0]/', $value)) {
        return null;
    }
    return $value;
}

$contact = $request['contact'] ?? null;
if (!is_array($contact)) {
    answer(400, 'The enquiry could not be read.');
}

$name = line($contact['name'] ?? null, 120);
if ($name === null || $name === '') {
    answer(400, 'Please enter your name.');
}
$email = line($contact['email'] ?? null, 200);
if ($email === null || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    answer(400, 'Please enter an email address in the correct format, like name@example.com.');
}
$phone = line($contact['phone'] ?? '', 40);
if ($phone === null || ($phone !== '' && strlen(preg_replace('/\D/', '', $phone)) < 10)) {
    answer(400, 'Please enter a phone number with at least 10 digits, or leave it blank.');
}
$postcode = line($contact['postcode'] ?? '', 10);
if ($postcode === null || ($postcode !== '' && !preg_match('/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i', $postcode))) {
    answer(400, 'Please enter a full UK postcode, like SW1A 1AA, or leave it blank.');
}
$message = $contact['message'] ?? '';
if (!is_string($message) || mb_strlen($message) > 5000) {
    answer(400, 'Please shorten your message.');
}
if (($contact['consent'] ?? null) !== true) {
    answer(400, 'Please confirm that we may contact you about this enquiry.');
}

// A configuration that cannot be made is never sent by the page; one that
// arrives anyway is refused. "non-orderable" (a custom colour) is an enquiry.
$payload = $request['payload'] ?? null;
$kind = is_array($payload) ? ($payload['kind'] ?? null) : null;
if ($kind !== 'quotable' && $kind !== 'non-orderable') {
    answer(400, 'This configuration cannot be made yet. Fix what the summary lists, then send it.');
}

// The link reopens the exact configuration, and must point at this site.
$link = line($request['shareUrl'] ?? null, 4000);
$linkParts = $link === null ? false : parse_url($link);
$linkHost = is_array($linkParts) ? strtolower(($linkParts['host'] ?? '') . (isset($linkParts['port']) ? ':' . $linkParts['port'] : '')) : '';
if ($link === null || !is_array($linkParts) || !in_array($linkParts['scheme'] ?? '', ['http', 'https'], true) || $linkHost !== $host) {
    answer(400, 'The enquiry could not be read.');
}

$summary = $request['summary'] ?? '';
if (!is_string($summary) || mb_strlen($summary) > 20000) {
    answer(400, 'The enquiry is too long to send.');
}

/* ------------------------------------------------------------------ *
 * The email
 * ------------------------------------------------------------------ */

$status = $kind === 'quotable'
    ? 'Can be quoted.'
    : 'NOT orderable as configured (e.g. a custom colour): agree it with the customer before pricing.';

$body = implode("\n", [
    'New enquiry from the door and window configurator.',
    '',
    'Name:      ' . $name,
    'Email:     ' . $email,
    'Phone:     ' . ($phone !== '' ? $phone : '(not given)'),
    'Postcode:  ' . ($postcode !== '' ? strtoupper($postcode) : '(not given)'),
    '',
    'Status:    ' . $status,
    '',
    'Open the exact configuration:',
    $link,
    '',
    'Their message:',
    trim($message) !== '' ? trim($message) : '(none)',
    '',
    '--------------------------------------------------------------',
    'Summary as the customer saw it (built in their browser; the link',
    'above is the authoritative configuration):',
    '--------------------------------------------------------------',
    $summary,
    '',
    'Consent: the customer confirmed we may contact them about this enquiry.',
]);

$subject = 'Configurator enquiry: ' . $name . ($postcode !== '' ? ' (' . strtoupper($postcode) . ')' : '');
$headers = implode("\r\n", [
    'From: ' . $from,
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

if (($config['transport'] ?? 'mail') === 'log') {
    // TESTING ONLY: write the email to a file instead of sending it.
    $sent = file_put_contents((string) $config['log_file'], "To: $to\r\nSubject: $subject\r\n$headers\r\n\r\n$body\r\n\r\n", FILE_APPEND) !== false;
} else {
    $sent = mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $body, $headers, '-f' . $from);
}

if (!$sent) {
    answer(500, 'Something went wrong on our side. Please try again, or copy the enquiry and email it to us.');
}

$recent[] = $now;
@file_put_contents($bucket, json_encode($recent), LOCK_EX);
answer(200);
