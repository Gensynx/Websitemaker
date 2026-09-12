/* ============================================================
   NUISANCE 1989 — shared behaviour for every page.
   No dependencies, no build step. Everything here feature-detects
   the elements it needs, so one file serves all twelve pages.
   Product data comes from assets/data.js, which the generator
   emits, so the pages and the bag cannot drift apart.
   ============================================================ */
(function () {
  "use strict";
  var P = window.NSC_PRODUCTS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function find(sku) { for (var i = 0; i < P.length; i++) if (P[i].sku === sku) return P[i]; }
  function money(n) { return "£" + n.toFixed(n % 1 ? 2 : 0); }

  /* ---------- skin ---------- */
  var SKINS = ["asphalt", "paper"];
  function setSkin(s, remember) {
    if (SKINS.indexOf(s) < 0) s = "asphalt";
    document.documentElement.setAttribute("data-skin", s);
    if (remember) { try { localStorage.setItem("nsc-skin", s); } catch (e) {} }
    $$("[data-skin-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-skin-btn") === s));
    });
  }
  $$("[data-skin-btn]").forEach(function (b) {
    b.addEventListener("click", function () { setSkin(b.getAttribute("data-skin-btn"), true); });
  });
  setSkin(document.documentElement.getAttribute("data-skin") || "asphalt", false);

  /* ---------- garment flats (drawn, so a missing photo never breaks a page) ---------- */
  var CLOTH = {
    bone:    { fill: "#E8E2D6", seam: "#C4BBA9", ink: "#14120F", bg: "#E7E1D5" },
    asphalt: { fill: "#1B1815", seam: "#332F28", ink: "#E8E2D6", bg: "#14120F" },
    ring:    { fill: "#A3312A", seam: "#7A231D", ink: "#F0E9DD", bg: "#E7E1D5" },
    plate:   { fill: "#F2CB05", seam: "#BF9F04", ink: "#14120F", bg: "#E7E1D5" }
  };
  function mark(c, y, size) {
    return '<text x="200" y="' + y + '" text-anchor="middle" fill="' + c.ink +
      '" font-family="Bodoni Moda, Didot, Georgia, serif" font-size="' + size +
      '" letter-spacing="' + (size * 0.035).toFixed(2) + '">NUISANCE</text>' +
      '<text x="200" y="' + (y + size * 0.88).toFixed(1) + '" text-anchor="middle" fill="' + c.ink +
      '" font-family="Bodoni Moda, Didot, Georgia, serif" font-size="' + (size * 0.38).toFixed(1) +
      '" letter-spacing="' + (size * 0.10).toFixed(2) + '">1989</text>';
  }
  function flat(shape, key) {
    var c = CLOTH[key] || CLOTH.bone;
    var o = '<svg viewBox="0 0 400 470" role="img" aria-label="Garment flat" style="background:' + c.bg + '">';
    if (shape === "hoodie") {
      return o +
        '<path d="M138 84 C120 6 280 6 262 84 Z" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
        '<path d="M148 70 L300 70 L374 116 L332 218 L308 204 L308 442 L92 442 L92 204 L68 218 L26 116 L100 70 Z" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
        '<path d="M96 418 L304 418" stroke="' + c.seam + '" stroke-width="6"/>' + mark(c, 216, 25) + "</svg>";
    }
    if (shape === "shorts") {
      return o +
        '<rect x="72" y="90" width="256" height="42" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
        '<path d="M72 132 L328 132 L316 378 L212 378 L200 240 L188 378 L84 378 Z" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
        '<text x="130" y="200" text-anchor="middle" fill="' + c.ink + '" font-family="Bodoni Moda, Didot, Georgia, serif" font-size="17">NUISANCE</text></svg>';
    }
    if (shape === "cap") {
      return o +
        '<path d="M70 272 C96 348 304 348 330 272 Z" fill="' + c.seam + '"/>' +
        '<path d="M86 274 C86 152 314 152 314 274 Z" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
        '<text x="200" y="250" text-anchor="middle" fill="' + c.ink + '" font-family="Bodoni Moda, Didot, Georgia, serif" font-size="22">Nuisance</text></svg>';
    }
    return o +
      '<path d="M150 34 C152 64 248 64 250 34 L302 50 L374 98 L332 200 L308 186 L308 448 L92 448 L92 186 L68 200 L26 98 L98 50 Z" fill="' + c.fill + '" stroke="' + c.seam + '" stroke-width="2"/>' +
      '<path d="M143 32 C146 76 254 76 257 32" fill="none" stroke="' + c.seam + '" stroke-width="7" stroke-linecap="round"/>' +
      mark(c, 208, 25) + "</svg>";
  }
  window.NSCflat = flat;

  /* photo layers over the flat; a missing file removes its own <img> */
  function slotInner(p, soft) {
    var s = flat(p.shape, p.cloth);
    if (!p.photo) return s;
    var alt = p.name + ", " + p.colour;
    return s +
      '<img src="images/' + p.photo + '" alt="' + alt + '" loading="lazy" onerror="this.remove()">' +
      '<img class="blur" src="images/' + p.photo + '" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">';
  }
  $$("[data-slot]").forEach(function (el) {
    var p = find(el.getAttribute("data-slot"));
    if (p) el.innerHTML = el.innerHTML + slotInner(p);
  });

  /* lookbook rail draws its own flats behind each photo slot */
  $$(".pl-flat").forEach(function (el) {
    el.innerHTML = flat(el.getAttribute("data-shape"), el.getAttribute("data-cloth"));
  });

  /* ---------- bag, kept in localStorage so it survives page changes ---------- */
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem("nsc-bag") || "[]") || []; } catch (e) { bag = []; }
  bag = bag.filter(function (l) { return l && find(l.sku) && l.qty > 0; });
  function save() { try { localStorage.setItem("nsc-bag", JSON.stringify(bag)); } catch (e) {} }

  var bagBtn = $("#bagBtn"), bagN = $("#bagN"), bagBody = $("#bagBody"),
      drawer = $("#drawer"), scrim = $("#scrim"), subEl = $("#subtotal"), shipEl = $("#ship");

  function openBag(o) {
    if (!drawer) return;
    drawer.setAttribute("data-open", o ? "1" : "0");
    drawer.setAttribute("aria-hidden", o ? "false" : "true");
    if (scrim) { scrim.hidden = !o; scrim.setAttribute("data-open", o ? "1" : "0"); }
    if (o) { var c = $("#closeBag"); if (c) c.focus(); }
  }
  function paint() {
    var count = bag.reduce(function (n, l) { return n + l.qty; }, 0);
    if (bagN) { bagN.textContent = String(count); bagN.setAttribute("data-empty", count ? "0" : "1"); }
    if (!bagBody) return;
    if (!bag.length) {
      bagBody.innerHTML = '<p class="empty">Nothing in the bag yet. Drop 03 is six pieces deep.</p>';
    } else {
      bagBody.innerHTML = bag.map(function (l, i) {
        var p = find(l.sku);
        return '<div class="line"><div class="line__t">' + flat(p.shape, p.cloth) +
          (p.photo ? '<img src="images/' + p.photo + '" alt="" onerror="this.remove()">' : "") + "</div>" +
          "<div><p class='line__n'>" + p.name + "</p><p class='line__m'>" + p.colour +
          " · Size " + l.size + " · ×" + l.qty + "</p>" +
          '<button class="line__x" data-rm="' + i + '">Remove</button></div>' +
          '<span class="line__p">' + money(p.price * l.qty) + "</span></div>";
      }).join("");
    }
    var sum = bag.reduce(function (n, l) { return n + find(l.sku).price * l.qty; }, 0);
    if (subEl) subEl.textContent = money(sum);
    if (shipEl) shipEl.textContent = !sum ? "—" : (sum >= 100 ? "Free" : "£4.95");
  }
  function add(sku, size, btn) {
    var e = null, i;
    for (i = 0; i < bag.length; i++) if (bag[i].sku === sku && bag[i].size === size) e = bag[i];
    if (e) e.qty += 1; else bag.push({ sku: sku, size: size, qty: 1 });
    save(); paint(); openBag(true);
    if (btn) { var t = btn.querySelector("span") || btn, o = t.textContent;
      t.textContent = "Added"; setTimeout(function () { t.textContent = o; }, 1500); }
  }
  window.NSCadd = add;

  var picked = {};
  document.addEventListener("click", function (ev) {
    var sz = ev.target.closest && ev.target.closest(".size");
    if (sz && !sz.disabled) {
      var sku = sz.getAttribute("data-sku");
      picked[sku] = sz.getAttribute("data-size");
      $$('.size[data-sku="' + sku + '"]').forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === sz));
      });
      return;
    }
    var ab = ev.target.closest && ev.target.closest("[data-add]");
    if (ab && !ab.disabled) {
      var s2 = ab.getAttribute("data-add"), p = find(s2);
      var size = picked[s2] || (p && p.onesize ? "OS" : null);
      if (!size) {
        var t = ab.querySelector("span") || ab, o = t.textContent;
        t.textContent = "Pick a size"; setTimeout(function () { t.textContent = o; }, 1600);
        return;
      }
      add(s2, size, ab);
      return;
    }
    var rm = ev.target.closest && ev.target.closest("[data-rm]");
    if (rm) { bag.splice(Number(rm.getAttribute("data-rm")), 1); save(); paint(); }
  });
  if (bagBtn) bagBtn.addEventListener("click", function () { openBag(true); });
  var cb = $("#closeBag"); if (cb) cb.addEventListener("click", function () { openBag(false); });
  if (scrim) scrim.addEventListener("click", function () { openBag(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") openBag(false); });
  var co = $("#checkout");
  if (co) co.addEventListener("click", function () {
    var s = this.querySelector("span") || this, o = s.textContent;
    s.textContent = bag.length ? "Checkout is a mock-up" : "Bag is empty";
    setTimeout(function () { s.textContent = o; }, 2000);
  });
  paint();

  /* ---------- drop clock: next Friday 20:00, UK local, DST-correct ---------- */
  var cd = $("#cd");
  if (cd) {
    var ch = $("#ch"), cm = $("#cm"), cs = $("#cs");
    function offset(at) {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "shortOffset" })
        .formatToParts(at), nm = "GMT", i;
      for (i = 0; i < parts.length; i++) if (parts[i].type === "timeZoneName") nm = parts[i].value;
      var m = /GMT([+-]\d+)/.exec(nm);
      return m ? Number(m[1]) : 0;
    }
    function next() {
      var f = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", weekday: "short", year: "numeric",
        month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false
      }).formatToParts(new Date()), g = {}, i;
      for (i = 0; i < f.length; i++) g[f[i].type] = f[i].value;
      var dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g.weekday);
      var ahead = (5 - dow + 7) % 7;
      if (ahead === 0 && Number(g.hour) >= 20) ahead = 7;
      var guess = Date.UTC(Number(g.year), Number(g.month) - 1, Number(g.day) + ahead, 20, 0, 0);
      return new Date(guess - offset(new Date(guess)) * 3600000);
    }
    var target = next();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    (function tick() {
      var left = Math.max(0, target - Date.now()) / 1000;
      cd.textContent = pad(Math.floor(left / 86400));
      ch.textContent = pad(Math.floor(left / 3600) % 24);
      cm.textContent = pad(Math.floor(left / 60) % 60);
      cs.textContent = pad(Math.floor(left) % 60);
      if (left <= 0) target = next();
      setTimeout(tick, 1000);
    })();
  }

  /* ---------- drop page: the plate follows the hovered row ---------- */
  var pvFrame = $("#pvFrame");
  if (pvFrame) {
    var pvName = $("#pvName"), pvMeta = $("#pvMeta");
    pvFrame.innerHTML = P.map(function (p, i) {
      return '<div class="pv" data-i="' + i + '"' + (i ? "" : ' data-on="1"') + ">" +
        slotInner(p) + "</div>";
    }).join("");
    $$(".pv .blur").forEach(function (b) { b.style.opacity = "1"; });
    $$("#idx .row").forEach(function (row, i) {
      function show() {
        $$(".pv", pvFrame).forEach(function (el) {
          el.setAttribute("data-on", el.getAttribute("data-i") === String(i) ? "1" : "0");
        });
        if (pvName) pvName.textContent = P[i].name;
        if (pvMeta) pvMeta.textContent = P[i].colour + " · " + P[i].gsm;
      }
      row.addEventListener("pointerenter", show);
      row.addEventListener("focusin", show);
    });
  }

  /* ---------- forms ---------- */
  $$("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $(".note", form), email = $('input[type="email"]', form);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        if (note) { note.style.color = "var(--alert)";
          note.textContent = "That address does not look right — check it and try again."; }
        email.focus(); return;
      }
      if (note) { note.style.color = "var(--accent)";
        note.textContent = form.getAttribute("data-demo"); }
      form.reset();
    });
  });
})();
