(function() {
  'use strict';

  var SESSION_KEY = 'enac-admin-email';
  var SESSION_ROLE = 'enac-admin-role';
  var SESSION_UNTIL = 'enac-admin-until';
  var SESSION_HOURS = 12;

  var SUPABASE_URL = window.ENAC_SUPABASE_URL || 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = window.ENAC_SUPABASE_ANON_KEY || 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  var loginEl = document.getElementById('admin-login');
  var contentEl = document.getElementById('admin-content');
  var loginMsg = document.getElementById('login-msg');
  var googleBtnEl = document.getElementById('google-btn');
  var adminUserEmail = document.getElementById('admin-user-email');
  var roleBadge = document.getElementById('role-badge');
  var dashboardStats = document.getElementById('dashboard-stats');
  var relationsCommunauteSelect = document.getElementById('relations-communaute-id');

  var state = {
    user: null,
    settings: {},
    annonces: [],
    actualites: [],
    evenements: [],
    medias: [],
    communautes: [],
    contacts: [],
    horaires: [],
    activites: [],
    versets_quotidiens: []
  };

  var QUILL_EDITORS = {};

  var SUPABASE_BUCKET = 'ena-images';

  function uploadImage(file) {
    return new Promise(function(resolve, reject) {
      if (!file) return reject(new Error('Aucun fichier selectionne'));

      var ext = file.name.split('.').pop();
      var fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      var formData = new FormData();
      formData.append('file', file);

      fetch(SUPABASE_URL + '/storage/v1/object/' + SUPABASE_BUCKET + '/' + fileName, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: file
      }).then(function(resp) {
        if (!resp.ok) return resp.text().then(function(t) { throw new Error(t); });
        var publicUrl = SUPABASE_URL + '/storage/v1/object/public/' + SUPABASE_BUCKET + '/' + fileName;
        resolve(publicUrl);
      }).catch(function(err) {
        reject(err);
      });
    });
  }

  var entityConfigs = {
    annonces: {
      key: 'annonces',
      table: 'annonces',
      formId: 'annonces-form',
      listId: 'annonces-list',
      messageId: 'annonces-message-bar',
      hiddenId: 'annonces-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'annonces-badge', key: 'badge', type: 'text' },
        { id: 'annonces-titre', key: 'titre', type: 'text' },
        { id: 'annonces-message', key: 'message', type: 'text' },
        { id: 'annonces-link-url', key: 'link_url', type: 'text' },
        { id: 'annonces-link-label', key: 'link_label', type: 'text' },
        { id: 'annonces-sort-order', key: 'sort_order', type: 'number' },
        { id: 'annonces-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || 'Annonce'; },
      summary: function(row) { return row.message || ''; }
    },
    actualites: {
      key: 'actualites',
      table: 'actualites',
      formId: 'actualites-form',
      listId: 'actualites-list-admin',
      messageId: 'actualites-message-bar',
      hiddenId: 'actualites-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'actualites-titre', key: 'titre', type: 'text' },
        { id: 'actualites-date', key: 'date', type: 'text' },
        { id: 'actualites-contenu', key: 'contenu', type: 'richtext' },
        { id: 'actualites-image-url', key: 'image_url', type: 'text' },
        { id: 'actualites-link-url', key: 'link_url', type: 'text' },
        { id: 'actualites-link-label', key: 'link_label', type: 'text' },
        { id: 'actualites-sort-order', key: 'sort_order', type: 'number' },
        { id: 'actualites-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || 'Actualite'; },
      summary: function(row) { return row.contenu ? row.contenu.replace(/<[^>]+>/g, '').substring(0, 80) : ''; }
    },
    evenements: {
      key: 'evenements',
      table: 'evenements',
      formId: 'evenements-form',
      listId: 'evenements-list-admin',
      messageId: 'evenements-message-bar',
      hiddenId: 'evenements-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'evenements-titre', key: 'titre', type: 'text' },
        { id: 'evenements-date', key: 'date', type: 'text' },
        { id: 'evenements-location', key: 'location', type: 'text' },
        { id: 'evenements-desc', key: 'desc', type: 'text' },
        { id: 'evenements-image-url', key: 'image_url', type: 'text' },
        { id: 'evenements-sort-order', key: 'sort_order', type: 'number' },
        { id: 'evenements-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || 'Evenement'; },
      summary: function(row) { return [row.date, row.location, row.desc].filter(Boolean).join(' - '); }
    },
    medias: {
      key: 'medias',
      table: 'media_items',
      formId: 'medias-form',
      listId: 'medias-list-admin',
      messageId: 'medias-message-bar',
      hiddenId: 'medias-id',
      defaults: { sort_order: 0, is_published: true, is_featured: false },
      fields: [
        { id: 'medias-titre', key: 'titre', type: 'text' },
        { id: 'medias-categorie', key: 'categorie', type: 'text' },
        { id: 'medias-description', key: 'description', type: 'text' },
        { id: 'medias-url', key: 'url', type: 'text' },
        { id: 'medias-link-label', key: 'link_label', type: 'text' },
        { id: 'medias-sort-order', key: 'sort_order', type: 'number' },
        { id: 'medias-is-featured', key: 'is_featured', type: 'checkbox' },
        { id: 'medias-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || 'Media'; },
      summary: function(row) { return [row.categorie, row.description].filter(Boolean).join(' - '); }
    },
    communautes: {
      key: 'communautes',
      table: 'communautes',
      formId: 'communautes-form',
      listId: 'communautes-list-admin',
      messageId: 'communautes-message-bar',
      hiddenId: 'communautes-id',
      defaults: { active: true },
      fields: [
        { id: 'communautes-nom', key: 'nom', type: 'text' },
        { id: 'communautes-district', key: 'district_apostolique', type: 'text' },
        { id: 'communautes-quartier', key: 'quartier', type: 'text' },
        { id: 'communautes-zone', key: 'zone', type: 'text' },
        { id: 'communautes-responsable', key: 'responsable', type: 'text' },
        { id: 'communautes-latitude', key: 'latitude', type: 'number' },
        { id: 'communautes-longitude', key: 'longitude', type: 'number' },
        { id: 'communautes-adresse', key: 'adresse', type: 'text' },
        { id: 'communautes-point-repere', key: 'point_repere', type: 'text' },
        { id: 'communautes-description', key: 'description', type: 'text' },
        { id: 'communautes-active', key: 'active', type: 'checkbox' }
      ],
      title: function(row) { return row.nom || 'Communaute'; },
      summary: function(row) { return [row.quartier, row.district_apostolique, row.responsable].filter(Boolean).join(' - '); }
    },
    publications: {
      key: 'publications',
      table: 'publications',
      formId: 'publications-form',
      listId: 'publications-list-admin',
      messageId: 'publications-message-bar',
      hiddenId: 'publications-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'publications-titre', key: 'titre', type: 'text' },
        { id: 'publications-date', key: 'date', type: 'text' },
        { id: 'publications-categorie', key: 'categorie', type: 'text' },
        { id: 'publications-contenu', key: 'contenu', type: 'richtext' },
        { id: 'publications-image-url', key: 'image_url', type: 'url' },
        { id: 'publications-lien', key: 'lien', type: 'url' },
        { id: 'publications-sort-order', key: 'sort_order', type: 'number' },
        { id: 'publications-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || 'Publication'; },
      summary: function(row) { return [row.date, row.categorie].filter(Boolean).join(' - '); }
    },
    galerie: {
      key: 'galerie',
      table: 'galerie_images',
      formId: 'galerie-form',
      listId: 'galerie-list-admin',
      messageId: 'galerie-message-bar',
      hiddenId: 'galerie-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'galerie-titre', key: 'titre', type: 'text' },
        { id: 'galerie-categorie', key: 'categorie', type: 'text' },
        { id: 'galerie-image-url', key: 'image_url', type: 'text' },
        { id: 'galerie-description', key: 'description', type: 'text' },
        { id: 'galerie-sort-order', key: 'sort_order', type: 'number' },
        { id: 'galerie-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.titre || row.categorie || 'Image'; },
      summary: function(row) {
        return [row.categorie, row.description].filter(Boolean).join(' - ');
      }
    },
    professions: {
      key: 'professions',
      table: 'professions',
      formId: 'professions-form',
      listId: 'professions-list-admin',
      messageId: 'professions-message-bar',
      hiddenId: 'professions-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'professions-nom', key: 'nom', type: 'text' },
        { id: 'professions-titre', key: 'titre', type: 'text' },
        { id: 'professions-role', key: 'role', type: 'text' },
        { id: 'professions-description', key: 'description', type: 'textarea' },
        { id: 'professions-photo-url', key: 'photo_url', type: 'url' },
        { id: 'professions-email', key: 'email', type: 'text' },
        { id: 'professions-sort-order', key: 'sort_order', type: 'number' },
        { id: 'professions-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.nom || 'Profession'; },
      summary: function(row) { return [row.role, row.titre].filter(Boolean).join(' - '); }
    },
    versets_quotidiens: {
      key: 'versets_quotidiens',
      table: 'versets_quotidiens',
      formId: 'versets-quotidiens-form',
      listId: 'versets-quotidiens-list-admin',
      messageId: 'versets-quotidiens-message-bar',
      hiddenId: 'versets-quotidiens-id',
      defaults: { sort_order: 0, is_published: true },
      fields: [
        { id: 'versets-quotidiens-texte', key: 'texte', type: 'textarea' },
        { id: 'versets-quotidiens-reference', key: 'reference', type: 'text' },
        { id: 'versets-quotidiens-source', key: 'source', type: 'text' },
        { id: 'versets-quotidiens-sort-order', key: 'sort_order', type: 'number' },
        { id: 'versets-quotidiens-is-published', key: 'is_published', type: 'checkbox' }
      ],
      title: function(row) { return row.reference || 'Verset'; },
      summary: function(row) { return row.texte ? row.texte.substring(0, 80) : ''; }
    }
  };

  function sbHeaders(preferRepresentation) {
    var headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };

    if (preferRepresentation) {
      headers.Prefer = 'return=representation';
    }

    return headers;
  }

  function request(path, options) {
    options = options || {};
    return fetch(SUPABASE_URL + '/rest/v1/' + path, {
      method: options.method || 'GET',
      headers: sbHeaders(options.returnRepresentation),
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          throw new Error(text || ('Erreur ' + response.status));
        });
      }

      if (response.status === 204) {
        return null;
      }

      return response.text().then(function(text) {
        return text ? JSON.parse(text) : null;
      });
    });
  }

  function getAuthorizedUsers() {
    if (Array.isArray(window.ADMIN_USERS) && window.ADMIN_USERS.length) {
      return window.ADMIN_USERS.map(function(user) {
        return {
          email: String(user.email || '').toLowerCase().trim(),
          role: user.role === 'superadmin' ? 'superadmin' : 'admin',
          name: user.name || ''
        };
      }).filter(function(user) {
        return !!user.email;
      });
    }

    if (Array.isArray(window.ADMIN_ALLOWED_EMAILS) && window.ADMIN_ALLOWED_EMAILS.length) {
      return window.ADMIN_ALLOWED_EMAILS.map(function(email) {
        return { email: String(email || '').toLowerCase().trim(), role: 'admin', name: '' };
      });
    }

    if (window.ADMIN_ALLOWED_EMAIL) {
      return [{
        email: String(window.ADMIN_ALLOWED_EMAIL).toLowerCase().trim(),
        role: 'superadmin',
        name: ''
      }];
    }

    return [];
  }

  function getUserByEmail(email) {
    var needle = String(email || '').toLowerCase().trim();
    return getAuthorizedUsers().find(function(user) {
      return user.email === needle;
    }) || null;
  }

  function getEmailFromJwt(token) {
    try {
      var parts = String(token || '').split('.');
      if (parts.length < 2) return '';
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(atob(payload).split('').map(function(char) {
        return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return (JSON.parse(json).email || '').toLowerCase().trim();
    } catch (error) {
      return '';
    }
  }

  function showLogin(message) {
    if (contentEl) contentEl.style.display = 'none';
    if (loginEl) loginEl.style.display = 'grid';
    if (loginMsg) {
      loginMsg.textContent = message || '';
      loginMsg.style.color = message ? '#b71c1c' : 'inherit';
    }
  }

  function showAdmin(user) {
    if (loginEl) loginEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

    state.user = user;
    if (adminUserEmail) {
      adminUserEmail.textContent = user.email + ' - ' + user.role;
    }
    if (roleBadge) {
      roleBadge.textContent = user.role;
    }

    document.querySelectorAll('[data-role="superadmin"]').forEach(function(element) {
      if (user.role === 'superadmin') {
        element.classList.remove('hidden-by-role');
      } else {
        element.classList.add('hidden-by-role');
      }
    });
  }

  function setSession(user) {
    try {
      sessionStorage.setItem(SESSION_KEY, user.email);
      sessionStorage.setItem(SESSION_ROLE, user.role);
      sessionStorage.setItem(SESSION_UNTIL, String(Date.now() + SESSION_HOURS * 60 * 60 * 1000));
    } catch (error) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_ROLE);
      sessionStorage.removeItem(SESSION_UNTIL);
    } catch (error) {}
  }

  function getSessionUser() {
    try {
      var email = sessionStorage.getItem(SESSION_KEY);
      var until = parseInt(sessionStorage.getItem(SESSION_UNTIL), 10);
      if (!email || !until || until < Date.now()) return null;
      return getUserByEmail(email);
    } catch (error) {
      return null;
    }
  }

  function showMessage(targetId, type, message) {
    var target = document.getElementById(targetId);
    if (!target) return;
    target.className = 'message-bar show ' + type;
    target.textContent = message;
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function sortRows(rows) {
    return rows.slice().sort(function(a, b) {
      var aOrder = typeof a.sort_order === 'number' ? a.sort_order : 999999;
      var bOrder = typeof b.sort_order === 'number' ? b.sort_order : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      var aDate = a.created_at || a.updated_at || '';
      var bDate = b.created_at || b.updated_at || '';
      return aDate < bDate ? 1 : -1;
    });
  }

  function initQuillEditor(textareaId) {
    var textarea = document.getElementById(textareaId);
    if (!textarea) return null;

    var editorId = textareaId + '-editor';
    var editorEl = document.getElementById(editorId);
    if (!editorEl) return null;

    if (QUILL_EDITORS[textareaId]) {
      return QUILL_EDITORS[textareaId];
    }

    var quill = new Quill(editorEl, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'blockquote', 'code-block'],
          ['clean']
        ]
      }
    });

    quill.root.innerHTML = textarea.value || '';
    QUILL_EDITORS[textareaId] = quill;

    return quill;
  }

  function syncQuillToTextarea(textareaId) {
    var quill = QUILL_EDITORS[textareaId];
    var textarea = document.getElementById(textareaId);
    if (quill && textarea) {
      textarea.value = quill.root.innerHTML;
    }
  }

  function bindImagePreview(urlInputId, previewContainerId) {
    var input = document.getElementById(urlInputId);
    var container = document.getElementById(previewContainerId);
    if (!input || !container) return;

    function updatePreview() {
      var url = input.value.trim();
      if (url) {
        container.innerHTML = '<div class="preview-box show"><img src="' + escapeHtml(url) + '" alt="Apercu" onerror="this.parentElement.style.display=\'none\'"></div>';
      } else {
        container.innerHTML = '';
      }
    }

    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  }

  function bindImageUpload(btnId, fileId, urlId, previewId) {
    var btn = document.getElementById(btnId);
    var fileInput = document.getElementById(fileId);
    var urlInput = document.getElementById(urlId);
    var previewContainer = document.getElementById(previewId);
    if (!btn || !fileInput || !urlInput) return;

    fileInput.addEventListener('change', function() {
      var file = fileInput.files && fileInput.files[0];
      if (!file || !previewContainer) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        previewContainer.innerHTML = '<div class="preview-box show"><img src="' + e.target.result + '" alt="Apercu"></div>';
      };
      reader.readAsDataURL(file);
    });

    btn.addEventListener('click', function() {
      var file = fileInput.files && fileInput.files[0];
      if (!file) { alert('Selectionnez d abord un fichier.'); return; }
      btn.disabled = true;
      btn.textContent = 'Upload...';
      uploadImage(file).then(function(url) {
        urlInput.value = url;
        if (previewContainer) {
          previewContainer.innerHTML = '<div class="preview-box show"><img src="' + escapeHtml(url) + '" alt="Apercu"></div>';
        }
        alert('Image uploadee avec succes !');
        btn.disabled = false;
        btn.textContent = 'Uploader image';
      }).catch(function(err) {
        alert('Erreur upload: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Uploader image';
      });
    });
  }

  function readField(field) {
    if (field.type === 'richtext') {
      var quill = QUILL_EDITORS[field.id];
      if (quill) {
        return quill.root.innerHTML.trim();
      }
      var input = document.getElementById(field.id);
      return input ? input.value.trim() : null;
    }

    var input = document.getElementById(field.id);
    if (!input) return null;

    if (field.type === 'checkbox') {
      return !!input.checked;
    }

    if (field.type === 'number') {
      return input.value === '' ? null : Number(input.value);
    }

    return input.value.trim();
  }

  function writeField(field, value) {
    if (field.type === 'richtext') {
      var input = document.getElementById(field.id);
      if (input) {
        input.value = value == null ? '' : value;
      }
      var quill = QUILL_EDITORS[field.id];
      if (quill) {
        quill.root.innerHTML = value == null ? '' : value;
      }
      return;
    }

    var input = document.getElementById(field.id);
    if (!input) return;

    if (field.type === 'checkbox') {
      input.checked = !!value;
      return;
    }

    input.value = value == null ? '' : value;
  }

  function getEntityPayload(config) {
    var payload = {};
    config.fields.forEach(function(field) {
      payload[field.key] = readField(field);
    });
    return payload;
  }

  function fillEntityForm(config, row) {
    document.getElementById(config.hiddenId).value = row.id || '';
    config.fields.forEach(function(field) {
      writeField(field, row[field.key]);
    });
  }

  function resetEntityForm(config) {
    var form = document.getElementById(config.formId);
    if (form) {
      form.reset();
    }
    document.getElementById(config.hiddenId).value = '';
    Object.keys(config.defaults || {}).forEach(function(key) {
      var field = config.fields.find(function(item) { return item.key === key; });
      if (field) {
        writeField(field, config.defaults[key]);
      }
    });
    (config.fields || []).forEach(function(field) {
      if (field.type === 'richtext') {
        var quill = QUILL_EDITORS[field.id];
        if (quill) {
          quill.root.innerHTML = '';
        }
        var input = document.getElementById(field.id);
        if (input) {
          input.value = '';
        }
      }
    });
  }

  function renderList(config, rows) {
    var container = document.getElementById(config.listId);
    if (!container) return;

    if (!rows.length) {
      container.innerHTML = '<div class="list-item"><div><strong>Aucun enregistrement</strong><p class="meta">Ajoutez votre premier contenu depuis le formulaire ci-dessus.</p></div></div>';
      return;
    }

    container.innerHTML = rows.map(function(row) {
      var meta = [];
      if (row.date) meta.push(row.date);
      if (row.categorie) meta.push(row.categorie);
      if (row.location) meta.push(row.location);
      if (typeof row.is_published === 'boolean') meta.push(row.is_published ? 'publie' : 'brouillon');
      if (typeof row.active === 'boolean') meta.push(row.active ? 'active' : 'inactive');

      return '<div class="list-item">' +
        '<div>' +
          '<strong>' + escapeHtml(config.title(row)) + '</strong>' +
          '<p>' + escapeHtml(config.summary(row)) + '</p>' +
          '<p class="meta">' + escapeHtml(meta.join(' | ')) + '</p>' +
        '</div>' +
        '<div class="list-actions">' +
          '<button type="button" class="btn-small btn-edit" data-edit-' + config.key + '="' + row.id + '">Modifier</button>' +
          '<button type="button" class="btn-small btn-delete" data-delete-' + config.key + '="' + row.id + '">Supprimer</button>' +
        '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('[data-edit-' + config.key + ']').forEach(function(button) {
      button.addEventListener('click', function() {
        var id = Number(button.getAttribute('data-edit-' + config.key));
        var row = state[config.key].find(function(item) { return item.id === id; });
        if (row) {
          fillEntityForm(config, row);
          showMessage(config.messageId, 'success', 'Mode modification active pour "' + config.title(row) + '".');
        }
      });
    });

    container.querySelectorAll('[data-delete-' + config.key + ']').forEach(function(button) {
      button.addEventListener('click', function() {
        var id = Number(button.getAttribute('data-delete-' + config.key));
        deleteEntity(config, id);
      });
    });
  }

  function loadEntity(config) {
    return request(config.table + '?select=*').then(function(rows) {
      state[config.key] = sortRows(Array.isArray(rows) ? rows : []);
      renderList(config, state[config.key]);
    });
  }

  function saveEntity(config, event) {
    event.preventDefault();

    (config.fields || []).forEach(function(field) {
      if (field.type === 'richtext') {
        syncQuillToTextarea(field.id);
      }
    });

    var payload = getEntityPayload(config);
    var id = document.getElementById(config.hiddenId).value;
    var path = config.table;
    var method = 'POST';

    if (id) {
      method = 'PATCH';
      path += '?id=eq.' + encodeURIComponent(id);
    }

    request(path, {
      method: method,
      body: method === 'POST' ? [payload] : payload,
      returnRepresentation: method === 'POST'
    }).then(function() {
      showMessage(config.messageId, 'success', 'Enregistrement effectue avec succes.');
      resetEntityForm(config);
      return loadEntity(config);
    }).then(function() {
      refreshDashboard();
      if (config.key === 'communautes') {
        refreshCommunitySelect();
      }
    }).catch(function(error) {
      showMessage(config.messageId, 'error', 'Erreur: ' + error.message);
    });
  }

  function deleteEntity(config, id) {
    if (!window.confirm('Supprimer cet element ?')) return;

    request(config.table + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE'
    }).then(function() {
      showMessage(config.messageId, 'success', 'Element supprime.');
      resetEntityForm(config);
      return loadEntity(config);
    }).then(function() {
      refreshDashboard();
      if (config.key === 'communautes') {
        refreshCommunitySelect();
      }
    }).catch(function(error) {
      showMessage(config.messageId, 'error', 'Erreur: ' + error.message);
    });
  }

  function loadSettings() {
    return request('site_settings?select=*&id=eq.1&limit=1')
      .then(function(rows) {
        state.settings = rows && rows[0] ? rows[0] : {};
      })
      .catch(function() {
        state.settings = {};
      })
      .then(function() {
        document.getElementById('settings-notification-html').value = state.settings.notification_html || '';
        document.getElementById('settings-home-welcome-text').value = state.settings.home_welcome_text || '';
        document.getElementById('settings-home-verse-text').value = state.settings.home_verse_text || '';
        document.getElementById('settings-home-verse-ref').value = state.settings.home_verse_ref || '';
        document.getElementById('settings-contact-email').value = state.settings.contact_email || '';
        document.getElementById('settings-contact-phone').value = state.settings.contact_phone || '';
        document.getElementById('settings-contact-address').value = state.settings.contact_address || '';
        document.getElementById('settings-contact-map').value = state.settings.contact_map_embed_url || '';
        document.getElementById('settings-youtube').value = state.settings.youtube_url || '';
        document.getElementById('settings-facebook').value = state.settings.facebook_url || '';
        document.getElementById('settings-whatsapp').value = state.settings.whatsapp_url || '';
        document.getElementById('settings-nac').value = state.settings.nac_today_url || '';
      });
  }

  function saveSettings(event) {
    event.preventDefault();

    var payload = {
      id: 1,
      notification_html: document.getElementById('settings-notification-html').value.trim(),
      home_welcome_text: document.getElementById('settings-home-welcome-text').value.trim(),
      home_verse_text: document.getElementById('settings-home-verse-text').value.trim(),
      home_verse_ref: document.getElementById('settings-home-verse-ref').value.trim(),
      contact_email: document.getElementById('settings-contact-email').value.trim(),
      contact_phone: document.getElementById('settings-contact-phone').value.trim(),
      contact_address: document.getElementById('settings-contact-address').value.trim(),
      contact_map_embed_url: document.getElementById('settings-contact-map').value.trim(),
      youtube_url: document.getElementById('settings-youtube').value.trim(),
      facebook_url: document.getElementById('settings-facebook').value.trim(),
      whatsapp_url: document.getElementById('settings-whatsapp').value.trim(),
      nac_today_url: document.getElementById('settings-nac').value.trim(),
      updated_by: state.user ? state.user.email : ''
    };

    var method = state.settings && state.settings.id ? 'PATCH' : 'POST';
    var path = method === 'PATCH' ? 'site_settings?id=eq.1' : 'site_settings';
    var body = method === 'PATCH' ? payload : [payload];

    request(path, {
      method: method,
      body: body,
      returnRepresentation: method === 'POST'
    }).then(function() {
      showMessage('settings-message', 'success', 'Parametres sauvegardes.');
      return loadSettings();
    }).catch(function(error) {
      showMessage('settings-message', 'error', 'Erreur: ' + error.message);
    });
  }

  function refreshDashboard() {
    if (!dashboardStats) return;

    var stats = [
      { label: 'Annonces', value: state.annonces.length },
      { label: 'Actualites', value: state.actualites.length },
      { label: 'Evenements', value: state.evenements.length },
      { label: 'Medias', value: state.medias.length },
      { label: 'Galerie', value: state.galerie ? state.galerie.length : 0 },
      { label: 'Publications', value: state.publications.length },
      { label: 'Professions', value: state.professions.length },
      { label: 'Communautes', value: state.communautes.length },
      { label: 'Versets quotidiens', value: state.versets_quotidiens ? state.versets_quotidiens.length : 0 }
    ];

    dashboardStats.innerHTML = stats.map(function(item) {
      return '<div class="stat-card"><strong>' + item.value + '</strong><span>' + item.label + '</span></div>';
    }).join('');
  }

  function refreshCommunitySelect() {
    if (!relationsCommunauteSelect) return;

    var options = '<option value="">Choisir une communaute</option>' + state.communautes.map(function(item) {
      return '<option value="' + item.id + '">' + escapeHtml(item.nom || ('Communaute #' + item.id)) + '</option>';
    }).join('');

    relationsCommunauteSelect.innerHTML = options;
    if (state.communautes[0] && !relationsCommunauteSelect.value) {
      relationsCommunauteSelect.value = String(state.communautes[0].id);
    }
    refreshRelations();
  }

  function getSelectedCommunauteId() {
    return Number(relationsCommunauteSelect && relationsCommunauteSelect.value ? relationsCommunauteSelect.value : 0);
  }

  function renderSimpleRelationList(containerId, rows, formatter, tableName) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!rows.length) {
      container.innerHTML = '<div class="list-item"><div><strong>Aucun element</strong><p class="meta">Ajoutez un element pour cette communaute.</p></div></div>';
      return;
    }

    container.innerHTML = rows.map(function(row) {
      return '<div class="list-item">' +
        '<div><strong>' + escapeHtml(formatter.title(row)) + '</strong><p>' + escapeHtml(formatter.summary(row)) + '</p></div>' +
        '<div class="list-actions"><button type="button" class="btn-small btn-delete" data-delete-relation="' + tableName + '" data-id="' + row.id + '">Supprimer</button></div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('[data-delete-relation]').forEach(function(button) {
      button.addEventListener('click', function() {
        deleteRelation(button.getAttribute('data-delete-relation'), Number(button.getAttribute('data-id')));
      });
    });
  }

  function refreshRelations() {
    var communauteId = getSelectedCommunauteId();
    if (!communauteId) {
      renderSimpleRelationList('contacts-list-admin', [], { title: function() { return ''; }, summary: function() { return ''; } }, 'contacts_communaute');
      renderSimpleRelationList('horaires-list-admin', [], { title: function() { return ''; }, summary: function() { return ''; } }, 'horaires_services');
      renderSimpleRelationList('activites-list-admin', [], { title: function() { return ''; }, summary: function() { return ''; } }, 'activites_communaute');
      return Promise.resolve();
    }

    return Promise.all([
      request('contacts_communaute?select=*&communaute_id=eq.' + communauteId),
      request('horaires_services?select=*&communaute_id=eq.' + communauteId),
      request('activites_communaute?select=*&communaute_id=eq.' + communauteId)
    ]).then(function(results) {
      state.contacts = results[0] || [];
      state.horaires = results[1] || [];
      state.activites = results[2] || [];

      renderSimpleRelationList('contacts-list-admin', state.contacts, {
        title: function(row) { return row.type || 'Contact'; },
        summary: function(row) { return row.valeur || ''; }
      }, 'contacts_communaute');

      renderSimpleRelationList('horaires-list-admin', state.horaires, {
        title: function(row) { return row.jour || 'Horaire'; },
        summary: function(row) { return (row.heure_debut || '') + ' - ' + (row.heure_fin || '') + ' (' + (row.type_service || '') + ')'; }
      }, 'horaires_services');

      renderSimpleRelationList('activites-list-admin', state.activites, {
        title: function(row) { return row.activite || 'Activite'; },
        summary: function(row) { return [row.jour, row.heure, row.description].filter(Boolean).join(' - '); }
      }, 'activites_communaute');
    }).catch(function(error) {
      showMessage('relations-message-bar', 'error', 'Erreur: ' + error.message);
    });
  }

  function addContact(event) {
    event.preventDefault();
    var communauteId = getSelectedCommunauteId();
    if (!communauteId) {
      showMessage('relations-message-bar', 'error', 'Choisissez une communaute avant d ajouter un contact.');
      return;
    }

    request('contacts_communaute', {
      method: 'POST',
      body: [{
        communaute_id: communauteId,
        type: document.getElementById('contacts-type').value,
        valeur: document.getElementById('contacts-valeur').value.trim(),
        is_primary: document.getElementById('contacts-is-primary').checked
      }],
      returnRepresentation: true
    }).then(function() {
      document.getElementById('contacts-form').reset();
      showMessage('relations-message-bar', 'success', 'Contact ajoute.');
      return refreshRelations();
    }).catch(function(error) {
      showMessage('relations-message-bar', 'error', 'Erreur: ' + error.message);
    });
  }

  function addHoraire(event) {
    event.preventDefault();
    var communauteId = getSelectedCommunauteId();
    if (!communauteId) {
      showMessage('relations-message-bar', 'error', 'Choisissez une communaute avant d ajouter un horaire.');
      return;
    }

    request('horaires_services', {
      method: 'POST',
      body: [{
        communaute_id: communauteId,
        jour: document.getElementById('horaires-jour').value.trim(),
        heure_debut: document.getElementById('horaires-debut').value,
        heure_fin: document.getElementById('horaires-fin').value,
        type_service: document.getElementById('horaires-type').value
      }],
      returnRepresentation: true
    }).then(function() {
      document.getElementById('horaires-form').reset();
      showMessage('relations-message-bar', 'success', 'Horaire ajoute.');
      return refreshRelations();
    }).catch(function(error) {
      showMessage('relations-message-bar', 'error', 'Erreur: ' + error.message);
    });
  }

  function addActivite(event) {
    event.preventDefault();
    var communauteId = getSelectedCommunauteId();
    if (!communauteId) {
      showMessage('relations-message-bar', 'error', 'Choisissez une communaute avant d ajouter une activite.');
      return;
    }

    request('activites_communaute', {
      method: 'POST',
      body: [{
        communaute_id: communauteId,
        jour: document.getElementById('activites-jour').value.trim(),
        heure: document.getElementById('activites-heure').value,
        activite: document.getElementById('activites-nom').value.trim(),
        description: document.getElementById('activites-description').value.trim()
      }],
      returnRepresentation: true
    }).then(function() {
      document.getElementById('activites-form').reset();
      showMessage('relations-message-bar', 'success', 'Activite ajoutee.');
      return refreshRelations();
    }).catch(function(error) {
      showMessage('relations-message-bar', 'error', 'Erreur: ' + error.message);
    });
  }

  function deleteRelation(table, id) {
    if (!window.confirm('Supprimer cet element ?')) return;

    request(table + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE'
    }).then(function() {
      showMessage('relations-message-bar', 'success', 'Element supprime.');
      return refreshRelations();
    }).catch(function(error) {
      showMessage('relations-message-bar', 'error', 'Erreur: ' + error.message);
    });
  }

  function bindMenu() {
    document.querySelectorAll('#admin-menu button').forEach(function(button) {
      button.addEventListener('click', function() {
        var section = button.getAttribute('data-section');
        document.querySelectorAll('#admin-menu button').forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        document.querySelectorAll('.section-screen').forEach(function(screen) {
          screen.classList.toggle('active', screen.id === 'screen-' + section);
        });
      });
    });
  }

  function bindForms() {
    Object.keys(entityConfigs).forEach(function(key) {
      var config = entityConfigs[key];
      var form = document.getElementById(config.formId);
      if (form) {
        form.addEventListener('submit', function(event) {
          saveEntity(config, event);
        });
      }
      resetEntityForm(config);
    });

    document.querySelectorAll('[data-reset-form]').forEach(function(button) {
      button.addEventListener('click', function() {
        var formId = button.getAttribute('data-reset-form');
        Object.keys(entityConfigs).forEach(function(key) {
          if (entityConfigs[key].formId === formId) {
            resetEntityForm(entityConfigs[key]);
          }
        });
      });
    });

    initQuillEditor('actualites-contenu');
    initQuillEditor('publications-contenu');

    bindImageUpload('actualites-upload-btn', 'actualites-image-upload', 'actualites-image-url', 'actualites-image-preview');
    bindImageUpload('publications-upload-btn', 'publications-image-upload', 'publications-image-url', 'publications-image-preview');
    bindImageUpload('galerie-upload-btn', 'galerie-image-upload', 'galerie-image-url', 'galerie-image-preview');
    bindImageUpload('professions-upload-btn', 'professions-photo-upload', 'professions-photo-url', null);

    bindImagePreview('actualites-image-url', 'actualites-image-preview');
    bindImagePreview('publications-image-url', 'publications-image-preview');
    bindImagePreview('galerie-image-url', 'galerie-image-preview');
    bindImagePreview('professions-photo-url', null);

    var settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', saveSettings);

    var contactsForm = document.getElementById('contacts-form');
    if (contactsForm) contactsForm.addEventListener('submit', addContact);

    var horairesForm = document.getElementById('horaires-form');
    if (horairesForm) horairesForm.addEventListener('submit', addHoraire);

    var activitesForm = document.getElementById('activites-form');
    if (activitesForm) activitesForm.addEventListener('submit', addActivite);

    if (relationsCommunauteSelect) {
      relationsCommunauteSelect.addEventListener('change', refreshRelations);
    }

    var logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        clearSession();
        window.location.reload();
      });
    }
  }

  function loadAllData() {
    var tasks = Object.keys(entityConfigs).map(function(key) {
      return loadEntity(entityConfigs[key]);
    });

    if (state.user && state.user.role === 'superadmin') {
      tasks.push(loadSettings());
    }

    return Promise.all(tasks).then(function() {
      refreshDashboard();
      refreshCommunitySelect();
    });
  }

  function renderGoogleButton() {
    var clientId = (window.ADMIN_GOOGLE_CLIENT_ID || '').trim();
    if (!clientId || !googleBtnEl) {
      showLogin('Configurez admin-config.js avec ADMIN_USERS et ADMIN_GOOGLE_CLIENT_ID.');
      return;
    }

    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      showLogin('Chargement de Google Sign-In. Reessayez dans un instant.');
      setTimeout(renderGoogleButton, 500);
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: function(response) {
        var email = getEmailFromJwt(response.credential);
        var user = getUserByEmail(email);

        if (!user) {
          showLogin('Acces refuse pour ce compte Google.');
          return;
        }

        setSession(user);
        showAdmin(user);
        bindMenu();
        bindForms();
        loadAllData();
      }
    });

    google.accounts.id.renderButton(googleBtnEl, {
      theme: 'filled_blue',
      size: 'large',
      text: 'continue_with',
      width: 280
    });
  }

  function init() {
    if (!getAuthorizedUsers().length) {
      showLogin('Aucun compte admin configure. Ouvrez admin-config.js.');
      return;
    }

    var sessionUser = getSessionUser();
    if (sessionUser) {
      showAdmin(sessionUser);
      bindMenu();
      bindForms();
      loadAllData();
      return;
    }

    showLogin('');
    renderGoogleButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
