# Google Calendar Kit

Drop-in Google Calendar integration for the static sites in this repo. No build step, no dependencies, no API keys — one script (`gcal.js`) and plain HTML attributes.

**Open `index.html` for the interactive version of this document**: live demos, a wizard that generates your exact snippets, and the full attribute reference.

## What it does

| Mode | What the visitor sees | Google setup needed |
|---|---|---|
| **Booking** | "Book a call" button opening your Google appointment schedule in an overlay, or the schedule embedded inline on the page | Create an appointment schedule, copy its share link |
| **Add to calendar** | A button that opens Google Calendar prefilled with your event (date, time, place, notes) | None — it's just a link |
| **Calendar view** | A live month/week/agenda view of a calendar | Make the calendar public, copy its ID |

## Using it on a site

1. Copy `gcal.js` into the site's folder (each site in this repo is self-contained by design).
2. Before `</body>`:

```html
<script>window.GCAL_CONFIG = { bookingUrl: "", timezone: "Europe/London" };</script>
<script src="gcal.js" defer></script>
```

3. Add elements anywhere in the page:

```html
<!-- booking button (opens overlay) -->
<a class="btn" data-gcal-booking-button href="#">Book a call</a>

<!-- inline booking embed -->
<div data-gcal-booking data-height="700"></div>

<!-- add-to-calendar link: timed event -->
<a data-gcal-add
   data-title="Consultation"
   data-start="2026-08-01T10:00" data-duration="60"
   data-location="157 Seymour Place, London"
   data-details="Bring previous treatment notes."
   data-timezone="Europe/London">Add to Google Calendar</a>

<!-- add-to-calendar: all-day range (data-end = last day, inclusive) -->
<a data-gcal-add data-title="Foundation course" data-start="2026-09-12" data-end="2026-09-13">Save the dates</a>

<!-- live public calendar -->
<div data-gcal-view="YOUR_ID@group.calendar.google.com" data-mode="AGENDA" data-weekstart="1"></div>
```

**Safe on live sites:** every booking/view element hides itself until a real URL/ID is configured, so you can ship the markup first and activate it later by filling in `bookingUrl`. `GCAL_CONFIG.bookingUrl` is the site-wide default; a URL in the attribute itself overrides it per element.

## Getting the Google links

- **Booking link** — calendar.google.com → **Create → Appointment schedule** → set availability → save → click it → **Share** → copy the link (or the website-embed code; both work). Full `calendar.google.com/calendar/appointments/schedules/...` links embed inline; short `calendar.app.google/...` links open in a new tab instead (Google doesn't allow those in iframes). Free Gmail = one schedule; Workspace = several + email reminders.
- **Calendar ID** — calendar settings → **Access permissions** → *Make available to public*, then **Integrate calendar** → *Calendar ID*.

## JS API

Everything is also scriptable (all attributes have an equivalent option):

```js
GCal.setConfig({ bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/…" });
GCal.openBooking();                 // open the overlay programmatically
GCal.addToCalendarUrl({ title, start, end, duration, details, location, timezone, recur }); // → URL
GCal.viewUrl({ id, mode, timezone, weekstart });                                            // → embed URL
GCal.init(rootElement);             // re-scan markup added after load
```

Dates use `YYYY-MM-DD` (all-day) or `YYYY-MM-DDTHH:MM` (timed). Timed events with a `timezone` are pinned to it; without one they land in the viewer's timezone. Repeats via `recur: "RRULE:FREQ=WEEKLY;BYDAY=MO"`.

## Live integration in this repo

`coveworks/index.html` ships with a **Book a call** button in its contact section, wired to this kit's overlay pattern. It stays hidden until a booking link is set in the `CW_BOOKING_URL` constant at the top of the site's script — paste the studio's schedule link there and it appears.

## Tests

`node google-calendar/test/test-gcal.mjs` — unit tests for the URL builders (date maths, all-day exclusivity, link normalisation).
