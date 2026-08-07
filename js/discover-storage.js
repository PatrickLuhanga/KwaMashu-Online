/*
 * KwaMashu Online — discover-storage.js
 * ──────────────────────────────────────
 * Data layer for the Discover CMS demo.
 * All persistence uses browser localStorage with structured JSON.
 *
 * FUTURE API MIGRATION NOTE:
 * To replace localStorage with a Flask / REST API, swap the
 * _read / _write functions with async fetch() calls and update
 * callers in discover.js to await them.
 */
'use strict';

window.KMOStorage = (function () {

  /* ── Storage keys ─────────────────────────────────────────────── */

  var KEYS = {
    NOTABLE_PEOPLE:        'kmo_notablePeople',
    PLACES:                'kmo_places',
    LANDMARKS:             'kmo_landmarks',
    GALLERY:               'kmo_gallery',
    COMMUNITY_INITIATIVES: 'kmo_communityInitiatives',
  };

  /* ── Default seed data ────────────────────────────────────────── */

  var DEFAULT_PEOPLE = [
    {
      id: 'kp001', slug: 'sibusiso-ndlovu',
      fullName: 'Sibusiso Ndlovu', occupation: 'Entrepreneur', section: 'B',
      birthDate: '1972-03-14', deathDate: null, status: 'living',
      summary: 'A pioneering entrepreneur who built one of KwaMashu\'s most successful community cooperatives, creating employment for over 200 local residents.',
      biography: 'Sibusiso Ndlovu grew up in Section B, where he developed a passion for business and community development from an early age. After completing a business diploma at Mangosuthu University of Technology, he returned to KwaMashu to invest his skills in the community that raised him. His cooperative model became a blueprint for township economic empowerment across eThekwini.',
      achievements: ['Founded KwaMashu Community Co-op (1998)', 'eThekwini Business Excellence Award (2005)', 'KwaZulu-Natal Entrepreneur of the Year nominee (2018)', '200+ permanent jobs created in KwaMashu'],
      image: null, featured: true, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp002', slug: 'thandi-mthembu',
      fullName: 'Thandi Mthembu', occupation: 'Education Activist', section: 'D',
      birthDate: '1968-07-22', deathDate: null, status: 'living',
      summary: 'Dedicated her career to improving educational outcomes in KwaMashu, founding a reading programme that has reached over 5\u202f000 learners.',
      biography: 'Thandi Mthembu has spent over three decades fighting for quality education in township schools. Her grassroots reading programme, Vula Amehlo (Open Eyes), began with 12 children in her living room in Section D and has since been adopted by schools across KwaZulu-Natal as a model for community-led literacy upliftment.',
      achievements: ['Founded Vula Amehlo Reading Programme (2001)', 'South African Women in Education Award (2011)', 'National Teaching Excellence Commendation (2019)', 'Programme expanded to 14 KwaZulu-Natal schools'],
      image: null, featured: true, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp003', slug: 'bongani-zulu',
      fullName: 'Bongani Zulu', occupation: 'Professional Footballer', section: 'G',
      birthDate: '1985-11-05', deathDate: null, status: 'living',
      summary: 'Raised on the pitches of KwaMashu, Bongani went on to represent AmaZulu FC and now inspires a generation of young footballers through his youth academy.',
      biography: 'Bongani discovered his love of football at the KwaMashu Sports Ground, honing his skills through the K-Zone youth tournaments before being scouted at the age of 17. A decade as a professional footballer was followed by a passionate commitment to youth coaching in the community that shaped him.',
      achievements: ['AmaZulu FC Senior Squad (2005\u20132016)', 'KwaZulu-Natal Premier League Champion (2009)', 'KwaMashu Youth Football Academy \u2014 founder (2017\u2013present)', 'Over 80 youth players coached and mentored'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp004', slug: 'nomvula-dlamini',
      fullName: 'Nomvula Dlamini', occupation: 'Social Worker', section: 'C',
      birthDate: '1975-04-18', deathDate: null, status: 'living',
      summary: 'A compassionate social worker whose 25-year career has transformed child welfare support across KwaMashu\'s most vulnerable families.',
      biography: 'Nomvula joined the Department of Social Development straight out of the University of Zululand and chose to work in KwaMashu rather than pursue a more lucrative urban career. She has been instrumental in building community-led child protection networks and mentoring the next generation of social workers.',
      achievements: ['Established KwaMashu Child Welfare Desk (2000)', 'Social Worker of the Year \u2014 eThekwini (2014)', 'UNICEF Community Champion recognition (2020)', 'Mentored over 30 student social workers'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp005', slug: 'lungelo-mkhize',
      fullName: 'Lungelo Mkhize', occupation: 'Musician & Producer', section: 'E',
      birthDate: '1989-09-30', deathDate: null, status: 'living',
      summary: 'A multi-talented musician and record producer whose afro-soul sound has put KwaMashu on the South African music map.',
      biography: 'Lungelo\'s love of music began in his church choir in Section E. By the age of 19 he was producing tracks in a makeshift bedroom studio. Today his afro-soul and maskandi-influenced sound is streamed across Africa and the diaspora, and he runs a mentorship programme for young KwaMashu musicians from that same studio where it all began.',
      achievements: ['South African Music Award nomination \u2014 Best Newcomer (2014)', 'Three independently released albums', 'KwaMashu Sound Studio \u2014 mentors 12 young musicians per year', 'Featured on SABC 1 Soul Sessions (2022)'],
      image: null, featured: true, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp006', slug: 'phiwayinkosi-hadebe',
      fullName: 'Phiwayinkosi Hadebe', occupation: 'Political Activist', section: 'A',
      birthDate: '1938-02-10', deathDate: '1993-07-15', status: 'deceased',
      summary: 'A fearless voice for justice during the apartheid era, whose community organising in KwaMashu helped build the foundations of a democratic KwaZulu-Natal.',
      biography: 'Phiwayinkosi dedicated his life to the liberation struggle. He helped coordinate grassroots resistance networks in KwaMashu throughout the 1970s and 1980s, often at great personal risk. His tireless organising of civic associations and community meetings built the social infrastructure that would shape KwaMashu\'s post-apartheid institutions.',
      achievements: ['Founding member of the KwaMashu Residents\' Association (1974)', 'Key organiser of the 1984 rent boycott', 'Established community legal aid desk (1986)', 'Posthumously honoured by eThekwini Municipality (2004)'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp007', slug: 'zanele-nkosi',
      fullName: 'Zanele Nkosi', occupation: 'Business Leader', section: 'H',
      birthDate: '1965-12-03', deathDate: null, status: 'living',
      summary: 'One of KwaMashu\'s most respected business leaders, Zanele has used her success to fund bursaries and mentorship programmes for township youth.',
      biography: 'Zanele started her first business from a roadside food stall in Section H. Four decades of tenacity, reinvestment and community focus have grown that single stall into a group of companies employing 140 people. She now chairs the KwaMashu Business Forum and is among the most prominent advocates for township economic empowerment in KwaZulu-Natal.',
      achievements: ['Chair, KwaMashu Business Forum (2015\u2013present)', 'Funded 47 university bursaries for KwaMashu students', 'Business Women\'s Association of South Africa \u2014 Gold Member', 'Business group employs 140 KwaMashu residents'],
      image: null, featured: true, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp008', slug: 'dr-sipho-cele',
      fullName: 'Dr. Sipho Cele', occupation: 'Community Doctor', section: 'F',
      birthDate: '1970-06-25', deathDate: null, status: 'living',
      summary: 'A general practitioner who chose to open his clinic in KwaMashu rather than private practice, providing affordable healthcare to thousands of families.',
      biography: 'Dr. Cele studied medicine at the University of KwaZulu-Natal and, despite receiving offers from private hospitals in Durban, returned to KwaMashu to serve the community that raised him. His sliding-scale fee model has made quality healthcare accessible to families who would otherwise go without.',
      achievements: ['KwaMashu Community Clinic \u2014 open since 1999', 'Treated over 80\u202f000 patients across 25 years', 'KwaZulu-Natal Health Department Community Service Award (2016)', 'Runs free HIV and TB screening twice monthly'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp009', slug: 'lindiwe-ngcobo',
      fullName: 'Lindiwe Ngcobo', occupation: 'Artist & Muralist', section: 'K',
      birthDate: '1991-08-14', deathDate: null, status: 'living',
      summary: 'A visual artist whose striking murals across KwaMashu have transformed public spaces into open-air galleries celebrating community history.',
      biography: 'Lindiwe studied fine art in Cape Town but returned home to KwaMashu with a mission: to make public space beautiful and meaningful for the people who live there. Her large-scale murals depicting township history, community heroes and everyday life have gained national attention and several international commissions.',
      achievements: ['Created 18 large-scale public murals in KwaMashu', 'Featured at Design Indaba, Cape Town (2022)', 'Public art commission \u2014 Durban City Hall precinct (2023)', 'Runs free youth art workshops at E Section Community Centre'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp010', slug: 'mandla-buthelezi',
      fullName: 'Mandla Buthelezi', occupation: 'Youth Leader', section: 'J',
      birthDate: '1995-03-22', deathDate: null, status: 'living',
      summary: 'The founder of KwaMashu Youth Collective, Mandla has mobilised thousands of young people into civic life, skills programmes and community development.',
      biography: 'Mandla founded the KwaMashu Youth Collective at just 20 years old after becoming frustrated by the lack of structured opportunities for township youth. The organisation now runs coding bootcamps, sports leagues, a community newspaper and a mentorship programme connecting young people with established professionals.',
      achievements: ['Founded KwaMashu Youth Collective (2015)', 'Mail & Guardian 200 Young South Africans list (2019)', 'Launched KwaMashu Community Newsletter \u2014 4\u202f000+ readers', 'Collective has engaged over 3\u202f200 young people since 2015'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp011', slug: 'nokuthula-zwane',
      fullName: 'Nokuthula Zwane', occupation: 'Healthcare Activist', section: 'I',
      birthDate: '1958-05-08', deathDate: '2019-11-30', status: 'deceased',
      summary: 'A dedicated nurse who spent four decades fighting for maternal healthcare rights in KwaMashu and trained hundreds of community health workers.',
      biography: 'Sister Nokuthula served the KwaMashu community from the 1970s until her passing. She trained community health workers, ran ante-natal clinics from her home, and was a relentless advocate for better resources in township health facilities. Her legacy lives on through the Maternal Health Initiative she founded in 1986.',
      achievements: ['Trained over 300 community health workers', 'Established KwaMashu Maternal Health Initiative (1986)', 'Decades of pro-bono community ante-natal care', 'Posthumous recognition \u2014 KwaZulu-Natal Department of Health (2020)'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'kp012', slug: 'mthokozisi-mkhwanazi',
      fullName: 'Mthokozisi Mkhwanazi', occupation: 'Investigative Journalist', section: 'B',
      birthDate: '1982-10-17', deathDate: null, status: 'living',
      summary: 'An award-winning journalist whose investigative work on township governance and housing rights has driven policy change at municipal level.',
      biography: 'Mthokozisi started his career writing for a local community paper in KwaMashu before moving into broadcast journalism. His investigative work on housing backlogs, municipal corruption and service delivery failures has been cited in parliamentary debates and led to tangible policy improvements for KwaMashu residents.',
      achievements: ['Print Media South Africa Award \u2014 Investigative Journalism (2015)', 'Durban Press Club Award for Public Interest Reporting (2018)', 'Launched KwaMashu Civic Watch accountability project', 'Work cited in KwaZulu-Natal Legislature proceedings (2020)'],
      image: null, featured: false, published: true,
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  var DEFAULT_LANDMARKS = [
    { id: 'lm001', name: 'KwaMashu Community Hall', section: 'A', description: 'A gathering place for markets, celebrations and community events throughout the year.', image: 'km_hall.png' },
    { id: 'lm002', name: 'KwaMashu Sports Ground', section: 'K', description: 'Home of the K-Zone tournaments and community football that brings thousands together every weekend.', image: 'km_sports.png' },
    { id: 'lm003', name: 'E Section Community Park', section: 'E', description: 'A green space where families meet, play and relax \u2014 the heartbeat of the neighbourhood.', image: 'km_park.png' },
  ];

  var DEFAULT_PLACES = [
    { id: 'pl001', name: 'Weekend Markets', location: 'Multiple locations', description: 'Vibrant open-air markets for fresh produce, handmade crafts, traditional food and a taste of real township life.', image: 'km_market.png' },
    { id: 'pl002', name: 'Inanda Heritage Route', location: 'Inanda, adjacent to KwaMashu', description: 'Home to the Phoenix Settlement where Gandhi lived, the John Dube House and the Ohlange Institute.', image: 'KwaMashu-01.webp' },
    { id: 'pl003', name: 'The Surrounding Valleys', location: 'Surrounding KwaMashu', description: 'Lush hills and valleys offering scenic walks, panoramic views and a sense of just how beautiful this corner of KwaZulu-Natal truly is.', image: 'km_landscape.png' },
  ];

  var DEFAULT_GALLERY = [
    { id: 'ga001', src: 'KwaMashu-01.webp', alt: 'KwaMashu community scenery looking across the township', caption: 'KwaMashu from above', feature: true },
    { id: 'ga002', src: 'km_market.png',    alt: 'Busy weekend market stalls in KwaMashu', caption: 'Weekend Market', feature: false },
    { id: 'ga003', src: 'km_sports.png',    alt: 'Community football match at KwaMashu Sports Ground', caption: 'Community Football', feature: false },
    { id: 'ga004', src: 'inanda-1.jpg',     alt: 'The surrounding hillside landscape of KwaMashu and Inanda', caption: 'KwaMashu & Inanda Hills', feature: false },
    { id: 'ga005', src: 'km_landscape.png', alt: 'Rolling valleys and hills beyond the township', caption: 'The Surrounding Valleys', feature: false },
  ];

  /* ── Internal helpers ─────────────────────────────────────────── */

  function _read(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[KMOStorage] Read error for key "' + key + '":', e);
      return null;
    }
  }

  function _write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('[KMOStorage] Write error for key "' + key + '":', e);
    }
  }

  function _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function _slugify(str) {
    return (str || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function _now() { return new Date().toISOString(); }

  /* ── Public: Storage initialisation ──────────────────────────── */

  function init() {
    if (!_read(KEYS.NOTABLE_PEOPLE))        _write(KEYS.NOTABLE_PEOPLE,        DEFAULT_PEOPLE);
    if (!_read(KEYS.LANDMARKS))             _write(KEYS.LANDMARKS,             DEFAULT_LANDMARKS);
    if (!_read(KEYS.PLACES))               _write(KEYS.PLACES,               DEFAULT_PLACES);
    if (!_read(KEYS.GALLERY))              _write(KEYS.GALLERY,              DEFAULT_GALLERY);
    if (!_read(KEYS.COMMUNITY_INITIATIVES)) _write(KEYS.COMMUNITY_INITIATIVES, []);
  }

  /* ── Public: Notable People CRUD ─────────────────────────────── */

  function getPeople() { return _read(KEYS.NOTABLE_PEOPLE) || []; }

  function savePeople(arr) { _write(KEYS.NOTABLE_PEOPLE, arr); }

  function addPerson(data) {
    var people = getPeople();
    var person = Object.assign({}, data, {
      id:        _uid(),
      slug:      _slugify(data.fullName || ''),
      createdAt: _now(),
      updatedAt: _now(),
    });
    people.push(person);
    savePeople(people);
    return person;
  }

  function updatePerson(id, patch) {
    var people = getPeople();
    var idx = people.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return null;
    people[idx] = Object.assign({}, people[idx], patch, { updatedAt: _now() });
    savePeople(people);
    return people[idx];
  }

  function deletePerson(id) {
    savePeople(getPeople().filter(function (p) { return p.id !== id; }));
  }

  function getPersonById(id) {
    return getPeople().find(function (p) { return p.id === id; }) || null;
  }

  /* ── Public: Other content types (read-only for now) ─────────── */

  function getLandmarks() { return _read(KEYS.LANDMARKS) || []; }
  function getPlaces()    { return _read(KEYS.PLACES)    || []; }
  function getGallery()   { return _read(KEYS.GALLERY)   || []; }

  /* ── Expose public API ────────────────────────────────────────── */

  return {
    KEYS,
    init,
    getPeople, savePeople, addPerson, updatePerson, deletePerson, getPersonById,
    getLandmarks, getPlaces, getGallery,
  };

})();
