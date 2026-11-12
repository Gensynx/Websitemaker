<?php
/* Coveworks · lead capture.
   POST JSON from the configurator ("Send this build") or the contact form. Every lead is
   written to data/leads.php first and then emailed, so one that cannot be emailed is not lost.

   Body: { kind: "build" | "contact", name, email, phone, business, message, summary, link,
           brief, site, ref, website (honeypot, must be empty), t (ms the page was open) } */
require __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') cw_json(405, ['ok' => false, 'error' => 'Send a POST request.']);

$raw = file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) cw_json(400, ['ok' => false, 'error' => 'That did not arrive in one piece. Please try again.']);

/* Bots fill every field and submit at once. People do neither. Answer as if it worked. */
$trap = cw_line($in['website'] ?? '', 200) !== '' || (int) ($in['t'] ?? 0) < 2500;
if ($trap) cw_json(200, ['ok' => true, 'id' => 'CW-' . strtoupper(bin2hex(random_bytes(3)))]);

$email = cw_line($in['email'] ?? '', 120);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) cw_json(422, ['ok' => false, 'field' => 'email', 'error' => 'Please check your email address.']);

$kind = ($in['kind'] ?? '') === 'contact' ? 'contact' : 'build';
$lead = [
    'id' => 'CW-' . strtoupper(bin2hex(random_bytes(3))),
    'at' => gmdate('c'),
    'kind' => $kind,
    'name' => cw_line($in['name'] ?? '', 80),
    'email' => $email,
    'phone' => cw_line($in['phone'] ?? '', 40),
    'business' => cw_line($in['business'] ?? '', 80),
    'message' => cw_text($in['message'] ?? '', 3000),
    'summary' => cw_text($in['summary'] ?? '', 2500),
    'link' => cw_line($in['link'] ?? '', 2600),
    'brief' => cw_line($in['brief'] ?? '', 200),
    'site' => cw_line($in['site'] ?? '', 300),
    'ref' => cw_line($in['ref'] ?? '', 40),
];
if ($kind === 'contact' && $lead['message'] === '') cw_json(422, ['ok' => false, 'field' => 'message', 'error' => 'Tell us a little about the project.']);
if ($lead['link'] !== '' && strpos($lead['link'], CW_SITE . '/') !== 0 && !getenv('CW_ALLOW_LOCAL')) $lead['link'] = '';

if (!cw_rate_ok('lead', 6, 3600)) cw_json(429, ['ok' => false, 'error' => 'That is a lot of messages. Please email ' . CW_TO . ' instead.']);

/* 1. keep it */
$file = cw_data_dir() . '/leads.php';
if (!is_file($file)) @file_put_contents($file, "<?php http_response_code(404); exit; ?>\n", LOCK_EX);
$saved = @file_put_contents($file, json_encode($lead, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX) !== false;

/* 2. send it */
$who = $lead['name'] !== '' ? $lead['name'] : $email;
$subject = ($kind === 'build' ? 'New build · ' : 'New enquiry · ') . ($lead['business'] !== '' ? $lead['business'] : $who) . ' · ' . $lead['id'];
$lines = [
    $kind === 'build' ? 'Someone built a site in the configurator and sent it over.' : 'Someone wrote through the contact form.',
    '',
    'Name:      ' . ($lead['name'] ?: 'not given'),
    'Email:     ' . $email,
    'Phone:     ' . ($lead['phone'] ?: 'not given'),
];
if ($lead['business'] !== '') $lines[] = 'Business:  ' . $lead['business'];
if ($lead['site'] !== '') $lines[] = 'Their site: ' . $lead['site'];
if ($lead['brief'] !== '') $lines[] = 'Their words: ' . $lead['brief'];
if ($lead['message'] !== '') { $lines[] = ''; $lines[] = $lead['message']; }
if ($lead['summary'] !== '') { $lines[] = ''; $lines[] = $lead['summary']; }
if ($lead['link'] !== '') { $lines[] = ''; $lines[] = 'Open their build: ' . $lead['link']; }
$lines[] = '';
$lines[] = 'Reference ' . $lead['id'] . ($lead['ref'] !== '' ? ' · ' . $lead['ref'] : '') . ' · ' . $lead['at'] . ' · reply to this email to answer them.';

$headers = 'From: Coveworks website <' . CW_TO . ">\r\n"
    . 'Reply-To: ' . $email . "\r\n"
    . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit";
$sent = false;
if (!getenv('CW_NO_MAIL')) {
    $sent = @mail(CW_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', implode("\n", $lines), $headers, '-f' . CW_TO);
}

if (!$saved && !$sent) cw_json(500, ['ok' => false, 'error' => 'We could not take that just now. Please email ' . CW_TO . ' instead.']);
cw_json(200, ['ok' => true, 'id' => $lead['id']]);
