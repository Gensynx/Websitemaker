#!/usr/bin/env python3
"""Builds the five Atelier pages from one shared header, footer and tape.

Run from anywhere:  python3 coveworks-atelier/sitegen/build.py
The generated HTML is committed, so hosting needs no build step.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [
    ('index.html', 'Home'),
    ('work.html', 'Work'),
    ('fitting-room.html', 'Fitting room'),
    ('studio.html', 'Studio'),
    ('contact.html', 'Contact'),
]
NAV = [p for p in PAGES if p[0] != 'index.html']
ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23EFE9DD'/%3E"
           "%3Cpath d='M44 20a16 16 0 1 0 0 24' fill='none' stroke='%23191613' stroke-width='5'/%3E%3Cpath d='M48 12v40' stroke='%23B4412A' stroke-width='3'/%3E%3C/svg%3E")


def head(title, desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#EFE9DD">
<link rel="icon" href="{FAVICON}">
<link rel="preload" href="assets/fonts/bodoni-moda.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
'''


def chrome(current):
    def cur(href):
        return ' aria-current="page"' if href == current else ''
    links = ''.join(f'<a href="{href}"{cur(href)}>{label}</a>' for href, label in NAV)
    mlinks = ''.join(f'<a href="{href}"{cur(href)}>{label}<span>{i:02d}</span></a>' for i, (href, label) in enumerate(PAGES, 1))
    return f'''<div class="tape" aria-hidden="true">
  <div class="ticks" id="tapeTicks"></div>
  <div id="tapeNums"></div>
  <div class="cap">cm</div>
  <div class="mark"><span id="tapeRead">0.0 cm</span></div>
</div>

<header class="top" id="top">
  <div class="wrap bar">
    <a class="wordmark" href="index.html" aria-label="Coveworks, home">Coveworks<sup>Atelier</sup></a>
    <nav class="main" aria-label="Primary">{links}</nav>
    <div class="h-right">
      <a class="btn sm" href="fitting-room.html"><span>Book a fitting</span></a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i></button>
    </div>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Menu">{mlinks}</nav>
'''


FOOTER = f'''
<footer>
  <div class="wrap">
    <div class="f-grid">
      <div>
        <a class="wordmark" href="index.html">Coveworks<sup>Atelier</sup></a>
        <p>An independent web studio. Animated websites, drawn, written and built by hand.</p>
      </div>
      <div>
        <h4>Pages</h4>
        <ul><li><a href="index.html">Home</a></li><li><a href="work.html">Work</a></li><li><a href="fitting-room.html">Fitting room</a></li><li><a href="studio.html">Studio</a></li><li><a href="contact.html">Contact</a></li></ul>
      </div>
      <div>
        <h4>Studio</h4>
        <ul><li><a href="mailto:hello@coveworks.studio">hello@coveworks.studio</a></li><li>Working worldwide</li><li>One build at a time</li></ul>
      </div>
      <div>
        <h4>Other cuts</h4>
        <ul><li><a href="../coveworks-scifi/">The flagship, nine themes</a></li></ul>
      </div>
    </div>
    <div class="f-base"><span>© <span class="year">2026</span> Coveworks</span><span>Made to measure</span></div>
  </div>
</footer>
<script src="assets/site.js"></script>
</body>
</html>
'''


def page_head(no, kicker, title, lede):
    return f'''  <section class="page-head">
    <div class="wrap">
      <p class="label" data-rise><b>{no}</b> {kicker}</p>
      <div class="ph-row">
        <h1 data-rise>{title}</h1>
        <p class="lede" data-rise>{lede}</p>
      </div>
    </div>
  </section>
'''


SERVICES = [
    ('Art direction and design', 'The look, the type, the palette, the mood. We design every screen as a composition, not a layout, so the site reads as one continuous piece.'),
    ('Development', 'Clean, fast, dependency light code that ships as a single artifact and loads like a whisper. Built by hand, easy to host anywhere.'),
    ('Motion and interaction', 'Cinematic intros, scroll choreography, cursors that respond, pages that breathe. Motion with intent, never decoration for its own sake.'),
    ('Identity and voice', 'Wordmarks, copy and tone that carry the same conviction as the design. We write the words as carefully as we set them.'),
]
PROCESS = [
    ('Listen', 'We hear it out', 'What the brand is, who it faces, and what the site must earn. One honest conversation beats forty pages of discovery theatre.'),
    ('Design', 'We draw it', 'Direction, type, palette and motion sketches arrive together, in the browser, where the real decisions get made.'),
    ('Build', 'We craft it', 'The design becomes fast, living code. Animation is tuned by eye, on real devices, until it feels inevitable.'),
    ('Launch', 'We hand it over', 'Deployed, documented and yours. A site you can host anywhere and grow without calling us in a panic.'),
]


def services(wide=False):
    items = ''.join(
        f'<article data-rise><p class="label"><b>Piece {i:02d}</b></p><h3>{t}</h3><p>{d}</p></article>'
        for i, (t, d) in enumerate(SERVICES, 1))
    cls = 'svc wide' if wide else 'svc'
    return f'<div class="{cls}">{items}</div>'


def process():
    items = ''.join(
        f'<div data-rise><p class="label"><b>Fitting {i:02d}</b> {k}</p><h3>{t}</h3><p>{d}</p></div>'
        for i, (k, t, d) in enumerate(PROCESS, 1))
    return f'<div class="proc">{items}</div>'


CONTACT_BAND = f'''  <section class="block">
    <div class="wrap c-band">
      <div data-rise>
        <p class="label"><b>Contact</b> Say the word</p>
        <h2 class="title">Tell us what you are <em>building.</em></h2>
        <a class="mail" href="mailto:hello@coveworks.studio">hello@coveworks.studio</a>
      </div>
      <div class="acts" data-rise>
        <a class="btn chalk" href="fitting-room.html"><span>Start with a fitting</span>{ARROW}</a>
        <a class="btn" href="contact.html"><span>Write to us</span></a>
      </div>
    </div>
  </section>
'''

HOME = f'''<main>
  <section id="hero">
    <div class="wrap">
      <p class="label fade d1"><b>Welcome</b> Coveworks · independent web studio</p>
      <h1 aria-label="The web, made to measure.">
        <span class="ln"><span>The web,</span></span>
        <span class="ln"><span><span class="dim" aria-hidden="true"><span>Made to measure · 1 : 1</span></span>made to measure.</span></span>
      </h1>
      <div class="hero-row">
        <p class="sub fade d2">We design and build animated websites with the patience of a tailor. Every page is drawn, written and engineered by hand. No templates. Nothing off the rack.</p>
        <form class="starter fade d3" action="fitting-room.html" method="get" autocomplete="off">
          <label for="starterName"><b>Begin your fitting</b> · what is your business called?</label>
          <div class="field">
            <input id="starterName" name="name" maxlength="32" placeholder="Your business name" spellcheck="false">
            <button type="submit">Cut my demo {ARROW}</button>
          </div>
          <p class="alt">Or <a href="work.html">see the work first</a>.</p>
        </form>
        <div class="hero-meta fade d4">
          <span id="clock">London</span>
          <span>One build at a time</span>
          <span>Working worldwide</span>
        </div>
      </div>
    </div>
  </section>

  <section class="block" style="padding-top:clamp(28px,3.4vw,44px)">
    <div class="wrap">
      <div class="s-head">
        <div data-rise>
          <p class="label"><b>01</b> Selected work</p>
          <h2 class="title">Built here, <em>recently.</em></h2>
        </div>
        <a class="more" href="work.html" data-rise>All eight builds {ARROW}</a>
      </div>
      <div class="w-list" id="wList" data-limit="4"></div>
      <noscript><p class="lede" style="margin-top:16px"><a href="work.html">See the work</a></p></noscript>
    </div>
  </section>

  <section class="block">
    <div class="wrap teaser">
      <div data-rise>
        <p class="label"><b>02</b> The fitting room</p>
        <h2 class="title">Cut a demo <em>of your own.</em></h2>
        <p class="lede">Seven measurements and one live preview. Pick your trade, a look, a layout, a colour and the sections you want, in your order, and watch your site cut itself to fit. Nothing is stored until you send it to us.</p>
        <div class="actions">
          <a class="btn chalk" href="fitting-room.html"><span>Open the fitting room</span>{ARROW}</a>
        </div>
      </div>
      <div data-rise>
        <div class="steps">
          <div><b>01</b><p><strong>Name</strong><span>As it appears on the door</span></p></div>
          <div><b>02</b><p><strong>Trade</strong><span>Seven, each with its own copy</span></p></div>
          <div><b>03</b><p><strong>Look</strong><span>Nine, six of them professional</span></p></div>
          <div><b>04</b><p><strong>Layout</strong><span>Split, centred or full image</span></p></div>
          <div><b>05</b><p><strong>Colour</strong><span>Eight considered accents</span></p></div>
          <div><b>06</b><p><strong>Sections</strong><span>Switch on, switch off, reorder</span></p></div>
        </div>
        <div class="mini-cloths" aria-hidden="true">
          <span class="sw clean">Clean</span><span class="sw boardroom">Boardroom</span><span class="sw gallery">Gallery</span><span class="sw slate">Slate</span>
        </div>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="s-head">
        <div data-rise>
          <p class="label"><b>03</b> Services</p>
          <h2 class="title">What the <em>studio does.</em></h2>
        </div>
        <a class="more" href="studio.html" data-rise>How we work {ARROW}</a>
      </div>
      {services()}
    </div>
  </section>

{CONTACT_BAND}</main>
'''

WORK = f'''<main>
{page_head('01', 'Selected work', 'Built here, <em>recently.</em>', 'Every build in the list is real and most are live. Open any of them for the story, or follow the link to the site itself.')}
  <section class="block" style="padding-top:0">
    <div class="wrap">
      <div class="w-list" id="wList" data-next></div>
      <noscript><p class="lede" style="margin-top:16px">Turn on JavaScript to open the work index, or write to hello@coveworks.studio.</p></noscript>
    </div>
  </section>
{CONTACT_BAND}</main>
'''

FITTING = f'''<main>
{page_head('02', 'The fitting room', 'Cut a demo <em>of your own.</em>', 'Take your measurements and watch a site cut itself to fit. Nothing is stored. When it fits, send it to us and we will make the real one.')}
  <section class="fit-wrap">
    <div class="wrap">
      <div class="fit-grid">
        <div class="ticket">
          <div class="t-head"><strong>Measurements</strong><span id="orderNo">Order no. 0000</span></div>
          <fieldset>
            <legend><span><b>01</b>Name</span><small>as it appears on the door</small></legend>
            <input class="t-input" id="fName" maxlength="32" placeholder="Your business name" autocomplete="off" spellcheck="false">
          </fieldset>
          <fieldset>
            <legend><span><b>02</b>Trade</span></legend>
            <div class="chips" id="fTrade"></div>
          </fieldset>
          <fieldset>
            <legend><span><b>03</b>Look</span><small>nine cuts</small></legend>
            <div class="cloths" id="fCloth"></div>
            <p class="cloth-desc" id="fClothDesc"></p>
          </fieldset>
          <fieldset>
            <legend><span><b>04</b>Layout</span><small>the opening section</small></legend>
            <div class="layouts" id="fLayout"></div>
          </fieldset>
          <fieldset>
            <legend><span><b>05</b>Colour</span></legend>
            <div class="swatches" id="fAccent"></div>
          </fieldset>
          <fieldset>
            <legend><span><b>06</b>Sections</span><small>tick, then set the order</small></legend>
            <ol class="secs" id="fSecs"></ol>
          </fieldset>
          <fieldset>
            <legend><span><b>07</b>Headline</span><small>optional · leave blank for ours</small></legend>
            <input class="t-input sm" id="fHead" maxlength="70" placeholder="" autocomplete="off">
          </fieldset>
          <div class="t-actions">
            <a class="btn chalk" id="fSend" href="mailto:hello@coveworks.studio"><span>Send this fitting to Coveworks</span>{ARROW}</a>
            <div class="row">
              <button class="btn sm" id="fCopy" type="button"><span>Copy link</span></button>
              <button class="btn sm" id="fReset" type="button"><span>Start again</span></button>
            </div>
            <p class="t-status" id="fStatus" role="status"></p>
            <p class="t-fine">Sending opens your own email app with the brief written for you. A demo shows the cut; the real build is drawn and written for your business alone.</p>
          </div>
        </div>
        <div class="stage">
          <div class="browser">
            <div class="b-bar">
              <span class="b-url" id="pvUrl">yourbusiness.co.uk</span>
              <div class="dev" role="group" aria-label="Preview size">
                <button type="button" data-dev="desktop" aria-pressed="true">Desktop</button>
                <button type="button" data-dev="phone" aria-pressed="false">Phone</button>
              </div>
            </div>
            <div class="viewport" id="pvView" tabindex="0" aria-label="Live preview of your demo site">
              <div class="sizer" id="pvSizer"><div class="pvs" id="pvSite"></div></div>
            </div>
          </div>
          <div class="cap"><span>Live preview · scroll inside</span><span>Photography slots swap for yours</span></div>
        </div>
      </div>
      <noscript><p class="lede" style="margin-top:16px">The fitting room needs JavaScript. You can still write to hello@coveworks.studio.</p></noscript>
    </div>
  </section>
</main>
'''

STUDIO = f'''<main>
{page_head('03', 'The studio', 'Small on <em>purpose.</em>', 'One studio, one build at a time, every page made by hand. This is what we do and how a project runs.')}
  <section class="block ink">
    <div class="wrap">
      <p class="label" data-rise><b>Statement</b> Why Coveworks</p>
      <p class="manifesto" data-rise>Most of the web is poured from the same mould, and it shows. Coveworks exists for the brands that notice. We keep the studio small, take on one build at a time, and treat every project like the flagship it deserves to be. The result is a site that could not belong to <em>anyone but you.</em></p>
      <div class="nums">
        <div data-rise><strong data-count="0">0</strong><span>Templates used, ever</span></div>
        <div data-rise><strong><i data-count="100">0</i><small>%</small></strong><span>Built by hand, in house</span></div>
        <div data-rise><strong><i data-count="60">0</i><small>fps</small></strong><span>Minimum motion budget</span></div>
        <div data-rise><strong data-count="1">0</strong><span>Build at a time, on purpose</span></div>
      </div>
    </div>
  </section>
  <section class="block">
    <div class="wrap">
      <div data-rise>
        <p class="label"><b>Services</b> The pieces</p>
        <h2 class="title">What the <em>studio does.</em></h2>
      </div>
      {services(wide=True)}
    </div>
  </section>
  <section class="block">
    <div class="wrap">
      <div data-rise>
        <p class="label"><b>Process</b> Four fittings</p>
        <h2 class="title">Four moves, <em>no drift.</em></h2>
      </div>
      {process()}
    </div>
  </section>
{CONTACT_BAND}</main>
'''

CONTACT = f'''<main>
{page_head('04', 'Contact', 'Say <em>the word.</em>', 'Tell us what you are building and where it should live. We reply personally, usually within a day.')}
  <section class="block">
    <div class="wrap c-grid">
      <div data-rise>
        <p class="label"><b>Write</b> Directly</p>
        <a class="mail" href="mailto:hello@coveworks.studio">hello@coveworks.studio</a>
        <dl class="c-facts">
          <div><dt>Replies</dt><dd>Personally, usually within a day</dd></div>
          <div><dt>Where</dt><dd>Working worldwide</dd></div>
          <div><dt>Capacity</dt><dd>One build at a time</dd></div>
          <div><dt>Not sure yet?</dt><dd><a href="fitting-room.html">Start with a fitting</a></dd></div>
        </dl>
      </div>
      <form class="c-form" id="cForm" novalidate data-rise>
        <div class="f"><label for="cName">Name</label><input id="cName" autocomplete="name"></div>
        <div class="f"><label for="cEmail">Email</label><input id="cEmail" type="email" autocomplete="email"></div>
        <div class="f"><label for="cMsg">The project</label><textarea id="cMsg"></textarea></div>
        <div><button class="btn chalk" type="submit"><span>Send it over</span>{ARROW}</button></div>
        <p class="c-ok" id="cOk" role="status"></p>
      </form>
    </div>
  </section>
</main>
'''

CONTENT = {
    'index.html': ('Coveworks · made to measure', 'Coveworks is an independent web studio. We design and build animated websites with the patience of a tailor.', HOME),
    'work.html': ('Work · Coveworks', 'Every build from the Coveworks studio: property, commerce, streetwear, accountancy, car hire, local services and clinics.', WORK),
    'fitting-room.html': ('Fitting room · Coveworks', 'Cut a demo website for your own business: choose a trade, a look, a layout, a colour and your sections, and watch it build live.', FITTING),
    'studio.html': ('Studio · Coveworks', 'A small web studio on purpose: services, process and why Coveworks takes on one build at a time.', STUDIO),
    'contact.html': ('Contact · Coveworks', 'Tell Coveworks what you are building. We reply personally, usually within a day.', CONTACT),
}

for href, _label in PAGES:
    title, desc, body = CONTENT[href]
    html = head(title, desc) + chrome(href) + '\n' + body + FOOTER
    with open(os.path.join(ROOT, href), 'w', encoding='utf-8') as f:
        f.write(html)
    print('wrote', href, len(html) // 1024, 'KB')
