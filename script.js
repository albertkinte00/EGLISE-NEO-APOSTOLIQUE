/**
 * Église Néo-Apostolique – Brazzaville
 * Scripts communs : menu, révélations au scroll, thème clair/sombre, notifications
 */
(function() {
  'use strict';

  // ----- Menu mobile -----
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    document.addEventListener('click', function(e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ----- Active nav selon la page -----
  var path = (window.location.pathname || '').split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function(a) {
    var href = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });

  // ----- Révélations au scroll -----
  var reveal = document.querySelectorAll('.reveal');
  if (reveal.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(function(el) { io.observe(el); });
  } else {
    reveal.forEach(function(el) { el.classList.add('visible'); });
  }

  // ----- Cartes .card (fallback animation) -----
  var cards = document.querySelectorAll('.card');
  if (cards.length && 'IntersectionObserver' in window) {
    var cardIo = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    cards.forEach(function(c) { cardIo.observe(c); });
  }

  // ----- Thème clair / sombre -----
  var themeKey = 'enac-theme';
  var root = document.documentElement;
  function applyTheme(isDark) {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌓';
  }
        try {
            var saved = localStorage.getItem(themeKey);
            if (saved === 'dark') applyTheme(true);
            else if (saved === 'light') applyTheme(false);
          } catch (e) {}
          var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      var isDark = root.getAttribute('data-theme') === 'dark';
      isDark = !isDark;
      try { localStorage.setItem(themeKey, isDark ? 'dark' : 'light'); } catch (e) {}
      applyTheme(isDark);
    });
  }

  // ----- Notification personnalisable (Supabase settings.html_notif) -----
  var notif = document.getElementById('notif-text');
  if (notif) {
    (function loadNotifFromSupabase() {
      try {
        var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
        var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';
        fetch(SUPABASE_URL + '/rest/v1/settings?select=html_notif&order=update_at.desc&limit=1', {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        })
        .then(function(r){ return r.json(); })
        .then(function(data){
          if (data && data[0] && data[0].html_notif) {
            // Pure Supabase rendering: afficher tel quel (si contenu HTML autorisé côté DB)
            notif.innerHTML = data[0].html_notif;
          }
        })
        .catch(function(){});
      } catch (e) {}
    })();
  }
})();

/** Charge et affiche les actualités depuis localStorage (admin) */
function enacRenderActualites(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  fetch(SUPABASE_URL + '/rest/v1/actualites?select=id,titre,date,contenu,created_at&order=created_at.desc&limit=20', {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(list){
    if (!list || list.length === 0) return;
    var html = list.map(function(a) {
      return '<article class="card reveal"><h3>' + (a.titre || '') + '</h3><p style="color:var(--text-muted);font-size:0.9rem;">' + (a.date || '') + '</p><p>' + (a.contenu || '') + '</p></article>';
    }).join('');
    el.innerHTML = html;
  })
  .catch(function(){});
}

/** Charge et affiche les événements depuis localStorage (admin) */
function enacRenderEvenements(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

  fetch(SUPABASE_URL + '/rest/v1/evenements?select=id,titre,date,desc,created_at&order=created_at.desc&limit=15', {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(list){
    if (!list || list.length === 0) return;
    var html = list.map(function(e) {
      return '<li><span class="event-date">' + (e.date || '') + '</span><span class="event-title">' + (e.titre || '') + '</span>' + (e.desc ? '<br><span style="font-size:0.9rem;">' + e.desc + '</span>' : '') + '</li>';
    }).join('');
    el.innerHTML = html;
  })
  .catch(function(){});
}
