<?php
/**
 * Enquiry settings. On the server, copy this file to enquiry-config.php and
 * fill in the two addresses. enquiry-config.php is not part of the build, so
 * uploading a new version of the configurator never overwrites it.
 *
 * Until enquiry-config.php exists, the page tells customers that enquiries
 * are not set up yet and offers to copy the enquiry for them.
 */

return [
    // Who receives each enquiry.
    'to' => 'enquiries@your-domain.co.uk',

    // Who it is sent from. Must be a real mailbox on THIS website's domain
    // (create it in IONOS under Email), or many mail servers — IONOS's
    // included — will reject or junk it. Replies go to the customer, not here.
    'from' => 'configurator@your-domain.co.uk',

    // Enquiries one connection may send in an hour.
    'per_hour' => 5,
];
