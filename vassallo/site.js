/* Vassallo Developments site script. Kept out of the page so the
   Content-Security-Policy can refuse every inline script. */
/* Clickjacking guard. GitHub Pages cannot send the frame-ancestors header,
   so if another site shows this page inside a frame, cover it with a link
   that opens the real page in its own tab. Clicks meant for a hidden copy of
   the form land on that link instead. CloudFront's header replaces this. */
(function(){
  if(window.top === window.self) return;
  var a = document.createElement("a");
  a.href = window.location.href;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "framed-cover";
  a.textContent = "Open Vassallo Developments in its own window";
  document.body.appendChild(a);
})();
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---- load ---- */
  window.addEventListener("load", function(){ document.body.classList.add("loaded"); });
  setTimeout(function(){ document.body.classList.add("loaded"); }, 400);
  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ---- theme toggle ---- */
  var toggle = document.getElementById("theme");
  toggle.addEventListener("click", function(){
    var cur = root.getAttribute("data-theme");
    if(!cur){ cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  });

  /* ---- nav scrolled + scroll progress ---- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("scrolled", y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (h > 0 ? y/h : 0) + ")";
    if(!reduce){
      var px = document.querySelectorAll("[data-parallax]");
      for(var i=0;i<px.length;i++){
        var sp = parseFloat(px[i].getAttribute("data-parallax"));
        px[i].style.transform = "translateY(" + (y*sp) + "px)";
      }
    }
  }
  var ticking=false;
  window.addEventListener("scroll", function(){
    if(!ticking){ requestAnimationFrame(function(){ onScroll(); ticking=false; }); ticking=true; }
  }, {passive:true});
  onScroll();

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:.12, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

  /* ---- count up ---- */
  function countUp(el){
    var v = el.querySelector(".v");
    var to = parseInt(el.getAttribute("data-to"),10);
    if(reduce){ v.textContent = to.toLocaleString("en-GB"); return; }
    var start=null, dur=1600;
    /* four-figure counts need separators to stay readable at display size */
    function fmt(n){ return n.toLocaleString("en-GB"); }
    function step(t){
      if(!start) start=t;
      var p = Math.min((t-start)/dur,1);
      var eased = 1-Math.pow(1-p,3);
      v.textContent = fmt(Math.round(to*eased));
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ countUp(e.target.querySelector(".n")); nio.unobserve(e.target); }
    });
  }, {threshold:.5});
  document.querySelectorAll(".numbers .stat").forEach(function(el){ nio.observe(el); });

  /* ---- magnetic CTA ---- */
  if(!reduce && window.matchMedia("(hover:hover)").matches){
    document.querySelectorAll(".submit, .nav-cta").forEach(function(btn){
      btn.addEventListener("mousemove", function(ev){
        var r = btn.getBoundingClientRect();
        var x = ev.clientX - r.left - r.width/2;
        var y = ev.clientY - r.top - r.height/2;
        btn.style.transform = "translate(" + x*.18 + "px," + y*.28 + "px)";
      });
      btn.addEventListener("mouseleave", function(){ btn.style.transform=""; });
    });
  }

  /* ---- service chips ---- */
  var chosen = new Set();
  function setChip(chip, on){
    chip.setAttribute("aria-pressed", on?"true":"false");
    if(on) chosen.add(chip.dataset.v); else chosen.delete(chip.dataset.v);
  }
  document.querySelectorAll("#services .chip").forEach(function(chip){
    chip.addEventListener("click", function(){
      setChip(chip, chip.getAttribute("aria-pressed")!=="true");
    });
  });

  /* a trade card carries its own service into the form, so the enquiry arrives
     already saying which trade it is about */
  /* ---- a configuration handed back by the configurator ----
     It returns to ../?spec=…&cfg=…#enquire. Fill the message, tick the matching
     trade, and say where it came from, so one enquiry carries the whole thing. */
  (function(){
    var qs = new URLSearchParams(window.location.search);
    var spec = qs.get('spec'), cfg = qs.get('cfg');
    if(!spec && !cfg) return;
    var msg = document.getElementById('message');
    if(msg){
      var text = spec || '';
      if(cfg) text += (text ? '\n\n' : '') + 'Configuration link: ' + cfg;
      msg.value = text;
      msg.classList.add('has');
      msg.style.height = 'auto';
      msg.style.height = msg.scrollHeight + 'px';
    }
    var want = 'Window and door replacements';
    document.querySelectorAll('#services .chip').forEach(function(c){
      if(c.dataset.v === want && c.getAttribute('aria-pressed') !== 'true') setChip(c, true);
    });
    /* drop the parameters so a refresh or a shared link is not stuck with them */
    history.replaceState(null, '', window.location.pathname + '#enquire');
  })();

  document.querySelectorAll(".trade[data-service]").forEach(function(card){
    card.addEventListener("click", function(){
      var want = card.getAttribute("data-service");
      document.querySelectorAll("#services .chip").forEach(function(c){
        if(c.dataset.v === want && c.getAttribute("aria-pressed")!=="true") setChip(c, true);
      });
    });
  });

  /* ---- radios ---- */
  document.querySelectorAll("#ptype .radio").forEach(function(r){
    r.addEventListener("click", function(){
      document.querySelectorAll("#ptype .radio").forEach(function(x){ x.classList.remove("sel"); });
      r.classList.add("sel");
      r.querySelector("input").checked = true;
    });
  });

  /* ---- floating labels ---- */
  document.querySelectorAll(".inp input, .inp textarea").forEach(function(f){
    f.addEventListener("input", function(){ f.classList.toggle("has", f.value.trim().length>0); });
  });
  // textarea auto-grow
  var ta = document.getElementById("message");
  ta.addEventListener("input", function(){ ta.style.height="auto"; ta.style.height=ta.scrollHeight+"px"; });

  /* ---- submit ----
     Nothing here may claim an enquiry has reached us unless it has. With no
     endpoint the enquiry is handed to the visitor's email app, and the
     confirmation says it still has to be sent from there. */
  var form = document.getElementById("enquiry");
  var statusEl = document.getElementById("status");
  var submitBtn = document.getElementById("submit");
  var TO = form.getAttribute("data-to");
  var ENDPOINT = form.getAttribute("data-endpoint");
  var busy = false;

  function field(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function collect(){
    var pt = form.querySelector('input[name="ptype"]:checked');
    return {
      services: Array.from(chosen),
      propertyType: pt ? pt.value : "",
      stage: field("stage"),
      name: field("name"),
      email: field("email"),
      phone: field("phone"),
      message: field("message")
    };
  }
  function asText(d){
    return [
      "Enquiry from the Vassallo Developments website",
      "",
      "Services: " + d.services.join(", "),
      "Property type: " + (d.propertyType || "Not given"),
      "Project stage: " + d.stage,
      "",
      "Name: " + d.name,
      "Email: " + d.email,
      "Phone: " + (d.phone || "Not given"),
      "",
      "About the project:",
      d.message || "Nothing added yet."
    ].join("\n");
  }
  function mailtoFor(d){
    return "mailto:" + TO +
      "?subject=" + encodeURIComponent("Website enquiry: " + d.services.join(", ")) +
      "&body=" + encodeURIComponent(asText(d));
  }
  function showDone(d, sent){
    var first = d.name.split(" ")[0];
    var title = document.getElementById("success-title");
    var help = document.getElementById("mail-help");
    if(sent){
      title.firstChild.nodeValue = "Thank you";
      document.getElementById("success-msg").textContent =
        "Thanks " + first + ", we've got your enquiry about " + d.services.join(", ") + ". We'll be in touch within two working days.";
      help.hidden = true;
    } else {
      title.firstChild.nodeValue = "Nearly there";
      document.getElementById("success-msg").textContent =
        "Thanks " + first + ". Your email app should now be open with the enquiry written out. It reaches us once you press Send there.";
      document.getElementById("mail-again").href = mailtoFor(d);
      document.getElementById("enq-text").value = "To: " + TO + "\n\n" + asText(d);
      help.hidden = false;
    }
    form.style.display = "none";
    var s = document.getElementById("success");
    s.classList.add("show");
    s.scrollIntoView({behavior:reduce?"auto":"smooth", block:"center"});
  }
  function handToEmail(d){
    window.location.href = mailtoFor(d);
    showDone(d, false);
  }
  function post(d){
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timer = ctl ? setTimeout(function(){ ctl.abort(); }, 15000) : null;
    var payload = Object.assign({ website: document.getElementById("website").value }, d);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctl ? ctl.signal : undefined
    }).then(function(r){
      if(timer) clearTimeout(timer);
      if(!r.ok) throw new Error("HTTP " + r.status);
    });
  }

  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    if(busy) return;
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    statusEl.textContent = "";
    if(chosen.size===0){ statusEl.textContent = "Please choose at least one service."; document.getElementById("services").scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"}); return; }
    if(!name.value.trim()){ statusEl.textContent = "Please add your name."; name.focus(); return; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){ statusEl.textContent = "Please enter a valid email."; email.focus(); return; }

    var d = collect();
    if(!ENDPOINT){ handToEmail(d); return; }

    busy = true;
    submitBtn.disabled = true;
    statusEl.textContent = "Sending…";
    post(d).then(function(){
      statusEl.textContent = "";
      showDone(d, true);
    }).catch(function(){
      statusEl.textContent = "We couldn't send that just now, so we've opened your email app instead.";
      handToEmail(d);
    }).then(function(){
      busy = false;
      submitBtn.disabled = false;
    });
  });

  document.getElementById("copy-enq").addEventListener("click", function(){
    var t = document.getElementById("enq-text");
    var btn = this;
    function done(){ btn.textContent = "Copied"; setTimeout(function(){ btn.textContent = "Copy the enquiry"; }, 2000); }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(t.value).then(done, function(){ t.parentNode.open = true; t.select(); });
    } else { t.parentNode.open = true; t.select(); }
  });
  document.getElementById("reset").addEventListener("click", function(){
    document.getElementById("success").classList.remove("show");
    form.reset(); form.style.display="flex"; chosen.clear();
    document.querySelectorAll("#services .chip").forEach(function(c){ c.setAttribute("aria-pressed","false"); });
    document.querySelectorAll("#ptype .radio").forEach(function(x){ x.classList.remove("sel"); });
    document.querySelectorAll(".inp .has").forEach(function(x){ x.classList.remove("has"); });
    statusEl.textContent="";
    document.getElementById("mail-help").hidden = true;
    form.scrollIntoView({behavior:reduce?"auto":"smooth", block:"center"});
  });

  /* ---- smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(e){
      var id = a.getAttribute("href");
      if(id.length<2) return;
      var t = document.querySelector(id);
      if(t){
        e.preventDefault(); t.scrollIntoView({behavior:reduce?"auto":"smooth", block:"start"});
        /* move keyboard and screen reader focus too, not just the view (the skip link) */
        if(t.getAttribute("tabindex") === "-1") t.focus({preventScroll:true});
      }
    });
  });
})();

(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var intro = document.getElementById("intro");
  if(!intro) return;
  if(reduce){ intro.classList.add("collapsed"); return; }

  var vid = document.getElementById("introVideo");
  var beats = intro.querySelectorAll(".intro-beat");
  var cue = document.getElementById("introCue");
  var nav = document.getElementById("nav");
  var vdur = 12, vready = false;

  /* Touch devices (phones, tablets) can't reliably scrub a video frame-by-frame
     on scroll, so there we let the film AUTOPLAY through on its own and time the
     copy beats to the video. Pointer-based devices (desktop) get the scroll-scrub. */
  var isTouch = window.matchMedia("(pointer:coarse)").matches
             || window.matchMedia("(max-width:760px)").matches;

  vid.addEventListener("loadedmetadata", function(){
    vdur = vid.duration || 12; vready = true;
    if(!isTouch){ try{ vid.pause(); vid.currentTime = 0; }catch(e){} }
  });

  try{ vid.load(); }catch(e){}

  /* if the video can't load at all, drop the intro so the site still works */
  function fail(){ intro.classList.add("collapsed"); nav.classList.remove("over-intro"); }
  var sources = vid.querySelectorAll("source");
  if(sources.length){ sources[sources.length-1].addEventListener("error", fail); }
  vid.addEventListener("error", fail);

  function clamp(v,a,b){ return Math.min(Math.max(v,a),b); }
  /* fade a beat in and out inside its [a,b] progress window */
  function windowFade(p,a,b){ var f=.05; return clamp(Math.min((p-a)/f,(b-p)/f),0,1); }
  var BEATS = [[.03,.22],[.28,.46],[.52,.70]]; /* final beat handled separately, it stays */

  /* set the four copy beats from a 0..1 progress value (shared by both modes) */
  function paintBeats(p){
    for(var i=0;i<BEATS.length;i++){
      var o = windowFade(p, BEATS[i][0], BEATS[i][1]);
      beats[i].style.opacity = o.toFixed(3);
      beats[i].style.transform = "translateY(" + ((1-o)*22).toFixed(1) + "px)";
    }
    var fo = clamp((p-.80)/.08, 0, 1);
    beats[3].style.opacity = fo.toFixed(3);
    beats[3].style.transform = "translateY(" + ((1-fo)*22).toFixed(1) + "px)";
  }

  /* ---------- DESKTOP: scroll scrubs the video ---------- */
  function setupScrub(){
    function updateIntro(){
      var rect = intro.getBoundingClientRect();
      var range = intro.offsetHeight - window.innerHeight;
      var p = clamp(-rect.top/(range>0?range:1), 0, 1);
      nav.classList.toggle("over-intro", rect.bottom > 80);
      var vp = clamp(p/.86, 0, 1);
      if(vready){ try{ vid.currentTime = vp*vdur*.999; }catch(e){} }
      paintBeats(p);
      cue.style.opacity = Math.max(1-p*5, 0).toFixed(3);
    }
    var iticking = false;
    window.addEventListener("scroll", function(){
      if(!iticking){ requestAnimationFrame(function(){ updateIntro(); iticking=false; }); iticking = true; }
    }, {passive:true});
    window.addEventListener("resize", updateIntro);
    updateIntro();
  }

  /* ---------- TOUCH: the film plays through, beats timed to it ---------- */
  function setupPlaythrough(){
    function paint(){ paintBeats(vid.duration ? clamp(vid.currentTime/vid.duration,0,1) : 0); }
    /* drive the copy off requestAnimationFrame (60fps) while the film plays,
       the video's timeupdate event only fires ~4x/sec, which makes the text
       fade in choppy steps. rAF keeps the writing smooth. */
    var raf = 0;
    function loop(){ paint(); if(!vid.paused && !vid.ended){ raf = requestAnimationFrame(loop); } }
    function startLoop(){ if(raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    vid.addEventListener("play", startLoop);
    vid.addEventListener("playing", startLoop);
    vid.addEventListener("timeupdate", function(){ if(vid.paused || vid.ended) paint(); }); /* keep synced while paused */
    vid.addEventListener("ended", function(){ if(raf) cancelAnimationFrame(raf); paintBeats(1); }); /* hold the finale */
    paint();

    /* try to autoplay; if the browser blocks it, start on the first interaction */
    function play(){ var pr; try{ pr = vid.play(); }catch(e){} return pr; }
    var pr = play();
    if(pr && pr.catch){
      pr.catch(function(){
        var kick = function(){ play(); window.removeEventListener("touchstart",kick); window.removeEventListener("scroll",kick); window.removeEventListener("click",kick); };
        window.addEventListener("touchstart", kick, {passive:true});
        window.addEventListener("scroll", kick, {passive:true});
        window.addEventListener("click", kick);
      });
    }

    /* nav stays light while the film is on screen; cue fades once you scroll */
    var nticking = false;
    function onScroll(){
      var rect = intro.getBoundingClientRect();
      nav.classList.toggle("over-intro", rect.bottom > 80);
      var y = window.scrollY || window.pageYOffset;
      cue.style.opacity = Math.max(1 - y/120, 0).toFixed(3);
    }
    window.addEventListener("scroll", function(){
      if(!nticking){ requestAnimationFrame(function(){ onScroll(); nticking=false; }); nticking = true; }
    }, {passive:true});
    onScroll();
  }

  if(isTouch){ setupPlaythrough(); } else { setupScrub(); }
})();
