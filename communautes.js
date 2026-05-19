/**
 * Localiser une Communauté – Version optimisée
 * Carte visible d'emblée + Géolocalisation automatique
 */
(function() {
  'use strict';

  // Configuration
  var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  // État global
  var map = null;
  var allCommunautes = [];
  var markers = [];
  var userLocation = null;
  var userMarker = null;
  var filteredCommunautes = [];

  // DOM
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

  // Headers Supabase
  function sbHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }

  // 1. INITIALISER LA CARTE
  function initMap() {
    if (!window.L) {
      setTimeout(initMap, 500);
      return;
    }

    // Brazzaville par défaut
    var brazzaville = [-4.2634, 15.2429];

    map = L.map(mapEl).setView(brazzaville, 12);
    
    // Couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Contrôles
    L.control.zoom().addTo(map);
    L.control.scale().addTo(map);

    console.log('✅ Carte initialisée');

    // Charger les données
    loadCommunautes();
    
    // Demander géolocalisation AU DÉMARRAGE
    requestUserLocation();
  }

  // 2. DEMANDER LOCALISATION AU DÉMARRAGE
  function requestUserLocation() {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non disponible');
      hideMapLoading();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('✅ Position détectée:', userLocation);

        // Ajouter marqueur utilisateur
        addUserMarker();

        // Centrer la carte
        map.setView([userLocation.lat, userLocation.lng], 13);

        // Afficher info et trier par distance
        userInfo.style.display = 'block';
        sortByDistance();
        renderCommunautes(allCommunautes);

        hideMapLoading();
      },
      function(err) {
        console.warn('Géolocalisation refusée ou erreur:', err.message);
        hideMapLoading();
        // Afficher quand même les communautés (données publiques)
        renderCommunautes(allCommunautes);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  function hideMapLoading() {
    mapLoadingEl.classList.remove('active');
  }

  function addUserMarker() {
    if (!map || !userLocation) return;

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
    }).addTo(map).bindPopup('<strong>📍 Votre position</strong>');
  }

  // 3. CHARGER COMMUNAUTÉS DEPUIS SUPABASE
  function loadCommunautes() {
    fetch(SUPABASE_URL + '/rest/v1/communautes?active=eq.true&select=*', {
      method: 'GET',
      headers: sbHeaders()
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && Array.isArray(data)) {
        allCommunautes = data;
        console.log('✅ Communautés chargées:', data.length);

        // Ajouter les marqueurs sur la carte
        addMarkersToMap(allCommunautes);

        // Remplir le filtre district
        populateDistrictFilter(allCommunautes);

        // Afficher liste
        renderCommunautes(allCommunautes);
      } else {
        console.error('❌ Pas de données:', data);
        noCommunautes.style.display = 'block';
      }
    })
    .catch(function(err) {
      console.error('❌ Erreur Supabase:', err);
      noCommunautes.style.display = 'block';
    });
  }

  // 4. AJOUTER LES MARQUEURS SUR LA CARTE
  function addMarkersToMap(communautes) {
    // Effacer anciens
    markers.forEach(function(m) {
      map.removeLayer(m.marker);
    });
    markers = [];

    // Ajouter nouveaux
    communautes.forEach(function(comm) {
      if (comm.latitude && comm.longitude) {
        var marker = L.circleMarker([comm.latitude, comm.longitude], {
          radius: 8,
          fillColor: '#1565c0',
          color: '#0a3d6b',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup('<strong>' + escapeHtml(comm.nom) + '</strong>');

        marker.on('click', function() {
          // Scroller vers la fiche
          var card = document.querySelector('[data-comm-id="' + comm.id + '"]');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

        markers.push({ marker: marker, commune: comm });
      }
    });
  }

  // 5. REMPLIR LE FILTRE DISTRICT
  function populateDistrictFilter(communautes) {
    var districts = new Set();
    communautes.forEach(function(c) {
      if (c.district_apostolique) {
        districts.add(c.district_apostolique);
      }
    });

    var options = Array.from(districts).sort().map(function(d) {
      return '<option value="' + escapeHtml(d) + '">' + escapeHtml(d) + '</option>';
    }).join('');

    filterDistrict.innerHTML += options;
  }

  // 6. TRIER PAR DISTANCE
  function sortByDistance() {
    if (!userLocation) return;

    allCommunautes.sort(function(a, b) {
      var distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      var distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  // 7. CALCULER DISTANCE
  function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return deg * (Math.PI / 180);
  }

  // 8. AFFICHER LES COMMUNAUTÉS
  function renderCommunautes(communautes) {
    if (!communautes || communautes.length === 0) {
      communautesList.innerHTML = '';
      noCommunautes.style.display = 'block';
      updateNearCount(0);
      return;
    }

    noCommunautes.style.display = 'none';
    updateNearCount(communautes.length);

    communautesList.innerHTML = communautes.map(function(comm) {
      var distance = userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lng, comm.latitude, comm.longitude).toFixed(1) : 
        null;

      var html = '<div class="community-card" data-comm-id="' + comm.id + '">' +
        '<div class="community-card-header">' +
          '<h3>' + escapeHtml(comm.nom) + '</h3>';

      if (distance) {
        html += '<p class="community-distance">📍 À ' + distance + ' km de vous</p>';
      }

      html += '</div>' +
        '<div class="community-card-body">';

      if (comm.district_apostolique) {
        html += '<div class="info-row"><strong>District:</strong> <span>' + escapeHtml(comm.district_apostolique) + '</span></div>';
      }

      if (comm.quartier) {
        html += '<div class="info-row"><strong>Quartier:</strong> <span>' + escapeHtml(comm.quartier) + '</span></div>';
      }

      if (comm.responsable) {
        html += '<div class="info-row"><strong>Responsable:</strong> <span>' + escapeHtml(comm.responsable) + '</span></div>';
      }

      if (comm.adresse) {
        html += '<div class="info-row"><strong>Adresse:</strong> <span>' + escapeHtml(comm.adresse) + '</span></div>';
      }

      if (comm.point_repere) {
        html += '<div class="info-row"><strong>Repère:</strong> <span>' + escapeHtml(comm.point_repere) + '</span></div>';
      }

      html += '</div>' +
        '<div class="community-card-footer">' +
          '<button class="btn-itineraire" onclick="showItineraire(' + comm.latitude + ', ' + comm.longitude + ', ' + escapeHtml(comm.nom) + ')">🗺️ Itinéraire</button>' +
          '<a href="tel:+242" class="btn-contact">📞 Appeler</a>' +
        '</div>' +
        '</div>';

      return html;
    }).join('');
  }

  // 9. AFFICHER ITINÉRAIRE
  window.showItineraire = function(lat, lng, nom) {
    if (!userLocation) {
      alert('Veuillez accepter la géolocalisation pour obtenir un itinéraire');
      requestUserLocation();
      return;
    }

    var url = 'https://www.openstreetmap.org/directions?engine=osrm_car&route=' +
      userLocation.lat + ',' + userLocation.lng + ';' +
      lat + ',' + lng;

    window.open(url, '_blank');
  };

  // 10. METTRE À JOUR COMPTEUR
  function updateNearCount(count) {
    document.getElementById('near-count').textContent = count;
  }

  // 11. RECHERCHE
  function performSearch() {
    var query = (searchInput.value || '').toLowerCase().trim();
    var district = (filterDistrict.value || '').trim();

    var filtered = allCommunautes.filter(function(comm) {
      var matchText = !query || 
        comm.nom.toLowerCase().includes(query) ||
        (comm.quartier && comm.quartier.toLowerCase().includes(query)) ||
        (comm.zone && comm.zone.toLowerCase().includes(query));

      var matchDistrict = !district || comm.district_apostolique === district;

      return matchText && matchDistrict;
    });

    filteredCommunautes = filtered;
    addMarkersToMap(filtered);
    renderCommunautes(filtered);
  }

  // 12. RÉINITIALISER
  function resetView() {
    searchInput.value = '';
    filterDistrict.value = '';
    addMarkersToMap(allCommunautes);
    renderCommunautes(allCommunautes);

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }

  // EVENT LISTENERS
  btnSearch.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
  });
  filterDistrict.addEventListener('change', performSearch);

  btnLocate.addEventListener('click', function() {
    requestUserLocation();
  });

  btnReset.addEventListener('click', resetView);

  // UTILITAIRES
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // INIT
  initMap();
})();
