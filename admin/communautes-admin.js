/**
 * Admin – Gestion des communautés (à intégrer dans admin.js ou charger en <script> séparé)
 * Ce code ajoute les fonctionnalités CRUD pour communautés, contacts, horaires et activités
 */
(function() {
  'use strict';

  // Configuration Supabase (identique au site)
  var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  function sbHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }

  // Éléments DOM
  var toggleForm = document.getElementById('toggle-comm-form');
  var commForm = document.getElementById('comm-form');
  var cancelBtn = document.getElementById('cancel-comm');
  var saveBtn = document.getElementById('save-comm');
  var commList = document.getElementById('comm-list');

  // Inputs communauté
  var inputNom = document.getElementById('comm-nom');
  var inputDistrict = document.getElementById('comm-district');
  var inputQuartier = document.getElementById('comm-quartier');
  var inputZone = document.getElementById('comm-zone');
  var inputResponsable = document.getElementById('comm-responsable');
  var inputLat = document.getElementById('comm-lat');
  var inputLng = document.getElementById('comm-lng');
  var inputAdresse = document.getElementById('comm-adresse');
  var inputRepere = document.getElementById('comm-repere');
  var inputPhoto = document.getElementById('comm-photo');
  var inputDesc = document.getElementById('comm-desc');

  // Contacts
  var contactCommSelect = document.getElementById('contact-comm-select');
  var contactType = document.getElementById('contact-type');
  var contactValeur = document.getElementById('contact-valeur');
  var contactPrimary = document.getElementById('contact-primary');
  var addContactBtn = document.getElementById('add-contact');
  var contactMsg = document.getElementById('contact-msg');

  // Horaires
  var horaireCommSelect = document.getElementById('horaire-comm-select');
  var horaireJour = document.getElementById('horaire-jour');
  var horaireDebut = document.getElementById('horaire-debut');
  var horaireFin = document.getElementById('horaire-fin');
  var horaireType = document.getElementById('horaire-type');
  var addHoraireBtn = document.getElementById('add-horaire');
  var horaireMsg = document.getElementById('horaire-msg');

  // Activités
  var activiteCommSelect = document.getElementById('activite-comm-select');
  var activiteJour = document.getElementById('activite-jour');
  var activiteHeure = document.getElementById('activite-heure');
  var activiteNom = document.getElementById('activite-nom');
  var activiteDesc = document.getElementById('activite-desc');
  var addActiviteBtn = document.getElementById('add-activite');
  var activiteMsg = document.getElementById('activite-msg');

  var communautes = [];

  // ===== COMMUNAUTÉS =====

  function toggleCommForm() {
    if (commForm.style.display === 'none') {
      commForm.style.display = 'block';
      inputNom.focus();
    } else {
      commForm.style.display = 'none';
      clearCommForm();
    }
  }

  function clearCommForm() {
    inputNom.value = '';
    inputDistrict.value = '';
    inputQuartier.value = '';
    inputZone.value = '';
    inputResponsable.value = '';
    inputLat.value = '';
    inputLng.value = '';
    inputAdresse.value = '';
    inputRepere.value = '';
    inputPhoto.value = '';
    inputDesc.value = '';
  }

  function renderCommunautes() {
    if (!commList) return;

    fetch(SUPABASE_URL + '/rest/v1/communautes?order=nom.asc', {
      method: 'GET',
      headers: sbHeaders()
    })
    .then(function(r) { return r.json(); })
    .then(function(list) {
      if (!list || list.length === 0) {
        commList.innerHTML = '<li style="color:var(--text-muted);">Aucune communauté.</li>';
        communautes = [];
        updateSelectLists();
        return;
      }

      communautes = list;
      commList.innerHTML = list.map(function(c) {
        return '<li>' +
          '<span><strong>' + escapeHtml(c.nom) + '</strong> – ' + escapeHtml(c.quartier || c.district_apostolique || 'N/A') + '</span>' +
          '<button type="button" class="del" data-id="' + c.id + '">Supprimer</button>' +
          '</li>';
      }).join('');

      commList.querySelectorAll('.del').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.getAttribute('data-id');
          if (confirm('Supprimer cette communauté ? Les contacts, horaires et activités seront aussi supprimés.')) {
            deleteCommunaute(id);
          }
        });
      });

      updateSelectLists();
    })
    .catch(function(err) {
      console.error('Erreur communautés:', err);
    });
  }

  function saveCommunaute() {
    var nom = (inputNom.value || '').trim();
    if (!nom) {
      alert('Le nom de la communauté est obligatoire.');
      return;
    }

    var lat = parseFloat(inputLat.value);
    var lng = parseFloat(inputLng.value);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Latitude et longitude valides sont obligatoires.');
      return;
    }

    var payload = [{
      nom: nom,
      district_apostolique: (inputDistrict.value || '').trim(),
      quartier: (inputQuartier.value || '').trim(),
      zone: (inputZone.value || '').trim(),
      responsable: (inputResponsable.value || '').trim(),
      latitude: lat,
      longitude: lng,
      adresse: (inputAdresse.value || '').trim(),
      point_repere: (inputRepere.value || '').trim(),
      photo_url: (inputPhoto.value || '').trim(),
      description: (inputDesc.value || '').trim(),
      active: true
    }];

    fetch(SUPABASE_URL + '/rest/v1/communautes', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    })
    .then(function() {
      clearCommForm();
      commForm.style.display = 'none';
      renderCommunautes();
    })
    .catch(function(err) {
      console.error('Erreur création:', err);
      alert('Erreur lors de la création.');
    });
  }

  function deleteCommunaute(id) {
    fetch(SUPABASE_URL + '/rest/v1/communautes?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: sbHeaders()
    })
    .then(function() {
      renderCommunautes();
    })
    .catch(function(err) {
      console.error('Erreur suppression:', err);
    });
  }

  // ===== CONTACTS =====

  function addContact() {
    var commId = parseInt(contactCommSelect.value, 10);
    var type = (contactType.value || '').trim();
    var valeur = (contactValeur.value || '').trim();

    if (!commId || !type || !valeur) {
      contactMsg.textContent = '❌ Tous les champs sont obligatoires.';
      return;
    }

    fetch(SUPABASE_URL + '/rest/v1/contacts_communaute', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
      body: JSON.stringify([{
        communaute_id: commId,
        type: type,
        valeur: valeur,
        is_primary: contactPrimary.checked
      }])
    })
    .then(function() {
      contactMsg.textContent = '✅ Contact ajouté.';
      contactValeur.value = '';
      contactPrimary.checked = false;
      setTimeout(function() { contactMsg.textContent = ''; }, 2000);
    })
    .catch(function(err) {
      console.error('Erreur contact:', err);
      contactMsg.textContent = '❌ Erreur.';
    });
  }

  // ===== HORAIRES =====

  function addHoraire() {
    var commId = parseInt(horaireCommSelect.value, 10);
    var jour = (horaireJour.value || '').trim();
    var debut = (horaireDebut.value || '').trim();
    var fin = (horaireFin.value || '').trim();
    var type = (horaireType.value || '').trim();

    if (!commId || !jour || !debut || !fin || !type) {
      horaireMsg.textContent = '❌ Tous les champs sont obligatoires.';
      return;
    }

    fetch(SUPABASE_URL + '/rest/v1/horaires_services', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
      body: JSON.stringify([{
        communaute_id: commId,
        jour: jour,
        heure_debut: debut,
        heure_fin: fin,
        type_service: type
      }])
    })
    .then(function() {
      horaireMsg.textContent = '✅ Horaire ajouté.';
      horaireJour.value = '';
      horaireDebut.value = '';
      horaireFin.value = '';
      setTimeout(function() { horaireMsg.textContent = ''; }, 2000);
    })
    .catch(function(err) {
      console.error('Erreur horaire:', err);
      horaireMsg.textContent = '❌ Erreur.';
    });
  }

  // ===== ACTIVITÉS =====

  function addActivite() {
    var commId = parseInt(activiteCommSelect.value, 10);
    var jour = (activiteJour.value || '').trim();
    var heure = (activiteHeure.value || '').trim();
    var nom = (activiteNom.value || '').trim();

    if (!commId || !jour || !heure || !nom) {
      activiteMsg.textContent = '❌ Tous les champs obligatoires.';
      return;
    }

    fetch(SUPABASE_URL + '/rest/v1/activites_communaute', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders(), { 'Prefer': 'return=representation' }),
      body: JSON.stringify([{
        communaute_id: commId,
        jour: jour,
        heure: heure,
        activite: nom,
        description: (activiteDesc.value || '').trim()
      }])
    })
    .then(function() {
      activiteMsg.textContent = '✅ Activité ajoutée.';
      activiteJour.value = '';
      activiteHeure.value = '';
      activiteNom.value = '';
      activiteDesc.value = '';
      setTimeout(function() { activiteMsg.textContent = ''; }, 2000);
    })
    .catch(function(err) {
      console.error('Erreur activité:', err);
      activiteMsg.textContent = '❌ Erreur.';
    });
  }

  // ===== UTILITAIRES =====

  function updateSelectLists() {
    // Mettre à jour les <select> avec la liste des communautés
    [contactCommSelect, horaireCommSelect, activiteCommSelect].forEach(function(select) {
      if (!select) return;
      var currentValue = select.value;
      select.innerHTML = '<option value="">-- Choisir une communauté --</option>' +
        communautes.map(function(c) {
          return '<option value="' + c.id + '">' + escapeHtml(c.nom) + '</option>';
        }).join('');
      select.value = currentValue;
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== EVENT LISTENERS =====

  if (toggleForm) toggleForm.addEventListener('click', toggleCommForm);
  if (cancelBtn) cancelBtn.addEventListener('click', toggleCommForm);
  if (saveBtn) saveBtn.addEventListener('click', saveCommunaute);
  if (addContactBtn) addContactBtn.addEventListener('click', addContact);
  if (addHoraireBtn) addHoraireBtn.addEventListener('click', addHoraire);
  if (addActiviteBtn) addActiviteBtn.addEventListener('click', addActivite);

  // Init
  renderCommunautes();
})();
