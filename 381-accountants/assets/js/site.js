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
