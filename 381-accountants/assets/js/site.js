/* 381 Accountants — shared behaviour. No dependencies. */
(function () {
  'use strict';

  /* Sticky header shadow */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Header booking button: while the page's own primary button is (mostly)
     on screen, the header copy steps back so there is only ever one "Book"
     competing for attention; once that button scrolls away, it returns.
     Without JavaScript (or IntersectionObserver) it simply stays visible. */
  var navBook = document.querySelector('.nav-book');
  var pageBook = document.querySelector('main .btn-gold');
  if (navBook && pageBook && 'IntersectionObserver' in window) {
    document.body.classList.add('cta-dock');
    /* The sticky header covers the top of the viewport, so a button tucked
       underneath it counts as gone. */
    var headerH = header ? header.offsetHeight : 0;
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('cta-docked', entries[0].intersectionRatio < 0.5);
    }, { rootMargin: '-' + headerH + 'px 0px 0px 0px', threshold: [0, 0.5, 1] }).observe(pageBook);
  }

  /* Scroll reveal */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.rv');
  if (!reduced && 'IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Stat counters (data-count on .trust-cell b) */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var raw = el.getAttribute('data-count');
        var target = parseFloat(raw);
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = (raw.split('.')[1] || '').length;
        var t0 = null, dur = 1100;
        var tick = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Deadline finder: works out accounts, corporation tax, CT600, VAT and
     self assessment dates. Dates are handled in UTC so the visitor's
     timezone cannot shift a day. */
  var DAY = 86400000;
  function utc(y, m, d) { return new Date(Date.UTC(y, m, d)); }
  function lastDay(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function isMonthEnd(d) { return d.getUTCDate() === lastDay(d.getUTCFullYear(), d.getUTCMonth()); }
  /* Calendar months; a month-end date stays at month end (30 June + 9
     months = 31 March), which is how Companies House and HMRC count. */
  function addMonths(d, n) {
    var m = d.getUTCMonth() + n;
    var ty = d.getUTCFullYear() + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var day = isMonthEnd(d) ? lastDay(ty, tm) : Math.min(d.getUTCDate(), lastDay(ty, tm));
    return utc(ty, tm, day);
  }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function today() { var t = new Date(); return utc(t.getFullYear(), t.getMonth(), t.getDate()); }
  var fmtDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fmtShort = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  function until(d, now) {
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
  function deadlineRows(ye, vatOffset, now) {
    var rows = [];
    if (ye) {
      var acc = addMonths(ye, 9);
      rows.push([acc, 'Company accounts filed at Companies House']);
      rows.push([addDays(acc, 1), 'Corporation tax paid to HMRC']);
      rows.push([addMonths(ye, 12), 'Company tax return (CT600) filed with HMRC']);
    }
    if (vatOffset) {
      /* The next two VAT returns still to come: each period ends on the
         last day of a quarter month and is due one month and seven days later. */
      var m = now.getUTCMonth() - 3, found = 0;
      for (var i = 0; i < 12 && found < 2; i++, m++) {
        var mm = ((m % 12) + 12) % 12, yy = now.getUTCFullYear() + Math.floor(m / 12);
        if ((mm + 1) % 3 !== vatOffset % 3) continue;
        var end = utc(yy, mm, lastDay(yy, mm));
        var due = addDays(addMonths(end, 1), 7);
        if (due < now) continue;
        rows.push([due, 'VAT return filed and paid (quarter to ' + fmtShort.format(end) + ')']);
        found++;
      }
    }
    rows.push([nextOn(0, 31, now), 'Self assessment return filed online and the balance paid, plus first payment on account']);
    rows.push([nextOn(6, 31, now), 'Second self assessment payment on account']);
    return rows.sort(function (a, b) { return a[0] - b[0]; });
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
      var now = today();
      var marked = false;
      tbody.innerHTML = '';
      deadlineRows(ye, +vatInput.value || 0, now).forEach(function (r) {
        var tr = document.createElement('tr');
        if (r[0] < now) tr.className = 'is-past';
        else if (!marked) { tr.className = 'is-next'; marked = true; }
        [fmtDate.format(r[0]), r[1], until(r[0], now)].forEach(function (text) {
          var td = document.createElement('td');
          td.textContent = text;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      finder.classList.add('has-dates');
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    yeInput.addEventListener('change', render);
    vatInput.addEventListener('change', render);
  });

  /* Booking / enquiry forms — compose an email to the practice.
     Works with no backend: builds a mailto: draft from the fields. */
  document.querySelectorAll('form[data-book]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var get = function (name) {
        var f = form.querySelector('[name="' + name + '"]');
        return f ? f.value.trim() : '';
      };
      var service = get('service') || 'General enquiry';
      var lines = [
        'Hello 381 Accountants,',
        '',
        'I would like to book a free consultation.',
        '',
        'Service: ' + service,
        'Name: ' + get('name'),
        'Phone: ' + get('phone'),
        'Email: ' + get('email')
      ];
      var msg = get('message');
      if (msg) lines.push('', 'Details:', msg);
      var href = 'mailto:info@381abs.com'
        + '?subject=' + encodeURIComponent('Consultation request — ' + service)
        + '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      var status = form.querySelector('.form-status');
      if (status) {
        status.textContent = 'Your email draft has opened — press send and we will come back to you within one working day.';
        status.classList.add('ok');
      }
    });
  });

  /* Pre-select a service when arriving with ?service=… */
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get('service');
  if (wanted) {
    document.querySelectorAll('select[name="service"]').forEach(function (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase() === wanted.toLowerCase()) {
          sel.selectedIndex = i;
          break;
        }
      }
    });
  }

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
