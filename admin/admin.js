/**
 * Admin Église Néo-Apostolique – Stockage local (localStorage)
 * Clés : enac-notif, enac-actualites, enac-evenements
 */
(function() {
  'use strict';

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

  // ----- Bannière -----
  var notifInput = document.getElementById('notif-input');
  var saveNotif = document.getElementById('save-notif');
  var notifMsg = document.getElementById('notif-msg');
  if (notifInput && saveNotif) {
    notifInput.value = localStorage.getItem(NOTIF_KEY) || 'Prochain culte dominical : dimanche 9h00. <a href="cultes.html">Voir les horaires</a>';
    saveNotif.addEventListener('click', function() {
      var v = notifInput.value.trim();
      localStorage.setItem(NOTIF_KEY, v || '');
      if (notifMsg) notifMsg.textContent = 'Enregistré. Rechargez la page d’accueil pour voir le changement.';
    });
  }

  // ----- Actualités -----
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
      arr.unshift({
        titre: titre,
        date: actuDate.value.trim(),
        contenu: actuContenu.value.trim()
      });
      setJson(ACTU_KEY, arr);
      actuTitre.value = '';
      actuDate.value = '';
      actuContenu.value = '';
      renderActu();
    });
  }
  renderActu();

  // ----- Événements -----
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
      arr.unshift({
        titre: titre,
        date: evDate.value.trim(),
        desc: evDesc.value.trim()
      });
      setJson(EV_KEY, arr);
      evTitre.value = '';
      evDate.value = '';
      evDesc.value = '';
      renderEv();
    });
  }
  renderEv();
})();
