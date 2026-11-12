#!/usr/bin/env python3
"""Builds the five Lab pages from one shared header, footer and telemetry rail.

Run from anywhere:  python3 coveworks-lab/sitegen/build.py
The generated HTML is committed, so hosting needs no build step.
"""
import base64, html as htmllib, json, os
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The portfolio: one list drives the work pages here and what package.py uploads
with open(os.path.join(ROOT, 'sitegen', 'work.json'), encoding='utf-8') as _f:
    _WORK = json.load(_f)
WORKS = [{'title': w['title'], 'tag': w['tag'], 'image': w['image'], 'text': w['text'],
          'link': _WORK['live'] + w['slug'] + '/'} for w in _WORK['work']]
WORKS_JS = '<script>window.WORKS = ' + json.dumps(WORKS, ensure_ascii=False).replace('</', '<\\/') + ';</script>\n'
with open(os.path.join(ROOT, 'sitegen', 'trades.json'), encoding='utf-8') as _f:
    TRADES = json.load(_f)['trades']
FIT_LABEL = {'salon': 'Salon', 'restaurant': 'Restaurant', 'cafe': 'Café', 'trades': 'Trades', 'clinic': 'Clinic', 'fitness': 'Fitness',
             'photography': 'Photography', 'property': 'Property', 'professional': 'Professional', 'education': 'Education',
             'childcare': 'Childcare', 'pets': 'Pets', 'travel': 'Travel', 'events': 'Events', 'boutique': 'Shop', 'saas': 'Software'}
NUMBER = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
WORK_COUNT = NUMBER[len(WORKS)] if len(WORKS) < len(NUMBER) else str(len(WORKS))

PAGES = [
    ('index.html', 'Home'),
    ('work.html', 'Work'),
    ('configurator.html', 'Configurator'),
    ('studio.html', 'Studio'),
    ('contact.html', 'Contact'),
]
NAV = [p for p in PAGES if p[0] != 'index.html']
ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23F4F4F2'/%3E"
           "%3Ccircle cx='32' cy='32' r='12' fill='%23E5321E'/%3E%3C/svg%3E")


SITE = 'https://coveworks.tech/'   # the live domain; GitHub Pages serves a copy

def head(title, desc, extra_css='', page='index.html'):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#F4F4F2">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="canonical" href="{SITE}{'' if page == 'index.html' else page}">
<meta property="og:url" content="{SITE}{'' if page == 'index.html' else page}">
<meta property="og:image" content="{SITE}assets/gen/lab-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{FAVICON}">
<link rel="preload" href="assets/fonts/doto.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">
{extra_css}<script>document.documentElement.classList.add('js');</script>
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
  <div class="cap">SCR</div>
  <div class="mark"><span id="tapeRead">000%</span></div>
</div>

<header class="top" id="top">
  <div class="wrap bar">
    <a class="wordmark" href="index.html" aria-label="Coveworks, home">Coveworks<sup>Lab</sup></a>
    <nav class="main" aria-label="Primary">{links}</nav>
    <div class="h-right">
      <a class="btn sm" href="configurator.html"><span>Start a build</span></a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i></button>
    </div>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Menu">{mlinks}</nav>
'''


FOOTER_TOP = f'''
<footer>
  <div class="wrap">
    <div class="f-grid">
      <div>
        <a class="wordmark" href="index.html">Coveworks<sup>Lab</sup></a>
        <p>An independent web studio. Animated websites, designed, written and engineered by hand.</p>
      </div>
      <div>
        <h4>Pages</h4>
        <ul><li><a href="index.html">Home</a></li><li><a href="work.html">Work</a></li><li><a href="configurator.html">Configurator</a></li><li><a href="studio.html">Studio</a></li><li><a href="contact.html">Contact</a></li></ul>
      </div>
      <div>
        <h4>Studio</h4>
        <ul><li><a href="mailto:sales@coveworks.tech">sales@coveworks.tech</a></li><li>Working worldwide</li><li>One build at a time</li></ul>
      </div>
      <div>
        <h4>More</h4>
        <ul><li><a href="websites-for.html">Websites by trade</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="https://www.coveworks.tech/work/flagship/">The flagship, nine themes</a></li></ul>
      </div>
    </div>
    <p class="f-big" aria-hidden="true">Coveworks<span>.</span></p>
    <div class="f-base"><span>© <span class="year">2026</span> Coveworks Ltd</span><span>Made to measure</span></div>
  </div>
</footer>
'''


def footer(extra_js='', before_js=''):
    return FOOTER_TOP + before_js + '<script src="assets/site.js"></script>\n' + extra_js + '</body>\n</html>\n'


def page_head(no, kicker, title, lede):
    return f'''  <section class="page-head">
    <div class="wrap">
      <p class="label" data-rise><span class="led"></span><b>{no}</b> {kicker}</p>
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
        f'<article data-rise><p class="label"><span>Module</span><b>{i:02d}</b></p><h3>{t}</h3><p>{d}</p></article>'
        for i, (t, d) in enumerate(SERVICES, 1))
    cls = 'svc wide' if wide else 'svc'
    return f'<div class="{cls}">{items}</div>'


def process():
    items = ''.join(
        f'<div data-rise><p class="label"><b>{i:02d}</b> {k}</p><h3>{t}</h3><p>{d}</p></div>'
        for i, (k, t, d) in enumerate(PROCESS, 1))
    return f'<div class="proc">{items}</div>'


CONTACT_BAND = f'''  <section class="block">
    <div class="wrap">
      <div class="c-band" data-rise>
        <div>
          <p class="label"><span class="led ok pulse"></span><b>Contact</b> Taking new builds</p>
          <h2 class="title">Tell us what you are <em>building.</em></h2>
          <a class="mail" href="mailto:sales@coveworks.tech">sales@coveworks.tech</a>
        </div>
        <div class="acts">
          <a class="btn sig" href="configurator.html"><span>Start in the configurator</span>{ARROW}</a>
          <a class="btn ghost" href="contact.html"><span>Write to us</span></a>
        </div>
      </div>
    </div>
  </section>
'''

HOME = f'''<main>
  <section id="hero">
    <div class="wrap">
      <div class="hero-top fade d1">
        <p class="label"><span class="led pulse"></span><b>Coveworks</b> Independent web studio</p>
        <p class="label">System · online</p>
      </div>
      <h1 aria-label="The web, made to measure.">
        <span class="ln">The web,</span>
        <span class="ln">made to measure<span class="stop">.</span></span>
      </h1>
      <div class="hero-row">
        <div class="mod fade d2">
          <div class="mod-head"><span>01 · Studio</span><span class="led ok"></span></div>
          <p class="sub">We design and build animated websites with the patience of a tailor. Every page is drawn, written and engineered by hand. No templates. Nothing off the rack.</p>
        </div>
        <form class="mod starter fade d3" action="configurator.html" method="get" autocomplete="off">
          <div class="mod-head"><span>02 · Configurator</span><span>Ready</span></div>
          <label class="sub" for="starterBrief" style="margin-bottom:14px">Describe the site you need, or paste the address of the one you have, and we will build a preview.</label>
          <div class="field">
            <input id="starterBrief" name="brief" maxlength="140" placeholder="A barber shop, or yoursite.co.uk" spellcheck="false" autocapitalize="off">
            <button class="btn sig" type="submit"><span>Build it</span>{ARROW}</button>
          </div>
          <p class="alt">Or <a href="work.html">see the work first</a>.</p>
        </form>
        <div class="mod readout fade d4">
          <div class="mod-head"><span>03 · Status</span><span>London</span></div>
          <p class="big" id="clock">00:00</p>
          <ul>
            <li><span class="led ok"></span> One build at a time</li>
            <li><span class="led ok"></span> Working worldwide</li>
            <li><span class="led ok"></span> Replies within a day</li>
          </ul>
        </div>
      </div>
      <figure class="plate wide fade d4">
        <img src="assets/gen/lab-hero.webp" alt="White modular devices with a red dot matrix display, laid out on a white bench" width="1600" height="900" fetchpriority="high">
        <figcaption><span>Fig. 01</span> Every site, assembled from modules made for it</figcaption>
      </figure>
    </div>
  </section>

  <section class="block" style="padding-top:clamp(24px,3vw,40px)">
    <div class="wrap">
      <div class="s-head">
        <div data-rise>
          <p class="label"><b>01</b> Selected work</p>
          <h2 class="title">Built here, <em>recently.</em></h2>
        </div>
        <a class="more" href="work.html" data-rise>All {WORK_COUNT} builds {ARROW}</a>
      </div>
      <div class="w-list" id="wList" data-limit="4"></div>
      <noscript><p class="lede" style="margin-top:16px"><a href="work.html">See the work</a></p></noscript>
    </div>
  </section>

  <section class="block">
    <div class="wrap teaser">
      <div data-rise>
        <p class="label"><b>02</b> The configurator</p>
        <h2 class="title">Build a demo <em>of your own.</em></h2>
        <p class="lede">Tell us in plain words what you need, a photography portfolio, a dental clinic, a launch page for an app, and a preview is built for that kind of business: its own structure, its own copy, its own photography. Then change the look, the layout and the sections until it fits.</p>
        <div class="actions">
          <a class="btn sig" href="configurator.html"><span>Open the configurator</span>{ARROW}</a>
        </div>
      </div>
      <div data-rise>
        <figure class="plate band">
          <img src="assets/gen/lab-modules.webp" alt="A row of white website modules floating above a white surface" width="1600" height="686" loading="lazy">
          <figcaption><span>Fig. 02</span> Blocks, in your order</figcaption>
        </figure>
        <div class="steps">
          <div><b>00</b><p><strong>Your words</strong><span>Describe the site you need</span></p></div>
          <div><b>01</b><p><strong>Site type</strong><span>Twenty three, or anything else you name</span></p></div>
          <div><b>02</b><p><strong>Look</strong><span>Fifteen, from Swiss to Aurora</span></p></div>
          <div><b>03</b><p><strong>Layout</strong><span>Split, centred or full image</span></p></div>
          <div><b>04</b><p><strong>Colour</strong><span>Ten considered accents</span></p></div>
          <div><b>05</b><p><strong>Sections</strong><span>The blocks that type needs, in your order</span></p></div>
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
  <section class="block" style="padding-top:clamp(20px,2.6vw,32px)">
    <div class="wrap">
      <div class="w-list" id="wList" data-next></div>
      <noscript><p class="lede" style="margin-top:16px">Turn on JavaScript to open the work index, or write to sales@coveworks.tech.</p></noscript>
    </div>
  </section>
{CONTACT_BAND}</main>
'''

CONFIGURATOR = f'''<main>
{page_head('02', 'The configurator', 'Build a demo <em>of your own.</em>', 'Describe the site you need in plain words, or pick a type. Each of the twenty three types is built with its own structure, copy and photography, in any of fifteen looks, and anything else gets a site written around your own words. Already have a site? Paste its address and see it rebuilt. Nothing is saved unless you send it to us.')}
  <section class="fit-wrap">
    <div class="wrap">
      <div class="fit-grid">
        <div>
        <form class="brief" id="fBriefForm" autocomplete="off">
          <label for="fBrief"><b>00</b>Describe the site you need, or paste your current address</label>
          <div class="row">
            <input id="fBrief" maxlength="160" placeholder="A minimal photography portfolio, or yoursite.co.uk" spellcheck="false" autocapitalize="off">
            <button type="submit">Build it {ARROW}</button>
          </div>
          <div class="brief-eg" aria-label="Examples">
            <button type="button">A photography portfolio</button><button type="button">A dental clinic, calm and friendly</button><button type="button">A launch page for our app, dark</button>
            <button type="button">An Italian restaurant called Nonna</button><button type="button">A wedding venue, elegant</button><button type="button">A plumber, bold and blue</button>
          </div>
          <p class="brief-read" id="fBriefRead" role="status"></p>
        </form>
        <div class="ticket">
          <div class="t-head"><strong><span class="led ok"></span>Spec sheet</strong><span id="orderNo">Build no. 0000</span></div>
          <fieldset>
            <legend><span><b>01</b>Name</span><small>your business</small></legend>
            <input class="t-input" id="fName" maxlength="32" placeholder="Your business name" autocomplete="off" spellcheck="false">
          </fieldset>
          <fieldset>
            <legend><span><b>02</b>Site type</span><small>each one is built differently</small></legend>
            <div class="chips" id="fType"></div>
          </fieldset>
          <fieldset>
            <legend><span><b>03</b>Look</span><small>fifteen styles</small></legend>
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
            <form class="lead" id="fLead" novalidate>
              <p class="lead-h">Like it? Send it to us and we will reply within a day.</p>
              <input class="t-input sm" id="lName" placeholder="Your name" autocomplete="name" maxlength="80" aria-label="Your name">
              <input class="t-input sm" id="lEmail" type="email" placeholder="Email" autocomplete="email" maxlength="120" aria-label="Email" required>
              <input class="t-input sm" id="lPhone" type="tel" placeholder="Phone, if you prefer a call" autocomplete="tel" maxlength="40" aria-label="Phone">
              <input class="hp" id="lWeb" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
              <button class="btn sig" id="fSend" type="submit"><span>Send this build to Coveworks</span>{ARROW}</button>
              <p class="lead-alt" id="fLeadAlt" hidden>Or <a href="mailto:sales@coveworks.tech">send it from your own email</a>.</p>
            </form>
            <div class="row">
              <button class="btn ghost sm" id="fCopy" type="button"><span>Copy link</span></button>
              <button class="btn ghost sm" id="fReset" type="button"><span>Start again</span></button>
            </div>
            <p class="t-status" id="fStatus" role="status"></p>
            <p class="t-fine">We use your details only to reply about this build (<a href="privacy.html">privacy</a>). A demo shows the structure; the real site is designed and written for your business alone. Imagery in the preview is illustrative.</p>
          </div>
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
      <noscript><p class="lede" style="margin-top:16px">The configurator needs JavaScript. You can still write to sales@coveworks.tech.</p></noscript>
    </div>
  </section>
</main>
'''

STUDIO = f'''<main>
{page_head('03', 'The studio', 'Small on <em>purpose.</em>', 'One studio, one build at a time, every page made by hand. This is what we do and how a project runs.')}
  <section class="plate-row">
    <div class="wrap">
      <figure class="plate wide" data-rise>
        <img src="assets/gen/lab-studio.webp" alt="A clean white studio desk with a laptop, sketches and a small red indicator" width="1600" height="900" loading="lazy">
        <figcaption><span>Fig. 03</span> The bench, where every build is made by hand</figcaption>
      </figure>
    </div>
  </section>
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
        <p class="label"><b>Services</b> The modules</p>
        <h2 class="title">What the <em>studio does.</em></h2>
      </div>
      {services(wide=True)}
    </div>
  </section>
  <section class="block">
    <div class="wrap">
      <div data-rise>
        <p class="label"><b>Process</b> Four stages</p>
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
        <p class="label"><span class="led ok pulse"></span><b>Write</b> Directly</p>
        <a class="mail" href="mailto:sales@coveworks.tech">sales@coveworks.tech</a>
        <dl class="c-facts">
          <div><dt>Replies</dt><dd>Personally, usually within a day</dd></div>
          <div><dt>Where</dt><dd>Working worldwide</dd></div>
          <div><dt>Capacity</dt><dd>One build at a time</dd></div>
          <div><dt>Not sure yet?</dt><dd><a href="configurator.html">Start in the configurator</a></dd></div>
        </dl>
      </div>
      <form class="c-form" id="cForm" novalidate data-rise>
        <div class="f"><label for="cName">Name</label><input id="cName" autocomplete="name"></div>
        <div class="f"><label for="cEmail">Email</label><input id="cEmail" type="email" autocomplete="email"></div>
        <div class="f"><label for="cMsg">The project</label><textarea id="cMsg"></textarea></div>
        <input class="hp" id="cWeb" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div><button class="btn sig" type="submit"><span>Send it over</span>{ARROW}</button></div>
        <p class="c-ok" id="cOk" role="status"></p>
        <p class="c-fine">We use your details only to reply to you. See our <a href="privacy.html">privacy notice</a>.</p>
      </form>
    </div>
  </section>
</main>
'''

CONTENT = {
    'index.html': ('Coveworks · made to measure', 'Coveworks is an independent web studio. We design and build animated websites by hand. Describe the site you need and build a preview in the configurator.', HOME),
    'work.html': ('Work · Coveworks', 'Every build from the Coveworks studio: property, commerce, streetwear, accountancy, car hire, local services and clinics.', WORK),
    'configurator.html': ('Configurator · Coveworks', 'Build a demo website for your own business: describe it, then choose a type, a look, a layout, a colour and your sections, and watch it build live.', CONFIGURATOR),
    'studio.html': ('Studio · Coveworks', 'A small web studio on purpose: services, process and why Coveworks takes on one build at a time.', STUDIO),
    'contact.html': ('Contact · Coveworks', 'Tell Coveworks what you are building. We reply personally, usually within a day.', CONTACT),
}

for href, _label in PAGES:
    title, desc, body = CONTENT[href]
    cfg = href == 'configurator.html'
    css = '<link rel="stylesheet" href="assets/fitting.css">\n' if cfg else ''
    js = '<script src="assets/fitting-data.js"></script>\n<script src="assets/fitting.js"></script>\n' if cfg else ''
    works = WORKS_JS if 'id="wList"' in body else ''
    html = head(title, desc, css, href) + chrome(href) + '\n' + body + footer(js, works)
    with open(os.path.join(ROOT, href), 'w', encoding='utf-8') as f:
        f.write(html)
    print('wrote', href, len(html) // 1024, 'KB')


# ---------- preview.html: a shared build, full page, with no configurator around it ----------
PREVIEW = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview · Coveworks</title>
<meta name="robots" content="noindex">
<link rel="icon" href="{FAVICON}">
<link rel="stylesheet" href="assets/site.css">
<link rel="stylesheet" href="assets/fitting.css">
</head>
<body class="pv-page">
<a class="pv-bar" id="pvBar" href="configurator.html"><span><span class="led ok"></span>A preview, built in the Coveworks configurator</span><b>Make it yours {ARROW}</b></a>
<div class="sizer" id="pvSizer"><div class="pvs" id="pvSite"></div></div>
<noscript><p style="padding:40px">This preview needs JavaScript.</p></noscript>
<script src="assets/fitting-data.js"></script>
<script src="assets/fitting.js"></script>
</body>
</html>
"""
with open(os.path.join(ROOT, 'preview.html'), 'w', encoding='utf-8') as f:
    f.write(PREVIEW)
print('wrote preview.html')


# ---------- websites-for-<trade>.html ----------
def fit_code(state):
    """The share code the configurator and preview page read: URL safe base64 of the state as JSON."""
    raw = json.dumps(state, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    return base64.urlsafe_b64encode(raw).decode('ascii').rstrip('=')


def e(text):
    return htmllib.escape(text, quote=True)


def trade_page(t):
    others = ''.join(f'<a href="websites-for-{o["slug"]}.html">{e(o["name"].capitalize())}</a>' for o in TRADES if o['slug'] != t['slug'])
    needs = ''.join(f'<article data-rise><p class="label"><b>{i:02d}</b></p><h3>{e(n[0])}</h3><p>{e(n[1])}</p></article>' for i, n in enumerate(t['needs'], 1))
    faq = ''.join(f'<div data-rise><dt>{e(q)}</dt><dd>{e(a)}</dd></div>' for q, a in t['faq'])
    domain = ''.join(c for c in t['demo'].lower().replace('&', 'and') if c.isalnum()) + '.co.uk'
    code = fit_code({'type': t['type'], 'name': t['demo']})
    return f"""<main>
{page_head('05', 'Websites by trade', f'Websites for <em>{e(t["name"])}.</em>', e(t['intro']))}
  <section class="block" style="padding-top:clamp(20px,2.6vw,32px)">
    <div class="wrap">
      <div class="browser" data-rise>
        <div class="b-bar"><span class="b-url">{domain}</span><span class="b-note">A sample · scroll inside</span></div>
        <div class="live-frame"><iframe src="preview.html?embed=1&amp;fit={code}" title="A sample {e(t['one'])} website" loading="lazy"></iframe></div>
      </div>
      <div class="live-cta" data-rise>
        <p>This sample was built in seconds in our configurator. Put your own name on it, try other looks and colours, and reorder the sections until it fits.</p>
        <a class="btn sig" href="configurator.html?brief={quote(t['brief'])}"><span>Make this one yours</span>{ARROW}</a>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div data-rise>
        <p class="label"><b>01</b> What it needs</p>
        <h2 class="title">What a good {e(t['one'])} site <em>needs.</em></h2>
      </div>
      <div class="svc three">{needs}</div>
    </div>
  </section>

  <section class="block">
    <div class="wrap teaser">
      <div data-rise>
        <p class="label"><b>02</b> Already have a site?</p>
        <h2 class="title">See yours, <em>rebuilt.</em></h2>
        <p class="lede">Paste the address of the site you have now. We read your name, your colour and your own words, and show the same business in a new design, in a few seconds.</p>
      </div>
      <form class="mod starter" action="configurator.html" method="get" autocomplete="off" data-rise>
        <div class="mod-head"><span>Rebuild</span><span>Ready</span></div>
        <label class="sub" for="tSite" style="margin-bottom:14px">Your current web address</label>
        <div class="field">
          <input id="tSite" name="brief" maxlength="140" placeholder="yoursite.co.uk" spellcheck="false" autocapitalize="off" inputmode="url">
          <button class="btn sig" type="submit"><span>Rebuild it</span>{ARROW}</button>
        </div>
        <p class="alt">No site yet? <a href="configurator.html?brief={quote(t['brief'])}">Start from the sample</a>.</p>
      </form>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div data-rise>
        <p class="label"><b>03</b> Questions</p>
        <h2 class="title">Asked <em>often.</em></h2>
      </div>
      <dl class="qa">{faq}<div data-rise><dt>What does it cost, and how long does it take?</dt><dd>Every site is quoted for the job. Send us the build you made in the configurator and we reply within a day with a fixed price and a date.</dd></div></dl>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <p class="label" data-rise><b>04</b> Other trades</p>
      <nav class="trades" aria-label="Websites for other trades" data-rise>{others}</nav>
    </div>
  </section>
{CONTACT_BAND}</main>
"""


extra_pages = []
for t in TRADES:
    href = f'websites-for-{t["slug"]}.html'
    title = f'Websites for {t["name"]} · Coveworks'
    desc = e(t['intro'])
    with open(os.path.join(ROOT, href), 'w', encoding='utf-8') as f:
        f.write(head(title, desc, '', href) + chrome('') + '\n' + trade_page(t) + footer())
    extra_pages.append(href)

cards = ''.join(f'<a class="mod" href="websites-for-{t["slug"]}.html" data-rise><span class="mod-head"><span>{i:02d}</span><span>{e(FIT_LABEL.get(t["type"], ""))}</span></span><strong>{e(t["name"].capitalize())}</strong><span>{e(t["needs"][0][0])}, {e(t["needs"][1][0].lower())}, {e(t["needs"][2][0].lower())}.</span></a>' for i, t in enumerate(TRADES, 1))
INDEX_TRADES = f"""<main>
{page_head('05', 'Websites by trade', 'A site built for <em>your trade.</em>', 'Every kind of business needs something different from its website. Pick yours to see a sample built for it, then make it your own in the configurator.')}
  <section class="block" style="padding-top:clamp(20px,2.6vw,32px)">
    <div class="wrap">
      <div class="trade-grid">{cards}</div>
      <p class="lede" style="margin-top:22px" data-rise>Not on the list? <a href="configurator.html">Describe your business in the configurator</a> and it builds around your own words.</p>
    </div>
  </section>
{CONTACT_BAND}</main>
"""
with open(os.path.join(ROOT, 'websites-for.html'), 'w', encoding='utf-8') as f:
    f.write(head('Websites by trade · Coveworks', 'Sample websites for barbers, restaurants, plumbers, dentists, photographers and twenty more trades, each built for what that business needs.', '', 'websites-for.html') + chrome('') + '\n' + INDEX_TRADES + footer())
extra_pages.insert(0, 'websites-for.html')
print('wrote', len(extra_pages), 'trade pages')

# ---------- privacy.html ----------
KEEP = 'twelve months'      # must match CW_KEEP_DAYS in api/lib.php
PRIVACY = f"""<main>
{page_head('06', 'Privacy', 'What we do with <em>your details.</em>', 'The short version: we collect only what you choose to send us, we use it to reply to you, and we do not track you around the site.')}
  <section class="block" style="padding-top:clamp(20px,2.6vw,32px)">
    <div class="wrap">
      <div class="legal">
        <article>
          <h2>Who we are</h2>
          <p>This site is run by Coveworks Ltd, an independent web studio. We are the controller of the personal information described here. For anything about your information, write to <a href="mailto:sales@coveworks.tech">sales@coveworks.tech</a>.</p>
        </article>
        <article>
          <h2>What we collect, and when</h2>
          <p><strong>When you send us a build or a message.</strong> Your name, your email address, your phone number if you give one, what you wrote, and the build you made in the configurator: the kind of site, the look, the sections, the headline and the words you typed to describe it. If you pasted the address of your current website, we keep that address too.</p>
          <p><strong>When you paste a web address into the configurator.</strong> Our server opens that public page once and reads a few details from it: the business name, the main headline, the description, the main colour and the logo. A temporary copy of those details is kept so a repeat lookup is quick, and is cleared automatically. Nothing else is kept unless you then send us the build.</p>
          <p><strong>To stop misuse.</strong> When you send a form or look up a site, we keep a scrambled record of your internet address for a short time, so that nobody can flood the forms. It is cleared automatically, normally within hours.</p>
          <p><strong>What we do not do.</strong> This site sets no cookies and uses no analytics, advertising or tracking tools. Describing a site in words is read in your own browser and sends us nothing until you press send. Like any website, the company that hosts ours keeps standard server logs.</p>
        </article>
        <article>
          <h2>Why we use it</h2>
          <p>To reply to you, talk through your project and prepare a quote, which are steps you have asked us to take. We do not add you to a mailing list, and we never sell or share your details for marketing.</p>
        </article>
        <article>
          <h2>Where it is kept, and for how long</h2>
          <p>Enquiries are held on our web hosting and in our email, both provided by IONOS. We keep an enquiry for up to {KEEP} after we last spoke, then delete it. If you become a client, we keep what we need for the work and for our business records.</p>
        </article>
        <article>
          <h2>Your rights</h2>
          <p>You can ask us for a copy of the information we hold about you, ask us to correct it or delete it, or object to how we use it. Email <a href="mailto:sales@coveworks.tech">sales@coveworks.tech</a> and we will reply within a month. If you are unhappy with our answer, you can complain to the Information Commissioner's Office at <a href="https://ico.org.uk" rel="noopener">ico.org.uk</a>.</p>
        </article>
        <p class="legal-date">Last updated 12 November 2026.</p>
      </div>
    </div>
  </section>
</main>
"""
with open(os.path.join(ROOT, 'privacy.html'), 'w', encoding='utf-8') as f:
    f.write(head('Privacy · Coveworks', 'What Coveworks Ltd collects when you send a build or a message, why, how long it is kept and your rights.', '', 'privacy.html') + chrome('') + '\n' + PRIVACY + footer())
extra_pages.append('privacy.html')
print('wrote privacy.html')

# ---------- sitemap.xml and robots.txt ----------
urls = [SITE] + [SITE + href for href, _l in PAGES if href != 'index.html'] + [SITE + href for href in extra_pages]
with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n')
with open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8') as f:
    f.write(f'User-agent: *\nDisallow: /api/\n\nSitemap: {SITE}sitemap.xml\n')
print('wrote sitemap.xml with', len(urls), 'addresses, and robots.txt')
