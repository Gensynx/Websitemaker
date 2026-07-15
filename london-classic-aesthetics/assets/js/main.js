/* London Classic Aesthetics — shared behaviour.
   Everything is progressive enhancement: the site reads fine with JS off. */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  var lastScrolled = null;
  function onScroll() {
    var scrolled = window.scrollY > 24;
    if (scrolled !== lastScrolled && header) {
      header.classList.toggle('scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Desktop dropdowns ---------- */
  var drops = document.querySelectorAll('.main-nav li.has-drop');
  var closeTimer;
  drops.forEach(function (li) {
    var btn = li.querySelector('.nav-link');
    function open() {
      clearTimeout(closeTimer);
      drops.forEach(function (o) { if (o !== li) close(o); });
      li.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close(target) {
      var el = target || li;
      el.classList.remove('open');
      var b = el.querySelector('.nav-link');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', function () {
      closeTimer = setTimeout(function () { close(); }, 160);
    });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      li.classList.contains('open') ? close() : open();
    });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) close();
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); btn.focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    drops.forEach(function (li) {
      if (!li.contains(e.target)) {
        li.classList.remove('open');
        var b = li.querySelector('.nav-link');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('open', open);
      document.body.classList.toggle('menu-locked', open);
      if (open) {
        var first = mobileMenu.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }
    }
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
    mobileMenu.querySelectorAll('.mob-group > button').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.parentElement;
        var open = g.classList.toggle('open');
        b.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ---------- Scroll reveals (once, staggered via --d) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Photo slots: swap in real images when the files exist ---------- */
  document.querySelectorAll('.art[data-img]').forEach(function (slot) {
    var probe = new Image();
    probe.onload = function () {
      var img = document.createElement('img');
      img.src = slot.dataset.img;
      img.alt = slot.dataset.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      slot.prepend(img);
      slot.classList.add('has-img');
    };
    probe.src = slot.dataset.img;
  });

  /* ---------- Marquee: duplicate track for a seamless loop ---------- */
  document.querySelectorAll('.marquee').forEach(function (mq) {
    var track = mq.querySelector('.marquee-track');
    if (!track || reduceMotion.matches) return;
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    mq.appendChild(clone);
  });

  /* ---------- Gentle parallax on hero blooms ---------- */
  var blooms = document.querySelectorAll('.hero-art .bloom');
  if (blooms.length && !reduceMotion.matches && matchMedia('(pointer: fine)').matches) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        blooms.forEach(function (b, i) {
          b.style.translate = '0 ' + (y * (0.06 + i * 0.04)) + 'px';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Demo enquiry form ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
      setTimeout(function () {
        if (status) {
          status.className = 'form-status ok';
          status.textContent = 'Thank you — your enquiry has been noted. We reply personally, usually within one working day. If it is urgent, email info@londonclassicaesthetics.com.';
          status.focus && status.focus();
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      }, 700);
    });
  });

  /* ---------- Course list (shortlist) ----------
     Users collect Academy courses as they browse; the list persists across
     pages via localStorage and is folded into the enquiry on the contact
     page (chips + a prefilled mailto). */
  (function () {
    var LS_KEY = 'lca-course-list';
    var EMAIL = 'info@londonclassicaesthetics.com';

    function read() {
      try {
        var v = JSON.parse(localStorage.getItem(LS_KEY));
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    }
    function write(list) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
    }
    function has(list, slug) {
      return list.some(function (c) { return c.slug === slug; });
    }

    var fab = document.querySelector('.courselist-fab');
    var drawer = document.querySelector('.courselist-drawer');
    var scrim = document.querySelector('.courselist-scrim');
    var itemsEl = drawer && drawer.querySelector('.courselist-items');
    var footNote = drawer && drawer.querySelector('.cl-mailto');
    var browseHref = drawer ? drawer.getAttribute('data-browse') : 'academy/index.html';

    var iconPlus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>';
    var iconCheck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>';
    var iconX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';

    function mailtoHref(list) {
      var subject = 'Course enquiry (' + list.length + ' course' + (list.length === 1 ? '' : 's') + ')';
      var body = 'Hello LCA,\n\nI would like to enquire about the following courses:\n' +
        list.map(function (c) { return '  - ' + c.name + (c.tag ? ' (' + c.tag + ')' : ''); }).join('\n') +
        '\n\nA little about my background:\n\n\nMy preferred dates or timing:\n\n\nThank you.';
      return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    function render() {
      var list = read();

      /* floating button */
      if (fab) {
        fab.classList.toggle('visible', list.length > 0);
        var count = fab.querySelector('.count');
        if (count) count.textContent = String(list.length);
        fab.setAttribute('aria-label', 'Your course list, ' + list.length + ' course' + (list.length === 1 ? '' : 's'));
        if (!list.length) setOpen(false);
      }

      /* drawer contents */
      if (itemsEl) {
        if (!list.length) {
          itemsEl.innerHTML = '<p class="courselist-empty">Nothing here yet. Browse the <a href="' + browseHref + '">Academy</a> and add the courses that fit your ambition; one enquiry will cover them all.</p>';
        } else {
          itemsEl.innerHTML = list.map(function (c) {
            return '<div class="courselist-item">' +
              '<div><span class="ci-name">' + c.name + '</span>' +
              (c.tag ? '<span class="ci-tag">' + c.tag + '</span>' : '') + '</div>' +
              '<button type="button" class="courselist-remove" data-remove="' + c.slug + '" aria-label="Remove ' + c.name + ' from your list">' + iconX + '</button>' +
              '</div>';
          }).join('');
        }
      }
      if (footNote) footNote.href = mailtoHref(list);

      /* every add button on the page */
      document.querySelectorAll('[data-course-add]').forEach(function (btn) {
        var added = has(list, btn.dataset.slug);
        btn.classList.toggle('added', added);
        btn.setAttribute('aria-pressed', String(added));
        if (btn.classList.contains('row-add')) {
          btn.innerHTML = added ? iconCheck : iconPlus;
          btn.setAttribute('aria-label', (added ? 'Remove ' : 'Add ') + btn.dataset.name + (added ? ' from' : ' to') + ' your course list');
        } else {
          btn.innerHTML = (added ? iconCheck : iconPlus) + '<span>' + (added ? 'On your list' : 'Add to my course list') + '</span>';
        }
      });

      renderContact(list);
    }

    /* contact page integration */
    function renderContact(list) {
      var summary = document.getElementById('course-summary');
      if (!summary) return;
      var chips = document.getElementById('course-chips');
      summary.hidden = !list.length;
      if (chips) {
        chips.innerHTML = list.map(function (c) {
          return '<span class="course-chip">' + c.name +
            '<button type="button" data-remove="' + c.slug + '" aria-label="Remove ' + c.name + '">' + iconX + '</button></span>';
        }).join('');
      }
      if (list.length) {
        var topic = document.getElementById('f-topic');
        if (topic && !topic.value) topic.value = 'A training course';
      }
      var direct = document.querySelector('[data-mailto-courses]');
      if (direct && list.length) direct.href = mailtoHref(list);
    }

    /* drawer open/close */
    var lastFocus = null;
    function setOpen(open) {
      if (!drawer) return;
      var isOpen = document.body.classList.contains('courselist-open');
      if (open === isOpen) return;
      document.body.classList.toggle('courselist-open', open);
      if (fab) fab.setAttribute('aria-expanded', String(open));
      if (open) {
        lastFocus = document.activeElement;
        var close = drawer.querySelector('.courselist-close');
        if (close) close.focus({ preventScroll: true });
      } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus({ preventScroll: true });
      }
    }
    if (fab) fab.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('courselist-open'));
    });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    if (drawer) {
      var closeBtn = drawer.querySelector('.courselist-close');
      if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    /* clicks: add/toggle + remove (delegated) */
    document.addEventListener('click', function (e) {
      var add = e.target.closest && e.target.closest('[data-course-add]');
      if (add) {
        e.preventDefault();
        var list = read();
        if (has(list, add.dataset.slug)) {
          list = list.filter(function (c) { return c.slug !== add.dataset.slug; });
        } else {
          list.push({ slug: add.dataset.slug, name: add.dataset.name, tag: add.dataset.tag || '' });
        }
        write(list);
        render();
        return;
      }
      var rm = e.target.closest && e.target.closest('[data-remove]');
      if (rm) {
        e.preventDefault();
        write(read().filter(function (c) { return c.slug !== rm.dataset.remove; }));
        render();
      }
    });

    /* the demo form acknowledges the attached courses */
    document.querySelectorAll('form[data-demo]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var status = form.querySelector('.form-status');
        var list = read();
        if (status && list.length) {
          setTimeout(function () {
            if (status.classList.contains('ok')) {
              status.textContent = 'Thank you — your enquiry has been noted, including the ' +
                list.length + ' course' + (list.length === 1 ? '' : 's') + ' on your list (' +
                list.map(function (c) { return c.name; }).join(', ') +
                '). We reply personally, usually within one working day.';
            }
          }, 750);
        }
      });
    });

    render();
  })();

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
