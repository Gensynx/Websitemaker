3D door and window configurator, published inside the Vassallo site
===================================================================

This folder is a BUILD, not source. The source is the door-window-configurator
project on branch claude/stoic-knuth-ymog8j (React, Vite, TypeScript, React
Three Fiber). Built 2026-10-21 from that branch's head, with Vite 6.4 and
Vitest 4.1 (the earlier Vite 5 and Vitest 2 had known vulnerabilities in the
development server and test runner; nothing that shipped to visitors).

Rebuild:
  git archive origin/claude/stoic-knuth-ymog8j door-window-configurator | tar -x
  cd door-window-configurator
  # blank VITE_ENQUIRY_ENDPOINT in .env.production (see "No PHP here")
  npm ci && npm run build
  # copy dist/index.html and dist/assets into this folder; leave the PHP out

Security policy
---------------
The build writes a Content-Security-Policy <meta> tag into index.html (see
contentSecurityPolicy() in vite.config.ts): scripts from this site only, and
network requests to this site plus the enquiry endpoint's origin when it is on
another domain. A <meta> policy cannot stop the page being framed; that needs
a frame-ancestors response header from the host.

No PHP here
-----------
The configurator was written for a PHP host such as IONOS: its enquiry is a
JSON POST to enquiry.php, which re-validates, rate limits and emails. GitHub
Pages is static and cannot run PHP, so:

  * enquiry.php, enquiry-config.example.php and .htaccess are deliberately NOT
    published here. Pages would serve the PHP as readable source, which is
    untidy now and a credential leak the day a real enquiry-config.php with a
    mailbox password sits beside it.
  * VITE_ENQUIRY_ENDPOINT is blank in the build, so ENQUIRY_ENDPOINT is null and
    submitEnquiry() returns 'not-sent'. The configurator never claims to have
    sent something it has not. That behaviour is the project's own design.

The handoff
-----------
Rather than leave a dead end where the send used to be, the review dialog now
offers "Send it to Vassallo Developments", which returns to

    ../?spec=<the written specification>&cfg=<share link>#enquire

The Vassallo page reads those on load, fills the message field, ticks the
Window and door replacements chip, and strips the parameters from the URL so a
refresh or a shared link is not stuck with them. One enquiry funnel, not two.

Getting back
------------
The title block carries "Vassallo Developments" with a left arrow, returning to
../ . The title is click-through so the canvas can be dragged beneath it, so
that link sets pointer-events: auto on itself; nothing else in the block takes
a pointer.

Both live in the configurator's own branch (d216733), so a rebuild from it
keeps the back link and the handoff. They sit entirely inside the
null-endpoint branch, so restoring VITE_ENQUIRY_ENDPOINT=enquiry.php gives the
original PHP behaviour untouched.

Worth knowing before this is used for real quoting
--------------------------------------------------
The project's own README marks the frame material table, the manufacturable
limits and the RAL palette as PLACEHOLDER DATA, and the Approved Document K
safety module as "simplified, not a compliance tool". It is Phase 1. Someone
can currently configure something that is not actually manufacturable and send
it in. Treat enquiries from it as a conversation starter, not a specification
to order against, until that data is real.
