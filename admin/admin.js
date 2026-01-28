/**
 * Admin Église Néo-Apostolique – Accès réservé au(x) Gmail configuré(s) dans admin-config.js
 * Stockage : enac-notif, enac-actualites, enac-evenements (localStorage)
 */
(function() {
  'use strict';

  var SESSION_KEY = 'enac-admin-email';
  var SESSION_UNTIL = 'enac-admin-until';
  var SESSION_HOURS = 12;

  var loginEl = document.getElementById('admin-login');
  var contentEl = document.getElementById('admin-content');
  var loginMsg = document.getElementById('login-msg');
  var googleBtnEl = document.getElementById('google-btn');

  function allowedEmails() {
    var e = window.ADMIN_ALLOWED_EMAIL;
    var list = window.ADMIN_ALLOWED_EMAILS;
    if (list && Array.isArray(list)) return list.map(function(x) { return (x || '').toLowerCase().trim(); });
    if (e && typeof e === 'string') return [e.toLowerCase().trim()];
    return [];
  }

  function isAllowed(email) {
    var em = (email || '').toLowerCase().trim();
    return allowedEmails().indexOf(em) !== -1;
  }

  function getEmailFromJwt(token) {
    try {
      var parts = (token || '').split('.');
      if (parts.length < 2) return '';
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      var data = JSON.parse(json);
      return (data.email || '').toLowerCase().trim();
    } catch (e) {
      return '';
    }
  }

  function showLogin(err) {
    if (contentEl) contentEl.style.display = 'none';
    if (loginEl) {
      loginEl.style.display = 'block';
      if (loginMsg) {
        loginMsg.textContent = err || '';
        loginMsg.className = 'msg' + (err ? ' error' : '');
      }
    }
  }

  function showAdmin() {
    if (loginEl) loginEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
  }

  function sessionValid() {
    try {
      var email = sessionStorage.getItem(SESSION_KEY);
      var until = parseInt(sessionStorage.getItem(SESSION_UNTIL), 10);
      if (!email || !until || until < Date.now()) return false;
      return isAllowed(email);
    } catch (e) {
      return false;
    }
  }

  function setSession(email) {
    try {
      sessionStorage.setItem(SESSION_KEY, email);
      sessionStorage.setItem(SESSION_UNTIL, String(Date.now() + SESSION_HOURS * 60 * 60 * 1000));
    } catch (e) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_UNTIL);
    } catch (e) {}
  }

  function runInitAdmin() {
    var NOTIF_KEY = 'enac-notif';
    var ACTU_KEY = 'enac-actualites';
    var EV_KEY = 'enac-evenements';

    function getJson(key, def) {
      try {
        var s = localStorage.getItem(key);
        return s ? JSON.parse(s) : (def || []);
      } catch (e) {
        return def || [];
      }
    }
    function setJson(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (e) {
        return false;
      }
    }

    var notifInput = document.getElementById('notif-input');
    var saveNotif = document.getElementById('save-notif');
    var notifMsg = document.getElementById('notif-msg');
    if (notifInput && saveNotif) {
      notifInput.value = localStorage.getItem(NOTIF_KEY) || 'Prochain culte dominical : dimanche 9h00. <a href="cultes.html">Voir les horaires</a>';
      saveNotif.addEventListener('click', function() {
        var v = notifInput.value.trim();
        localStorage.setItem(NOTIF_KEY, v || '');
        if (notifMsg) notifMsg.textContent = 'Enregistré. Rechargez la page d\'accueil pour voir le changement.';
      });
    }

    var actuList = document.getElementById('actu-list');
    var actuTitre = document.getElementById('act-titre');
    var actuDate = document.getElementById('act-date');
    var actuContenu = document.getElementById('act-contenu');
    var addActu = document.getElementById('add-actu');
    function renderActu() {
      var list = getJson(ACTU_KEY, []);
      if (!actuList) return;
      actuList.innerHTML = list.length ? list.map(function(a, i) {
        return '<li><span><strong>' + (a.titre || 'Sans titre') + '</strong> – ' + (a.date || '') + '</span><button type="button" class="del" data-i="' + i + '">Supprimer</button></li>';
      }).join('') : '<li style="color:var(--text-muted);">Aucune actualité.</li>';
      actuList.querySelectorAll('.del').forEach(function(b) {
        b.addEventListener('click', function() {
          var i = parseInt(b.getAttribute('data-i'), 10);
          var arr = getJson(ACTU_KEY, []);
          arr.splice(i, 1);
          setJson(ACTU_KEY, arr);
          renderActu();
        });
      });
    }
    if (addActu && actuTitre && actuDate && actuContenu) {
      addActu.addEventListener('click', function() {
        var titre = actuTitre.value.trim();
        if (!titre) return;
        var arr = getJson(ACTU_KEY, []);
        arr.unshift({ titre: titre, date: actuDate.value.trim(), contenu: actuContenu.value.trim() });
        setJson(ACTU_KEY, arr);
        actuTitre.value = ''; actuDate.value = ''; actuContenu.value = '';
        renderActu();
      });
    }
    renderActu();

    var evList = document.getElementById('ev-list');
    var evTitre = document.getElementById('ev-titre');
    var evDate = document.getElementById('ev-date');
    var evDesc = document.getElementById('ev-desc');
    var addEv = document.getElementById('add-ev');
    function renderEv() {
      var list = getJson(EV_KEY, []);
      if (!evList) return;
      evList.innerHTML = list.length ? list.map(function(e, i) {
        return '<li><span><strong>' + (e.titre || 'Sans titre') + '</strong> – ' + (e.date || '') + '</span><button type="button" class="del" data-i="' + i + '">Supprimer</button></li>';
      }).join('') : '<li style="color:var(--text-muted);">Aucun événement.</li>';
      evList.querySelectorAll('.del').forEach(function(b) {
        b.addEventListener('click', function() {
          var i = parseInt(b.getAttribute('data-i'), 10);
          var arr = getJson(EV_KEY, []);
          arr.splice(i, 1);
          setJson(EV_KEY, arr);
          renderEv();
        });
      });
    }
    if (addEv && evTitre && evDate && evDesc) {
      addEv.addEventListener('click', function() {
        var titre = evTitre.value.trim();
        if (!titre) return;
        var arr = getJson(EV_KEY, []);
        arr.unshift({ titre: titre, date: evDate.value.trim(), desc: evDesc.value.trim() });
        setJson(EV_KEY, arr);
        evTitre.value = ''; evDate.value = ''; evDesc.value = '';
        renderEv();
      });
    }
    renderEv();
  }

  function renderGoogleButton() {
    var clientId = (window.ADMIN_GOOGLE_CLIENT_ID || '').trim();
    if (!clientId || !googleBtnEl) {
      showLogin('Configurez admin-config.js : ajoutez votre Gmail et votre Google Client ID (voir admin-config.example.js).');
      return;
    }
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      showLogin('Chargement de Google Sign-In… Réessayez dans un instant.');
      setTimeout(renderGoogleButton, 500);
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: function(res) {
        var email = getEmailFromJwt(res.credential);
        if (isAllowed(email)) {
          setSession(email);
          showAdmin();
          runInitAdmin();
        } else {
          showLogin('Accès refusé. Seul le(s) compte(s) Gmail autorisé(s) dans admin-config.js peut/peuvent se connecter.');
        }
      }
    });
    google.accounts.id.renderButton(googleBtnEl, {
      theme: 'filled_blue',
      size: 'large',
      type: 'standard',
      text: 'continue_with',
      width: 280
    });
  }

  function onLoad() {
    var logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        clearSession();
        location.reload();
      });
    }

    if (sessionValid()) {
      showAdmin();
      runInitAdmin();
      return;
    }

    showLogin();
    if (allowedEmails().length === 0 || !(window.ADMIN_GOOGLE_CLIENT_ID || '').trim()) {
      if (loginMsg) {
        loginMsg.className = 'msg error';
        loginMsg.textContent = 'Ouvrez admin-config.js et définissez ADMIN_ALLOWED_EMAIL (votre Gmail) et ADMIN_GOOGLE_CLIENT_ID. Voir admin-config.example.js pour la marche à suivre.';
      }
      return;
    }

    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      renderGoogleButton();
    } else {
      window.addEventListener('load', function once() {
        window.removeEventListener('load', once);
        setTimeout(renderGoogleButton, 100);
      });
      setTimeout(renderGoogleButton, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();
