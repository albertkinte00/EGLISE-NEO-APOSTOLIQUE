/**
 * Eglise Neo-Apostolique - Brazzaville
 * Scripts communs : navigation, theme, contenus dynamiques Supabase
 */
(function() {
  'use strict';

  var config = {
    supabaseUrl: window.ENAC_SUPABASE_URL || 'https://soejilvldrainmblqnex.supabase.co',
    supabaseAnonKey: window.ENAC_SUPABASE_ANON_KEY || 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8'
  };

  function sbHeaders() {
    return {
      'apikey': config.supabaseAnonKey,
      'Authorization': 'Bearer ' + config.supabaseAnonKey,
      'Content-Type': 'application/json'
    };
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function compareRows(a, b) {
    var aOrder = typeof a.sort_order === 'number' ? a.sort_order : 999999;
    var bOrder = typeof b.sort_order === 'number' ? b.sort_order : 999999;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    var aDate = a.created_at || a.updated_at || '';
    var bDate = b.created_at || b.updated_at || '';

    if (aDate === bDate) {
      return 0;
    }

    return aDate < bDate ? 1 : -1;
  }

  function fetchJson(path) {
    return fetch(config.supabaseUrl + '/rest/v1/' + path, {
      method: 'GET',
      headers: sbHeaders()
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Supabase request failed: ' + response.status);
      }
      return response.json();
    });
  }

  function fetchTable(table, query) {
    var suffix = query ? '?' + query : '';
    return fetchJson(table + suffix);
  }

  function applyLink(id, url, fallbackLabel) {
    var el = document.getElementById(id);
    if (!el || !url) return;
    el.href = url;
    if (fallbackLabel && !el.textContent.trim()) {
      el.textContent = fallbackLabel;
    }
  }

  function applyText(id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return;
    el.textContent = value;
  }

  function applyHtml(id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return;
    el.innerHTML = value;
  }

  function getSiteSettings() {
    return fetchTable('site_settings', 'select=*&id=eq.1&limit=1')
      .then(function(rows) {
        if (rows && rows[0]) {
          return rows[0];
        }
        return {};
      })
      .catch(function() {
        return fetchTable('settings', 'select=html_notif&order=updated_at.desc&limit=1')
          .then(function(rows) {
            return rows && rows[0] ? { notification_html: rows[0].html_notif } : {};
          })
          .catch(function() {
            return {};
          });
      });
  }

  function initMenu() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.nav-toggle');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });

    document.addEventListener('click', function(event) {
      if (nav.classList.contains('open') && !nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initActiveNav() {
    var path = (window.location.pathname || '').split('/').pop() || 'index.html';

    document.querySelectorAll('.nav a').forEach(function(anchor) {
      var href = (anchor.getAttribute('href') || '').split('/').pop();
      anchor.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  }

  function initReveal() {
    var revealItems = document.querySelectorAll('.reveal');

    if (!revealItems.length) return;

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(function(item) {
        item.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function(item) {
      observer.observe(item);
    });
  }

  function initTheme() {
    var themeKey = 'enac-theme';
    var root = document.documentElement;
    var button = document.getElementById('theme-toggle');

    function applyTheme(isDark) {
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (button) {
        button.textContent = isDark ? 'Light' : 'Dark';
      }
    }

    try {
      var saved = localStorage.getItem(themeKey);
      if (saved === 'dark') applyTheme(true);
      if (saved === 'light') applyTheme(false);
    } catch (error) {}

    if (!button) return;

    button.addEventListener('click', function() {
      var isDark = root.getAttribute('data-theme') === 'dark';
      var next = !isDark;
      applyTheme(next);

      try {
        localStorage.setItem(themeKey, next ? 'dark' : 'light');
      } catch (error) {}
    });
  }

  function loadSiteSettings() {
    return getSiteSettings().then(function(settings) {
      applyHtml('notif-text', settings.notification_html);
      applyText('verse-text', settings.home_verse_text);
      applyText('verse-ref', settings.home_verse_ref);
      applyText('welcome-text', settings.home_welcome_text);
      applyText('contact-email-text', settings.contact_email);
      applyText('contact-phone-text', settings.contact_phone);
      applyText('contact-address-text', settings.contact_address);

      var emailLink = document.getElementById('contact-email-link');
      if (emailLink && settings.contact_email) {
        emailLink.href = 'mailto:' + settings.contact_email;
      }

      var phoneLink = document.getElementById('contact-phone-link');
      if (phoneLink && settings.contact_phone) {
        phoneLink.href = 'tel:' + settings.contact_phone.replace(/\s+/g, '');
      }

      var mapFrame = document.getElementById('contact-map-frame');
      if (mapFrame && settings.contact_map_embed_url) {
        mapFrame.src = settings.contact_map_embed_url;
      }

      applyLink('media-youtube-link', settings.youtube_url, 'Chaine YouTube');
      applyLink('media-facebook-link', settings.facebook_url, 'Page Facebook');
      applyLink('media-whatsapp-link', settings.whatsapp_url, 'Canal WhatsApp');
      applyLink('media-nac-link', settings.nac_today_url, 'nac.today');
      applyLink('media-featured-primary-link', settings.youtube_url, 'Voir sur YouTube');
      applyLink('media-featured-secondary-link', settings.facebook_url, 'Voir sur Facebook');

      return settings;
    }).catch(function() {
      return {};
    });
  }

  function renderCards(containerId, rows, options) {
    var container = document.getElementById(containerId);
    if (!container || !rows || !rows.length) return;

    var html = rows.map(function(row) {
      return options.render(row);
    }).join('');

    if (html) {
      container.innerHTML = html;
    }
  }

  window.enacRenderActualites = function(containerId) {
    fetchTable('actualites', 'select=*&is_published=eq.true')
      .then(function(rows) {
        var list = (rows || []).sort(compareRows);
        renderCards(containerId, list, {
          render: function(item) {
            var footer = '';
            if (item.link_url) {
              footer = '<a class="btn btn-outline" style="margin-top:0.5rem;" href="' + escapeHtml(item.link_url) + '">' + escapeHtml(item.link_label || 'Lire plus') + '</a>';
            }

            return '<article class="card reveal">' +
              '<h3>' + escapeHtml(item.titre || 'Actualite') + '</h3>' +
              '<p style="color:var(--text-muted);font-size:0.9rem;">' + escapeHtml(item.date || '') + '</p>' +
              '<p>' + escapeHtml(item.contenu || '') + '</p>' +
              footer +
              '</article>';
          }
        });
      })
      .catch(function() {});
  };

  window.enacRenderEvenements = function(containerId) {
    fetchTable('evenements', 'select=*&is_published=eq.true')
      .then(function(rows) {
        var container = document.getElementById(containerId);
        var list = (rows || []).sort(compareRows);
        if (!container || !list.length) return;

        container.innerHTML = list.map(function(item) {
          var description = item.desc ? '<br><span style="font-size:0.9rem;">' + escapeHtml(item.desc) + '</span>' : '';
          return '<li>' +
            '<span class="event-date">' + escapeHtml(item.date || 'Info') + '</span>' +
            '<span class="event-title">' + escapeHtml(item.titre || 'Evenement') + '</span>' +
            description +
            '</li>';
        }).join('');
      })
      .catch(function() {});
  };

  window.enacRenderAnnonces = function(containerId) {
    fetchTable('annonces', 'select=*&is_published=eq.true')
      .then(function(rows) {
        var container = document.getElementById(containerId);
        var list = (rows || []).sort(compareRows);
        if (!container || !list.length) return;

        container.innerHTML = list.map(function(item) {
          var action = '';
          if (item.link_url) {
            action = ' <a href="' + escapeHtml(item.link_url) + '">' + escapeHtml(item.link_label || 'Ouvrir') + '</a>';
          }

          return '<li>' +
            '<span class="event-date">' + escapeHtml(item.badge || 'Info') + '</span>' +
            '<span>' + escapeHtml(item.titre || 'Annonce') + ' - ' + escapeHtml(item.message || '') + action + '</span>' +
            '</li>';
        }).join('');
      })
      .catch(function() {});
  };

  window.enacRenderMediaItems = function(containerId) {
    fetchTable('media_items', 'select=*&is_published=eq.true')
      .then(function(rows) {
        var list = (rows || []).sort(compareRows);
        renderCards(containerId, list, {
          render: function(item) {
            var category = item.categorie ? '<p style="color:var(--text-muted);font-size:0.9rem;">' + escapeHtml(item.categorie) + '</p>' : '';
            var buttonLabel = item.link_label || 'Ouvrir';
            var buttonClass = item.is_featured ? 'btn btn-gold' : 'btn btn-primary';

            return '<article class="card media-card reveal">' +
              '<div class="body">' +
              '<h3>' + escapeHtml(item.titre || 'Media') + '</h3>' +
              category +
              '<p>' + escapeHtml(item.description || '') + '</p>' +
              (item.url ? '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener" class="' + buttonClass + '">' + escapeHtml(buttonLabel) + '</a>' : '') +
              '</div>' +
              '</article>';
          }
        });
      })
      .catch(function() {});
  };

  window.enacLoadSiteSettings = loadSiteSettings;

  initMenu();
  initActiveNav();
  initReveal();
  initTheme();
  loadSiteSettings();
})();
