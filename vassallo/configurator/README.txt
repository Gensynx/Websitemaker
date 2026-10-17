3D door and window configurator, published inside the Vassallo site
===================================================================

This folder is a BUILD, not source. The source is the door-window-configurator
project on branch claude/stoic-knuth-ymog8j (React, Vite, TypeScript, React
Three Fiber). Built 2026-10-17 from that branch's head, 63333b4.

Rebuild:
  git archive origin/claude/stoic-knuth-ymog8j door-window-configurator | tar -x
  cd door-window-configurator
  patch -p0 < path/to/handoff.patch        # see "The handoff" below
  # blank VITE_ENQUIRY_ENDPOINT in .env.production (see "No PHP here")
  npm install && npm run build
  # copy dist/index.html and dist/assets into this folder; leave the PHP out

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

handoff.patch is that change against ReviewDialog.tsx at 63333b4. It is
additive and sits entirely inside the null-endpoint branch, so restoring
VITE_ENQUIRY_ENDPOINT=enquiry.php gives the original PHP behaviour untouched.
It should be merged into the configurator's own branch so the two do not drift.

Worth knowing before this is used for real quoting
--------------------------------------------------
The project's own README marks the frame material table, the manufacturable
limits and the RAL palette as PLACEHOLDER DATA, and the Approved Document K
safety module as "simplified, not a compliance tool". It is Phase 1. Someone
can currently configure something that is not actually manufacturable and send
it in. Treat enquiries from it as a conversation starter, not a specification
to order against, until that data is real.
