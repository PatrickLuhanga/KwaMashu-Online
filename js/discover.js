/*
 * KwaMashu Online — discover.js
 * ──────────────────────────────
 * Orchestrates the Discover page CMS features.
 * Initialises storage → renders people section → wires controls → boots admin.
 *
 * Dependencies (loaded before this file in HTML):
 *   app.js  →  discover-storage.js  →  discover-render.js  →  discover-admin.js
 */
'use strict';

(function () {

  /* ── Application state ────────────────────────────────────────── */

  var state = {
    all:      [],   // All published people from storage
    filtered: [],   // People after filters applied
    showAll:  false,
    filters: {
      query:      '',
      section:    '',
      occupation: '',
      status:     '',
      decade:     '',
      featured:   '',
    },
  };

  /* ── Load + filter + render ───────────────────────────────────── */

  function loadPeople() {
    state.all = KMOStorage.getPeople().filter(function (p) { return p.published; });
  }

  function applyAndRender() {
    state.filtered = KMORenderer.applyFilters(state.all, state.filters);
    KMORenderer.renderPeopleGrid(state.filtered, state.showAll);
  }

  /* ── Full refresh (called by admin after CRUD operations) ─────── */

  function refresh() {
    loadPeople();
    KMORenderer.populateOccupationFilter(state.all);
    KMORenderer.populateDecadeFilter(state.all);
    state.showAll = false;
    applyAndRender();
  }

  /* ── Search & filter controls ─────────────────────────────────── */

  function initControls() {
    // Live search input
    var searchInput = document.getElementById('people-search');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        state.filters.query = e.target.value;
        state.showAll = false;
        applyAndRender();
      });
    }

    // Dropdown filters (use data-filter attribute to map to state.filters key)
    var filterEls = document.querySelectorAll('.people-filter[data-filter]');
    filterEls.forEach(function (sel) {
      sel.addEventListener('change', function () {
        state.filters[sel.dataset.filter] = sel.value;
        state.showAll = false;
        applyAndRender();
      });
    });

    // View More / Show Less
    var moreBtn = document.getElementById('people-view-more');
    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        state.showAll = !state.showAll;
        applyAndRender();
        // Scroll back to section top when collapsing
        if (!state.showAll) {
          var section = document.getElementById('notable-people');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  /* ── Boot ─────────────────────────────────────────────────────── */

  function init() {
    KMOStorage.init();       // Seed localStorage if first visit
    loadPeople();
    KMORenderer.populateOccupationFilter(state.all);
    KMORenderer.populateDecadeFilter(state.all);
    applyAndRender();
    initControls();
    KMOAdmin.init(refresh);  // Boot floating admin panel
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
