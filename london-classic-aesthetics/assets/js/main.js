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

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
