/*
 * KwaMashu Online — discover-render.js
 * ──────────────────────────────────────
 * UI rendering for the Notable People section.
 * All public functions accept plain data arrays rather than
 * reading storage directly — making an API migration trivial.
 */
'use strict';

window.KMORenderer = (function () {

  var CARDS_PER_PAGE = 6;

  /* ── Utility helpers ──────────────────────────────────────────── */

  function _esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str != null ? String(str) : ''));
    return d.innerHTML;
  }

  function _year(dateStr) {
    if (!dateStr) return null;
    var y = parseInt(String(dateStr).slice(0, 4), 10);
    return isNaN(y) ? null : y;
  }

  function _initials(name) {
    return (name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0]; })
      .join('')
      .toUpperCase();
  }

  var AVATAR_PALETTE = [
    '#c89b3c', '#1f2937', '#3a6b8a', '#5c6e2e',
    '#7d4a2e', '#4a2e7d', '#2e7d5c', '#7d2e5c',
  ];

  function _avatarColour(name) {
    var h = 0, s = name || '';
    for (var i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
  }

  /* ── Portrait markup ──────────────────────────────────────────── */

  function _portraitHtml(person) {
    if (person.image) {
      return (
        '<img src="' + _esc(person.image) + '" ' +
        'alt="Portrait of ' + _esc(person.fullName) + '" ' +
        'loading="lazy" decoding="async">'
      );
    }
    var initials = _initials(person.fullName);
    var colour   = _avatarColour(person.fullName);
    return (
      '<div class="people-card-initials" ' +
      'style="background:' + colour + '" ' +
      'aria-hidden="true">' + _esc(initials) + '</div>'
    );
  }

  /* ── Date display label ───────────────────────────────────────── */

  function _datesLabel(person) {
    var born = _year(person.birthDate);
    var died = _year(person.deathDate);
    if (born && died) return born + '\u2013' + died;   // en-dash
    if (born)         return 'b.\u00a0' + born;         // non-breaking space
    return '';
  }

  /* ── Single person card ───────────────────────────────────────── */

  function createPersonCard(person) {
    var dates   = _datesLabel(person);
    var metaDates = dates
      ? '<span class="people-card-meta-sep" aria-hidden="true">\u00b7</span><span>' + _esc(dates) + '</span>'
      : '';
    var badge = person.featured
      ? '<span class="people-card-badge">\u2605 Featured</span>'
      : '';

    return (
      '<article class="people-card' + (person.featured ? ' people-card--featured' : '') + '" ' +
        'role="listitem" data-id="' + _esc(person.id) + '">' +

        '<div class="people-card-portrait">' +
          _portraitHtml(person) +
          badge +
        '</div>' +

        '<div class="people-card-body">' +
          '<p class="people-card-meta">' +
            '<span>Section\u00a0' + _esc(person.section || '?') + '</span>' +
            metaDates +
          '</p>' +
          '<h3 class="people-card-name">' + _esc(person.fullName) + '</h3>' +
          '<p class="people-card-occupation">' + _esc(person.occupation) + '</p>' +
          '<p class="people-card-summary">' + _esc(person.summary) + '</p>' +
          '<a class="discover-card-link" href="#" ' +
            'data-person-id="' + _esc(person.id) + '" ' +
            'aria-label="View profile of ' + _esc(person.fullName) + '">' +
            'View Profile <span aria-hidden="true">\u2197</span>' +
          '</a>' +
        '</div>' +

      '</article>'
    );
  }

  /* ── Filter logic ─────────────────────────────────────────────── */

  function applyFilters(people, filters) {
    var q = (filters.query || '').toLowerCase().trim();
    return people.filter(function (p) {
      if (!p.published) return false;

      // Search (name or occupation)
      if (q) {
        var nameMatch = (p.fullName   || '').toLowerCase().indexOf(q) !== -1;
        var occMatch  = (p.occupation || '').toLowerCase().indexOf(q) !== -1;
        if (!nameMatch && !occMatch) return false;
      }

      if (filters.section    && p.section    !== filters.section)    return false;
      if (filters.occupation && p.occupation !== filters.occupation) return false;
      if (filters.status     && p.status     !== filters.status)     return false;

      if (filters.decade) {
        var y = _year(p.birthDate);
        if (!y || Math.floor(y / 10) * 10 !== parseInt(filters.decade, 10)) return false;
      }

      if (filters.featured === 'featured' && !p.featured) return false;

      return true;
    });
  }

  /* ── Main grid renderer ───────────────────────────────────────── */

  function renderPeopleGrid(people, showAll) {
    var grid     = document.getElementById('people-grid');
    var emptyEl  = document.getElementById('people-empty');
    var moreWrap = document.getElementById('people-view-more-wrap');
    var moreBtn  = document.getElementById('people-view-more');
    var countEl  = document.getElementById('people-results-count');

    if (!grid) return;

    var visible = showAll ? people : people.slice(0, CARDS_PER_PAGE);

    if (people.length === 0) {
      grid.innerHTML = '';
      if (emptyEl)  emptyEl.hidden  = false;
      if (moreWrap) moreWrap.hidden = true;
      if (countEl)  countEl.textContent = '';
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    grid.innerHTML = visible.map(createPersonCard).join('');

    // Staggered reveal for dynamically rendered cards
    var cards = grid.querySelectorAll('.people-card');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cards.forEach(function (el, i) {
          el.style.transitionDelay = Math.min(i, 5) * 55 + 'ms';
          el.classList.add('is-visible');
        });
      });
    });

    // Results count (accessible live region)
    if (countEl) {
      countEl.textContent =
        'Showing ' + visible.length + ' of ' + people.length +
        (people.length === 1 ? ' person' : ' people');
    }

    // View More / Show Less button
    if (moreWrap && moreBtn) {
      if (people.length > CARDS_PER_PAGE) {
        moreWrap.hidden = false;
        if (showAll) {
          moreBtn.textContent = 'Show Less';
        } else {
          moreBtn.innerHTML =
            'View All Notable People (' + people.length + ')' +
            ' <span class="button-arrow" aria-hidden="true">\u2192</span>';
        }
      } else {
        moreWrap.hidden = true;
      }
    }
  }

  /* ── Dynamic filter option populators ────────────────────────── */

  function populateOccupationFilter(people) {
    var sel = document.getElementById('filter-occupation');
    if (!sel) return;

    var occs = [];
    people.forEach(function (p) {
      if (p.occupation && occs.indexOf(p.occupation) === -1) occs.push(p.occupation);
    });
    occs.sort();

    var placeholder = sel.options[0];
    sel.innerHTML = '';
    if (placeholder && placeholder.value === '') {
      sel.appendChild(placeholder);
    } else {
      sel.appendChild(_opt('', 'All Occupations'));
    }
    occs.forEach(function (o) { sel.appendChild(_opt(o, o)); });
  }

  function populateDecadeFilter(people) {
    var sel = document.getElementById('filter-decade');
    if (!sel) return;

    var decades = [];
    people.forEach(function (p) {
      var y = _year(p.birthDate);
      if (y) {
        var d = Math.floor(y / 10) * 10;
        if (decades.indexOf(d) === -1) decades.push(d);
      }
    });
    decades.sort(function (a, b) { return a - b; });

    sel.innerHTML = '';
    sel.appendChild(_opt('', 'All Decades'));
    decades.forEach(function (d) { sel.appendChild(_opt(String(d), d + 's')); });
  }

  function _opt(value, label) {
    var o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    return o;
  }

  /* ── Public API ───────────────────────────────────────────────── */

  return {
    CARDS_PER_PAGE,
    createPersonCard,
    applyFilters,
    renderPeopleGrid,
    populateOccupationFilter,
    populateDecadeFilter,
  };

})();
