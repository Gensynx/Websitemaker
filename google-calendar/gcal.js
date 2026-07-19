/* ==========================================================================
   Coveworks · Google Calendar Kit — gcal.js
   One drop-in file, no dependencies, no build step.

   Three integrations, all declarative:

   1) BOOKING (Google Calendar appointment schedules)
      <div data-gcal-booking></div>                       inline embed
      <a data-gcal-booking-button>Book a call</a>         opens an overlay
      URL comes from GCAL_CONFIG.bookingUrl, or put it in the attribute:
      <div data-gcal-booking="https://calendar.google.com/calendar/appointments/schedules/XXX"></div>
      Elements stay hidden until a booking URL is configured, so shipping
      this markup on a live site changes nothing until you paste your link.

   2) ADD TO CALENDAR (works with zero setup — it is just a link)
      <a data-gcal-add
         data-title="Consultation"
         data-start="2026-08-01T10:00" data-duration="60"
         data-location="157 Seymour Place, London"
         data-details="Bring previous treatment notes."
         data-timezone="Europe/London">Add to Google Calendar</a>
      All-day: data-start="2026-08-01" (optional data-end = last day, inclusive)
      Repeat:  data-recur="RRULE:FREQ=WEEKLY;BYDAY=MO"

   3) PUBLIC CALENDAR VIEW
      <div data-gcal-view="en.uk#holiday@group.v.calendar.google.com"
           data-mode="AGENDA" data-height="620"></div>

   Configure per site (before this script):
      <script>window.GCAL_CONFIG = { bookingUrl:"", timezone:"Europe/London" };</script>
      <script src="gcal.js" defer></script>

   JS API: GCal.init(root) · GCal.setConfig(obj) · GCal.openBooking(url)
           GCal.addToCalendarUrl(opts) · GCal.bookingEmbedUrl(url) · GCal.viewUrl(opts)
   ========================================================================== */
(function (global) {
  'use strict';

  var CONFIG = {
    bookingUrl: '',
    timezone: '',
    calendarId: '',
    accent: '#C8A566'
  };

  /* ---------- helpers ---------- */

  function assign(target, src) {
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k) && src[k] != null) target[k] = src[k];
    return target;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM[:SS]" into parts without
     touching the Date timezone minefield. Returns null when unreadable. */
  function parseWhen(str) {
    if (!str) return null;
    var m = String(str).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    return {
      y: +m[1], mo: +m[2], d: +m[3],
      h: m[4] == null ? null : +m[4],
      mi: m[5] == null ? 0 : +m[5],
      s: m[6] == null ? 0 : +m[6],
      allDay: m[4] == null
    };
  }

  function fmtDate(p) { return '' + p.y + pad(p.mo) + pad(p.d); }
  function fmtDateTime(p) { return fmtDate(p) + 'T' + pad(p.h) + pad(p.mi) + pad(p.s); }

  /* Add minutes / days using Date only as an arithmetic engine (UTC lane,
     no local-timezone involvement). */
  function shift(p, minutes, days) {
    var t = Date.UTC(p.y, p.mo - 1, p.d, p.h == null ? 0 : p.h, p.mi, p.s) +
            (minutes || 0) * 60000 + (days || 0) * 86400000;
    var d = new Date(t);
    return {
      y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(),
      h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(),
      allDay: p.allDay
    };
  }

  /* ---------- 1) Add-to-calendar URL ---------- */

  /* opts: {title, start, end, duration, details, location, timezone, recur}
     start/end accept the formats parseWhen reads. Timed events are floating
     local times; pass timezone to pin them. For all-day events `end` is the
     LAST day (inclusive) — Google's exclusive end is handled here. */
  function addToCalendarUrl(opts) {
    var start = parseWhen(opts.start);
    if (!start) return null;
    var dates;
    if (start.allDay) {
      var endD = parseWhen(opts.end) || start;
      dates = fmtDate(start) + '/' + fmtDate(shift(endD, 0, 1));
    } else {
      var end = parseWhen(opts.end);
      if (!end || end.allDay) end = shift(start, parseInt(opts.duration, 10) || 60, 0);
      dates = fmtDateTime(start) + '/' + fmtDateTime(end);
    }
    var q = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent(opts.title || 'Appointment'),
      'dates=' + dates
    ];
    if (opts.details)  q.push('details='  + encodeURIComponent(opts.details));
    if (opts.location) q.push('location=' + encodeURIComponent(opts.location));
    var tz = opts.timezone || CONFIG.timezone;
    if (tz)            q.push('ctz='      + encodeURIComponent(tz));
    if (opts.recur)    q.push('recur='    + encodeURIComponent(opts.recur));
    return 'https://calendar.google.com/calendar/render?' + q.join('&');
  }

  /* ---------- 2) Booking (appointment schedules) ---------- */

  /* Accepts a full schedule URL, a calendar.app.google short link, or a
     pasted <iframe …> embed snippet. Returns {embed, open} — `embed` is an
     iframe-safe URL (gv=true) or null when the link can only open in a tab. */
  function normalizeBookingUrl(input) {
    if (!input) return null;
    var url = String(input).trim();
    var m = url.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
    if (m) url = m[1];
    if (!/^https:\/\//i.test(url)) return null;
    var a;
    try { a = new URL(url); } catch (e) { return null; }
    if (a.hostname === 'calendar.app.google') {
      return { embed: null, open: url };
    }
    if (a.hostname === 'calendar.google.com' && /\/appointments\//.test(a.pathname)) {
      a.searchParams.set('gv', 'true');
      return { embed: a.href, open: url };
    }
    /* Unknown booking provider: still usable as a plain link. */
    return { embed: null, open: url };
  }

  /* Hide/show via inline style so it wins over site CSS that sets display
     on the element's class (the `hidden` attribute loses that fight). */
  function conceal(el, state) {
    el.style.display = 'none';
    el.setAttribute('data-gcal-state', state);
  }

  function reveal(el) {
    if (el.style.display === 'none') el.style.display = '';
    el.setAttribute('data-gcal-state', 'ready');
  }

  function makeIframe(src, title, height) {
    var f = document.createElement('iframe');
    f.src = src;
    f.title = title;
    f.loading = 'lazy';
    f.style.cssText = 'width:100%;border:0;display:block;height:' + (parseInt(height, 10) || 640) + 'px';
    return f;
  }

  /* Inline booking embed. Falls back to a link card for short links that
     refuse to be iframed. */
  function mountBooking(el) {
    var link = normalizeBookingUrl(el.getAttribute('data-gcal-booking') || CONFIG.bookingUrl);
    if (!link) { conceal(el, 'unconfigured'); return; }
    reveal(el);
    el.textContent = '';
    if (link.embed) {
      el.appendChild(makeIframe(link.embed, el.getAttribute('data-gcal-title') || 'Book an appointment',
        el.getAttribute('data-height') || 760));
    } else {
      var a = document.createElement('a');
      a.href = link.open;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = el.getAttribute('data-gcal-label') || 'Open the booking page';
      a.style.cssText = 'display:inline-block;padding:14px 22px;border:1px solid currentColor;text-decoration:none;color:inherit;font:inherit';
      el.appendChild(a);
    }
  }

  /* Shared booking overlay (built once, reused). */
  var overlay = null, lastFocus = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Book an appointment');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;' +
      'background:rgba(10,9,6,.72);padding:clamp(8px,3vw,40px)';
    var panel = document.createElement('div');
    panel.style.cssText =
      'position:relative;width:min(1060px,100%);height:min(760px,100%);background:#fff;' +
      'border-radius:10px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.5)';
    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close booking');
    close.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    close.style.cssText =
      'position:absolute;top:10px;right:10px;z-index:1;width:38px;height:38px;display:flex;align-items:center;' +
      'justify-content:center;border:0;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;cursor:pointer';
    close.addEventListener('click', closeBooking);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeBooking(); });
    panel.appendChild(close);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display !== 'none') closeBooking();
    });
    return panel;
  }

  function openBooking(url) {
    var link = normalizeBookingUrl(url || CONFIG.bookingUrl);
    if (!link) return false;
    if (!link.embed) { global.open(link.open, '_blank', 'noopener'); return true; }
    var panel = overlay ? overlay.firstChild : buildOverlay();
    var old = panel.querySelector('iframe');
    if (old) panel.removeChild(old);
    panel.appendChild(makeIframe(link.embed, 'Book an appointment', 9999));
    panel.lastChild.style.height = '100%';
    overlay.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    panel.querySelector('button').focus();
    return true;
  }

  function closeBooking() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function mountBookingButton(el) {
    var url = el.getAttribute('data-gcal-booking-button') || CONFIG.bookingUrl;
    if (!normalizeBookingUrl(url)) { conceal(el, 'unconfigured'); return; }
    reveal(el);
    if (el.getAttribute('data-gcal-bound')) return;
    el.setAttribute('data-gcal-bound', '1');
    if (el.tagName === 'A' && !el.getAttribute('href')) el.setAttribute('href', '#');
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openBooking(el.getAttribute('data-gcal-booking-button') || CONFIG.bookingUrl);
    });
  }

  /* ---------- 3) Public calendar view ---------- */

  /* opts: {id (comma-separated for several), mode MONTH|WEEK|AGENDA,
            timezone, weekstart 1=Mon, bg, showTitle} */
  function viewUrl(opts) {
    var ids = String(opts.id || CONFIG.calendarId || '').split(',');
    if (!ids[0]) return null;
    var q = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i].trim();
      if (id) q.push('src=' + encodeURIComponent(id));
    }
    if (!q.length) return null;
    q.push('mode=' + encodeURIComponent((opts.mode || 'MONTH').toUpperCase()));
    var tz = opts.timezone || CONFIG.timezone;
    if (tz) q.push('ctz=' + encodeURIComponent(tz));
    q.push('wkst=' + (parseInt(opts.weekstart, 10) === 1 ? '2' : '1'));
    if (opts.bg) q.push('bgcolor=' + encodeURIComponent(opts.bg));
    if (!opts.showTitle) q.push('showTitle=0');
    q.push('showPrint=0');
    q.push('showTab=0');
    q.push('showCalendars=0');
    return 'https://calendar.google.com/calendar/embed?' + q.join('&');
  }

  function mountView(el) {
    var src = viewUrl({
      id: el.getAttribute('data-gcal-view'),
      mode: el.getAttribute('data-mode'),
      timezone: el.getAttribute('data-timezone'),
      weekstart: el.getAttribute('data-weekstart'),
      bg: el.getAttribute('data-bg'),
      showTitle: el.getAttribute('data-show-title') === '1'
    });
    if (!src) { conceal(el, 'unconfigured'); return; }
    reveal(el);
    el.textContent = '';
    el.appendChild(makeIframe(src, el.getAttribute('data-gcal-title') || 'Calendar', el.getAttribute('data-height') || 620));
  }

  /* ---------- add-to-calendar elements ---------- */

  function mountAdd(el) {
    var url = addToCalendarUrl({
      title:    el.getAttribute('data-title'),
      start:    el.getAttribute('data-start'),
      end:      el.getAttribute('data-end'),
      duration: el.getAttribute('data-duration'),
      details:  el.getAttribute('data-details'),
      location: el.getAttribute('data-location'),
      timezone: el.getAttribute('data-timezone'),
      recur:    el.getAttribute('data-recur')
    });
    if (!url) { conceal(el, 'invalid-date'); return; }
    reveal(el);
    if (el.tagName === 'A') {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener';
    } else if (!el.getAttribute('data-gcal-bound')) {
      el.setAttribute('data-gcal-bound', '1');
      el.style.cursor = 'pointer';
      el.addEventListener('click', function () { global.open(el.getAttribute('data-gcal-url'), '_blank', 'noopener'); });
    }
    el.setAttribute('data-gcal-url', url);
  }

  /* ---------- init ---------- */

  function initIn(root, selector, fn) {
    var nodes = (root || document).querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function init(root) {
    initIn(root, '[data-gcal-booking]', mountBooking);
    initIn(root, '[data-gcal-booking-button]', mountBookingButton);
    initIn(root, '[data-gcal-add]', mountAdd);
    initIn(root, '[data-gcal-view]', mountView);
  }

  function setConfig(obj) {
    assign(CONFIG, obj || {});
    if (typeof document !== 'undefined') init(document);
    return CONFIG;
  }

  var GCal = {
    init: init,
    setConfig: setConfig,
    config: CONFIG,
    addToCalendarUrl: addToCalendarUrl,
    normalizeBookingUrl: normalizeBookingUrl,
    bookingEmbedUrl: function (url) { var l = normalizeBookingUrl(url); return l ? (l.embed || l.open) : null; },
    openBooking: openBooking,
    closeBooking: closeBooking,
    viewUrl: viewUrl
  };

  global.GCal = GCal;
  if (typeof module !== 'undefined' && module.exports) module.exports = GCal;

  if (typeof document !== 'undefined') {
    assign(CONFIG, global.GCAL_CONFIG || {});
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { init(document); });
    } else {
      init(document);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
