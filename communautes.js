/**
 * Localiser une communaute
 * Carte Leaflet + geolocalisation + details dynamiques Supabase
 */
(function() {
  'use strict';

  var SUPABASE_URL = window.ENAC_SUPABASE_URL || 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = window.ENAC_SUPABASE_ANON_KEY || 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  var map = null;
  var allCommunautes = [];
  var visibleCommunautes = [];
  var markers = [];
  var userLocation = null;
  var userMarker = null;

  var mapEl = document.getElementById('map');
  var mapLoadingEl = document.getElementById('map-loading');
  var searchInput = document.getElementById('search-input');
  var filterDistrict = document.getElementById('filter-district');
  var btnSearch = document.getElementById('btn-search');
  var btnLocate = document.getElementById('btn-locate');
  var btnReset = document.getElementById('btn-reset');
  var communautesList = document.getElementById('communautes-list');
  var noCommunautes = document.getElementById('no-communautes');
  var userInfo = document.getElementById('user-info');
  var nearCount = document.getElementById('near-count');

  function sbHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    if ([lat1, lon1, lat2, lon2].some(function(value) { return typeof value !== 'number' || isNaN(value); })) {
      return null;
    }

    var radius = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
  }

  function hideMapLoading() {
    if (mapLoadingEl) {
      mapLoadingEl.classList.remove('active');
    }
  }

  function setNearCount(count) {
    if (nearCount) {
      nearCount.textContent = String(count);
    }
  }

  function sortCommunautes(list) {
    if (!userLocation) return list.slice();

    return list.slice().sort(function(a, b) {
      var distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      var distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      if (distA == null && distB == null) return 0;
      if (distA == null) return 1;
      if (distB == null) return -1;
      return distA - distB;
    });
  }

  function addUserMarker() {
    if (!map || !userLocation || !window.L) return;

    if (userMarker) {
      map.removeLayer(userMarker);
    }

    userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 12,
      fillColor: '#4CAF50',
      color: '#2E7D32',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('<strong>Votre position</strong>');
  }

  function populateDistrictFilter(rows) {
    if (!filterDistrict) return;

    var districts = {};
    rows.forEach(function(item) {
      if (item.district_apostolique) {
        districts[item.district_apostolique] = true;
      }
    });

    filterDistrict.innerHTML = '<option value="">Tous les districts</option>' +
      Object.keys(districts).sort().map(function(district) {
        return '<option value="' + escapeHtml(district) + '">' + escapeHtml(district) + '</option>';
      }).join('');
  }

  function clearMarkers() {
    markers.forEach(function(entry) {
      map.removeLayer(entry.marker);
    });
    markers = [];
  }

  function addMarkers(rows) {
    if (!map || !window.L) return;

    clearMarkers();

    rows.forEach(function(communaute) {
      if (typeof communaute.latitude !== 'number' || typeof communaute.longitude !== 'number') {
        return;
      }

      var marker = L.circleMarker([communaute.latitude, communaute.longitude], {
        radius: 8,
        fillColor: '#1565c0',
        color: '#0a3d6b',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup('<strong>' + escapeHtml(communaute.nom) + '</strong>');
      marker.on('click', function() {
        var card = document.querySelector('[data-comm-id="' + communaute.id + '"]');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      markers.push({ marker: marker, communaute: communaute });
    });
  }

  function renderContacts(contacts) {
    if (!contacts || !contacts.length) return '';

    return contacts.map(function(contact) {
      var label = contact.type || 'contact';
      var value = escapeHtml(contact.valeur || '');

      if (contact.type === 'telephone' || contact.type === 'whatsapp') {
        return '<div class="info-row"><strong>' + escapeHtml(label) + ':</strong><span><a href="tel:' + value.replace(/\s+/g, '') + '">' + value + '</a></span></div>';
      }

      if (contact.type === 'email') {
        return '<div class="info-row"><strong>Email:</strong><span><a href="mailto:' + value + '">' + value + '</a></span></div>';
      }

      return '<div class="info-row"><strong>' + escapeHtml(label) + ':</strong><span>' + value + '</span></div>';
    }).join('');
  }

  function renderHoraires(horaires) {
    if (!horaires || !horaires.length) return '';

    return '<div class="info-row"><strong>Horaires:</strong><span>' + horaires.map(function(item) {
      return escapeHtml(item.jour || '') + ' ' + escapeHtml(item.heure_debut || '') + '-' + escapeHtml(item.heure_fin || '');
    }).join(' | ') + '</span></div>';
  }

  function renderActivites(activites) {
    if (!activites || !activites.length) return '';

    return '<div class="info-row"><strong>Activites:</strong><span>' + activites.map(function(item) {
      return escapeHtml(item.jour || '') + ' ' + escapeHtml(item.heure || '') + ' - ' + escapeHtml(item.activite || '');
    }).join(' | ') + '</span></div>';
  }

  function renderCommunautes(rows) {
    if (!communautesList || !noCommunautes) return;

    if (!rows.length) {
      communautesList.innerHTML = '';
      noCommunautes.style.display = 'block';
      setNearCount(0);
      return;
    }

    noCommunautes.style.display = 'none';
    setNearCount(rows.length);

    communautesList.innerHTML = rows.map(function(communaute) {
      var distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, communaute.latitude, communaute.longitude) : null;
      var primaryPhone = '';
      var contacts = Array.isArray(communaute.contacts_communaute) ? communaute.contacts_communaute : [];

      contacts.forEach(function(contact) {
        if (!primaryPhone && contact.type === 'telephone') {
          primaryPhone = contact.valeur || '';
        }
      });

      var footerContact = primaryPhone ? 'tel:' + primaryPhone.replace(/\s+/g, '') : 'contact.html';
      var distanceHtml = distance != null ? '<p class="community-distance">A ' + distance.toFixed(1) + ' km de vous</p>' : '';

      return '<div class="community-card" data-comm-id="' + communaute.id + '">' +
        '<div class="community-card-header">' +
          '<h3>' + escapeHtml(communaute.nom) + '</h3>' +
          distanceHtml +
        '</div>' +
        '<div class="community-card-body">' +
          (communaute.district_apostolique ? '<div class="info-row"><strong>District:</strong><span>' + escapeHtml(communaute.district_apostolique) + '</span></div>' : '') +
          (communaute.quartier ? '<div class="info-row"><strong>Quartier:</strong><span>' + escapeHtml(communaute.quartier) + '</span></div>' : '') +
          (communaute.zone ? '<div class="info-row"><strong>Zone:</strong><span>' + escapeHtml(communaute.zone) + '</span></div>' : '') +
          (communaute.responsable ? '<div class="info-row"><strong>Responsable:</strong><span>' + escapeHtml(communaute.responsable) + '</span></div>' : '') +
          (communaute.adresse ? '<div class="info-row"><strong>Adresse:</strong><span>' + escapeHtml(communaute.adresse) + '</span></div>' : '') +
          (communaute.point_repere ? '<div class="info-row"><strong>Repere:</strong><span>' + escapeHtml(communaute.point_repere) + '</span></div>' : '') +
          renderContacts(contacts) +
          renderHoraires(communaute.horaires_services || []) +
          renderActivites(communaute.activites_communaute || []) +
        '</div>' +
        '<div class="community-card-footer">' +
          '<button type="button" class="btn-itineraire" data-itineraire-lat="' + escapeHtml(communaute.latitude) + '" data-itineraire-lng="' + escapeHtml(communaute.longitude) + '">Itineraire</button>' +
          '<a href="' + footerContact + '" class="btn-contact">' + (primaryPhone ? 'Appeler' : 'Contacter') + '</a>' +
        '</div>' +
      '</div>';
    }).join('');

    communautesList.querySelectorAll('.btn-itineraire').forEach(function(button) {
      button.addEventListener('click', function() {
        var lat = parseFloat(button.getAttribute('data-itineraire-lat'));
        var lng = parseFloat(button.getAttribute('data-itineraire-lng'));
        showItineraire(lat, lng);
      });
    });
  }

  function showItineraire(lat, lng) {
    if (!userLocation) {
      alert('Veuillez activer la geolocalisation pour obtenir un itineraire.');
      requestUserLocation();
      return;
    }

    var url = 'https://www.openstreetmap.org/directions?engine=osrm_car&route=' +
      userLocation.lat + ',' + userLocation.lng + ';' + lat + ',' + lng;

    window.open(url, '_blank');
  }

  function renderAll(rows) {
    visibleCommunautes = sortCommunautes(rows);
    addMarkers(visibleCommunautes);
    renderCommunautes(visibleCommunautes);
  }

  function performSearch() {
    var query = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();
    var district = filterDistrict && filterDistrict.value ? filterDistrict.value.trim() : '';

    var filtered = allCommunautes.filter(function(communaute) {
      var matchText = !query ||
        (communaute.nom || '').toLowerCase().indexOf(query) !== -1 ||
        (communaute.quartier || '').toLowerCase().indexOf(query) !== -1 ||
        (communaute.zone || '').toLowerCase().indexOf(query) !== -1;

      var matchDistrict = !district || communaute.district_apostolique === district;
      return matchText && matchDistrict;
    });

    renderAll(filtered);
  }

  function resetView() {
    if (searchInput) searchInput.value = '';
    if (filterDistrict) filterDistrict.value = '';
    renderAll(allCommunautes);

    if (map) {
      if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 13);
      } else {
        map.setView([-4.2634, 15.2429], 12);
      }
    }
  }

  function loadCommunautes() {
    var query = 'active=eq.true&select=*,contacts_communaute(*),horaires_services(*),activites_communaute(*)';

    fetch(SUPABASE_URL + '/rest/v1/communautes?' + query, {
      method: 'GET',
      headers: sbHeaders()
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Erreur Supabase: ' + response.status);
        }
        return response.json();
      })
      .then(function(rows) {
        allCommunautes = Array.isArray(rows) ? rows : [];
        populateDistrictFilter(allCommunautes);
        renderAll(allCommunautes);
      })
      .catch(function() {
        if (noCommunautes) {
          noCommunautes.style.display = 'block';
        }
      })
      .finally(function() {
        hideMapLoading();
      });
  }

  function requestUserLocation() {
    if (!navigator.geolocation) {
      hideMapLoading();
      return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      addUserMarker();

      if (userInfo) {
        userInfo.style.display = 'block';
      }

      if (map) {
        map.setView([userLocation.lat, userLocation.lng], 13);
      }

      renderAll(visibleCommunautes.length ? visibleCommunautes : allCommunautes);
      hideMapLoading();
    }, function() {
      hideMapLoading();
      renderAll(allCommunautes);
    }, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 0
    });
  }

  function initMap() {
    if (!mapEl || !window.L) return;

    map = L.map(mapEl).setView([-4.2634, 15.2429], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom().addTo(map);
    L.control.scale().addTo(map);

    loadCommunautes();
    requestUserLocation();
  }

  if (btnSearch) btnSearch.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
  }
  if (filterDistrict) filterDistrict.addEventListener('change', performSearch);
  if (btnLocate) btnLocate.addEventListener('click', requestUserLocation);
  if (btnReset) btnReset.addEventListener('click', resetView);

  window.showItineraire = showItineraire;
  initMap();
})();
