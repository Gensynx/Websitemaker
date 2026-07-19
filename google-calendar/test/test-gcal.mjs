import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const GCal = require(new URL('../gcal.js', import.meta.url).pathname);

let fails = 0;
function eq(name, got, want) {
  if (got !== want) { fails++; console.log('FAIL', name, '\n  got  ', got, '\n  want ', want); }
  else console.log('ok  ', name);
}

// timed event with duration + timezone
eq('timed+duration',
  GCal.addToCalendarUrl({title:'Fitting · Dar Ul Amir', start:'2026-08-01T10:00', duration:'90', location:'157 Seymour Place, London', timezone:'Europe/London'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Fitting%20%C2%B7%20Dar%20Ul%20Amir&dates=20260801T100000/20260801T113000&location=157%20Seymour%20Place%2C%20London&ctz=Europe%2FLondon');

// timed event with explicit end, crossing midnight
eq('timed+end-cross-midnight',
  GCal.addToCalendarUrl({title:'X', start:'2026-12-31T23:30', end:'2027-01-01T00:30'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=X&dates=20261231T233000/20270101T003000');

// default 60min when no end/duration
eq('timed default 60',
  GCal.addToCalendarUrl({title:'X', start:'2026-08-01T10:00'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=X&dates=20260801T100000/20260801T110000');

// all-day single day -> exclusive end +1
eq('all-day single',
  GCal.addToCalendarUrl({title:'Open day', start:'2026-08-01'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Open%20day&dates=20260801/20260802');

// all-day range inclusive end -> exclusive +1, month rollover
eq('all-day range rollover',
  GCal.addToCalendarUrl({title:'Course', start:'2026-08-30', end:'2026-08-31'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Course&dates=20260830/20260901');

// recur + details
eq('recur',
  GCal.addToCalendarUrl({title:'Clinic', start:'2026-08-03T09:00', duration:'30', recur:'RRULE:FREQ=WEEKLY;BYDAY=MO', details:'Weekly clinic'}),
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Clinic&dates=20260803T090000/20260803T093000&details=Weekly%20clinic&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DMO');

// invalid date -> null
eq('invalid', GCal.addToCalendarUrl({title:'X', start:'01/08/2026'}), null);

// booking URL normalization
let b = GCal.normalizeBookingUrl('https://calendar.google.com/calendar/appointments/schedules/AcZss?param=1');
eq('booking full link embed', b.embed, 'https://calendar.google.com/calendar/appointments/schedules/AcZss?param=1&gv=true');
b = GCal.normalizeBookingUrl('  <iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZss?gv=true" style="border:0" width="100%" height="600"></iframe>');
eq('booking iframe paste', b.embed, 'https://calendar.google.com/calendar/appointments/schedules/AcZss?gv=true');
b = GCal.normalizeBookingUrl('https://calendar.app.google/abc123');
eq('short link no embed', b.embed, null);
eq('short link opens', b.open, 'https://calendar.app.google/abc123');
eq('http rejected', GCal.normalizeBookingUrl('http://calendar.google.com/x'), null);
eq('empty rejected', GCal.normalizeBookingUrl(''), null);
b = GCal.normalizeBookingUrl('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZss');
eq('u/0 path embed', b.embed, 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZss?gv=true');

// view url
eq('view url',
  GCal.viewUrl({id:'en.uk#holiday@group.v.calendar.google.com', mode:'agenda', timezone:'Europe/London', weekstart:'1'}),
  'https://calendar.google.com/calendar/embed?src=en.uk%23holiday%40group.v.calendar.google.com&mode=AGENDA&ctz=Europe%2FLondon&wkst=2&showTitle=0&showPrint=0&showTab=0&showCalendars=0');
eq('view multiple ids', GCal.viewUrl({id:'a@x.com, b@y.com'}).includes('src=a%40x.com&src=b%40y.com'), true);
eq('view empty', GCal.viewUrl({id:''}), null);

console.log(fails ? ('\n' + fails + ' FAILURES') : '\nall tests passed');
process.exit(fails ? 1 : 0);
