/**
 * Super Administrateur - Logique Principale
 */
(function() {
  'use strict';

  // Configuration
  var SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';
  var config = window.SUPER_ADMIN_CONFIG || {};
  var authConfig = config.AUTH || {};
  var SUPER_ADMIN_EMAIL = (authConfig.SUPER_ADMIN_EMAIL || 'albertkintsodiza@gmail.com').toLowerCase();
  var SESSION_TIMEOUT_MS = (authConfig.SESSION_TIMEOUT_MINUTES || 30) * 60 * 1000;
  var SESSION_KEYS = {
    email: 'super_admin_email',
    token: 'super_admin_token',
    role: 'super_admin_role',
    until: 'super_admin_until'
  };

  // DOM Elements
  var sidebar = document.querySelector('.sidebar');
  var btnMenu = document.getElementById('btn-menu');
  var btnTheme = document.getElementById('btn-theme');
  var menuLinks = document.querySelectorAll('.menu-link');
  var pageContents = document.querySelectorAll('.page-content');

  // Chart instance
  var activityChart = null;

  // ============================================
  // AUTHENTICATION CHECK
  // ============================================
  function checkAuth() {
    var adminEmail = (sessionStorage.getItem(SESSION_KEYS.email) || '').toLowerCase();
    var adminToken = sessionStorage.getItem(SESSION_KEYS.token);
    var adminUntil = parseInt(sessionStorage.getItem(SESSION_KEYS.until), 10);
    var adminRole = sessionStorage.getItem(SESSION_KEYS.role) || 'super_admin';

    if (!adminEmail || !adminToken || !adminUntil || adminUntil < Date.now()) {
      sessionStorage.removeItem(SESSION_KEYS.email);
      sessionStorage.removeItem(SESSION_KEYS.token);
      sessionStorage.removeItem(SESSION_KEYS.role);
      sessionStorage.removeItem(SESSION_KEYS.until);
      window.location.href = 'login.html';
      return false;
    }

    if (adminEmail !== SUPER_ADMIN_EMAIL || adminRole !== 'super_admin') {
      alert('Accès non autorisé');
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }

  // ============================================
  // THEME MANAGEMENT
  // ============================================
  function initTheme() {
    var theme = localStorage.getItem('admin-theme') || 'light';
    setTheme(theme);

    btnTheme.addEventListener('click', function() {
      var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      var newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
    btnTheme.innerHTML = theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  // ============================================
  // SIDEBAR NAVIGATION
  // ============================================
  function initNavigation() {
    // Menu toggle mobile
    btnMenu.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Menu links
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();

        var href = this.getAttribute('href');
        if (href === '#logout') {
          logout();
          return;
        }

        // Remove active class
        menuLinks.forEach(function(l) {
          l.classList.remove('active');
        });

        // Add active class
        this.classList.add('active');

        // Hide all pages
        pageContents.forEach(function(page) {
          page.style.display = 'none';
        });

        // Show selected page
        var pageName = href.substring(1) + '-page';
        var selectedPage = document.getElementById(pageName);
        if (selectedPage) {
          selectedPage.style.display = 'block';
        }

        // Close sidebar on mobile
        sidebar.classList.remove('open');
      });
    });
  }

  // ============================================
  // CHARTS & STATISTICS
  // ============================================
  function initCharts() {
    var ctx = document.getElementById('activityChart');
    if (!ctx) return;

    activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Utilisateurs Actifs',
            data: [1200, 1300, 1250, 1400, 1350, 1248],
            borderColor: '#1565c0',
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Événements',
            data: [150, 160, 155, 170, 165, 156],
            borderColor: '#c9a227',
            backgroundColor: 'rgba(201, 162, 39, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // ============================================
  // SEARCH GLOBAL
  // ============================================
  function initSearch() {
    var searchBox = document.getElementById('global-search');
    if (!searchBox) return;

    searchBox.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      if (query.length < 2) return;

      console.log('🔍 Recherche:', query);
      // À implémenter : recherche globale
    });
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================
  function initNotifications() {
    var notifyBtn = document.getElementById('btn-notifications');
    if (!notifyBtn) return;

    notifyBtn.addEventListener('click', function() {
      alert('Notifications:\n\n• 2 alertes système\n• 1 maintenance prévue');
    });
  }

  // ============================================
  // LOGOUT
  // ============================================
  function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      sessionStorage.removeItem(SESSION_KEYS.email);
      sessionStorage.removeItem(SESSION_KEYS.token);
      sessionStorage.removeItem(SESSION_KEYS.role);
      sessionStorage.removeItem(SESSION_KEYS.until);
      window.location.href = 'login.html';
    }
  }

  // ============================================
  // LOAD STATISTICS
  // ============================================
  function loadStatistics() {
    // À intégrer avec Supabase pour récupérer données réelles
    console.log('📊 Chargement des statistiques...');
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    // Vérifier authentification
    if (!checkAuth()) return;

    // Initialiser
    initTheme();
    initNavigation();
    initCharts();
    initSearch();
    initNotifications();
    loadStatistics();

    console.log('✅ Super Administrateur chargé');
  });

  // Export functions
  window.superAdmin = {
    logout: logout
  };
})();
