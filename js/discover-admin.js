/*
 * KwaMashu Online — discover-admin.js
 * ──────────────────────────────────────
 * Floating CMS admin panel for the Discover page.
 * Adds, edits and deletes Notable People via KMOStorage.
 * The panel and modal are injected entirely by JavaScript —
 * no admin HTML lives in the page source.
 *
 * This is a demo / prototype. No authentication is used.
 */
'use strict';

window.KMOAdmin = (function () {

  var _refreshCb     = null;  // Called after any data change to re-render the grid
  var _addImageData  = null;  // { value: base64String | null }
  var _editImageData = null;  // { value: base64String | null }

  /* ── Section list A–Z ─────────────────────────────────────────── */
  var SECTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  /* ── Escape helpers ───────────────────────────────────────────── */

  function _esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str != null ? String(str) : ''));
    return d.innerHTML;
  }

  function _attr(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Default avatar SVG ───────────────────────────────────────── */

  function _avatarSvg() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="8.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  /* ── Section <option> list ────────────────────────────────────── */

  function _sectionOpts(selected) {
    return SECTIONS.map(function (s) {
      return '<option value="' + s + '"' + (s === selected ? ' selected' : '') + '>Section\u00a0' + s + '</option>';
    }).join('');
  }

  /* ── Person form HTML (shared by Add and Edit) ────────────────── */

  function _formHtml(pfx, p) {
    p = p || {};
    var achievements = Array.isArray(p.achievements) ? p.achievements.join('\n') : (p.achievements || '');

    return (
      '<form id="admin-form-' + pfx + '" class="admin-form" novalidate autocomplete="off">' +

      /* Hidden ID for edit */
      '<input type="hidden" id="' + pfx + '-id" value="' + _attr(p.id) + '">' +

      /* ── Photo ── */
      '<div class="admin-field">' +
        '<label>Photo</label>' +
        '<div class="admin-image-upload">' +
          '<div class="admin-img-preview" id="' + pfx + '-img-preview">' +
            (p.image ? '<img src="' + _attr(p.image) + '" alt="">' : _avatarSvg()) +
          '</div>' +
          '<div class="admin-upload-controls">' +
            '<input type="file" id="' + pfx + '-img-file" accept="image/*" class="sr-only" aria-label="Upload portrait photo">' +
            '<button type="button" class="admin-upload-btn" data-trigger="' + pfx + '-img-file">Choose Photo</button>' +
            '<button type="button" class="admin-clear-btn" id="' + pfx + '-img-clear"' + (!p.image ? ' hidden' : '') + '>Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ── Name + Occupation ── */
      '<div class="admin-form-row">' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-fullName">Full Name <abbr title="required">*</abbr></label>' +
          '<input type="text" id="' + pfx + '-fullName" placeholder="e.g. Sibusiso Ndlovu" value="' + _attr(p.fullName) + '" required>' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-occupation">Occupation <abbr title="required">*</abbr></label>' +
          '<input type="text" id="' + pfx + '-occupation" placeholder="e.g. Entrepreneur" value="' + _attr(p.occupation) + '" required>' +
        '</div>' +
      '</div>' +

      /* ── Section + Status ── */
      '<div class="admin-form-row">' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-section">KwaMashu Section</label>' +
          '<select id="' + pfx + '-section">' +
            '<option value="">Select section</option>' +
            _sectionOpts(p.section || '') +
          '</select>' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-status">Status</label>' +
          '<select id="' + pfx + '-status">' +
            '<option value="living"'   + (p.status !== 'deceased' ? ' selected' : '') + '>Living</option>' +
            '<option value="deceased"' + (p.status === 'deceased' ? ' selected' : '') + '>Deceased</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      /* ── Dates ── */
      '<div class="admin-form-row">' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-birthDate">Date of Birth</label>' +
          '<input type="date" id="' + pfx + '-birthDate" value="' + _attr(p.birthDate) + '">' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="' + pfx + '-deathDate">Date of Passing</label>' +
          '<input type="date" id="' + pfx + '-deathDate" value="' + _attr(p.deathDate) + '">' +
        '</div>' +
      '</div>' +

      /* ── Short Summary ── */
      '<div class="admin-field">' +
        '<label for="' + pfx + '-summary">Short Summary <abbr title="required">*</abbr></label>' +
        '<textarea id="' + pfx + '-summary" rows="3" placeholder="A brief one or two sentence description..." required>' + _esc(p.summary) + '</textarea>' +
      '</div>' +

      /* ── Biography ── */
      '<div class="admin-field">' +
        '<label for="' + pfx + '-biography">Biography</label>' +
        '<textarea id="' + pfx + '-biography" rows="4" placeholder="Full biography...">' + _esc(p.biography) + '</textarea>' +
      '</div>' +

      /* ── Achievements ── */
      '<div class="admin-field">' +
        '<label for="' + pfx + '-achievements">Achievements <span class="admin-label-hint">(one per line)</span></label>' +
        '<textarea id="' + pfx + '-achievements" rows="3" placeholder="Award or achievement&#10;Another achievement...">' + _esc(achievements) + '</textarea>' +
      '</div>' +

      /* ── Checkboxes ── */
      '<div class="admin-checkbox-row">' +
        '<label class="admin-checkbox-label">' +
          '<input type="checkbox" id="' + pfx + '-featured"' + (p.featured ? ' checked' : '') + '> Featured' +
        '</label>' +
        '<label class="admin-checkbox-label">' +
          '<input type="checkbox" id="' + pfx + '-published"' + (p.published !== false ? ' checked' : '') + '> Published' +
        '</label>' +
      '</div>' +

      /* ── Feedback + Submit ── */
      '<div class="admin-feedback" id="' + pfx + '-feedback" role="alert" aria-live="polite"></div>' +
      '<button type="submit" class="admin-save-btn">' + (pfx === 'edit' ? 'Save Changes' : 'Add Person') + '</button>' +

      '</form>'
    );
  }

  /* ── Full modal + FAB markup ──────────────────────────────────── */

  function _modalHtml() {
    return (

      /* Floating Action Button */
      '<button class="admin-fab" id="admin-fab" type="button" aria-label="Open Demo Admin panel" aria-expanded="false">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="15" height="15" fill="currentColor">' +
          '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/>' +
        '</svg>' +
        'Demo Admin' +
      '</button>' +

      /* Overlay */
      '<div class="admin-overlay" id="admin-overlay" aria-hidden="true">' +
        '<div class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">' +

          /* Header */
          '<div class="admin-modal-hd">' +
            '<div>' +
              '<h2 class="admin-modal-title" id="admin-title">KwaMashu Online <span>CMS Demo</span></h2>' +
              '<p class="admin-modal-sub">LocalStorage powered &mdash; no server required</p>' +
            '</div>' +
            '<button class="admin-close" id="admin-close" type="button" aria-label="Close admin panel">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
                '<path d="M18 6 6 18M6 6l12 12"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +

          /* Tabs */
          '<div class="admin-tabs" role="tablist" aria-label="Admin sections">' +
            '<button class="admin-tab is-active" role="tab" aria-selected="true"  data-tab="add"    id="atab-add">Add Person</button>' +
            '<button class="admin-tab"            role="tab" aria-selected="false" data-tab="edit"   id="atab-edit">Edit Person</button>' +
            '<button class="admin-tab"            role="tab" aria-selected="false" data-tab="delete" id="atab-delete">Delete Person</button>' +
          '</div>' +

          /* Panels */
          '<div class="admin-panels">' +

            /* Add */
            '<div class="admin-panel is-active" id="apanel-add" role="tabpanel" aria-labelledby="atab-add">' +
              _formHtml('add', {}) +
            '</div>' +

            /* Edit */
            '<div class="admin-panel" id="apanel-edit" role="tabpanel" aria-labelledby="atab-edit" hidden>' +
              '<div class="admin-select-wrap">' +
                '<label for="edit-select">Select person to edit</label>' +
                '<select id="edit-select" class="admin-full-select">' +
                  '<option value="">\u2014 Choose a person \u2014</option>' +
                '</select>' +
              '</div>' +
              '<div id="edit-form-host"></div>' +
            '</div>' +

            /* Delete */
            '<div class="admin-panel" id="apanel-delete" role="tabpanel" aria-labelledby="atab-delete" hidden>' +
              '<div id="delete-list"></div>' +
            '</div>' +

          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Collect form data ────────────────────────────────────────── */

  function _collect(pfx, imageData) {
    function v(field) {
      var el = document.getElementById(pfx + '-' + field);
      return el ? el.value.trim() : '';
    }
    function cb(field) {
      var el = document.getElementById(pfx + '-' + field);
      return el ? el.checked : false;
    }
    var raw = v('achievements');
    var achievements = raw
      ? raw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
      : [];
    return {
      fullName:     v('fullName'),
      occupation:   v('occupation'),
      section:      v('section'),
      status:       v('status') || 'living',
      birthDate:    v('birthDate') || null,
      deathDate:    v('deathDate') || null,
      summary:      v('summary'),
      biography:    v('biography'),
      achievements: achievements,
      image:        (imageData && imageData.value) || null,
      featured:     cb('featured'),
      published:    cb('published'),
    };
  }

  /* ── Feedback messages ────────────────────────────────────────── */

  function _feedback(pfx, type, msg) {
    var el = document.getElementById(pfx + '-feedback');
    if (!el) return;
    el.className = 'admin-feedback admin-feedback--' + type;
    el.textContent = msg;
    if (type === 'success') {
      setTimeout(function () {
        el.className = 'admin-feedback';
        el.textContent = '';
      }, 3600);
    }
  }

  /* ── Image upload wiring ──────────────────────────────────────── */

  function _wireImage(pfx, imageRef) {
    var fileInput = document.getElementById(pfx + '-img-file');
    var preview   = document.getElementById(pfx + '-img-preview');
    var clearBtn  = document.getElementById(pfx + '-img-clear');
    var triggerBtn = document.querySelector('[data-trigger="' + pfx + '-img-file"]');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', function () { fileInput && fileInput.click(); });
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
          alert('Image exceeds 4\u202fMB. Please choose a smaller file.');
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          imageRef.value = e.target.result;
          if (preview) preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
          if (clearBtn) clearBtn.hidden = false;
        };
        reader.readAsDataURL(file);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        imageRef.value = null;
        if (preview)   preview.innerHTML = _avatarSvg();
        if (clearBtn)  clearBtn.hidden = true;
        if (fileInput) fileInput.value = '';
      });
    }
  }

  /* ── Populate Edit person select ──────────────────────────────── */

  function _fillEditSelect() {
    var sel = document.getElementById('edit-select');
    if (!sel) return;
    var current = sel.value;
    var people  = KMOStorage.getPeople();
    sel.innerHTML = '<option value="">\u2014 Choose a person \u2014</option>';
    people.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.fullName + ' \u2014 ' + p.occupation;
      if (p.id === current) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  /* ── Wire Edit select change ──────────────────────────────────── */

  function _wireEditSelect() {
    var sel = document.getElementById('edit-select');
    if (!sel) return;
    sel.addEventListener('change', function () {
      var host = document.getElementById('edit-form-host');
      if (!host) return;
      if (!sel.value) { host.innerHTML = ''; return; }
      var person = KMOStorage.getPersonById(sel.value);
      if (!person) return;

      // Render pre-filled form
      host.innerHTML = _formHtml('edit', person);

      // Set up image ref (pre-loaded with existing image)
      _editImageData = { value: person.image || null };
      _wireImage('edit', _editImageData);

      // Wire submit
      var form = document.getElementById('admin-form-edit');
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var id   = document.getElementById('edit-id');
        var pid  = id ? id.value : '';
        var data = _collect('edit', _editImageData);
        if (!data.fullName || !data.summary) {
          _feedback('edit', 'error', 'Full Name and Short Summary are required.');
          return;
        }
        KMOStorage.updatePerson(pid, data);
        _feedback('edit', 'success', '\u2713 Changes saved for ' + data.fullName + '.');
        _fillEditSelect();
        if (_refreshCb) _refreshCb();
      });
    });
  }

  /* ── Populate Delete list ─────────────────────────────────────── */

  function _fillDeleteList() {
    var list = document.getElementById('delete-list');
    if (!list) return;
    var people = KMOStorage.getPeople();
    if (people.length === 0) {
      list.innerHTML = '<p class="admin-empty-note">No people in the database yet.</p>';
      return;
    }
    list.innerHTML = people.map(function (p) {
      return (
        '<div class="admin-del-item" id="ditem-' + _attr(p.id) + '">' +
          '<div class="admin-del-info">' +
            '<p class="admin-del-name">' + _esc(p.fullName) + '</p>' +
            '<p class="admin-del-sub">' + _esc(p.occupation) + ' \u2014 Section\u00a0' + _esc(p.section) + '</p>' +
          '</div>' +
          '<button class="admin-del-btn" type="button" data-did="' + _attr(p.id) + '" ' +
            'aria-label="Delete ' + _attr(p.fullName) + '">Delete</button>' +
        '</div>'
      );
    }).join('');
  }

  /* ── Delete confirm inline flow ───────────────────────────────── */

  function _confirmDelete(id, name) {
    // Remove any existing confirm box first
    var existingConfirm = document.querySelector('.admin-confirm');
    if (existingConfirm) existingConfirm.remove();

    var item = document.getElementById('ditem-' + id);
    if (!item) return;

    var box = document.createElement('div');
    box.className = 'admin-confirm';
    box.setAttribute('role', 'alertdialog');
    box.setAttribute('aria-live', 'assertive');
    box.innerHTML = (
      '<p>Permanently delete <strong>' + _esc(name) + '</strong>? This cannot be undone.</p>' +
      '<div class="admin-confirm-actions">' +
        '<button class="admin-confirm-yes" type="button">Yes, delete</button>' +
        '<button class="admin-confirm-no" type="button">Cancel</button>' +
      '</div>'
    );

    box.querySelector('.admin-confirm-yes').addEventListener('click', function () {
      KMOStorage.deletePerson(id);
      _fillDeleteList();
      _fillEditSelect();
      if (_refreshCb) _refreshCb();
    });
    box.querySelector('.admin-confirm-no').addEventListener('click', function () {
      box.remove();
    });

    item.after(box);
    box.querySelector('.admin-confirm-yes').focus();
  }

  /* ── Wire Delete list (event delegation) ─────────────────────── */

  function _wireDeleteList() {
    var list = document.getElementById('delete-list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-did]');
      if (!btn) return;
      var id     = btn.dataset.did;
      var person = KMOStorage.getPersonById(id);
      if (person) _confirmDelete(id, person.fullName);
    });
  }

  /* ── Wire Add form ────────────────────────────────────────────── */

  function _wireAddForm() {
    _addImageData = { value: null };
    _wireImage('add', _addImageData);

    var form = document.getElementById('admin-form-add');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = _collect('add', _addImageData);
      if (!data.fullName || !data.summary) {
        _feedback('add', 'error', 'Full Name and Short Summary are required.');
        return;
      }
      KMOStorage.addPerson(data);

      // Reset form
      form.reset();
      _addImageData.value = null;
      var prev = document.getElementById('add-img-preview');
      if (prev) prev.innerHTML = _avatarSvg();
      var clr  = document.getElementById('add-img-clear');
      if (clr)  clr.hidden = true;

      _feedback('add', 'success', '\u2713 ' + data.fullName + ' added successfully.');
      if (_refreshCb) _refreshCb();
    });
  }

  /* ── Tab switching ────────────────────────────────────────────── */

  function _switchTab(name) {
    document.querySelectorAll('.admin-tab').forEach(function (t) {
      var active = t.dataset.tab === name;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.admin-panel').forEach(function (p) {
      var active = p.id === 'apanel-' + name;
      p.classList.toggle('is-active', active);
      p.hidden = !active;
    });
    if (name === 'edit')   _fillEditSelect();
    if (name === 'delete') _fillDeleteList();
  }

  /* ── Modal open / close ───────────────────────────────────────── */

  function _open() {
    var overlay = document.getElementById('admin-overlay');
    var fab     = document.getElementById('admin-fab');
    if (!overlay) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    if (fab) fab.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first interactive element
    var first = overlay.querySelector('button:not([disabled]), input, select, textarea');
    if (first) setTimeout(function () { first.focus(); }, 80);
  }

  function _close() {
    var overlay = document.getElementById('admin-overlay');
    var fab     = document.getElementById('admin-fab');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (fab) { fab.setAttribute('aria-expanded', 'false'); fab.focus(); }
    document.body.style.overflow = '';
  }

  /* ── Focus trap ───────────────────────────────────────────────── */

  function _trapFocus(e) {
    if (e.key !== 'Tab') return;
    var overlay = document.getElementById('admin-overlay');
    if (!overlay || !overlay.classList.contains('is-open')) return;
    var els = overlay.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var arr   = Array.prototype.slice.call(els);
    var first = arr[0];
    var last  = arr[arr.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  /* ── Public: init ─────────────────────────────────────────────── */

  function init(refreshCallback) {
    _refreshCb = refreshCallback || null;

    // Inject FAB + modal into document body
    var frag = document.createElement('div');
    frag.innerHTML = _modalHtml();
    while (frag.firstChild) document.body.appendChild(frag.firstChild);

    // FAB
    var fab = document.getElementById('admin-fab');
    if (fab) fab.addEventListener('click', _open);

    // Close button
    var closeBtn = document.getElementById('admin-close');
    if (closeBtn) closeBtn.addEventListener('click', _close);

    // Overlay backdrop click
    var overlay = document.getElementById('admin-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) _close();
      });
    }

    // Keyboard: Escape + focus trap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') _close();
      _trapFocus(e);
    });

    // Tab buttons
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { _switchTab(btn.dataset.tab); });
    });

    // Wire up panels
    _wireAddForm();
    _wireEditSelect();
    _wireDeleteList();
  }

  /* ── Public API ───────────────────────────────────────────────── */

  return { init: init };

})();
