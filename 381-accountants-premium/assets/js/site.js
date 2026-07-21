/* 381 Accountants premium edition. Shared behaviour, no dependencies. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, sc) { return (sc || document).querySelector(s); };
  var $$ = function (s, sc) { return Array.prototype.slice.call((sc || document).querySelectorAll(s)); };

  /* ---------- Header, scroll progress, back-to-top ---------- */
  var header = $('.site-header');
  var progress = $('.progress-bar i');
  var toTop = $('.to-top');
  var ringFill = $('.to-top .ring-fill');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    if (progress) progress.style.width = (p * 100).toFixed(2) + '%';
    if (toTop) {
      toTop.classList.toggle('show', y > 700);
      if (ringFill) ringFill.style.strokeDashoffset = String(132 - 132 * p);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- Mobile menu ---------- */
  var toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.menu-overlay').setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    $$('.menu-links a, .menu-foot a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) toggle.click();
    });
  }

  /* ---------- Hero headline word reveal ---------- */
  var h1 = $('.hero h1');
  if (h1 && !reduced) {
    var splitNode = function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var inner = document.createElement('span'); inner.textContent = part;
          w.appendChild(inner); frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        Array.prototype.slice.call(node.childNodes).forEach(splitNode);
      }
    };
    Array.prototype.slice.call(h1.childNodes).forEach(splitNode);
    var words = $$('.w > span', h1);
    words.forEach(function (s, i) { s.style.transitionDelay = (0.12 + i * 0.055) + 's'; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('played'); }); });
  } else if (h1) { h1.classList.add('played'); }

  /* ---------- Hero pointer parallax ---------- */
  var visual = $('.hero-visual');
  if (visual && finePointer && !reduced) {
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      $$('.hv-layer', visual).forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth') || '10');
        l.style.transform = 'translate3d(' + (-x * d) + 'px,' + (-y * d) + 'px,0)';
      });
    });
    hero.addEventListener('pointerleave', function () {
      $$('.hv-layer', visual).forEach(function (l) { l.style.transform = ''; });
    });
  }

  /* ---------- Rotating status ticker ---------- */
  var ticker = $('.hv-ticker');
  if (ticker) {
    var lines = $$('p', ticker);
    var ti = 0;
    lines[0].classList.add('on');
    if (lines.length > 1 && !reduced) {
      setInterval(function () {
        lines[ti].classList.remove('on');
        ti = (ti + 1) % lines.length;
        lines[ti].classList.add('on');
      }, 3200);
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Tilt + spotlight cards ---------- */
  if (finePointer && !reduced) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 5) + 'deg) rotateY(' + ((px - 0.5) * 5) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Marquee: duplicate content for seamless loop ---------- */
  $$('.marquee').forEach(function (mq) {
    var inner = mq.firstElementChild;
    if (inner) mq.appendChild(inner.cloneNode(true));
  });

  /* ---------- Reveals ---------- */
  var items = $$('.rv, .rv-l, .rv-r');
  if (!reduced && 'IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var raw = el.getAttribute('data-count');
        var target = parseFloat(raw);
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = (raw.split('.')[1] || '').length;
        var t0 = null, dur = 1300;
        var tick = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Countdown to 31 January ---------- */
  function nextDeadline() {
    var now = new Date();
    var y = now.getFullYear();
    var d = new Date(y, 0, 31, 23, 59, 59);
    if (now > d) d = new Date(y + 1, 0, 31, 23, 59, 59);
    return d;
  }
  var cds = $$('[data-countdown]');
  if (cds.length) {
    var target = nextDeadline();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var render = function () {
      var ms = Math.max(0, target - new Date());
      var days = Math.floor(ms / 86400000);
      var hrs = Math.floor(ms / 3600000) % 24;
      var min = Math.floor(ms / 60000) % 60;
      var sec = Math.floor(ms / 1000) % 60;
      cds.forEach(function (el) {
        if (el.hasAttribute('data-compact')) {
          el.innerHTML = '<b>' + days + 'd</b> ' + pad(hrs) + 'h ' + pad(min) + 'm ' + pad(sec) + 's';
        } else {
          $$('[data-cd-d]', el).forEach(function (n) { n.textContent = String(days); });
          $$('[data-cd-h]', el).forEach(function (n) { n.textContent = pad(hrs); });
          $$('[data-cd-m]', el).forEach(function (n) { n.textContent = pad(min); });
          $$('[data-cd-s]', el).forEach(function (n) { n.textContent = pad(sec); });
        }
      });
    };
    render();
    setInterval(render, 1000);
  }

  /* ---------- Service showcase tabs ---------- */
  $$('.showcase').forEach(function (sc) {
    var tabs = $$('.show-item', sc);
    var views = $$('.show-view', sc);
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('on'); t.setAttribute('aria-selected', 'false'); });
        views.forEach(function (v) { v.classList.remove('on'); });
        tab.classList.add('on');
        tab.setAttribute('aria-selected', 'true');
        views[i].classList.add('on');
      });
    });
  });

  /* ---------- Take-home calculator ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var slider = $('input[type=range]', calc);
    var out = $('output', calc);
    var mode = 'employee';
    var fmt = function (n) { return '£' + Math.round(n).toLocaleString('en-GB'); };

    function incomeTax(taxable) {
      var pa = 12570;
      if (taxable > 100000) pa = Math.max(0, pa - (taxable - 100000) / 2);
      var t = Math.max(0, taxable - pa), tax = 0;
      var basic = Math.min(t, 37700); tax += basic * 0.2; t -= basic;
      var higher = Math.min(t, 125140 - 12570 - 37700); tax += Math.max(0, higher) * 0.4; t -= Math.max(0, higher);
      tax += Math.max(0, t) * 0.45;
      return tax;
    }
    function ni(income, mainRate) {
      var n = 0;
      n += Math.max(0, Math.min(income, 50270) - 12570) * mainRate;
      n += Math.max(0, income - 50270) * 0.02;
      return n;
    }
    function corpTax(profit) {
      if (profit <= 50000) return profit * 0.19;
      if (profit <= 250000) return 50000 * 0.19 + (profit - 50000) * 0.265;
      return profit * 0.25;
    }
    function dividendTax(divs, salary) {
      var taxable = Math.max(0, divs - 500);
      var basicRoom = Math.max(0, 37700 - Math.max(0, salary - 12570));
      var t = 0;
      var basic = Math.min(taxable, basicRoom); t += basic * 0.0875; taxable -= basic;
      var higherRoom = Math.max(0, 125140 - 12570 - 37700);
      var higher = Math.min(taxable, higherRoom); t += higher * 0.3375; taxable -= higher;
      t += Math.max(0, taxable) * 0.3935;
      return t;
    }
    function compute(income) {
      if (mode === 'employee') {
        var it = incomeTax(income), n = ni(income, 0.08);
        return { take: income - it - n, tax: it, ni: n };
      }
      if (mode === 'sole') {
        var it2 = incomeTax(income), n2 = ni(income, 0.06);
        return { take: income - it2 - n2, tax: it2, ni: n2 };
      }
      var salary = Math.min(income, 12570);
      var profit = Math.max(0, income - salary);
      var ct = corpTax(profit);
      var divs = profit - ct;
      var dt = dividendTax(divs, salary);
      return { take: salary + divs - dt, tax: ct + dt, ni: 0 };
    }
    var takeEl = $('[data-out=take]', calc);
    var taxEl = $('[data-out=tax]', calc);
    var niEl = $('[data-out=ni]', calc);
    var keepEl = $('[data-out=keep]', calc);
    var bars = { take: $('.cr-take i', calc), tax: $('.cr-tax i', calc), ni: $('.cr-ni i', calc) };
    var current = { take: 0, tax: 0, ni: 0 };
    var animRaf = null;
    function render() {
      var income = parseInt(slider.value, 10);
      out.textContent = fmt(income);
      slider.style.setProperty('--fill', ((income - slider.min) / (slider.max - slider.min) * 100) + '%');
      var r = compute(income);
      var from = { take: current.take, tax: current.tax, ni: current.ni };
      current = r;
      if (animRaf) cancelAnimationFrame(animRaf);
      var t0 = null, dur = reduced ? 0 : 500;
      var stepA = function (t) {
        if (!t0) t0 = t;
        var p = dur ? Math.min((t - t0) / dur, 1) : 1;
        var e = 1 - Math.pow(1 - p, 3);
        var v = {
          take: from.take + (r.take - from.take) * e,
          tax: from.tax + (r.tax - from.tax) * e,
          ni: from.ni + (r.ni - from.ni) * e,
        };
        takeEl.textContent = fmt(v.take);
        taxEl.textContent = fmt(v.tax);
        niEl.textContent = fmt(v.ni);
        keepEl.textContent = income > 0 ? Math.round(v.take / income * 100) + '%' : '100%';
        if (p < 1) animRaf = requestAnimationFrame(stepA);
      };
      animRaf = requestAnimationFrame(stepA);
      bars.take.style.width = (r.take / income * 100) + '%';
      bars.tax.style.width = (r.tax / income * 100) + '%';
      bars.ni.style.width = (r.ni / income * 100) + '%';
    }
    $$('.seg button', calc).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.seg button', calc).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = b.getAttribute('data-mode');
        render();
      });
    });
    slider.addEventListener('input', render);
    render();
  }

  /* ---------- Carousels ---------- */
  $$('[data-carousel]').forEach(function (wrapEl) {
    var track = $('.carousel', wrapEl);
    var step = function () { return track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 20 : 400; };
    var prev = $('.car-prev', wrapEl), next = $('.car-next', wrapEl);
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }); });
  });

  /* ---------- Booking wizard ---------- */
  $$('[data-wizard]').forEach(function (wiz) {
    var stepsEls = $$('.wiz-step', wiz);
    var dots = $$('.wiz-dots li', wiz);
    var bar = $('.wiz-progress i', wiz);
    var form = $('form', wiz);
    var serviceInput = $('input[name=service]', wiz);
    var at = 0;
    function go(n) {
      at = n;
      stepsEls.forEach(function (s, i) { s.classList.toggle('on', i === n); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i <= n); });
      if (bar) bar.style.width = ((n + 1) / stepsEls.length * 100) + '%';
      if (n === 2) fillSummary();
    }
    function err(stepEl, msg) {
      var e = $('.wiz-err', stepEl);
      if (e) { e.textContent = msg || ''; e.classList.toggle('show', !!msg); }
    }
    $$('.wiz-chip', wiz).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.wiz-chip', wiz).forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        serviceInput.value = chip.getAttribute('data-service');
        err(stepsEls[0], '');
      });
    });
    function get(name) {
      var f = form.querySelector('[name="' + name + '"]');
      return f ? f.value.trim() : '';
    }
    function fillSummary() {
      var sum = $('.wiz-summary', wiz);
      var rows = [
        ['Service', get('service')],
        ['Name', get('name')],
        ['Email', get('email')],
        ['Phone', get('phone') || 'Not given'],
      ];
      var msg = get('message');
      if (msg) rows.push(['Notes', msg]);
      sum.innerHTML = rows.map(function (r) { return '<div><span>' + r[0] + '</span><b></b></div>'; }).join('');
      $$('b', sum).forEach(function (b, i) { b.textContent = rows[i][1]; });
    }
    $$('.wiz-next', wiz).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (at === 0 && !get('service')) { err(stepsEls[0], 'Choose a service to continue, or pick “Not sure yet”.'); return; }
        if (at === 1) {
          if (!get('name')) { err(stepsEls[1], 'Add your name so we know who to reply to.'); return; }
          var em = get('email');
          if (!em || em.indexOf('@') < 1 || em.indexOf('.') < 0) { err(stepsEls[1], 'Add a valid email address so we can reply.'); return; }
          err(stepsEls[1], '');
        }
        go(Math.min(at + 1, 2));
      });
    });
    $$('.wiz-back', wiz).forEach(function (btn) {
      btn.addEventListener('click', function () { go(Math.max(at - 1, 0)); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var service = get('service') || 'General enquiry';
      var lines = [
        'Hello 381 Accountants,', '',
        'I would like to book a free consultation.', '',
        'Service: ' + service,
        'Name: ' + get('name'),
        'Phone: ' + get('phone'),
        'Email: ' + get('email'),
      ];
      var msg = get('message');
      if (msg) lines.push('', 'Details:', msg);
      window.location.href = 'mailto:info@381abs.com'
        + '?subject=' + encodeURIComponent('Consultation request: ' + service)
        + '&body=' + encodeURIComponent(lines.join('\n'));
      var status = $('.form-status', wiz);
      if (status) {
        status.textContent = 'Your email draft has opened. Press send and we reply within one working day.';
        status.classList.add('ok');
      }
    });
    /* pre-select from ?service= */
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('service');
    if (wanted) {
      $$('.wiz-chip', wiz).forEach(function (chip) {
        if (chip.getAttribute('data-service').toLowerCase() === wanted.toLowerCase()) chip.click();
      });
    }
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
