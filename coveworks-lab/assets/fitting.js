/* Coveworks · Lab · the configurator
   Each site type carries its own structure, copy and photography; each look restyles it.
   Photography: generated for Coveworks with Higgsfield, see assets/gen/CREDITS.txt
   A brief that names no known type still builds: the "custom" type is written around the words it was given. */
(function(){
'use strict';
var pvSite = document.getElementById('pvSite');
if (!pvSite) return;
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var smooth = reduce ? 'auto' : 'smooth';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function img(id, cls, alt){ return '<span class="x-ph' + (cls ? ' ' + cls : '') + '"><img src="assets/gen/' + id + '.webp" alt="' + esc(alt || '') + '" decoding="async"></span>'; }

/* ============ site types ============ */
var TYPES = {
  photography: { label: 'Photography', look: 'gallery', layout: 'full', accent: 'ink', nav: 'centre',
    kw: ['photo', 'photograph', 'portrait', 'camera', 'shoot', 'film', 'portfolio', 'videograph', 'headshot', 'drone', 'wedding photo', 'filmmaker', 'cinematograph'],
    kick: 'Portrait and landscape photography', h: 'Light, held still.', cta: 'Book a shoot',
    sub: '{n} photographs people and places for editorial, commercial and private clients, on film and digital.',
    hero: 'photography-0', imgs: ['photography-1', 'photography-2', 'photography-3', 'photography-4', 'photography-5', 'photography-6', 'photography-7'],
    caps: ['Portrait · Studio', 'Golden hour', 'Lake series', 'Alps · Winter', 'Couples', 'Street', 'Family', 'Fields', 'Fjords'],
    blocks: [['work', 1], ['series', 1], ['about', 1], ['packages', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: 'I am {n}. I make quiet, honest pictures: people as they are, places as they feel. Every commission starts with a conversation and ends with a set of images you will keep for life.',
    series: [['Northern Water', 'Norway', '2026'], ['Small Hours', 'London', '2025'], ['The Long Field', 'Somerset', '2025'], ['Faces of the Market', 'Lisbon', '2024']],
    packages: [['Portrait session', 'One hour, one location, twenty edited images.', '£350'], ['Half day', 'Four hours for brands, events or families.', '£850'], ['Wedding day', 'Ceremony to first dance, with an album.', '£2,400']],
    q: 'Every photograph felt like us on our best day. We have them on every wall.', qc: 'a wedding client',
    faq: [['Do you travel?', 'Yes, across the country and abroad. Travel is quoted at cost.'], ['How soon do we get the images?', 'A preview within a week, the full set within three.']],
    c: 'Booking six weeks ahead · studio in East London.' },

  restaurant: { label: 'Restaurant', look: 'savile', layout: 'full', accent: 'oxblood', nav: 'bar', extra: 'reserve',
    kw: ['restaurant', 'dining', 'bistro', 'kitchen', 'food', 'bar ', 'pub', 'steak', 'sushi', 'pizza', 'chef', 'eatery', 'takeaway', 'burger', 'grill', 'tapas', 'ramen', 'curry', 'indian', 'thai', 'chinese', 'italian', 'trattoria', 'pizzeria', 'brasserie', 'gastropub', 'diner', 'food truck', 'street food', 'kebab', 'noodle', 'taco', 'mexican', 'vegan', 'cocktail', 'wine bar', 'brewery', 'bbq', 'barbecue', 'seafood', 'fish and chips', 'dumpling', 'dim sum', 'korean', 'japanese', 'greek', 'turkish', 'lebanese', 'caribbean'],
    kick: 'Kitchen and dining room', h: 'Seasonal plates, cooked with care.', cta: 'Book a table',
    sub: '{n} is a neighbourhood dining room with a short menu that changes with whatever the market brings in.',
    hero: 'restaurant-0', imgs: ['restaurant-1', 'restaurant-2', 'restaurant-3', 'restaurant-4', 'restaurant-5'],
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
    kw: ['cafe', 'café', 'coffee', 'bakery', 'brunch', ' tea ', 'tea room', 'tearoom', 'patisserie', 'roaster', 'cake', 'bake', 'dessert', 'ice cream', 'gelato', 'juice', 'smoothie', 'donut', 'doughnut', 'bubble tea', ' deli ', 'sandwich', 'crepe', 'waffle', 'cupcake', 'chocolat', 'brownie', 'pastry', 'pastries', 'espresso'],
    kick: 'Coffee, bakes and brunch', h: 'Good coffee, slow mornings.', cta: 'See the menu',
    sub: '{n} roasts its own beans and bakes everything on site, every morning, from seven.',
    hero: 'cafe-0', imgs: ['cafe-1', 'cafe-2', 'cafe-3', 'cafe-4', 'cafe-5'],
    blocks: [['strip', 1], ['menu', 1], ['about', 1], ['hours', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} started with one machine and a counter of cakes. We still weigh every shot, still bake at dawn, and still know most of our regulars by name.',
    menu: [['Coffee', [['Espresso', 'house blend', '2.6'], ['Flat white', 'whole or oat', '3.4'], ['Filter', 'single origin, changes weekly', '3.8']]],
           ['From the oven', [['Cardamom bun', 'baked at six', '3.5'], ['Almond croissant', 'twice baked', '3.9'], ['Sourdough toast', 'cultured butter, jam', '4.5']]]],
    hours: [['Monday to Friday', '07:00 till 16:00'], ['Saturday and Sunday', '08:00 till 17:00']],
    addr: '3 Canal Street · Bristol',
    q: 'The cardamom buns alone are worth the queue. Best flat white in the city.', qc: 'a weekend regular',
    c: 'Takeaway and tables · laptops welcome before noon.' },

  clinic: { label: 'Clinic', look: 'fresh', layout: 'split', accent: 'teal', nav: 'bar',
    kw: ['clinic', 'dental', 'dentist', 'aesthetic', 'skin', 'physio', 'doctor', 'therapy', 'therapist', ' health ', 'healthcare', 'wellness', 'spa', 'massage', 'osteo', 'orthodont', 'chiropract', 'podiat', 'optician', 'optometr', 'pharmacy', 'medical', 'surgery', 'hospital', 'counsell', 'psycholog', 'psychotherap', 'mental health', 'nutrition', 'dietit', 'acupunct', 'hearing', 'botox', 'filler', 'laser', 'cosmetic', 'fertility', 'midwife', 'care home', 'home care', 'carer', 'hypnother', 'reflexolog', 'reiki'],
    kick: 'Clinic and treatments', h: 'Results that look like you, rested.', cta: 'Book a consultation',
    sub: '{n} offers doctor led treatments in a calm private clinic, with honest advice before anything else.',
    hero: 'clinic-0', imgs: ['clinic-1', 'clinic-2', 'clinic-3', 'clinic-4', 'clinic-5'],
    blocks: [['treatments', 1], ['about', 1], ['team', 1], ['steps', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'Every treatment at {n} starts with a conversation. We take the time to understand what you want, explain what is realistic, and never push a treatment you do not need.',
    treatments: [['Skin consultation', '30 min', 'Free'], ['Skin boosters', '45 min', '£180'], ['Anti wrinkle · one area', '30 min', '£150'], ['Chemical peel', '40 min', '£95'], ['Hydrating facial', '60 min', '£85']],
    team: [['Dr Amelia Hart', 'Medical director'], ['Sam Okafor', 'Aesthetic nurse'], ['Lena Ruiz', 'Skin therapist']],
    steps: [['Consult', 'A free assessment and an honest plan.'], ['Treat', 'Performed by qualified practitioners.'], ['Review', 'A follow up at two weeks, always included.']],
    q: 'I left feeling listened to, and the results are so natural that nobody can tell. Exactly what I wanted.', qc: 'a returning client',
    faq: [['Is there any downtime?', 'Most treatments let you return to your day straight away.'], ['Who carries out the treatments?', 'Qualified medical practitioners, every time.']],
    c: 'Appointments Monday to Saturday · consultation first.' },

  property: { label: 'Property', look: 'clean', layout: 'full', accent: 'navy', nav: 'bar', extra: 'search',
    kw: ['property', 'estate agent', 'real estate', 'homes', 'lettings', 'developer', 'development', 'architect', 'interior', 'house', 'apartment', 'rental', 'estate', 'letting', 'landlord', 'mortgage', 'surveyor', 'construction', 'renovation', 'refurb', 'extension', 'loft conversion', 'flats', 'condo', 'housing', 'property management', 'realtor', 'new build'],
    kick: 'Property and development', h: 'Homes worth living in.', cta: 'Arrange a viewing',
    sub: '{n} finds, restores and sells homes across the city, from the first viewing to the day you get the keys.',
    hero: 'property-0', imgs: ['property-1', 'property-2', 'property-3', 'property-4', 'property-5'],
    blocks: [['listings', 1], ['about', 1], ['stats', 1], ['steps', 0], ['testimonial', 1], ['contact', 1]],
    about: '{n} takes on the properties others walk past. We plan every project in detail, manage the build ourselves and finish each home as if we were moving in.',
    listings: [['property-1', '£595,000', 'Garden flat', 'Islington · 2 bed · 820 sq ft'], ['property-2', '£825,000', 'Victorian terrace', 'Walthamstow · 3 bed · 1,240 sq ft'], ['property-3', '£2,150 pcm', 'Lateral apartment', 'Hackney · 2 bed · 900 sq ft']],
    stats: [['240', 'Homes sold'], ['18', 'Years in the city'], ['4.9', 'Average review'], ['21 days', 'Average time to offer']],
    steps: [['Value', 'An honest valuation within 48 hours.'], ['Market', 'Photography, floorplans and viewings handled.'], ['Complete', 'We chase every party until the keys change hands.']],
    q: 'They turned a tired terrace into the home we had been searching for. The finish is outstanding.', qc: 'a homeowner',
    c: 'Viewings by appointment · seven days a week.' },

  motors: { label: 'Car hire', look: 'noir', layout: 'full', accent: 'chalk', nav: 'bar',
    kw: ['car', 'cars', 'motor', 'car hire', 'van hire', 'rental car', 'chauffeur', 'garage', 'dealership', 'vehicle', 'auto', 'taxi', 'cab', 'minicab', 'limo', 'limousine', 'car wash', 'valet', 'detailing', 'tyre', ' mot ', 'bodyshop', 'body shop', 'car sales', 'used car', 'motorbike', 'motorcycle', 'scooter', 'supercar', 'classic car', 'driving instructor'],
    kick: 'Car hire and motors', h: 'The keys to a better drive.', cta: 'Reserve a car',
    sub: '{n} keeps a private collection of cars, prepared to a standard and handed over wherever you need them.',
    hero: 'motors-0', imgs: ['motors-1', 'motors-2', 'motors-3', 'motors-4', 'motors-5'],
    blocks: [['fleet', 1], ['steps', 1], ['about', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'Every car at {n} is chosen, cleaned and checked by us before it leaves. No call centres and no surprises at the counter, just the car you booked, ready on time.',
    fleet: [['motors-1', 'Grand tourer', 'Automatic · 4 seats · 380 hp', '£320'], ['motors-2', 'Weekend cruiser', 'Manual · 2 seats · 260 hp', '£240'], ['motors-3', 'Classic saloon', 'Automatic · 5 seats · 1964', '£410']],
    steps: [['Choose', 'Pick a car and your dates.'], ['Delivered', 'We bring it to your door, fuelled and cleaned.'], ['Drive', 'Fully insured, with mileage to spare.']],
    q: 'Delivered to my door, spotless and full of fuel. The easiest hire I have ever booked.', qc: 'a weekend client',
    faq: [['What do I need to hire?', 'A full licence held for three years and a valid card in your name.'], ['Is insurance included?', 'Yes, fully comprehensive cover comes with every hire.']],
    c: 'Bookings seven days a week · by phone or WhatsApp.' },

  trades: { label: 'Trades', look: 'boardroom', layout: 'split', accent: 'blue', nav: 'bar', extra: 'quote',
    kw: ['plumber', 'electrician', 'builder', 'roofer', 'mechanic', 'carpenter', 'joiner', 'decorator', 'trades', 'handyman', 'repair', 'cleaning', 'cleaner', 'landscap', 'gardener', 'locksmith', 'plumbing', 'heating', 'boiler', 'gas engineer', 'electrical', 'roofing', 'scaffold', 'plaster', 'painter', 'tiler', 'tiling', 'flooring', 'fencing', 'paving', 'driveway', 'window clean', 'pest control', 'removal', 'man and van', 'skip hire', 'odd jobs', 'gutter', 'damp', 'glazier', 'glazing', 'air con', 'aircon', 'hvac', 'solar', 'welder', 'welding', 'tree surgeon', 'courier', 'carpet', 'upholster', 'appliance', 'kitchen fitter', 'bathroom fitter', 'fitter', 'maintenance', 'drain', 'cctv', 'lawn'],
    kick: 'Trades and repair', h: 'Fixed properly, the first time.', cta: 'Get a quote',
    sub: '{n} comes to you, explains the problem in plain words and fixes it at an agreed price.',
    hero: 'trades-0', imgs: ['trades-1', 'trades-2', 'trades-3', 'trades-4', 'trades-5'],
    blocks: [['services', 1], ['steps', 1], ['areas', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'At {n} we treat every job as if it were our own. You get a clear quote before we start, tidy work, and a call back if anything is not right.',
    services: [['Repairs', 'Most jobs completed on the same visit.', 'from £60'], ['Installations', 'Fitted, tested and certified.', 'quoted'], ['Servicing', 'Regular care that saves money later.', 'from £120']],
    steps: [['Call or message', 'Tell us what is wrong, send a photo if you can.'], ['Fixed price', 'A written quote before any work begins.'], ['Guaranteed', 'Every job carries a twelve month guarantee.']],
    areas: ['Romford', 'Ilford', 'Barking', 'Hornchurch', 'Brentwood', 'Dagenham', 'Upminster', 'Stratford'],
    q: 'Turned up when they said, fixed it within the hour and charged exactly what they quoted.', qc: 'a local customer',
    faq: [['Do you charge for quotes?', 'No. Quotes are always free.'], ['Are you insured?', 'Yes, fully insured, and every job is guaranteed.']],
    c: 'Monday to Saturday · same day call outs.' },

  boutique: { label: 'Shop', look: 'mono', layout: 'split', accent: 'ink', nav: 'centre',
    kw: ['shop', 'store', 'boutique', 'fashion', 'clothing', 'brand', 'ecommerce', 'jewellery', 'jewelry', 'streetwear', 'products', 'apparel', 'candle', 'homeware', 'clothes', 'merch', 'handmade', 'craft', 'gift', 'florist', 'flower', 'bookshop', 'bookstore', 'record shop', 'vinyl', 'furniture', 'ceramic', 'pottery', 'prints', 'sneaker', 'perfume', 'fragrance', 'watches', 'handbag', 'accessories', 'etsy', 'online shop', 'tshirt', 't shirt', 'hoodie', 'vintage', 'thrift', 'toys', 'tailor', 'alterations', 'stationery', 'plants', 'soap', 'skincare', 'cosmetics', 'bridal', 'lingerie', 'swimwear', 'shoes', 'eyewear', 'sell online', 'selling'],
    kick: 'New season · small batch', h: 'Made in small runs, built to last.', cta: 'Shop the collection',
    sub: '{n} makes a short collection each season, cut from good cloth and finished by hand.',
    hero: 'boutique-0', imgs: ['boutique-1', 'boutique-2', 'boutique-3', 'boutique-4', 'boutique-5'],
    blocks: [['products', 1], ['strip', 1], ['about', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} began with one idea: make fewer things, and make them properly. Every piece is designed in house and produced in small numbers, so nothing is wasted.',
    products: [['boutique-1', 'Oxford shirt', '£85'], ['boutique-2', 'Wool scarf', '£60'], ['boutique-3', 'Leather court', '£140'], ['boutique-4', 'Everyday kit', '£45']],
    q: 'The quality is unreal for the price. I have bought three more pieces since my first order.', qc: 'a customer',
    faq: [['Do you ship worldwide?', 'Yes, to most countries, with tracked delivery.'], ['Can I return an item?', 'Within thirty days, unworn, for a full refund.']],
    c: 'Free delivery over £100 · returns within thirty days.' },

  professional: { label: 'Professional', look: 'ledger', layout: 'split', accent: 'navy', nav: 'bar',
    kw: ['accountant', 'accounting', 'law', 'lawyer', 'solicitor', 'legal', 'finance', 'financial', 'consult', 'advisor', 'adviser', 'insurance', 'bookkeep', 'tax', 'firm', 'recruit', 'accountancy', 'audit', 'payroll', 'broker', 'wealth', 'investment', 'will writing', 'notary', 'barrister', 'immigration', ' hr ', 'coach', 'life coach', 'business coach', 'translator', 'translation', 'it support', 'cyber', 'virtual assistant', 'mediation', 'probate', 'pension', 'compliance'],
    kick: 'Professional services', h: 'Your books in order, your deadlines met.', cta: 'Book a call',
    sub: '{n} looks after the accounts, tax and payroll of growing businesses, at fixed fees agreed in writing.',
    hero: 'professional-0', imgs: ['professional-1', 'professional-2', 'professional-3', 'professional-4', 'professional-5'],
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
    kw: ['saas', 'software', 'app', 'startup', 'platform', 'tool', 'dashboard', 'ai ', ' ai', 'tech', 'product launch', 'api', 'fintech', 'web app', 'mobile app', 'ios', 'android', 'crypto', 'blockchain', 'web3', 'machine learning', 'analytics', 'crm', 'devtool', 'developer tool', 'plugin', 'chatbot', 'automation', 'b2b', 'subscription', 'marketplace', 'cloud', 'productivity', 'no code', 'open source', 'browser extension', 'launch page', 'waitlist', 'beta'],
    kick: 'Now in public beta', h: 'Ship the work, not the busywork.', cta: 'Start free',
    sub: '{n} turns scattered tasks, docs and approvals into one calm workspace your whole team will actually use.',
    hero: 'saas-0', imgs: ['saas-1', 'saas-2', 'saas-3', 'saas-4', 'saas-5'],
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
    kw: ['agency', 'studio', 'design', 'creative', 'branding', 'marketing', 'architecture practice', 'freelance', 'designer', 'web developer', 'digital', 'graphic design', 'web design', 'ux', 'illustrat', 'animator', 'animation', 'motion design', 'video production', 'copywrit', ' pr ', 'seo', 'social media', 'design studio', 'product design', 'brand identity', 'advertising', 'production company', 'film production', 'case studies'],
    kick: 'Brand and digital studio', h: 'Brands with a point of view.', cta: 'Start a project',
    sub: '{n} is an independent studio making identities, websites and campaigns for companies that want to be remembered.',
    heads: { series: ['Case studies', 'Selected projects.'] },
    hero: 'agency-0', imgs: ['agency-1', 'agency-2', 'agency-3', 'agency-4', 'agency-5'],
    blocks: [['series', 1], ['services', 1], ['logos', 1], ['stats', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} is twelve people in one room. We work with a handful of clients a year, so each gets our full attention.',
    series: [['Field Notes', 'Identity · Packaging', '2026'], ['Harbour Line', 'Website · Motion', '2026'], ['Common Ground', 'Campaign', '2025'], ['Atlas Coffee', 'Brand system', '2025']],
    services: [['Identity', 'Names, marks, type and voice.', 'from £12k'], ['Digital', 'Websites and products that perform.', 'from £18k'], ['Campaigns', 'Ideas that travel across every channel.', 'quoted']],
    logos: ['Field Notes', 'Harbour', 'Atlas', 'Common', 'Verso'],
    stats: [['64', 'Brands launched'], ['11', 'Awards'], ['12', 'People'], ['1', 'Room']],
    q: 'They found the idea we had been circling for years, and made it look inevitable.', qc: 'a founder',
    c: 'Taking two new projects this season.' },

  fitness: { label: 'Fitness', look: 'brutal', layout: 'split', accent: 'blue', nav: 'bar',
    kw: ['gym', 'fitness', 'yoga', 'pilates', 'personal trainer', 'personal training', 'trainer', 'crossfit', 'boxing', 'running', 'swim', 'sport', 'martial', 'dance', 'cycling', 'bootcamp', 'hiit', 'spin', 'climbing', 'bouldering', 'tennis', 'golf', 'football', 'rugby', 'cricket', 'basketball', 'netball', 'padel', 'squash', 'athletics', 'marathon', 'triathlon', 'karate', 'judo', 'jiu jitsu', 'bjj', 'mma', 'kickbox', 'muay thai', 'taekwondo', 'surfing', ' surf ', ' ski ', 'skiing', 'horse riding', 'equestrian', 'stables', 'bodybuild', 'sports club', 'strength', 'run club'],
    kick: 'Strength, conditioning, community', h: 'Stronger every week.', cta: 'Book a free class',
    sub: '{n} runs small group classes and personal training for every level, coached by people who know your name.',
    hero: 'fitness-0', imgs: ['fitness-1', 'fitness-2', 'fitness-3', 'fitness-4', 'fitness-5'],
    blocks: [['timetable', 1], ['pricing', 1], ['strip', 1], ['team', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} is not a mirror and machine gym. Every session is coached, every plan is written for you, and every member is part of the crew.',
    timetable: [['06:30', ['Strength', 'Conditioning', 'Strength', 'Conditioning', 'Strength']], ['12:15', ['Mobility', 'Swim', 'Mobility', 'Swim', 'Mobility']], ['18:30', ['Conditioning', 'Strength', 'Boxing', 'Strength', 'Open gym']]],
    pricing: [['Drop in', '£15', 'a class', ['Any class', 'Towel included'], 0], ['Unlimited', '£89', 'a month', ['Every class', 'Open gym', 'Monthly check in'], 1], ['Personal', '£220', 'a month', ['Four PT sessions', 'Written programme', 'Unlimited classes'], 0]],
    team: [['Jordan Blake', 'Head coach'], ['Maya Chen', 'Strength coach'], ['Ollie Reed', 'Swim coach']],
    q: 'Six months in and I am lifting more than I ever thought I could. The coaches are brilliant.', qc: 'a member',
    faq: [['I am a beginner. Is that ok?', 'Most of our members started from scratch. Every class scales to you.'], ['Is the first class free?', 'Always. Come and try one on us.']],
    c: 'Open 06:00 till 21:00 · first class free.' },

  events: { label: 'Events', look: 'glass', layout: 'centred', accent: 'violet', nav: 'centre',
    kw: ['wedding', 'event', 'venue', 'party', 'festival', 'conference', 'planner', 'catering', 'celebration', 'ceremony', 'birthday', 'marquee', 'banqueting', 'function room', 'exhibition', 'gala', ' prom ', 'christening', 'hen party', 'stag do', 'balloon', 'decor', 'photo booth', 'wedding planner', 'venue hire', 'awards'],
    kick: 'Weddings, parties and gatherings', h: 'Days worth remembering.', cta: 'Check a date',
    sub: '{n} plans and hosts weddings and celebrations, from the first idea to the last dance.',
    hero: 'events-0', imgs: ['events-1', 'events-2', 'events-3', 'events-4', 'events-5'],
    blocks: [['dates', 1], ['packages', 1], ['gallery', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} has hosted more than four hundred celebrations. We take care of every detail so you can be a guest at your own event.',
    dates: [['14 Jun', 'Summer garden open day', 'Tour the grounds and meet the team'], ['02 Aug', 'Wedding showcase', 'Suppliers, tastings and live music'], ['21 Sep', 'Autumn supper club', 'Long tables under the lights']],
    packages: [['Intimate', 'Up to forty guests, ceremony and supper.', 'from £4,500'], ['Classic', 'Up to one hundred and twenty, all day.', 'from £11,000'], ['Grand', 'Two days, exclusive use of the venue.', 'from £24,000']],
    q: 'Every detail was taken care of. All we had to do was turn up and enjoy it.', qc: 'a couple married here',
    faq: [['How far ahead should we book?', 'Most couples book twelve to eighteen months ahead.'], ['Can we bring our own suppliers?', 'Yes, alongside our trusted list.']],
    c: 'Viewings most weekends · dates for next year now open.' },
  gaming: { label: 'Gaming', look: 'aurora', layout: 'full', accent: 'violet', nav: 'bar',
    kw: ['game', 'gaming', 'gamer', 'esport', 'esports', 'e sports', 'stream', 'twitch', 'clan', 'guild', 'minecraft', 'fortnite', 'roblox', 'valorant', 'league of legends', 'call of duty', 'fifa', 'console', 'playstation', 'xbox', 'nintendo', 'speedrun', 'tournament', 'discord', 'arcade', 'board game', 'tabletop', 'dungeons', 'warhammer'],
    kick: 'Streams, tournaments, community', h: 'Press start.', cta: 'Join the squad',
    sub: '{n} streams, competes and builds a community around the games we love, live most nights of the week.',
    hero: 'gaming-0', imgs: ['gaming-1', 'gaming-2', 'gaming-3', 'gaming-4', 'gaming-5'],
    heads: { dates: ['Schedule', 'Live this week.'], team: ['The roster', 'Meet the squad.'], gallery: ['Clips', 'Highlights.'] },
    blocks: [['dates', 1], ['stats', 1], ['gallery', 1], ['team', 1], ['about', 0], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} started as a few friends streaming after work. Now it is a team, a schedule and a community that grows every season.',
    dates: [['07 Nov', 'Ranked night', 'Live from 20:00 · everyone welcome'], ['14 Nov', 'Community cup', 'Sixteen teams · prizes for the top three'], ['21 Nov', 'Retro marathon', 'Twelve hours of classics for charity']],
    stats: [['48k', 'Followers'], ['1.2M', 'Views this year'], ['16', 'Tournaments won'], ['24/7', 'Community chat open']],
    team: [['Nova', 'Captain · support'], ['Rook', 'Entry'], ['Juno', 'Coach and analyst']],
    q: 'The friendliest community I have found online. The Friday streams are the highlight of my week.', qc: 'a community member',
    faq: [['How do I join?', 'Hop into the community chat and say hello. Everyone is welcome.'], ['Are you recruiting players?', 'Trials open every season. Keep an eye on the schedule.']],
    c: 'Live most nights from 20:00 · sponsorship enquiries by email.' },

  music: { label: 'Music', look: 'noir', layout: 'full', accent: 'chalk', nav: 'centre',
    kw: ['music', 'musician', 'band', 'dj', 'singer', 'songwriter', 'rapper', 'artist', 'producer', 'record label', 'album', 'gig', 'gigs', ' tour ', 'touring', 'concert', 'orchestra', 'choir', 'composer', 'guitarist', 'drummer', 'pianist', 'violinist', 'recording studio', 'mixing', 'mastering', 'hip hop', 'jazz', ' rock ', ' techno ', 'nightclub', 'karaoke', ' opera '],
    kick: 'New record out now', h: 'Turn it up.', cta: 'Get tickets',
    sub: '{n} makes loud, honest music and plays it live wherever there is a stage and a crowd.',
    hero: 'music-0', imgs: ['music-1', 'music-2', 'music-3', 'music-4', 'music-5'],
    heads: { dates: ['On tour', 'Live dates.'], series: ['Releases', 'Listen now.'], gallery: ['Photos', 'Live and loud.'] },
    blocks: [['dates', 1], ['series', 1], ['gallery', 1], ['about', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} started in a rehearsal room above a pub and never really left. Four records in, the songs still get written the same way: loud, late and together.',
    dates: [['14 Mar', 'London', 'Doors 19:00 · few tickets left'], ['22 Mar', 'Manchester', 'Doors 19:30 · on sale now'], ['05 Apr', 'Glasgow', 'Doors 19:00 · on sale now']],
    series: [['Night Swimming', 'Album', '2026'], ['Static', 'Single', '2025'], ['Live in Glasgow', 'Live album', '2025'], ['First Light', 'EP', '2024']],
    q: 'A band that sounds even bigger live than on record. Catch them in a small room while you still can.', qc: 'a music writer',
    c: 'Bookings and press by email · management on request.' },

  salon: { label: 'Salon', look: 'savile', layout: 'split', accent: 'ink', nav: 'centre',
    kw: ['salon', 'hair', 'hairdresser', 'hairdressing', 'barber', 'barbers', 'barbershop', 'nail', 'manicure', 'pedicure', 'lash', 'eyebrow', ' brows ', 'beauty', 'beautician', 'makeup', 'make up', 'waxing', 'tanning', 'tattoo', 'tattoo studio', 'piercing', 'blow dry', 'braids'],
    kick: 'Hair, colour and care', h: 'Leave looking like yourself, only better.', cta: 'Book online',
    sub: '{n} is a friendly salon for cuts, colour and styling, with stylists who listen before they pick up the scissors.',
    hero: 'salon-0', imgs: ['salon-1', 'salon-2', 'salon-3', 'salon-4', 'salon-5'],
    heads: { treatments: ['Services', 'Services and prices.'] },
    blocks: [['treatments', 1], ['team', 1], ['strip', 1], ['hours', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} is a small, relaxed salon where nobody is rushed. Every appointment starts with a proper chat, so you leave with the hair you asked for.',
    treatments: [['Cut and finish', '45 min', '£55'], ['Full colour', '90 min', '£95'], ['Balayage', '150 min', '£160'], ['Blow dry', '30 min', '£30'], ['Beard trim', '20 min', '£18']],
    team: [['Rosa Bell', 'Owner · colour'], ['Kai Moreno', 'Senior stylist'], ['Ivy Grant', 'Stylist · curls']],
    hours: [['Tuesday to Friday', '09:00 till 20:00'], ['Saturday', '09:00 till 17:00'], ['Sunday and Monday', 'Closed']],
    addr: '22 High Street · Leeds',
    q: 'Best colour I have ever had, and they actually listened to what I wanted. Booked in again already.', qc: 'a regular client',
    faq: [['Do you do patch tests?', 'Yes, at least 48 hours before any colour appointment.'], ['Can I book online?', 'Any time, day or night, in under a minute.']],
    c: 'Open six days · late nights Thursday and Friday.' },

  education: { label: 'Education', look: 'fresh', layout: 'split', accent: 'blue', nav: 'bar',
    kw: ['tutor', 'tutoring', 'tuition', 'teacher', 'teaching', 'school', 'academy', 'college', 'university', 'course', 'lesson', 'learn', 'learning', 'education', 'training', 'language', 'maths', 'math', 'science', 'exam', 'gcse', 'a level', 'coding', 'online course', 'workshop', 'music lessons', 'piano lessons', 'driving lessons', 'student'],
    kick: 'Tuition and courses', h: 'Learning that sticks.', cta: 'Book a free lesson',
    sub: '{n} offers patient, expert teaching for every level, one to one or in small groups, in person or online.',
    hero: 'education-0', imgs: ['education-1', 'education-2', 'education-3', 'education-4', 'education-5'],
    heads: { services: ['Subjects', 'What we teach.'], team: ['Tutors', 'The people who teach.'] },
    blocks: [['services', 1], ['steps', 1], ['pricing', 1], ['team', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'At {n} we believe anyone can learn anything with the right teacher and a little patience. Our tutors are qualified, checked and love their subjects.',
    services: [['Maths', 'From times tables to A level.', 'from £35'], ['English', 'Reading, writing and exam technique.', 'from £35'], ['Sciences', 'Biology, chemistry and physics.', 'from £40']],
    steps: [['Free lesson', 'A first session to find the right level.'], ['A plan', 'Clear goals and a simple weekly routine.'], ['Progress', 'A short report every half term.']],
    pricing: [['Single lesson', '£40', 'an hour', ['One to one', 'Online or in person'], 0], ['Termly', '£360', 'ten lessons', ['Weekly lessons', 'Progress reports', 'Homework support'], 1], ['Small group', '£20', 'per pupil', ['Up to four pupils', 'Exam focused'], 0]],
    team: [['Hannah Cole', 'Director · maths'], ['Raj Mehta', 'English lead'], ['Chloe Price', 'Science tutor']],
    q: 'Our daughter went from dreading maths to asking for extra practice. Her grades jumped two levels.', qc: 'a parent',
    faq: [['Do you teach online?', 'Yes, every subject is available online or in person.'], ['Are tutors checked?', 'Every tutor is qualified and DBS checked.']],
    c: 'Lessons after school and at weekends · first lesson free.' },

  charity: { label: 'Charity', look: 'linen', layout: 'full', accent: 'forest', nav: 'bar',
    kw: ['charity', 'charitable', 'nonprofit', 'non profit', 'ngo', 'foundation', 'fundrais', 'donate', 'donation', 'volunteer', ' appeal ', 'food bank', 'foodbank', 'shelter', 'social enterprise', 'relief', 'humanitarian', 'conservation', 'climate', 'wildlife', 'homeless', 'environment'],
    kick: 'Registered charity', h: 'Small acts, real change.', cta: 'Donate',
    sub: '{n} works alongside local people to make lasting change, and every pound you give goes where it is needed most.',
    hero: 'charity-0', imgs: ['charity-1', 'charity-2', 'charity-3', 'charity-4', 'charity-5'],
    heads: { steps: ['Your gift', 'Where your money goes.'], gallery: ['Our work', 'On the ground.'] },
    blocks: [['stats', 1], ['steps', 1], ['gallery', 1], ['about', 1], ['testimonial', 1], ['faq', 0], ['contact', 1]],
    about: '{n} began around a kitchen table with a handful of neighbours. Today it is a team of volunteers who turn up, week after week, because they care.',
    stats: [['12,400', 'Meals served this year'], ['380', 'Volunteers'], ['92p', 'Of every pound spent on our work'], ['14', 'Years of service']],
    steps: [['£10', 'Feeds a family for a week.'], ['£25', 'Buys school supplies for one child.'], ['£100', 'Funds a month of after school clubs.']],
    q: 'The volunteers here changed our year. We had somewhere to turn when we needed it most.', qc: 'a family the charity supports',
    faq: [['Can I give monthly?', 'Yes. Regular gifts help us plan ahead.'], ['Can I add Gift Aid?', 'Yes, and we can claim 25p more for every pound you give.']],
    c: 'Registered charity · volunteers always welcome.' },

  blog: { label: 'Creator', look: 'ledger', layout: 'centred', accent: 'oxblood', nav: 'centre',
    kw: ['blog', 'blogger', 'writer', 'writing', 'author', ' book ', 'books', 'novel', 'journalist', 'newsletter', 'substack', 'podcast', 'creator', 'content creator', 'influencer', 'youtube', 'youtuber', 'tiktok', 'instagram', 'vlog', 'personal site', 'personal website', 'personal page', 'resume', ' cv ', 'about me', 'poet', 'poetry', 'essay', 'magazine', 'journal', 'recipes', 'food blog', 'travel blog'],
    kick: 'Essays, notes and a weekly letter', h: 'Ideas worth your Sunday morning.', cta: 'Subscribe',
    sub: '{n} writes about work, culture and the small things that make life better, with a new letter every Sunday.',
    hero: 'blog-0', imgs: ['blog-1', 'blog-2', 'blog-3', 'blog-4', 'blog-5'],
    heads: { series: ['Latest', 'Recent writing.'], logos: 'As featured in' },
    blocks: [['series', 1], ['about', 1], ['logos', 1], ['testimonial', 1], ['contact', 1]],
    about: 'I am {n}. I write to make sense of things, and I share it here every week. No noise, no algorithm, just good writing for curious people.',
    series: [['The case for slow work', 'Essay', '12 min'], ['A year mostly offline', 'Notes', '8 min'], ['Small rooms, big ideas', 'Interview', '15 min'], ['Reading list · autumn', 'List', '5 min']],
    logos: ['The Weekly', 'Northern Review', 'Field Journal', 'Daily Letter', 'Common Room'],
    q: 'The only newsletter I open the moment it lands. Thoughtful, funny and always worth the read.', qc: 'a reader',
    c: 'New letters every Sunday · free to read.' },

  community: { label: 'Community', look: 'clean', layout: 'split', accent: 'forest', nav: 'bar',
    kw: ['church', 'mosque', 'temple', 'synagogue', 'gurdwara', 'faith', 'parish', 'chapel', 'ministry', 'community', 'community centre', 'club', 'society', 'association', 'members', 'scouts', 'allotment', 'residents', 'village hall', 'youth club', 'book club', 'supper club'],
    kick: 'A place for everyone', h: 'Everyone is welcome here.', cta: 'Come along',
    sub: '{n} brings neighbours together through weekly gatherings, clubs and events that are open to all.',
    hero: 'community-0', imgs: ['community-1', 'community-2', 'community-3', 'community-4', 'community-5'],
    heads: { dates: ['What’s on', 'Coming up this month.'], hours: ['Visit', 'Every week.'] },
    blocks: [['dates', 1], ['hours', 1], ['about', 1], ['gallery', 1], ['testimonial', 1], ['contact', 1]],
    about: '{n} has been at the heart of the neighbourhood for more than fifty years. Whoever you are and whatever brings you here, there is a seat for you.',
    dates: [['09 Nov', 'Sunday gathering', 'All ages · tea and cake after'], ['15 Nov', 'Winter fair', 'Stalls, food and live music'], ['23 Nov', 'Volunteers evening', 'Meet the team and lend a hand']],
    hours: [['Sunday', 'Gathering · 10:30'], ['Wednesday', 'Coffee morning · 10:00'], ['Friday', 'Youth club · 18:00']],
    addr: 'The Old Hall · Norwich',
    q: 'We moved here knowing nobody. Within a month this place felt like family.', qc: 'a member',
    c: 'Doors open every day · everyone welcome.' },

  childcare: { label: 'Childcare', look: 'fresh', layout: 'split', accent: 'ochre', nav: 'bar',
    kw: ['nursery', 'preschool', 'pre school', 'childcare', 'child care', 'childminder', 'creche', 'daycare', 'day care', 'kindergarten', 'montessori', 'playgroup', 'toddler', 'baby', 'babies', 'kids', 'children', 'after school', 'holiday club', 'soft play', 'nanny', 'babysit'],
    kick: 'Nursery and preschool', h: 'Little days, full of wonder.', cta: 'Book a visit',
    sub: '{n} is a warm, home from home nursery for children aged three months to five years, open all year round.',
    hero: 'childcare-0', imgs: ['childcare-1', 'childcare-2', 'childcare-3', 'childcare-4', 'childcare-5'],
    heads: { steps: ['Joining', 'Starting is simple.'], team: ['Our team', 'The people who care for your child.'] },
    blocks: [['steps', 1], ['gallery', 1], ['hours', 1], ['team', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'At {n} children learn through play, outdoors as much as in. Our rooms are calm and bright, and our team has looked after local families for years.',
    steps: [['Visit', 'Come and see us, and meet the team.'], ['Settle in', 'Short, gentle sessions to start.'], ['Grow', 'Daily updates and termly reports.']],
    hours: [['Monday to Friday', '07:30 till 18:30'], ['Holidays', 'Open fifty one weeks a year']],
    addr: '5 Orchard Road · Cambridge',
    team: [['Laura Finch', 'Nursery manager'], ['Ben Adeyemi', 'Early years teacher'], ['Mia Novak', 'Room leader · babies']],
    q: 'Our son runs in every morning. The team are kind, patient and tell us everything about his day.', qc: 'a parent',
    faq: [['Do you accept funded hours?', 'Yes, we accept all government funded hours.'], ['What about meals?', 'Fresh, healthy meals cooked on site every day.']],
    c: 'Visits by appointment · funded places available.' },

  travel: { label: 'Travel', look: 'gallery', layout: 'full', accent: 'teal', nav: 'centre', extra: 'stay',
    kw: ['hotel', 'b&b', 'bnb', 'bed and breakfast', 'guesthouse', 'guest house', 'inn', 'hostel', 'airbnb', 'holiday let', 'holiday', 'cottage', 'cabin', 'glamping', 'campsite', 'camping', 'resort', 'retreat', 'lodge', ' villa ', 'travel', ' tours ', 'tour operator', 'tourism', 'tourist', 'safari', 'cruise', 'boutique hotel', 'staycation', 'accommodation'],
    kick: 'Rooms, suites and slow weekends', h: 'Stay a little longer.', cta: 'Check availability',
    sub: '{n} is a small hotel with twelve rooms, a good kitchen and nowhere you have to be.',
    hero: 'travel-0', imgs: ['travel-1', 'travel-2', 'travel-3', 'travel-4', 'travel-5'],
    heads: { listings: ['Rooms', 'Choose your room.', 'All rooms'] },
    blocks: [['listings', 1], ['gallery', 1], ['about', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} was a tired coaching inn until we gave it a second life. Now it is the place we always wished we could find: quiet, generous and properly comfortable.',
    listings: [['travel-1', 'from £145', 'Garden room', 'King bed · garden view · sleeps 2'], ['travel-2', 'from £210', 'The loft suite', 'Roll top bath · sleeps 2'], ['travel-3', 'from £260', 'Family room', 'Two rooms · sleeps 4']],
    q: 'The most restful weekend we have had in years. Breakfast alone is worth the trip.', qc: 'a guest',
    faq: [['What time is check in?', 'From three in the afternoon. Check out is by eleven.'], ['Are dogs welcome?', 'Yes, in our garden rooms, with a bed and a treat waiting.']],
    c: 'Book direct for the best rate · free cancellation up to 48 hours before.' },

  pets: { label: 'Pets', look: 'clean', layout: 'split', accent: 'ochre', nav: 'bar',
    kw: ['pet', 'pets', 'dog', 'cat', 'puppy', 'kitten', 'vet', 'veterinary', 'groomer', 'grooming', 'dog walker', 'dog walking', 'dog training', 'kennel', 'cattery', 'pet sitter', 'pet sitting', 'animal', 'animal rescue', 'pet shop'],
    kick: 'Grooming, walks and care', h: 'Happy dogs, happy owners.', cta: 'Book a groom',
    sub: '{n} grooms, walks and cares for dogs as if they were our own, with gentle handling and plenty of treats.',
    hero: 'pets-0', imgs: ['pets-1', 'pets-2', 'pets-3', 'pets-4', 'pets-5'],
    blocks: [['services', 1], ['steps', 1], ['strip', 1], ['team', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: '{n} started with one van and a lot of love for dogs. We keep groups small and visits calm, so every dog gets the attention it deserves.',
    services: [['Full groom', 'Bath, dry, cut and nails.', 'from £45'], ['Daily walks', 'An hour out in small groups.', '£15 a walk'], ['Day care', 'Play, rest and cuddles, all day.', '£30 a day']],
    steps: [['Meet', 'A free meet and greet for your dog.'], ['Book', 'Choose a slot online in seconds.'], ['Relax', 'Photos sent during every visit.']],
    team: [['Ellie Shaw', 'Founder · groomer'], ['Marcus Hill', 'Walker'], ['Tia Brooks', 'Day care lead']],
    q: 'Our nervous rescue dog actually loves going. She comes back fluffy, calm and very pleased with herself.', qc: 'a dog owner',
    faq: [['Are you insured?', 'Yes, fully insured and first aid trained.'], ['Do you take puppies?', 'From twelve weeks, with gentle first visits.']],
    c: 'Open Monday to Saturday · collection available.' },

  custom: { label: 'Something else', look: 'clean', layout: 'split', accent: 'graphite', nav: 'bar', kw: [],
    kick: '{T}', h: '{T}, done properly.', cta: 'Get in touch',
    sub: '{n} is all about {t}: clear information, honest prices and an easy way to get in touch.',
    hero: 'custom-0', imgs: ['custom-1', 'custom-2', 'custom-3', 'custom-4', 'custom-5'],
    blocks: [['about', 1], ['services', 1], ['steps', 1], ['gallery', 1], ['testimonial', 1], ['faq', 1], ['contact', 1]],
    about: 'Everything at {n} comes back to {t}. We keep it simple, do it properly and answer every message ourselves.',
    services: [['First steps', 'Everything a newcomer needs to know, in plain words.', 'Free'], ['The full service', 'Our most popular option, from start to finish.', 'Most popular'], ['Something bespoke', 'Tell us what you have in mind and we will shape it around you.', 'On request']],
    steps: [['Say hello', 'Tell us what you are looking for.'], ['Plan it', 'We agree the details and a fair price.'], ['Enjoy it', 'We take care of the rest.']],
    q: 'Friendly, knowledgeable and clearly passionate about {t}. Could not recommend them more.', qc: 'a happy customer',
    faq: [['How do I get started?', 'Send us a message and we will reply within a day.'], ['Do you work with beginners?', 'Always. Everyone starts somewhere.']],
    c: 'Messages answered within a day.' }

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
    else if (loose && w.length > kw.length && lev(w.slice(0, kw.length), kw) <= tol) best = Math.max(best, kw.length - 2);
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
/* words that say nothing about the subject, so a brief like "a site for my pottery classes" leaves "pottery classes" */
var FILLER = ('a an the my our your their his her its i im we me us you for of about to with and or in on at by from that this these those it is are be ' +
  'been was were site sites website websites web webpage page pages landing home homepage one some need needs want wants would like love make making build ' +
  'building create creating please new simple small little local online business company just really very good great nice best look looking style styled ' +
  'colour color theme something thing things stuff kind type sort based help helps people who which where what do does doing offer offers service services ' +
  'them they can will get has have had so as all any more also too up out into over our own mine called named full screen image photo big split centred centered').split(' ');
function readTopic(text, name){
  var t = name ? text.split(name).join(' ') : text;
  var skip = {};
  FILLER.forEach(function(w){ skip[w] = 1; });
  LOOK_WORDS.concat(COLOUR_WORDS).forEach(function(p){ p[0].split(' ').forEach(function(w){ skip[w] = 1; }); });
  var link = { 'in': 1, 'of': 1, 'and': 1, 'for': 1, 'with': 1, '&': 1 }, ws = [];
  t.replace(/[^A-Za-z0-9& ]+/g, ' ').split(/\s+/).forEach(function(w){
    var l = w.toLowerCase();
    if (link[l]){ if (ws.length && !link[ws[ws.length - 1]]) ws.push(l); return; }   /* keep "in" in "escape room in Bristol" */
    if (w.length > 1 && !skip[l]) ws.push(/^[A-Z][a-z]/.test(w) ? w : l);            /* keep place and proper names as typed */
  });
  while (ws.length && link[ws[ws.length - 1]]) ws.pop();
  return ws.slice(0, 5).join(' ');
}
function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
var CUSTOM = JSON.stringify(TYPES.custom);
function setTopic(t){
  S.topic = String(t || '').replace(/[^A-Za-z0-9& ]+/g, '').trim().slice(0, 40);
  var w = S.topic || 'what you do';
  TYPES.custom = JSON.parse(CUSTOM.replace(/\{t\}/g, w).replace(/\{T\}/g, cap(w)));
}
function readBrief(text){
  var t = ' ' + text.toLowerCase().replace(/[^a-z0-9&é ]+/g, ' ') + ' ';
  var ws = t.split(/\s+/).filter(Boolean);
  var found = { type: null, look: null, accent: null, layout: null, name: null, guesses: [] };
  var ranked = scoreTypes(t, ws, false);
  if (ranked.length) found.type = ranked[0][0];
  else {
    var near = scoreTypes(t, ws, true);
    if (near.length && near[0][1] >= 8) found.type = near[0][0];   /* a clear misspelling of a long keyword: resturant, photgrapher */
    else found.guesses = near.filter(function(p){ return p[1] >= 5; }).slice(0, 3).map(function(p){ return p[0]; });
  }
  LOOK_WORDS.forEach(function(p){ if (!found.look && hit(p[0], t, ws, false)) found.look = p[1]; });
  COLOUR_WORDS.forEach(function(p){ if (!found.accent && hit(p[0], t, ws, false)) found.accent = p[1]; });
  LAYOUT_WORDS.forEach(function(p){ if (!found.layout && t.indexOf(p[0]) > -1) found.layout = p[1]; });
  var m = text.match(/(?:called|named)\s+["“']?([^,.;"”']{2,32})/i) || text.match(/["“]([^"”]{2,32})["”]/);
  if (m) found.name = m[1].trim();
  if (!found.type) found.topic = readTopic(text, found.name);
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
  s.name = ''; s.nameSrc = ''; s.headline = ''; s.topic = ''; s.device = window.innerWidth < 760 ? 'phone' : 'desktop';
  return s;
}
var S = fresh();
setTopic('');
var pendingBrief = '';
function applyType(k){
  var d = typeDefaults(k);
  Object.keys(d).forEach(function(key){ S[key] = d[key]; });
}
(function(){
  var q = new URLSearchParams(location.search);
  if (q.get('name')){ S.name = q.get('name').slice(0, 32); S.nameSrc = 'user'; }
  if (q.get('brief')){ pendingBrief = q.get('brief').slice(0, 140); var bi = document.getElementById('fBrief'); if (bi) bi.value = pendingBrief; }
  var fit = q.get('fit');
  if (!fit) return;
  try {
    var o = JSON.parse(decodeURIComponent(escape(atob(fit.replace(/-/g, '+').replace(/_/g, '/')))));
    if (typeof o.topic === 'string') setTopic(o.topic);
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
  var o = { type: S.type, topic: S.topic, name: S.name, look: S.look, layout: S.layout, accent: S.accent, headline: S.headline, order: S.order, on: S.on };
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
function H(T, k, d){ return (T.heads && T.heads[k]) || d; }
function head(T, k, d){ var h = H(T, k, d); return '<div class="x-head">' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2></div>'; }
function kick(t){ return '<p class="x-kick">' + esc(t) + '</p>'; }
function sec(k, inner, cls){ return '<section class="x-sec s-' + k + (cls ? ' ' + cls : '') + '" data-sec="' + k + '">' + inner + '</section>'; }
var R = {
  work: function(T){
    return sec('work', '<div class="x-head">' + kick('Selected work') + '<h2>Recent photographs.</h2></div><div class="x-masonry">' +
      T.imgs.slice(0, 6).map(function(id, i){ return '<figure>' + img(id, '', T.caps[i]) + '<figcaption>' + esc(T.caps[i] || '') + '</figcaption></figure>'; }).join('') + '</div>');
  },
  series: function(T){
    return sec('series', head(T, 'series', ['Series', 'Ongoing series.']) + '<div class="x-list">' +
      T.series.map(function(s, i){ return '<div class="x-li"><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><strong>' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span><span>' + esc(s[2]) + '</span>' + img(T.imgs[(i + 2) % T.imgs.length], 'x-li-img') + '</div>'; }).join('') + '</div>');
  },
  about: function(T){
    return sec('about', '<div class="x-about"><div>' + kick('About') + '<h2>' + esc(nm()) + '</h2><p>' + fill(T.about) + '</p></div>' + img(T.imgs[T.imgs.length - 1], 'x-about-img') + '</div>');
  },
  packages: function(T){
    return sec('packages', head(T, 'packages', ['Packages', 'Simple, clear packages.']) + '<div class="x-three">' +
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
    var h = H(T, 'hours', ['Visit', 'Opening hours.']);
    return sec('hours', '<div class="x-hours"><div>' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2><p>' + esc(T.addr || '') + '</p></div><dl>' +
      T.hours.map(function(h){ return '<div><dt>' + esc(h[0]) + '</dt><dd>' + esc(h[1]) + '</dd></div>'; }).join('') + '</dl></div>');
  },
  treatments: function(T){
    return sec('treatments', head(T, 'treatments', ['Treatments', 'Treatments and prices.']) + '<div class="x-rows">' +
      T.treatments.map(function(t){ return '<div><strong>' + esc(t[0]) + '</strong><span>' + esc(t[1]) + '</span><b>' + esc(t[2]) + '</b><span class="x-book">Book</span></div>'; }).join('') + '</div>');
  },
  team: function(T){
    return sec('team', head(T, 'team', ['The team', 'The people you will meet.']) + '<div class="x-team">' +
      T.team.map(function(p){ return '<div><span class="x-av">' + esc(initials(p[0])) + '</span><strong>' + esc(p[0]) + '</strong><span>' + esc(p[1]) + '</span></div>'; }).join('') + '</div>');
  },
  steps: function(T){
    return sec('steps', head(T, 'steps', ['How it works', 'Three simple steps.']) + '<div class="x-steps">' +
      T.steps.map(function(s, i){ return '<div><span class="x-n">' + String(i + 1).padStart(2, '0') + '</span><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></div>'; }).join('') + '</div>');
  },
  listings: function(T){
    var h = H(T, 'listings', ['Listings', 'Available now.', 'View all homes']);
    return sec('listings', '<div class="x-head x-head-row"><div>' + kick(h[0]) + '<h2>' + esc(h[1]) + '</h2></div><span class="x-ghost">' + esc(h[2]) + '</span></div><div class="x-three">' +
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
    return sec('services', head(T, 'services', ['Services', 'What we offer.']) + '<div class="x-three">' +
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
    return sec('logos', '<p class="x-trust">' + esc(H(T, 'logos', 'Trusted by teams at')) + '</p><div class="x-logos">' + T.logos.map(function(l){ return '<span>' + esc(l) + '</span>'; }).join('') + '</div>', 'x-thin');
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
    return sec('dates', head(T, 'dates', ['Coming up', 'Dates for your diary.']) + '<div class="x-dates">' +
      T.dates.map(function(d){ var p = d[0].split(' '); return '<div><span class="x-cal"><strong>' + esc(p[0]) + '</strong>' + esc(p[1]) + '</span><span><strong>' + esc(d[1]) + '</strong><em>' + esc(d[2]) + '</em></span><span class="x-ghost">Reserve</span></div>'; }).join('') + '</div>');
  },
  gallery: function(T){
    return sec('gallery', head(T, 'gallery', ['Gallery', 'A look inside.']) + '<div class="x-gal">' + T.imgs.slice(0, 4).map(function(id){ return img(id); }).join('') + '</div>');
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
  if (T.extra === 'stay') return '<div class="x-search x-reserve"><span><small>Check in</small>Friday 14 June</span><span><small>Check out</small>Sunday 16 June</span><span><small>Guests</small>2 adults</span><span class="x-btn">' + esc(T.cta) + '</span></div>';
  if (T.extra === 'quote') return '<div class="x-quotecard"><strong>Get a quote in minutes</strong><span class="x-field">Your postcode</span><span class="x-field">What needs doing?</span><span class="x-btn">Send request</span><small>Replies within the hour</small></div>';
  return '';
}
function hero(T){
  var head = S.headline.trim() || T.h;
  var media = (T.extra === 'mock' && S.layout !== 'full') ? mock() : (T.extra === 'quote' && S.layout === 'split') ? heroExtra(T) : img(T.hero, 'x-hero-img', T.label);
  var after = (T.extra === 'search' || T.extra === 'reserve' || T.extra === 'stay') ? heroExtra(T) : '';
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
    'Type of site: ' + (S.type === 'custom' ? 'Something else · ' + (S.topic || 'not described') : T.label) + '\n' +
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
  var f = readBrief(text), said = [], also = '';
  if (!f.type && f.topic){
    setTopic(f.topic);
    f.type = 'custom';
    if (f.guesses.length) also = ' Or did you mean:<span class="brief-pick">' + f.guesses.map(function(k){ return '<button type="button" data-pick="' + k + '">' + TYPES[k].label + '</button>'; }).join('') + '</span>';
  }
  if (!f.type){
    var picks = (f.guesses.length ? f.guesses : ['photography', 'restaurant', 'clinic']);
    $('fBriefRead').innerHTML = '<b>What is the site for?</b> ' + (f.guesses.length ? 'Did you mean' : 'Add a word or two about what you do, or start from one of these') + ':' +
      '<span class="brief-pick">' + picks.map(function(k){ return '<button type="button" data-pick="' + k + '">' + TYPES[k].label + '</button>'; }).join('') + '</span>';
    setUnsure(true);
    return;
  }
  setUnsure(false);
  applyType(f.type); said.push(f.type === 'custom' ? 'a site about ' + S.topic : TYPES[f.type].label + ' site');
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
  $('fBriefRead').innerHTML = '<b>Built as</b> ' + esc(said.join(' · ')) + '.' + (also || ' Adjust anything below.');
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
  S = fresh(); S.device = dev; setTopic('');
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
if (pendingBrief) runBrief(pendingBrief);
if (window.ResizeObserver) new ResizeObserver(function(){ fitPreview(); }).observe(pvView);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPreview);
document.addEventListener('loadingdone', fitPreview);
})();
