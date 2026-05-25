/**
 * Admin Église Néo-Apostolique – Accès réservé aux gestionnaires autorisés.
 * Stockage : Supabase (tables settings, actualites, evenements)
 */
(function() {
  'use strict';

  var SESSION_KEY = 'enac-admin-email';
  var SESSION_TOKEN_KEY = 'enac-admin-token';
  var SESSION_ROLE_KEY = 'enac-admin-role';
  var SESSION_UNTIL = 'enac-admin-until';

  var loginEl = document.getElementById('admin-login');
  var contentEl = document.getElementById('admin-content');
  var loginMsg = document.getElementById('login-msg');
  var loginButton = document.getElementById('admin-login-submit');
  var resetButton = document.getElementById('admin-reset-password');
  var emailInput = document.getElementById('admin-email');
  var passwordInput = document.getElementById('admin-password');
  var secretInput = document.getElementById('admin-secret');

  var config = window.ADMIN_CONFIG || {};
  var allowedEmails = (config.ALLOWED_EMAILS || []).map(function(email) { return String(email || '').toLowerCase().trim(); });
  var accessCode = String(config.ACCESS_CODE || '').trim();
  var useSupabaseAuth = config.USE_SUPABASE_AUTH === true;
  var sessionTimeout = (parseInt(config.SESSION_TIMEOUT_MINUTES, 10) || 12) * 60 * 1000;
  var SUPABASE_URL = config.SUPABASE_URL || 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY || 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  function isAllowed(email) {
    var em = (email || '').toLowerCase().trim();
    return allowedEmails.length === 0 || allowedEmails.indexOf(em) !== -1;
  }

  function isAccessCodeValid(code) {
    if (!accessCode) return true;
    return String(code || '').trim() === accessCode;
  }

  function decodeJwt(token) {
    try {
      var parts = (token || '').split('.');
      if (parts.length < 2) return null;
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function showLogin(message) {
    if (contentEl) contentEl.style.display = 'none';
    if (loginEl) {
      loginEl.style.display = 'block';
      if (loginMsg) {
        loginMsg.textContent = message || '';
        loginMsg.className = 'msg' + (message ? ' error' : '');
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
      var token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      var until = parseInt(sessionStorage.getItem(SESSION_UNTIL), 10);
      return Boolean(email && token && until && until > Date.now() && isAllowed(email));
    } catch (e) {
      return false;
    }
  }

  function setSession(email, token, role) {
    try {
      sessionStorage.setItem(SESSION_KEY, email);
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_ROLE_KEY, role || 'admin');
      sessionStorage.setItem(SESSION_UNTIL, String(Date.now() + sessionTimeout));
    } catch (e) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_ROLE_KEY);
      sessionStorage.removeItem(SESSION_UNTIL);
    } catch (e) {}
  }

  function getApiHeaders() {
    var token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + (token || SUPABASE_ANON_KEY),
      'Content-Type': 'application/json'
    };
  }

  async function signInSupabase(email, password) {
    var response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email: email, password: password })
    });

    var data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error_description || data?.error || 'Échec de l’authentification');
    }
    return data;
  }

  async function requestPasswordReset(email) {
    var response = await fetch(SUPABASE_URL + '/auth/v1/recovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email: email })
    });

    if (!response.ok) {
      var data = await response.json();
      throw new Error(data?.error_description || data?.error || 'Impossible d’envoyer la demande de réinitialisation');
    }
  }

  function getUserRoleFromToken(token) {
    var jwt = decodeJwt(token);
    if (!jwt) return null;
    return jwt.user_metadata?.role || jwt.role || null;
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

    function sbHeaders() {
      return getApiHeaders();
    }

    var notifInput = document.getElementById('notif-input');
    var saveNotif = document.getElementById('save-notif');
    var notifMsg = document.getElementById('notif-msg');

    function loadSettings() {
      return fetch(SUPABASE_URL + '/rest/v1/settings?select=html_notif&order=updated_at.desc&limit=1', {
        method: 'GET',
        headers: sbHeaders()
      }).then(function(r){ return r.json(); }).then(function(data){
        if (data && data[0] && typeof data[0].html_notif !== 'undefined') {
          if (notifInput) notifInput.value = data[0].html_notif || '';
        }
      });
    }

    if (notifInput && saveNotif) {
      loadSettings();
      saveNotif.addEventListener('click', function() {
        var v = (notifInput.value || '').trim();
        fetch(SUPABASE_URL + '/rest/v1/settings', {
          method: 'POST',
          headers: Object.assign({}, sbHeaders(), {
            'Prefer': 'return=representation'
          }),
          body: JSON.stringify([{ html_notif: v }])
        })
        .then(function(){
          if (notifMsg) notifMsg.textContent = 'Enregistré. Rechargez la page d\'accueil pour voir le changement.';
        })
        .catch(function(){
          if (notifMsg) {
            notifMsg.textContent = 'Impossible d\'enregistrer les paramètres.';
            notifMsg.className = 'msg error';
          }
        });
      });
    }

    var actuList = document.getElementById('actu-list');
    var actuTitre = document.getElementById('act-titre');
    var actuDate = document.getElementById('act-date');
    var actuContenu = document.getElementById('act-contenu');
    var addActu = document.getElementById('add-actu');

    function renderActu() {
      if (!actuList) return;
      fetch(SUPABASE_URL + '/rest/v1/actualites?select=id,titre,date&order=created_at.desc&limit=50', {
        method: 'GET',
        headers: sbHeaders()
      })
      .then(function(r){ return r.json(); })
      .then(function(list){
        if (!list || list.length === 0) {
          actuList.innerHTML = '<li style="color:var(--text-muted);">Aucune actualité.</li>';
          return;
        }
        actuList.innerHTML = list.map(function(a) {
          return '<li><span><strong>' + (a.titre || 'Sans titre') + '</strong> – ' + (a.date || '') + '</span><button type="button" class="del" data-id="' + a.id + '">Supprimer</button></li>';
        }).join('');
        actuList.querySelectorAll('.del').forEach(function(b) {
          b.addEventListener('click', function() {
            var id = b.getAttribute('data-id');
            fetch(SUPABASE_URL + '/rest/v1/actualites?id=eq.' + encodeURIComponent(id), {
              method: 'DELETE',
              headers: sbHeaders(),
            }).then(function(){ renderActu(); });
          });
        });
      })
      .catch(function(){
        actuList.innerHTML = '<li style="color:var(--text-muted);">Impossible de charger les actualités.</li>';
      });
    }

    if (addActu && actuTitre && actuDate && actuContenu) {
      addActu.addEventListener('click', function() {
        var titre = actuTitre.value.trim();
        if (!titre) return;
        var date = (actuDate.value || '').trim();
        var contenu = (actuContenu.value || '').trim();
        fetch(SUPABASE_URL + '/rest/v1/actualites', {
          method: 'POST',
          headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
          body: JSON.stringify([{ titre: titre, date: date, contenu: contenu }])
        }).then(function(){
          actuTitre.value = ''; actuDate.value = ''; actuContenu.value = '';
          renderActu();
        }).catch(function(){
          if (loginMsg) loginMsg.textContent = 'Impossible d\'ajouter l\'actualité.';
        });
      });
    }
    renderActu();

    var evList = document.getElementById('ev-list');
    var evTitre = document.getElementById('ev-titre');
    var evDate = document.getElementById('ev-date');
    var evDesc = document.getElementById('ev-desc');
    var addEv = document.getElementById('add-ev');

    function renderEv() {
      if (!evList) return;
      fetch(SUPABASE_URL + '/rest/v1/evenements?select=id,titre,date&order=created_at.desc&limit=50', {
        method: 'GET',
        headers: sbHeaders()
      })
      .then(function(r){ return r.json(); })
      .then(function(list){
        if (!list || list.length === 0) {
          evList.innerHTML = '<li style="color:var(--text-muted);">Aucun événement.</li>';
          return;
        }
        evList.innerHTML = list.map(function(e) {
          return '<li><span><strong>' + (e.titre || 'Sans titre') + '</strong> – ' + (e.date || '') + '</span><button type="button" class="del" data-id="' + e.id + '">Supprimer</button></li>';
        }).join('');
        evList.querySelectorAll('.del').forEach(function(b) {
          b.addEventListener('click', function() {
            var id = b.getAttribute('data-id');
            fetch(SUPABASE_URL + '/rest/v1/evenements?id=eq.' + encodeURIComponent(id), {
              method: 'DELETE',
              headers: sbHeaders(),
            }).then(function(){ renderEv(); });
          });
        });
      })
      .catch(function(){
        evList.innerHTML = '<li style="color:var(--text-muted);">Impossible de charger les événements.</li>';
      });
    }

    if (addEv && evTitre && evDate && evDesc) {
      addEv.addEventListener('click', function() {
        var titre = evTitre.value.trim();
        if (!titre) return;
        var date = (evDate.value || '').trim();
        var desc = (evDesc.value || '').trim();
        fetch(SUPABASE_URL + '/rest/v1/evenements', {
          method: 'POST',
          headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
          body: JSON.stringify([{ titre: titre, date: date, desc: desc }])
        }).then(function(){
          evTitre.value = ''; evDate.value = ''; evDesc.value = '';
          renderEv();
        }).catch(function(){
          if (loginMsg) loginMsg.textContent = 'Impossible d\'ajouter l\'événement.';
        });
      });
    }
    renderEv();
  }

  function handleLogin(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    var email = (emailInput && emailInput.value || '').toLowerCase().trim();
    var password = passwordInput && passwordInput.value || '';
    var secret = secretInput && secretInput.value || '';

    if (!email || !password || (accessCode && !secret)) {
      showLogin('Veuillez remplir tous les champs requis.');
      return;
    }

    if (!isAllowed(email)) {
      showLogin('Adresse email non autorisée.');
      return;
    }

    if (!isAccessCodeValid(secret)) {
      showLogin('Code d\'accès invalide.');
      return;
    }

    if (useSupabaseAuth) {
      signInSupabase(email, password)
        .then(function(authData) {
          var token = authData.access_token;
          var role = getUserRoleFromToken(token) || 'admin';
          if (role !== 'admin' && role !== 'super_admin') {
            showLogin('Le compte n\'a pas le rôle administrateur requis.');
            return;
          }
          setSession(email, token, role);
          showAdmin();
          runInitAdmin();
        })
        .catch(function(err) {
          showLogin(err.message || 'Erreur de connexion Supabase.');
        });
      return;
    }

    var token = 'local_admin_session_' + Date.now();
    setSession(email, token, 'admin');
    showAdmin();
    runInitAdmin();
  }

  function handleResetPassword(event) {
    event.preventDefault();
    var email = (emailInput && emailInput.value || '').toLowerCase().trim();
    if (!email) {
      showLogin('Entrez votre email pour réinitialiser le mot de passe.');
      return;
    }
    requestPasswordReset(email)
      .then(function() {
        showLogin('Email de réinitialisation envoyé.');
      })
      .catch(function(err) {
        showLogin(err.message || 'Erreur lors de la réinitialisation de mot de passe.');
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

    var loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (resetButton) {
      resetButton.addEventListener('click', handleResetPassword);
    }

    if (sessionValid()) {
      showAdmin();
      runInitAdmin();
      return;
    }

    showLogin();
    if (allowedEmails.length === 0) {
      if (loginMsg) {
        loginMsg.className = 'msg error';
        loginMsg.textContent = 'Ouvrez admin-config.js et définissez ADMIN_CONFIG.ALLOWED_EMAILS.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();
