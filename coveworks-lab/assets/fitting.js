/* Coveworks · Lab · the configurator
   Each site type carries its own structure, copy and photography; each look restyles it.
   Photography: Unsplash via Lorem Picsum, see assets/stock/CREDITS.txt */
(function(){
'use strict';
var pvSite = document.getElementById('pvSite');
if (!pvSite) return;
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var smooth = reduce ? 'auto' : 'smooth';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function img(id, cls, alt){ return '<span class="x-ph' + (cls ? ' ' + cls : '') + '"><img src="assets/stock/' + id + '.webp" alt="' + esc(alt || '') + '" decoding="async"></span>'; }

/* ============ site types ============ */
var TYPES = {
  photography: { label: 'Photography', look: 'gallery', layout: 'full', accent: 'ink', nav: 'centre',
    kw: ['photo', 'photograph', 'portrait', 'camera', 'shoot', 'film', 'portfolio', 'videograph'],
    kick: 'Portrait and landscape photography', h: 'Light, held still.', cta: 'Book a shoot',
    sub: '{n} photographs people and places for editorial, commercial and private clients, on film and digital.',
    hero: 1052, imgs: [1027, 778, 477, 29, 1001, 669, 822, 646, 1015],
    caps: ['Portrait · Studio', 'Golden hour', 'Lake series', 'Alps · Winter', 'Couples', 'Street', 'Family', 'Fields', 'Fjords'],
    blocks: [['work', 1], ['series', 1], ['about', 1], ['packages', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: 'I am {n}. I make quiet, honest pictures: people as they are, places as they feel. Every commission starts with a conversation and ends with a set of images you will keep for life.',
    series: [['Northern Water', 'Norway', '2026'], ['Small Hours', 'London', '2025'], ['The Long Field', 'Somerset', '2025'], ['Faces of the Market', 'Lisbon', '2024']],
    packages: [['Portrait session', 'One hour, one location, twenty edited images.', '£350'], ['Half day', 'Four hours for brands, events or families.', '£850'], ['Wedding day', 'Ceremony to first dance, with an album.', '£2,400']],
    q: 'Every photograph felt like us on our best day. We have them on every wall.', qc: 'a wedding client',
    faq: [['Do you travel?', 'Yes, across the country and abroad. Travel is quoted at cost.'], ['How soon do we get the images?', 'A preview within a week, the full set within three.']],
    c: 'Booking six weeks ahead · studio in East London.' },

  restaurant: { label: 'Restaurant', look: 'savile', layout: 'full', accent: 'oxblood', nav: 'bar', extra: 'reserve',
    kw: ['restaurant', 'dining', 'bistro', 'kitchen', 'food', 'bar ', 'pub', 'steak', 'sushi', 'pizza', 'chef', 'eatery'],
    kick: 'Kitchen and dining room', h: 'Seasonal plates, cooked with care.', cta: 'Book a table',
    sub: '{n} is a neighbourhood dining room with a short menu that changes with whatever the market brings in.',
    hero: 999, imgs: [292, 488, 995, 395, 42],
    blocks: [['about', 1], ['menu', 1], ['strip', 1], ['hours', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: 'We opened {n} to cook the food we wanted to eat: honest, generous and made from scratch every morning. The menu is short on purpose, so everything on it is the best it can be.',
    menu: [['To start', [['Burrata', 'blood orange, basil oil', '9'], ['Cured trout', 'cucumber, dill, rye', '11'], ['Charred leeks', 'romesco, hazelnut', '8']]],
           ['Mains', [['Hake', 'mussels, saffron, fennel', '24'], ['Lamb rump', 'white beans, salsa verde', '27'], ['Wild mushroom risotto', 'aged parmesan', '19']]]],
    hours: [['Tuesday to Thursday', '12:00 till 22:00'], ['Friday and Saturday', '12:00 till 23:00'], ['Sunday', '12:00 till 17:00']],
    addr: '14 Market Row · London',
    q: 'The best meal we have had all year. We booked again before we had even left.', qc: 'a regular guest',
    faq: [['Do you cater for allergies?', 'Yes. Tell us when you book and the kitchen will plan around it.'], ['Can we walk in?', 'Most nights, though booking is the only way to be sure of a table.']],
    c: 'Reservations by phone or online · private room for twenty.' },

  cafe: { label: 'Café', look: 'linen', layout: 'split', accent: 'ochre', nav: 'bar', extra: 'reserve',
    kw: ['cafe', 'café', 'coffee', 'bakery', 'brunch', 'tea', 'patisserie', 'roaster'],
    kick: 'Coffee, bakes and brunch', h: 'Good coffee, slow mornings.', cta: 'See the menu',
    sub: '{n} roasts its own beans and bakes everything on site, every morning, from seven.',
    hero: 431, imgs: [1060, 225, 365, 766, 513],
    blocks: [['strip', 1], ['menu', 1], ['about', 1], ['hours', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} started with one machine and a counter of cakes. We still weigh every shot, still bake at dawn, and still know most of our regulars by name.',
    menu: [['Coffee', [['Espresso', 'house blend', '2.6'], ['Flat white', 'whole or oat', '3.4'], ['Filter', 'single origin, changes weekly', '3.8']]],
           ['From the oven', [['Cardamom bun', 'baked at six', '3.5'], ['Almond croissant', 'twice baked', '3.9'], ['Sourdough toast', 'cultured butter, jam', '4.5']]]],
    hours: [['Monday to Friday', '07:00 till 16:00'], ['Saturday and Sunday', '08:00 till 17:00']],
    addr: '3 Canal Street · Bristol',
    q: 'The cardamom buns alone are worth the queue. Best flat white in the city.', qc: 'a weekend regular',
    c: 'Takeaway and tables · laptops welcome before noon.' },

  clinic: { label: 'Clinic', look: 'fresh', layout: 'split', accent: 'teal', nav: 'bar',
    kw: ['clinic', 'dental', 'dentist', 'aesthetic', 'skin', 'physio', 'doctor', 'therapy', 'therapist', 'health', 'wellness', 'spa', 'beauty', 'massage', 'osteo'],
    kick: 'Clinic and treatments', h: 'Results that look like you, rested.', cta: 'Book a consultation',
    sub: '{n} offers doctor led treatments in a calm private clinic, with honest advice before anything else.',
    hero: 1068, imgs: [785, 306, 832, 940, 691],
    blocks: [['treatments', 1], ['about', 1], ['team', 1], ['steps', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'Every treatment at {n} starts with a conversation. We take the time to understand what you want, explain what is realistic, and never push a treatment you do not need.',
    treatments: [['Skin consultation', '30 min', 'Free'], ['Skin boosters', '45 min', '£180'], ['Anti wrinkle · one area', '30 min', '£150'], ['Chemical peel', '40 min', '£95'], ['Hydrating facial', '60 min', '£85']],
    team: [['Dr Amelia Hart', 'Medical director'], ['Sam Okafor', 'Aesthetic nurse'], ['Lena Ruiz', 'Skin therapist']],
    steps: [['Consult', 'A free assessment and an honest plan.'], ['Treat', 'Performed by qualified practitioners.'], ['Review', 'A follow up at two weeks, always included.']],
    q: 'I left feeling listened to, and the results are so natural that nobody can tell. Exactly what I wanted.', qc: 'a returning client',
    faq: [['Is there any downtime?', 'Most treatments let you return to your day straight away.'], ['Who carries out the treatments?', 'Qualified medical practitioners, every time.']],
    c: 'Appointments Monday to Saturday · consultation first.' },

  property: { label: 'Property', look: 'clean', layout: 'full', accent: 'navy', nav: 'bar', extra: 'search',
    kw: ['property', 'estate agent', 'real estate', 'homes', 'lettings', 'developer', 'development', 'architect', 'interior', 'house', 'apartment', 'rental'],
    kick: 'Property and development', h: 'Homes worth living in.', cta: 'Arrange a viewing',
    sub: '{n} finds, restores and sells homes across the city, from the first viewing to the day you get the keys.',
    hero: 625, imgs: [834, 946, 887, 1008, 859],
    blocks: [['listings', 1], ['about', 1], ['stats', 1], ['steps', 0], ['testimonial', 1], ['contact', 1]],
    about: '{n} takes on the properties others walk past. We plan every project in detail, manage the build ourselves and finish each home as if we were moving in.',
    listings: [[834, '£595,000', 'Garden flat', 'Islington · 2 bed · 820 sq ft'], [946, '£825,000', 'Victorian terrace', 'Walthamstow · 3 bed · 1,240 sq ft'], [887, '£2,150 pcm', 'Lateral apartment', 'Hackney · 2 bed · 900 sq ft']],
    stats: [['240', 'Homes sold'], ['18', 'Years in the city'], ['4.9', 'Average review'], ['21 days', 'Average time to offer']],
    steps: [['Value', 'An honest valuation within 48 hours.'], ['Market', 'Photography, floorplans and viewings handled.'], ['Complete', 'We chase every party until the keys change hands.']],
    q: 'They turned a tired terrace into the home we had been searching for. The finish is outstanding.', qc: 'a homeowner',
    c: 'Viewings by appointment · seven days a week.' },

  motors: { label: 'Car hire', look: 'noir', layout: 'full', accent: 'chalk', nav: 'bar',
    kw: ['car', 'cars', 'motor', 'hire', 'rental car', 'chauffeur', 'garage', 'dealership', 'vehicle', 'auto'],
    kick: 'Car hire and motors', h: 'The keys to a better drive.', cta: 'Reserve a car',
    sub: '{n} keeps a private collection of cars, prepared to a standard and handed over wherever you need them.',
    hero: 133, imgs: [1071, 551, 605, 111],
    blocks: [['fleet', 1], ['steps', 1], ['about', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'Every car at {n} is chosen, cleaned and checked by us before it leaves. No call centres and no surprises at the counter, just the car you booked, ready on time.',
    fleet: [[1071, 'Grand tourer', 'Automatic · 4 seats · 380 hp', '£320'], [551, 'Weekend cruiser', 'Manual · 2 seats · 260 hp', '£240'], [111, 'Classic saloon', 'Automatic · 5 seats · 1964', '£410']],
    steps: [['Choose', 'Pick a car and your dates.'], ['Delivered', 'We bring it to your door, fuelled and cleaned.'], ['Drive', 'Fully insured, with mileage to spare.']],
    q: 'Delivered to my door, spotless and full of fuel. The easiest hire I have ever booked.', qc: 'a weekend client',
    faq: [['What do I need to hire?', 'A full licence held for three years and a valid card in your name.'], ['Is insurance included?', 'Yes, fully comprehensive cover comes with every hire.']],
    c: 'Bookings seven days a week · by phone or WhatsApp.' },

  trades: { label: 'Trades', look: 'boardroom', layout: 'split', accent: 'blue', nav: 'bar', extra: 'quote',
    kw: ['plumber', 'electrician', 'builder', 'roofer', 'mechanic', 'carpenter', 'joiner', 'decorator', 'trades', 'handyman', 'repair', 'cleaning', 'cleaner', 'landscap', 'gardener', 'locksmith'],
    kick: 'Trades and repair', h: 'Fixed properly, the first time.', cta: 'Get a quote',
    sub: '{n} comes to you, explains the problem in plain words and fixes it at an agreed price.',
    hero: 491, imgs: [527, 210, 307, 143],
    blocks: [['services', 1], ['steps', 1], ['areas', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'At {n} we treat every job as if it were our own. You get a clear quote before we start, tidy work, and a call back if anything is not right.',
    services: [['Repairs', 'Most jobs completed on the same visit.', 'from £60'], ['Installations', 'Fitted, tested and certified.', 'quoted'], ['Servicing', 'Regular care that saves money later.', 'from £120']],
    steps: [['Call or message', 'Tell us what is wrong, send a photo if you can.'], ['Fixed price', 'A written quote before any work begins.'], ['Guaranteed', 'Every job carries a twelve month guarantee.']],
    areas: ['Romford', 'Ilford', 'Barking', 'Hornchurch', 'Brentwood', 'Dagenham', 'Upminster', 'Stratford'],
    q: 'Turned up when they said, fixed it within the hour and charged exactly what they quoted.', qc: 'a local customer',
    faq: [['Do you charge for quotes?', 'No. Quotes are always free.'], ['Are you insured?', 'Yes, fully insured, and every job is guaranteed.']],
    c: 'Monday to Saturday · same day call outs.' },

  boutique: { label: 'Shop', look: 'mono', layout: 'split', accent: 'ink', nav: 'centre',
    kw: ['shop', 'store', 'boutique', 'fashion', 'clothing', 'brand', 'ecommerce', 'jewellery', 'jewelry', 'streetwear', 'products', 'apparel', 'candle', 'homeware'],
    kick: 'New season · small batch', h: 'Made in small runs, built to last.', cta: 'Shop the collection',
    sub: '{n} makes a short collection each season, cut from good cloth and finished by hand.',
    hero: 1059, imgs: [535, 758, 21, 26, 604],
    blocks: [['products', 1], ['strip', 1], ['about', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} began with one idea: make fewer things, and make them properly. Every piece is designed in house and produced in small numbers, so nothing is wasted.',
    products: [[535, 'Oxford shirt', '£85'], [758, 'Wool scarf', '£60'], [21, 'Leather court', '£140'], [26, 'Everyday kit', '£45']],
    q: 'The quality is unreal for the price. I have bought three more pieces since my first order.', qc: 'a customer',
    faq: [['Do you ship worldwide?', 'Yes, to most countries, with tracked delivery.'], ['Can I return an item?', 'Within thirty days, unworn, for a full refund.']],
    c: 'Free delivery over £100 · returns within thirty days.' },

  professional: { label: 'Professional', look: 'ledger', layout: 'split', accent: 'navy', nav: 'bar',
    kw: ['accountant', 'accounting', 'law', 'lawyer', 'solicitor', 'legal', 'finance', 'financial', 'consult', 'advisor', 'adviser', 'insurance', 'bookkeep', 'tax', 'firm', 'recruit'],
    kick: 'Professional services', h: 'Your books in order, your deadlines met.', cta: 'Book a call',
    sub: '{n} looks after the accounts, tax and payroll of growing businesses, at fixed fees agreed in writing.',
    hero: 856, imgs: [378, 534, 939, 1078],
    blocks: [['logos', 1], ['services', 1], ['pricing', 1], ['team', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} is a small firm by choice. You speak to the same people every time, you always know what you are paying, and you hear from us before deadlines, not after them.',
    logos: ['Hartley & Co', 'Northfield', 'Oakline', 'Marlow Group', 'Kestrel'],
    services: [['Bookkeeping', 'Monthly, accurate and always up to date.', 'from £150 a month'], ['Year end accounts', 'Prepared, explained and filed on time.', 'from £650'], ['Tax returns', 'Personal and company returns, handled.', 'from £250']],
    pricing: [['Sole trader', '£95', 'a month', ['Self assessment', 'Quarterly reviews', 'Email support'], 0], ['Limited company', '£195', 'a month', ['Year end accounts', 'Corporation tax', 'Payroll for five', 'A named accountant'], 1], ['Growing team', '£395', 'a month', ['Everything in Limited', 'Monthly management accounts', 'Payroll for twenty'], 0]],
    team: [['Priya Shah', 'Founding partner'], ['Tom Hale', 'Tax lead'], ['Grace Lin', 'Client manager']],
    q: 'Clear, quick and always ahead of the deadline. I would not move to another firm.', qc: 'a client since day one',
    faq: [['Do you offer fixed fees?', 'Always. You will know the cost before we begin.'], ['Can you take over from my current accountant?', 'Yes, and we handle the handover for you.']],
    c: 'Monday to Friday · nine till half past five.' },

  saas: { label: 'Software', look: 'aurora', layout: 'centred', accent: 'violet', nav: 'bar', extra: 'mock',
    kw: ['saas', 'software', 'app', 'startup', 'platform', 'tool', 'dashboard', 'ai ', ' ai', 'tech', 'product launch', 'api', 'fintech'],
    kick: 'Now in public beta', h: 'Ship the work, not the busywork.', cta: 'Start free',
    sub: '{n} turns scattered tasks, docs and approvals into one calm workspace your whole team will actually use.',
    hero: 893, imgs: [532, 668, 983, 1048],
    blocks: [['logos', 1], ['bento', 1], ['stats', 1], ['pricing', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} was built by a small team tired of switching between nine tools to finish one task. So we made the one we wanted.',
    logos: ['Northwind', 'Lumen', 'Parcel', 'Arcadia', 'Fieldnote', 'Orbit'],
    bento: [['Plans that write themselves', 'Turn a brief into a plan with owners and dates in seconds.'], ['Approvals in one click', 'Route work to the right person, never lose a sign off.'], ['Live docs', 'Specs that update as the work does.'], ['Reports on Monday', 'A weekly summary lands in every inbox.']],
    stats: [['12,000', 'Teams on board'], ['4.2 hrs', 'Saved per person, weekly'], ['99.98%', 'Uptime this year'], ['SOC 2', 'Type II certified']],
    pricing: [['Starter', '£0', 'forever', ['Up to five people', 'Unlimited projects', 'Core integrations'], 0], ['Team', '£9', 'per seat a month', ['Approvals and automations', 'Live docs', 'Priority support'], 1], ['Scale', 'Custom', 'billed yearly', ['SSO and audit logs', 'Dedicated success manager', 'Custom contracts'], 0]],
    q: 'We replaced three tools in a week. Our Monday stand up is now ten minutes.', qc: 'Head of operations, sample review',
    faq: [['Is there a free plan?', 'Yes, free forever for teams of up to five.'], ['Can we import our data?', 'One click imports from the tools you already use.']],
    c: 'Free for small teams · no card needed.' },

  agency: { label: 'Studio', look: 'swiss', layout: 'split', accent: 'chalk', nav: 'bar',
    kw: ['agency', 'studio', 'design', 'creative', 'branding', 'marketing', 'architecture practice', 'freelance', 'designer', 'developer', 'digital'],
    kick: 'Brand and digital studio', h: 'Brands with a point of view.', cta: 'Start a project',
    sub: '{n} is an independent studio making identities, websites and campaigns for companies that want to be remembered.',
    hero: 951, imgs: [526, 949, 20, 1081],
    blocks: [['series', 1], ['services', 1], ['logos', 1], ['stats', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} is twelve people in one room. We work with a handful of clients a year, so each gets our full attention.',
    series: [['Field Notes', 'Identity · Packaging', '2026'], ['Harbour Line', 'Website · Motion', '2026'], ['Common Ground', 'Campaign', '2025'], ['Atlas Coffee', 'Brand system', '2025']],
    services: [['Identity', 'Names, marks, type and voice.', 'from £12k'], ['Digital', 'Websites and products that perform.', 'from £18k'], ['Campaigns', 'Ideas that travel across every channel.', 'quoted']],
    logos: ['Field Notes', 'Harbour', 'Atlas', 'Common', 'Verso'],
    stats: [['64', 'Brands launched'], ['11', 'Awards'], ['12', 'People'], ['1', 'Room']],
    q: 'They found the idea we had been circling for years, and made it look inevitable.', qc: 'a founder',
    c: 'Taking two new projects this season.' },

  fitness: { label: 'Fitness', look: 'brutal', layout: 'split', accent: 'blue', nav: 'bar',
    kw: ['gym', 'fitness', 'yoga', 'pilates', 'personal trainer', 'trainer', 'crossfit', 'boxing', 'running', 'swim', 'sport', 'martial', 'dance', 'cycling'],
    kick: 'Strength, conditioning, community', h: 'Stronger every week.', cta: 'Book a free class',
    sub: '{n} runs small group classes and personal training for every level, coached by people who know your name.',
    hero: 841, imgs: [770, 1077, 839, 845],
    blocks: [['timetable', 1], ['pricing', 1], ['strip', 1], ['team', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} is not a mirror and machine gym. Every session is coached, every plan is written for you, and every member is part of the crew.',
    timetable: [['06:30', ['Strength', 'Conditioning', 'Strength', 'Conditioning', 'Strength']], ['12:15', ['Mobility', 'Swim', 'Mobility', 'Swim', 'Mobility']], ['18:30', ['Conditioning', 'Strength', 'Boxing', 'Strength', 'Open gym']]],
    pricing: [['Drop in', '£15', 'a class', ['Any class', 'Towel included'], 0], ['Unlimited', '£89', 'a month', ['Every class', 'Open gym', 'Monthly check in'], 1], ['Personal', '£220', 'a month', ['Four PT sessions', 'Written programme', 'Unlimited classes'], 0]],
    team: [['Jordan Blake', 'Head coach'], ['Maya Chen', 'Strength coach'], ['Ollie Reed', 'Swim coach']],
    q: 'Six months in and I am lifting more than I ever thought I could. The coaches are brilliant.', qc: 'a member',
    faq: [['I am a beginner. Is that ok?', 'Most of our members started from scratch. Every class scales to you.'], ['Is the first class free?', 'Always. Come and try one on us.']],
    c: 'Open 06:00 till 21:00 · first class free.' },

  events: { label: 'Events', look: 'glass', layout: 'centred', accent: 'violet', nav: 'centre',
    kw: ['wedding', 'event', 'venue', 'party', 'festival', 'conference', 'planner', 'catering', 'dj', 'music', 'band', 'celebration', 'ceremony'],
    kick: 'Weddings, parties and gatherings', h: 'Days worth remembering.', cta: 'Check a date',
    sub: '{n} plans and hosts weddings and celebrations, from the first idea to the last dance.',
    hero: 1004, imgs: [815, 195, 508, 407, 129],
    blocks: [['dates', 1], ['packages', 1], ['gallery', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} has hosted more than four hundred celebrations. We take care of every detail so you can be a guest at your own event.',
    dates: [['14 Jun', 'Summer garden open day', 'Tour the grounds and meet the team'], ['02 Aug', 'Wedding showcase', 'Suppliers, tastings and live music'], ['21 Sep', 'Autumn supper club', 'Long tables under the lights']],
    packages: [['Intimate', 'Up to forty guests, ceremony and supper.', 'from £4,500'], ['Classic', 'Up to one hundred and twenty, all day.', 'from £11,000'], ['Grand', 'Two days, exclusive use of the venue.', 'from £24,000']],
    q: 'Every detail was taken care of. All we had to do was turn up and enjoy it.', qc: 'a couple married here',
    faq: [['How far ahead should we book?', 'Most couples book twelve to eighteen months ahead.'], ['Can we bring our own suppliers?', 'Yes, alongside our trusted list.']],
    c: 'Viewings most weekends · dates for next year now open.' }
};
var BLOCKS = { work: 'Work', series: 'Projects', about: 'About', packages: 'Packages', testimonial: 'Reviews', faq: 'Questions', contact: 'Contact',
  menu: 'Menu', strip: 'Photos', hours: 'Hours', treatments: 'Treatments', team: 'Team', steps: 'How it works', listings: 'Listings', stats: 'Numbers',
  fleet: 'Fleet', services: 'Services', areas: 'Areas', products: 'Products', logos: 'Clients', pricing: 'Pricing', bento: 'Features', timetable: 'Timetable',
  dates: 'Dates', gallery: 'Gallery' };

/* ============ looks (styles) ============ */
var LOOKS = {
  clean:     { group: 'Professional', label: 'Clean',     desc: 'White, crisp, colour led' },
  swiss:     { group: 'Professional', label: 'Swiss',     desc: 'Strict grid, heavy type, hard rules' },
  ledger:    { group: 'Professional', label: 'Ledger',    desc: 'Paper white, serif headings, ruled lines' },
  boardroom: { group: 'Professional', label: 'Boardroom', desc: 'Cool grey, corporate sans, white cards' },
  gallery:   { group: 'Professional', label: 'Gallery',   desc: 'Pure white, large quiet type, images first' },
  fresh:     { group: 'Professional', label: 'Fresh',     desc: 'Soft white, friendly rounded sans' },
  slate:     { group: 'Professional', label: 'Slate',     desc: 'Dark slate, calm and modern' },
  savile:    { group: 'Signature',    label: 'Savile',    desc: 'Ivory, fashion house serif, hairlines' },
  linen:     { group: 'Signature',    label: 'Linen',     desc: 'Warm sand, soft corners, gentle serif' },
  noir:      { group: 'Signature',    label: 'Noir',      desc: 'Black, bold, set in capitals' },
  aurora:    { group: 'Modern',       label: 'Aurora',    desc: 'Deep night with colour glows and glass cards' },
  glass:     { group: 'Modern',       label: 'Glass',     desc: 'Frosted panels over a soft colour wash' },
  brutal:    { group: 'Modern',       label: 'Brutalist', desc: 'Thick outlines, hard shadows, loud type' },
  grid:      { group: 'Modern',       label: 'Blueprint', desc: 'Dot grid, mono labels, technical' },
  mono:      { group: 'Modern',       label: 'Mono',      desc: 'Black and white component style' }
};
var DARK = { slate: 1, noir: 1, aurora: 1 };
var LAYOUTS = {
  split:   { label: 'Split',   svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35"/><path d="M6 12h18M6 17h14M6 23h8"/><rect x="33" y="7" width="21" height="22" fill="currentColor" opacity=".18" stroke="none"/></svg>' },
  centred: { label: 'Centred', svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35"/><path d="M18 9h24M22 14h16M27 19h6"/><rect x="8" y="24" width="44" height="8" fill="currentColor" opacity=".18" stroke="none"/></svg>' },
  full:    { label: 'Full image', svg: '<svg viewBox="0 0 60 36" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="59" height="35" fill="currentColor" fill-opacity=".18"/><path d="M6 14h22M6 19h16M6 25h8"/></svg>' }
};
var ACCENTS = { navy: ['Navy', '#1F3A5F'], blue: ['Blue', '#2F5BEA'], teal: ['Teal', '#1E6B67'], forest: ['Forest', '#2F5D46'], violet: ['Violet', '#5B4BD6'],
  oxblood: ['Oxblood', '#7A2430'], chalk: ['Chalk red', '#B4412A'], ochre: ['Ochre', '#A0702A'], graphite: ['Graphite', '#3D4249'], ink: ['Ink', '#1B1712'] };

/* ============ reading a plain words brief ============ */
var LOOK_WORDS = [['minimal', 'gallery'], ['clean', 'clean'], ['simple', 'clean'], ['luxury', 'savile'], ['luxurious', 'savile'], ['elegant', 'savile'], ['premium', 'savile'],
  ['classic', 'ledger'], ['traditional', 'ledger'], ['editorial', 'ledger'], ['corporate', 'boardroom'], ['business', 'boardroom'], ['friendly', 'fresh'], ['calm', 'fresh'], ['soft', 'fresh'],
  ['warm', 'linen'], ['cosy', 'linen'], ['rustic', 'linen'], ['dark', 'slate'], ['moody', 'slate'], ['bold', 'noir'], ['edgy', 'noir'], ['loud', 'brutal'], ['brutal', 'brutal'],
  ['playful', 'brutal'], ['fun', 'brutal'], ['futuristic', 'aurora'], ['techy', 'grid'], ['technical', 'grid'], ['glass', 'glass'], ['modern', 'aurora'], ['swiss', 'swiss'],
  ['monochrome', 'mono'], ['black and white', 'mono'], ['gradient', 'aurora'], ['dreamy', 'glass']];
var COLOUR_WORDS = [['navy', 'navy'], ['blue', 'blue'], ['teal', 'teal'], ['green', 'forest'], ['purple', 'violet'], ['violet', 'violet'], ['burgundy', 'oxblood'], ['wine', 'oxblood'],
  ['red', 'chalk'], ['orange', 'chalk'], ['gold', 'ochre'], ['yellow', 'ochre'], ['grey', 'graphite'], ['gray', 'graphite'], ['black', 'ink']];
var LAYOUT_WORDS = [['centred', 'centred'], ['centered', 'centred'], ['full screen', 'full'], ['full image', 'full'], ['big photo', 'full'], ['split', 'split']];
function lev(a, b){
  if (a === b) return 0;
  var prev = [], cur, i, j;
  for (j = 0; j <= b.length; j++) prev[j] = j;
  for (i = 1; i <= a.length; i++){
    cur = [i];
    for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/* how well one keyword matches the brief: exact word, a longer form of it (photographer, minimalist),
   or a near spelling (resturant). Keywords padded with spaces must match exactly as written. */
function hit(kw, t, ws, loose){
  if (/^\s|\s$/.test(kw) || kw.indexOf(' ') > -1) return t.indexOf(kw) > -1 ? kw.trim().length + 1 : 0;
  var best = 0;
  ws.forEach(function(w){
    if (w === kw || w === kw + 's' || w === kw + 'es'){ best = Math.max(best, kw.length + 1); return; }
    if (w.indexOf(kw) === 0 && (kw.length >= 4 || w.length <= kw.length + 1)){ best = Math.max(best, kw.length); return; }
    if (kw.length < 5 || w.length < 4) return;
    var tol = (kw.length >= 8 ? 2 : 1) + (loose ? 1 : 0);
    if (Math.abs(w.length - kw.length) <= tol && lev(w, kw) <= tol) best = Math.max(best, kw.length - 1);
    else if (w.length > kw.length && lev(w.slice(0, kw.length), kw) <= tol) best = Math.max(best, kw.length - 2);
  });
  return best;
}
function scoreTypes(t, ws, loose){
  return Object.keys(TYPES).map(function(k){
    var score = 0;
    TYPES[k].kw.forEach(function(w){ score += hit(w, t, ws, loose); });
    return [k, score];
  }).filter(function(p){ return p[1] > 0; }).sort(function(x, y){ return y[1] - x[1]; });
}
function readBrief(text){
  var t = ' ' + text.toLowerCase().replace(/[^a-z0-9&é ]+/g, ' ') + ' ';
  var ws = t.split(/\s+/).filter(Boolean);
  var found = { type: null, look: null, accent: null, layout: null, name: null, guesses: [] };
  var ranked = scoreTypes(t, ws, false);
  if (ranked.length) found.type = ranked[0][0];
  else found.guesses = scoreTypes(t, ws, true).slice(0, 3).map(function(p){ return p[0]; });
  LOOK_WORDS.forEach(function(p){ if (!found.look && hit(p[0], t, ws, false)) found.look = p[1]; });
  COLOUR_WORDS.forEach(function(p){ if (!found.accent && hit(p[0], t, ws, false)) found.accent = p[1]; });
  LAYOUT_WORDS.forEach(function(p){ if (!found.layout && t.indexOf(p[0]) > -1) found.layout = p[1]; });
  var m = text.match(/(?:called|named)\s+["“']?([^,.;"”']{2,32})/i) || text.match(/["“]([^"”]{2,32})["”]/);
  if (m) found.name = m[1].trim();
  return found;
}

/* ============ state ============ */
function typeDefaults(k){
  var T = TYPES[k], order = [], on = {};
  T.blocks.forEach(function(b){ order.push(b[0]); on[b[0]] = b[1]; });
  return { type: k, look: T.look, layout: T.layout, accent: T.accent, order: order, on: on };
}
function fresh(){
  var s = typeDefaults('photography');
  s.name = ''; s.nameSrc = ''; s.headline = ''; s.device = window.innerWidth < 760 ? 'phone' : 'desktop';
  return s;
}
var S = fresh();
function applyType(k){
  var d = typeDefaults(k);
  Object.keys(d).forEach(function(key){ S[key] = d[key]; });
}
(function(){
  var q = new URLSearchParams(location.search);
  if (q.get('name')){ S.name = q.get('name').slice(0, 32); S.nameSrc = 'user'; }
  if (q.get('brief')) { var f = readBrief(q.get('brief')); if (f.type) applyType(f.type); if (f.look) S.look = f.look; if (f.accent) S.accent = f.accent; if (f.layout) S.layout = f.layout; if (f.name){ S.name = f.name; S.nameSrc = 'brief'; } var bi = document.getElementById('fBrief'); if (bi) bi.value = q.get('brief'); }
  var fit = q.get('fit');
  if (!fit) return;
  try {
    var o = JSON.parse(decodeURIComponent(escape(atob(fit.replace(/-/g, '+').replace(/_/g, '/')))));
    if (TYPES[o.type]) applyType(o.type);
    if (LOOKS[o.look]) S.look = o.look;
    if (LAYOUTS[o.layout]) S.layout = o.layout;
    if (ACCENTS[o.accent]) S.accent = o.accent;
    if (typeof o.name === 'string') S.name = o.name.slice(0, 32);
    if (typeof o.headline === 'string') S.headline = o.headline.slice(0, 70);
    var valid = S.order.slice().sort().join();
    if (Array.isArray(o.order) && o.order.slice().sort().join() === valid) S.order = o.order;
    if (o.on) S.order.forEach(function(k){ S.on[k] = o.on[k] ? 1 : 0; });
  } catch(e) {}
})();
function encodeFit(){
  var o = { type: S.type, name: S.name, look: S.look, layout: S.layout, accent: S.accent, headline: S.headline, order: S.order, on: S.on };
  return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fitURL(){ return location.href.split('#')[0].split('?')[0] + '?fit=' + encodeFit(); }
function nm(){ return S.name.trim() || 'Your Business'; }
function fill(s){ return esc(String(s).replace(/\{n\}/g, nm())); }
function slug(){ return (nm().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '') || 'yourbusiness') + '.co.uk'; }
function initials(n){ return n.replace(/^Dr\s+/, '').split(' ').map(function(w){ return w[0]; }).join('').slice(0, 2); }
$('orderNo').textContent = 'Build no. ' + String(1000 + Math.floor(Math.random() * 9000));

/* ============ controls ============ */
$('fType').innerHTML = Object.keys(TYPES).map(function(k){
  return '<label class="chip"><input type="radio" name="type" value="' + k + '"><span>' + TYPES[k].label + '</span></label>';
}).join('');
var lastGroup = '';
$('fCloth').innerHTML = Object.keys(LOOKS).map(function(k){
  var c = LOOKS[k], head = '';
  if (c.group !== lastGroup){ head = '<span class="cloth-group">' + c.group + '</span>'; lastGroup = c.group; }
  return head + '<label class="chip cloth" title="' + c.label + ' · ' + c.desc + '"><input type="radio" name="look" value="' + k + '"><span><i class="sw ' + k + '">Aa</i><b>' + c.label + '</b></span></label>';
}).join('');
$('fLayout').innerHTML = Object.keys(LAYOUTS).map(function(k){
  return '<label class="chip layout"><input type="radio" name="layout" value="' + k + '"><span>' + LAYOUTS[k].svg + LAYOUTS[k].label + '</span></label>';
}).join('');
$('fAccent').innerHTML = Object.keys(ACCENTS).map(function(k){
  return '<label class="swatch" title="' + ACCENTS[k][0] + '"><input type="radio" name="accent" value="' + k + '" aria-label="' + ACCENTS[k][0] + '"><span style="background:' + ACCENTS[k][1] + '"></span></label>';
}).join('') + '<span class="sw-name" id="fAccentName"></span>';
var UP = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
var DN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
function drawSecs(focusKey, focusDir){
  var html = '<li class="fixed"><label><input type="checkbox" checked disabled> Opening</label><span class="fx">Always first</span></li>';
  S.order.forEach(function(k, i){
    html += '<li class="' + (S.on[k] ? '' : 'off') + '">' +
      '<label><input type="checkbox" data-k="' + k + '"' + (S.on[k] ? ' checked' : '') + '> ' + BLOCKS[k] + '</label>' +
      '<span class="mv"><button type="button" data-up="' + k + '" aria-label="Move ' + BLOCKS[k] + ' up"' + (i === 0 ? ' disabled' : '') + '>' + UP + '</button>' +
      '<button type="button" data-dn="' + k + '" aria-label="Move ' + BLOCKS[k] + ' down"' + (i === S.order.length - 1 ? ' disabled' : '') + '>' + DN + '</button></span></li>';
  });
  $('fSecs').innerHTML = html;
  if (focusKey){
    var f = $('fSecs').querySelector('[data-' + focusDir + '="' + focusKey + '"]');
    if (f && !f.disabled) f.focus();
    else { var alt = $('fSecs').querySelector('[data-' + (focusDir === 'up' ? 'dn' : 'up') + '="' + focusKey + '"]'); if (alt) alt.focus(); }
  }
}
function describe(){
  $('fClothDesc').innerHTML = '<b>' + LOOKS[S.look].label + '</b> · ' + esc(LOOKS[S.look].desc);
  $('fAccentName').textContent = ACCENTS[S.accent][0];
}
function syncControls(){
  $('fName').value = S.name;
  $('fHead').value = S.headline;
  $('fHead').placeholder = TYPES[S.type].h;
  [['type', S.type], ['look', S.look], ['layout', S.layout], ['accent', S.accent]].forEach(function(p){
    document.querySelectorAll('input[name=' + p[0] + ']').forEach(function(r){ r.checked = r.value === p[1]; });
  });
  document.querySelectorAll('.dev button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-dev') === S.device); });
  describe();
  drawSecs();
}

/* ============ block renderers ============ */
function kick(t){ return '<p class="x-kick">' + esc(t) + '</p>'; }
function sec(k, inner, cls){ return '<section class="x-sec s-' + k + (cls ? ' ' + cls : '') + '" data-sec="' + k + '">' + inner + '</section>'; }
var R = {
  work: function(T){
    return sec('work', '<div class="x-head">' + kick('Selected work') + '<h2>Recent photographs.</h2></div><div class="x-masonry">' +
      T.imgs.slice(0, 6).map(function(id, i){ return '<figure>' + img(id, '', T.caps[i]) + '<figcaption>' + esc(T.caps[i] || '') + '</figcaption></figure>'; }).join('') + '</div>');
  },
  series: function(T){
    return sec('series', '<div class="x-head">' + kick(T.label === 'Studio' ? 'Case studies' : 'Series') + '<h2>' + (T.label === 'Studio' ? 'Selected projects.' : 'Ongoing series.') + '</h2></div><div class="x-list">' +
      T.series.map(function(s, i){ return '<div class="x-li"><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><strong>' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span><span>' + esc(s[2]) + '</span>' + img(T.imgs[(i + 2) % T.imgs.length], 'x-li-img') + '</div>'; }).join('') + '</div>');
  },
  about: function(T){
    return sec('about', '<div class="x-about"><div>' + kick('About') + '<h2>' + esc(nm()) + '</h2><p>' + fill(T.about) + '</p></div>' + img(T.imgs[T.imgs.length - 1], 'x-about-img') + '</div>');
  },
  packages: function(T){
    return sec('packages', '<div class="x-head">' + kick('Packages') + '<h2>Simple, clear packages.</h2></div><div class="x-three">' +
      T.packages.map(function(p){ return '<div class="x-card"><h3>' + esc(p[0]) + '</h3><p>' + esc(p[1]) + '</p><b>' + esc(p[2]) + '</b></div>'; }).join('') + '</div>');
  },
  testimonial: function(T){
    return sec('testimonial', '<div class="x-quote">' + kick('Kind words') + '<blockquote>“' + esc(T.q) + '”</blockquote><cite>Sample review · ' + esc(T.qc.replace(', sample review', '')) + '</cite></div>');
  },
  faq: function(T){
    return sec('faq', '<div class="x-faq"><div>' + kick('Questions') + '<h2>Asked often.</h2></div><dl>' +
      T.faq.map(function(f){ return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl></div>');
  },
  contact: function(T){
    return sec('contact', '<div>' + kick('Contact') + '<h2>Ready when you are.</h2><p>' + esc(T.c) + '</p></div><span class="x-btn x-btn-inv">' + esc(T.cta) + '</span>');
  },
  menu: function(T){
    return sec('menu', '<div class="x-head">' + kick('Menu') + '<h2>' + (T.label === 'Café' ? 'On the counter today.' : 'This week’s menu.') + '</h2></div><div class="x-menu">' +
      T.menu.map(function(g){ return '<div><h3>' + esc(g[0]) + '</h3>' + g[1].map(function(it){ return '<div class="x-mi"><span><strong>' + esc(it[0]) + '</strong><em>' + esc(it[1]) + '</em></span><i></i><b>' + esc(it[2]) + '</b></div>'; }).join('') + '</div>'; }).join('') + '</div>');
  },
  strip: function(T){
    return sec('strip', '<div class="x-strip">' + T.imgs.slice(0, 3).map(function(id){ return img(id); }).join('') + '</div>', 'x-flush');
  },
  hours: function(T){
    return sec('hours', '<div class="x-hours"><div>' + kick('Visit') + '<h2>Opening hours.</h2><p>' + esc(T.addr || '') + '</p></div><dl>' +
      T.hours.map(function(h){ return '<div><dt>' + esc(h[0]) + '</dt><dd>' + esc(h[1]) + '</dd></div>'; }).join('') + '</dl></div>');
  },
  treatments: function(T){
    return sec('treatments', '<div class="x-head">' + kick('Treatments') + '<h2>Treatments and prices.</h2></div><div class="x-rows">' +
      T.treatments.map(function(t){ return '<div><strong>' + esc(t[0]) + '</strong><span>' + esc(t[1]) + '</span><b>' + esc(t[2]) + '</b><span class="x-book">Book</span></div>'; }).join('') + '</div>');
  },
  team: function(T){
    return sec('team', '<div class="x-head">' + kick('The team') + '<h2>The people you will meet.</h2></div><div class="x-team">' +
      T.team.map(function(p){ return '<div><span class="x-av">' + esc(initials(p[0])) + '</span><strong>' + esc(p[0]) + '</strong><span>' + esc(p[1]) + '</span></div>'; }).join('') + '</div>');
  },
  steps: function(T){
    return sec('steps', '<div class="x-head">' + kick('How it works') + '<h2>Three simple steps.</h2></div><div class="x-steps">' +
      T.steps.map(function(s, i){ return '<div><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></div>'; }).join('') + '</div>');
  },
  listings: function(T){
    return sec('listings', '<div class="x-head x-head-row"><div>' + kick('Listings') + '<h2>Available now.</h2></div><span class="x-ghost">View all homes</span></div><div class="x-three">' +
      T.listings.map(function(l){ return '<div class="x-listing">' + img(l[0]) + '<div><b>' + esc(l[1]) + '</b><h3>' + esc(l[2]) + '</h3><p>' + esc(l[3]) + '</p></div></div>'; }).join('') + '</div>');
  },
  stats: function(T){
    return sec('stats', '<div class="x-stats">' + T.stats.map(function(s){ return '<div><strong>' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span></div>'; }).join('') + '</div>');
  },
  fleet: function(T){
    return sec('fleet', '<div class="x-head x-head-row"><div>' + kick('The fleet') + '<h2>Choose your car.</h2></div><span class="x-ghost">Full fleet</span></div><div class="x-three">' +
      T.fleet.map(function(f){ return '<div class="x-listing">' + img(f[0]) + '<div><h3>' + esc(f[1]) + '</h3><p>' + esc(f[2]) + '</p><div class="x-row"><b>' + esc(f[3]) + '<small> a day</small></b><span class="x-btn x-btn-sm">Reserve</span></div></div></div>'; }).join('') + '</div>');
  },
  services: function(T){
    return sec('services', '<div class="x-head">' + kick('Services') + '<h2>What we offer.</h2></div><div class="x-three">' +
      T.services.map(function(s){ return '<div class="x-card"><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p><b>' + esc(s[2]) + '</b></div>'; }).join('') + '</div>');
  },
  areas: function(T){
    return sec('areas', '<div class="x-areas"><div>' + kick('Coverage') + '<h2>Areas we cover.</h2></div><div class="x-chips">' + T.areas.map(function(a){ return '<span>' + esc(a) + '</span>'; }).join('') + '</div></div>');
  },
  products: function(T){
    return sec('products', '<div class="x-head x-head-row"><div>' + kick('New in') + '<h2>The collection.</h2></div><span class="x-ghost">Shop all</span></div><div class="x-four">' +
      T.products.map(function(p){ return '<div class="x-product">' + img(p[0]) + '<div class="x-row"><strong>' + esc(p[1]) + '</strong><b>' + esc(p[2]) + '</b></div><span class="x-add">Add to bag</span></div>'; }).join('') + '</div>');
  },
  logos: function(T){
    return sec('logos', '<p class="x-trust">Trusted by teams at</p><div class="x-logos">' + T.logos.map(function(l){ return '<span>' + esc(l) + '</span>'; }).join('') + '</div>', 'x-thin');
  },
  pricing: function(T){
    return sec('pricing', '<div class="x-head x-center">' + kick('Pricing') + '<h2>Simple, honest pricing.</h2></div><div class="x-three">' +
      T.pricing.map(function(p){ return '<div class="x-card x-tier' + (p[4] ? ' x-featured' : '') + '">' + (p[4] ? '<span class="x-badge">Most popular</span>' : '') + '<h3>' + esc(p[0]) + '</h3><div class="x-price"><strong>' + esc(p[1]) + '</strong><span>' + esc(p[2]) + '</span></div><ul>' +
        p[3].map(function(f){ return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><span class="x-btn' + (p[4] ? '' : ' x-btn-ghost') + '">Choose ' + esc(p[0].toLowerCase()) + '</span></div>'; }).join('') + '</div>');
  },
  bento: function(T){
    var b = T.bento;
    return sec('bento', '<div class="x-head x-center">' + kick('Features') + '<h2>Everything in one calm place.</h2></div><div class="x-bento">' +
      '<div class="x-b1"><h3>' + esc(b[0][0]) + '</h3><p>' + esc(b[0][1]) + '</p><div class="x-mini">' + mockRows(5) + '</div></div>' +
      '<div class="x-b2"><h3>' + esc(b[1][0]) + '</h3><p>' + esc(b[1][1]) + '</p><div class="x-pills"><span>Design</span><span class="on">Approved</span><span>Legal</span></div></div>' +
      '<div class="x-b3">' + img(T.imgs[0]) + '<div><h3>' + esc(b[2][0]) + '</h3><p>' + esc(b[2][1]) + '</p></div></div>' +
      '<div class="x-b4"><h3>' + esc(b[3][0]) + '</h3><p>' + esc(b[3][1]) + '</p><div class="x-bars">' + [40, 65, 52, 80, 70, 92].map(function(h){ return '<i style="height:' + h + '%"></i>'; }).join('') + '</div></div></div>');
  },
  timetable: function(T){
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return sec('timetable', '<div class="x-head">' + kick('Timetable') + '<h2>This week’s classes.</h2></div><div class="x-table"><div class="x-tr x-th"><span></span>' + days.map(function(d){ return '<span>' + d + '</span>'; }).join('') + '</div>' +
      T.timetable.map(function(r){ return '<div class="x-tr"><span class="x-time">' + esc(r[0]) + '</span>' + r[1].map(function(c){ return '<span class="x-class">' + esc(c) + '</span>'; }).join('') + '</div>'; }).join('') + '</div>');
  },
  dates: function(T){
    return sec('dates', '<div class="x-head">' + kick('Coming up') + '<h2>Dates for your diary.</h2></div><div class="x-dates">' +
      T.dates.map(function(d){ var p = d[0].split(' '); return '<div><span class="x-cal"><strong>' + esc(p[0]) + '</strong>' + esc(p[1]) + '</span><span><strong>' + esc(d[1]) + '</strong><em>' + esc(d[2]) + '</em></span><span class="x-ghost">Reserve</span></div>'; }).join('') + '</div>');
  },
  gallery: function(T){
    return sec('gallery', '<div class="x-head">' + kick('Gallery') + '<h2>A look inside.</h2></div><div class="x-gal">' + T.imgs.slice(0, 4).map(function(id){ return img(id); }).join('') + '</div>');
  }
};
function mockRows(n){
  var out = '';
  for (var i = 0; i < n; i++) out += '<div class="x-mrow"><i></i><span style="width:' + (38 + (i * 17) % 40) + '%"></span><b class="' + (i % 3 === 0 ? 'ok' : '') + '"></b></div>';
  return out;
}
function mock(){
  return '<div class="x-mock"><div class="x-mock-bar"><i></i><i></i><i></i></div><div class="x-mock-body"><div class="x-mock-side">' +
    '<span class="on"></span><span></span><span></span><span></span><span></span></div><div class="x-mock-main"><div class="x-mock-cards"><div><small>Open tasks</small><strong>128</strong></div><div><small>Approved</small><strong>94%</strong></div><div><small>This week</small><strong>+32</strong></div></div>' +
    '<div class="x-mock-chart">' + [30, 46, 38, 60, 52, 74, 66, 88, 80, 96].map(function(h){ return '<i style="height:' + h + '%"></i>'; }).join('') + '</div>' + mockRows(4) + '</div></div></div>';
}
function heroExtra(T){
  if (T.extra === 'search') return '<div class="x-search"><span><small>Location</small>Islington, London</span><span><small>Type</small>Any home</span><span><small>Budget</small>Up to £900,000</span><span class="x-btn">Search</span></div>';
  if (T.extra === 'reserve') return '<div class="x-search x-reserve"><span><small>Guests</small>2 people</span><span><small>Date</small>Friday 14 June</span><span><small>Time</small>19:30</span><span class="x-btn">' + esc(T.cta) + '</span></div>';
  if (T.extra === 'quote') return '<div class="x-quotecard"><strong>Get a quote in minutes</strong><span class="x-field">Your postcode</span><span class="x-field">What needs doing?</span><span class="x-btn">Send request</span><small>Replies within the hour</small></div>';
  return '';
}
function hero(T){
  var head = S.headline.trim() || T.h;
  var media = (T.extra === 'mock' && S.layout !== 'full') ? mock() : (T.extra === 'quote' && S.layout === 'split') ? heroExtra(T) : img(T.hero, 'x-hero-img', T.label);
  var after = (T.extra === 'search' || T.extra === 'reserve') ? heroExtra(T) : '';
  return '<section class="x-hero" data-sec="hero"><div class="x-hero-copy"><p class="x-kick">' + esc(T.kick) + '</p><h1>' + esc(head) + '</h1><p>' + fill(T.sub) + '</p>' +
    '<div class="x-cta"><span class="x-btn">' + esc(T.cta) + '</span><span class="x-ghost">Find out more</span></div>' + after + '</div>' + media + '</section>';
}
function nav(T, live){
  var links = live.filter(function(k){ return k !== 'contact' && k !== 'logos' && k !== 'strip' && k !== 'testimonial'; }).slice(0, 4).map(function(k){ return '<span>' + BLOCKS[k] + '</span>'; });
  if (T.nav === 'centre'){
    var half = Math.ceil(links.length / 2);
    return '<div class="x-nav x-nav-c"><div class="x-links">' + links.slice(0, half).join('') + '</div><span class="x-logo">' + esc(nm()) + '</span><div class="x-links x-links-r">' + links.slice(half).join('') + '<span class="x-navbtn">' + esc(T.cta) + '</span></div></div>';
  }
  return '<div class="x-nav"><span class="x-logo">' + esc(nm()) + '</span><div class="x-links">' + links.join('') + '</div><span class="x-btn x-navbtn">' + esc(T.cta) + '</span></div>';
}

/* ============ render ============ */
var pvSizer = $('pvSizer'), pvView = $('pvView');
function render(){
  var T = TYPES[S.type], phone = S.device === 'phone';
  var live = S.order.filter(function(k){ return S.on[k]; });
  pvSite.className = 'pvs c-' + S.look + ' l-' + S.layout + ' t-' + S.type + (phone ? ' is-phone' : '');
  var inkOnDark = S.accent === 'ink' && DARK[S.look];
  pvSite.style.setProperty('--a', inkOnDark ? '#ECE8E1' : ACCENTS[S.accent][1]);
  pvSite.style.setProperty('--on', inkOnDark ? '#111' : '#fff');
  pvSite.innerHTML = nav(T, live) + hero(T) +
    (live.length ? live.map(function(k){ return R[k](T); }).join('') : '<div class="x-empty">Tick a section to add it to your site</div>') +
    '<div class="x-foot"><span>© ' + new Date().getFullYear() + ' ' + esc(nm()) + '</span><span>Site by Coveworks</span></div>';
  $('pvUrl').textContent = slug();
  fitPreview();
  pvSite.querySelectorAll('img').forEach(function(im){ if (!im.complete) im.addEventListener('load', fitPreview, { once: true }); });
  $('fSend').setAttribute('href', mailto());
}
function fitPreview(){
  var phone = S.device === 'phone';
  pvView.classList.toggle('phone', phone);
  var fw = pvView.clientWidth, siteW = phone ? 390 : 1280;
  var w = phone ? Math.min(fw - 40, 330) : fw, s = w / siteW;
  pvSite.style.transform = 'scale(' + s + ')';
  pvSizer.style.width = w + 'px';
  pvSizer.style.height = Math.ceil(pvSite.offsetHeight * s) + 'px';
  pvSizer._s = s;
}
function showSection(k){
  var el = pvSite.querySelector('[data-sec="' + k + '"]');
  if (!el) return;
  var top = el.offsetTop * (pvSizer._s || 1) + (S.device === 'phone' ? 18 : 0) - 12;
  pvView.scrollTo({ top: Math.max(0, top), behavior: smooth });
  el.classList.add('flash');
  setTimeout(function(){ el.classList.remove('flash'); }, 900);
}
function mailto(){
  var T = TYPES[S.type];
  var live = S.order.filter(function(k){ return S.on[k]; }).map(function(k){ return BLOCKS[k]; });
  var body = 'Hello Coveworks,\n\nI built a demo in your configurator and would like to talk about the real thing.\n\n' +
    'Business: ' + nm() + '\n' +
    'Type of site: ' + T.label + '\n' +
    'Look: ' + LOOKS[S.look].label + ' (' + LOOKS[S.look].desc.toLowerCase() + ')\n' +
    'Opening layout: ' + LAYOUTS[S.layout].label + '\n' +
    'Colour: ' + ACCENTS[S.accent][0] + '\n' +
    'Sections, in order: Opening · ' + (live.join(' · ') || 'none yet') + '\n' +
    'Headline: ' + (S.headline.trim() || T.h) + '\n' +
    ($('fBrief').value.trim() ? 'In my words: ' + $('fBrief').value.trim() + '\n' : '') + '\n' +
    'My build: ' + fitURL() + '\n\n' +
    'My name:\nBest way to reach me:\n';
  return 'mailto:hello@coveworks.studio?subject=' + encodeURIComponent('Configurator · ' + nm()) + '&body=' + encodeURIComponent(body);
}
function status(t){
  var el = $('fStatus');
  el.textContent = t;
  clearTimeout(status._t);
  status._t = setTimeout(function(){ el.textContent = ''; }, 2600);
}
function fadeRender(){
  if (reduce){ render(); return; }
  pvSite.style.transition = 'opacity .16s ease';
  pvSite.style.opacity = '0';
  setTimeout(function(){ render(); pvSite.style.opacity = '1'; }, 160);
}

/* ============ wiring ============ */
function setUnsure(on){ document.querySelector('.stage').classList.toggle('unsure', !!on); }
function runBrief(text){
  var f = readBrief(text), said = [];
  if (!f.type){
    var picks = (f.guesses.length ? f.guesses : ['photography', 'restaurant', 'clinic']);
    $('fBriefRead').innerHTML = '<b>Not sure what kind of site that is.</b> ' + (f.guesses.length ? 'Did you mean' : 'Try one of these, or pick any type below') + ':' +
      '<span class="brief-pick">' + picks.map(function(k){ return '<button type="button" data-pick="' + k + '">' + TYPES[k].label + '</button>'; }).join('') + '</span>';
    setUnsure(true);
    return;
  }
  setUnsure(false);
  applyType(f.type); said.push(TYPES[f.type].label + ' site');
  if (f.look){ S.look = f.look; said.push(LOOKS[f.look].label + ' look'); }
  else said.push(LOOKS[S.look].label + ' look');
  if (f.layout){ S.layout = f.layout; }
  said.push(LAYOUTS[S.layout].label.toLowerCase() + ' opening');
  if (f.accent){ S.accent = f.accent; said.push(ACCENTS[f.accent][0].toLowerCase()); }
  if (f.name){ S.name = f.name.slice(0, 32); S.nameSrc = 'brief'; said.push('named ' + S.name); }
  else if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; }
  S.headline = '';
  syncControls();
  fadeRender();
  pvView.scrollTo({ top: 0, behavior: smooth });
  $('fBriefRead').innerHTML = '<b>Built as</b> ' + esc(said.join(' · ')) + '. Adjust anything below.';
}
$('fBriefRead').addEventListener('click', function(e){
  var b = e.target.closest('[data-pick]');
  if (!b) return;
  var k = b.getAttribute('data-pick');
  if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; }
  applyType(k); S.headline = ''; setUnsure(false);
  syncControls(); fadeRender(); pvView.scrollTo({ top: 0, behavior: smooth });
  $('fBriefRead').innerHTML = '<b>Built as</b> ' + esc(TYPES[k].label + ' site · ' + LOOKS[S.look].label + ' look') + '. Adjust anything below.';
});
$('fBriefForm').addEventListener('submit', function(e){ e.preventDefault(); runBrief($('fBrief').value); });
document.querySelectorAll('.brief-eg button').forEach(function(b){
  b.addEventListener('click', function(){ $('fBrief').value = b.textContent; runBrief(b.textContent); });
});
$('fName').addEventListener('input', function(){ S.name = this.value; S.nameSrc = this.value ? 'user' : ''; render(); });
$('fHead').addEventListener('input', function(){ S.headline = this.value; render(); });
$('fHead').addEventListener('focus', function(){ pvView.scrollTo({ top: 0, behavior: smooth }); });
document.querySelectorAll('input[name=type]').forEach(function(r){
  r.addEventListener('change', function(){ if (S.nameSrc === 'brief'){ S.name = ''; S.nameSrc = ''; } applyType(r.value); S.headline = ''; setUnsure(false); syncControls(); fadeRender(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
document.querySelectorAll('input[name=look]').forEach(function(r){
  r.addEventListener('change', function(){ S.look = r.value; describe(); fadeRender(); });
});
document.querySelectorAll('input[name=layout]').forEach(function(r){
  r.addEventListener('change', function(){ S.layout = r.value; render(); pvView.scrollTo({ top: 0, behavior: smooth }); });
});
document.querySelectorAll('input[name=accent]').forEach(function(r){
  r.addEventListener('change', function(){ S.accent = r.value; describe(); render(); });
});
$('fSecs').addEventListener('change', function(e){
  var k = e.target.getAttribute('data-k');
  if (!k) return;
  S.on[k] = e.target.checked ? 1 : 0;
  e.target.closest('li').classList.toggle('off', !S.on[k]);
  render();
  if (S.on[k]) showSection(k);
});
$('fSecs').addEventListener('click', function(e){
  var b = e.target.closest('button');
  if (!b || b.disabled) return;
  var k = b.getAttribute('data-up') || b.getAttribute('data-dn');
  var dir = b.hasAttribute('data-up') ? 'up' : 'dn';
  var i = S.order.indexOf(k), j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= S.order.length) return;
  S.order[i] = S.order[j]; S.order[j] = k;
  drawSecs(k, dir);
  render();
  if (S.on[k]) showSection(k);
});
document.querySelectorAll('.dev button').forEach(function(b){
  b.addEventListener('click', function(){
    S.device = b.getAttribute('data-dev');
    document.querySelectorAll('.dev button').forEach(function(o){ o.setAttribute('aria-pressed', o === b); });
    render();
    pvView.scrollTop = 0;
  });
});
$('fCopy').addEventListener('click', function(){
  var url = fitURL();
  try { history.replaceState(null, '', url); } catch(e) {}
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){ status('Link copied · it reopens this exact build'); }, function(){ status('Link is in the address bar'); });
  } else status('Link is in the address bar');
});
$('fReset').addEventListener('click', function(){
  var dev = S.device;
  S = fresh(); S.device = dev;
  $('fBrief').value = ''; $('fBriefRead').innerHTML = '';
  try { history.replaceState(null, '', location.pathname); } catch(e) {}
  syncControls(); render();
  pvView.scrollTop = 0;
  status('Reset');
  setUnsure(false);
});
$('fSend').addEventListener('click', function(){ this.setAttribute('href', mailto()); status('Your email app is opening'); });

syncControls();
render();
if (window.ResizeObserver) new ResizeObserver(function(){ fitPreview(); }).observe(pvView);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPreview);
document.addEventListener('loadingdone', fitPreview);
})();
