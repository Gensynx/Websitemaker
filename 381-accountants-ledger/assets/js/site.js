/* 381 Accountants, Ledger edition: shared behaviour. No dependencies.
   Everything here is an enhancement; every page works without it. */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------- Header booking button ----------
     While the page's own booking button is at least half visible below the
     header, the header copy steps back so only one "Book" is in view. */
  var barBook = document.querySelector('.bar-book');
  var pageBook = document.querySelector('main a.btn-primary[href*="#book"]');
  if (barBook && pageBook && 'IntersectionObserver' in window) {
    document.body.classList.add('cta-dock');
    var headerH = header ? header.offsetHeight : 0;
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('cta-docked', entries[0].intersectionRatio < 0.5);
    }, { rootMargin: '-' + headerH + 'px 0px 0px 0px', threshold: [0, 0.5, 1] }).observe(pageBook);
  }

  /* ---------- Deadline finder ----------
     Dates are handled in UTC so the user's timezone cannot shift a day. */
  var DAY = 86400000;
  function utc(y, m, d) { return new Date(Date.UTC(y, m, d)); }
  function lastDay(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function isMonthEnd(d) { return d.getUTCDate() === lastDay(d.getUTCFullYear(), d.getUTCMonth()); }
  /* Add calendar months. A month-end date stays at month end (30 June + 9
     months = 31 March), which is how Companies House and HMRC count. */
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var day = isMonthEnd(d) ? lastDay(ty, tm) : Math.min(d.getUTCDate(), lastDay(ty, tm));
    return utc(ty, tm, day);
  }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function today() { var t = new Date(); return utc(t.getFullYear(), t.getMonth(), t.getDate()); }
  var fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  function when(d, now) {
    var days = Math.round((d - now) / DAY);
    if (days < 0) return 'passed';
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    return 'in ' + days + ' days';
  }
  function nextOn(month, day, now) {
    var d = utc(now.getUTCFullYear(), month, day);
    return d < now ? utc(now.getUTCFullYear() + 1, month, day) : d;
  }

  function computeDates(ye, vatOffset) {
    var now = today();
    var rows = [];
    if (ye) {
      var acc = addMonths(ye, 9);
      rows.push([acc, 'Company accounts filed at Companies House']);
      rows.push([addDays(acc, 1), 'Corporation tax paid to HMRC']);
      rows.push([addMonths(ye, 12), 'Company tax return (CT600) filed with HMRC']);
    }
    if (vatOffset) {
      /* Next two VAT returns: period ends on the last day of each quarter
         month; due one month and seven days later. */
      var y = now.getUTCFullYear(), m = now.getUTCMonth() - 3, found = 0;
      for (var i = 0; i < 12 && found < 2; i++, m++) {
        var mm = ((m % 12) + 12) % 12, yy = y + Math.floor(m / 12);
        if ((mm + 1) % 3 !== vatOffset % 3) continue;
        var end = utc(yy, mm, lastDay(yy, mm));
        var due = addDays(addMonths(end, 1), 7);
        if (due < now) continue;
        rows.push([due, 'VAT return filed and paid (quarter to ' + fmt.format(end).replace(/^\w+ /, '') + ')']);
        found++;
      }
    }
    rows.push([nextOn(0, 31, now), 'Self assessment return filed online and the balance paid, plus first payment on account']);
    rows.push([nextOn(6, 31, now), 'Second self assessment payment on account']);
    rows.sort(function (a, b) { return a[0] - b[0]; });
    return { rows: rows, now: now };
  }

  document.querySelectorAll('[data-finder]').forEach(function (finder) {
    var form = finder.querySelector('.finder-form');
    var tbody = finder.querySelector('[data-finder-rows]');
    var yeInput = form.querySelector('[name="ye"]');
    var vatInput = form.querySelector('[name="vat"]');
    function render() {
      var ye = null;
      if (yeInput.value) {
        var p = yeInput.value.split('-');
        ye = utc(+p[0], +p[1] - 1, +p[2]);
      }
      var res = computeDates(ye, +vatInput.value || 0);
      var nextMarked = false;
      tbody.innerHTML = '';
      res.rows.forEach(function (r) {
        var tr = document.createElement('tr');
        var past = r[0] < res.now;
        if (past) tr.className = 'is-past';
        else if (!nextMarked) { tr.className = 'is-next'; nextMarked = true; }
        [fmt.format(r[0]), r[1], when(r[0], res.now)].forEach(function (text, i) {
          var td = document.createElement('td');
          td.textContent = text;
          if (i === 0) td.className = 'mono';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    yeInput.addEventListener('change', render);
    vatInput.addEventListener('change', render);
  });

  /* ---------- Booking form: validate, then compose an email ---------- */
  document.querySelectorAll('form[data-book]').forEach(function (form) {
    var errors = form.querySelector('.form-errors');
    var status = form.querySelector('.form-status');
    function field(name) { return form.querySelector('[name="' + name + '"]'); }
    function val(name) { var f = field(name); return f ? f.value.trim() : ''; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var problems = [];
      [['service', 'Choose a service, or “not sure yet”.'],
       ['name', 'Enter your name.'],
       ['email', 'Enter an email address we can reply to.']].forEach(function (p) {
        var f = field(p[0]);
        var bad = !f.value.trim() || (p[0] === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) problems.push([f, p[1]]);
      });
      if (problems.length) {
        errors.hidden = false;
        errors.textContent = problems.map(function (p) { return p[1]; }).join(' ');
        problems[0][0].focus();
        return;
      }
      errors.hidden = true;
      var service = val('service');
      var lines = ['Hello 381 Accountants,', '', 'I would like to book a free consultation.', '',
        'Service: ' + service, 'Name: ' + val('name'), 'Phone: ' + val('phone'), 'Email: ' + val('email')];
      if (val('message')) lines.push('', 'Details:', val('message'));
      window.location.href = 'mailto:info@381abs.com?subject=' +
        encodeURIComponent('Consultation request: ' + service) + '&body=' + encodeURIComponent(lines.join('\n'));
      status.textContent = 'Your email draft has opened. Press send and we will reply within one working day.';
    });
  });

  /* Pre-select a service when arriving with ?service=… */
  var wanted = new URLSearchParams(window.location.search).get('service');
  if (wanted) {
    document.querySelectorAll('select[name="service"]').forEach(function (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase() === wanted.toLowerCase()) { sel.selectedIndex = i; break; }
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
