/**
 * Configuration Super Administrateur
 * Fichier de configuration centralisée
 */

const SUPER_ADMIN_CONFIG = {
  // ============================================
  // INFORMATIONS GÉNÉRALES
  // ============================================
  APP_NAME: 'Église Néo-Apostolique',
  APP_VERSION: '1.0.0',
  
  // ============================================
  // AUTHENTIFICATION
  // ============================================
  AUTH: {
    SUPER_ADMIN_EMAIL: 'albertkintsodiza@gmail.com',
    // Mot de passe de secours ou d'urgence. Si vous ne souhaitez pas utiliser Supabase Auth,
    // définissez une valeur forte ici et changez-la immédiatement après le déploiement.
    SUPER_ADMIN_PASSWORD: 'Admin@123',
    SECRET_KEY: 'super_secret_key_123',
    ENABLE_2FA: true,
    ENABLE_GOOGLE_AUTH: false, // À implémenter
    SESSION_TIMEOUT_MINUTES: 30,
    PASSWORD_MIN_LENGTH: 8,
    SECRET_KEY_LENGTH: 16
  },

  // ============================================
  // SUPABASE
  // ============================================
  SUPABASE: {
    URL: 'https://soejilvldrainmblqnex.supabase.co',
    ANON_KEY: 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8'
  },

  // ============================================
  // FONCTIONNALITÉS
  // ============================================
  FEATURES: {
    COMMUNAUTES: true,
    EVENTS: true,
    GALLERY: true,
    CONTACT: true,
    PAYMENTS: true,
    NEWSLETTER: true,
    MEMBERS: true,
    COMMENTS: true,
    API: true,
    WEBHOOKS: false
  },

  // ============================================
  // SAUVEGARDES
  // ============================================
  BACKUP: {
    AUTO_BACKUP_ENABLED: true,
    FREQUENCY: 'weekly', // daily, weekly, monthly
    AUTO_BACKUP_TIME: '02:00', // Heure UTC
    RETENTION_DAYS: 90,
    MAX_BACKUP_SIZE_GB: 10
  },

  // ============================================
  // SÉCURITÉ
  // ============================================
  SECURITY: {
    FORCE_HTTPS: true,
    ENABLE_LOGS: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    PASSWORD_EXPIRY_DAYS: 90,
    REQUIRE_2FA_FOR_ADMIN: true,
    ALLOWED_IP_ADDRESSES: [], // Vide = tous les IPs
    RATE_LIMIT_REQUESTS_PER_MINUTE: 60
  },

  // ============================================
  // MAINTENANCE
  // ============================================
  MAINTENANCE: {
    MODE_ENABLED: false,
    MESSAGE: 'Site en maintenance. Merci de votre compréhension.',
    SHOW_TO_ADMINS: false
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  NOTIFICATIONS: {
    ADMIN_EMAIL: 'albertkintsodiza@gmail.com',
    ENABLE_EMAIL: true,
    ENABLE_SMS: false,
    ALERT_CRITICAL_ISSUES: true,
    ALERT_HIGH_TRAFFIC: true
  },

  // ============================================
  // LIMITES
  // ============================================
  LIMITS: {
    MAX_USERS: 10000,
    MAX_COMMUNITIES: 500,
    MAX_EVENTS: 5000,
    MAX_MEDIA_FILES: 10000,
    MAX_UPLOAD_SIZE_MB: 100,
    MAX_DAILY_BACKUPS: 5
  },

  // ============================================
  // RÔLES & PERMISSIONS
  // ============================================
  ROLES: {
    SUPER_ADMIN: {
      name: 'Super Administrateur',
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'roles.manage',
        'permissions.manage',
        'content.create',
        'content.update',
        'content.delete',
        'communities.manage',
        'media.manage',
        'events.manage',
        'payments.manage',
        'settings.manage',
        'logs.view',
        'logs.export',
        'backups.create',
        'backups.restore',
        'system.restart',
        'analytics.view',
        'alerts.manage'
      ]
    },
    ADMIN: {
      name: 'Administrateur',
      permissions: [
        'content.create',
        'content.update',
        'content.delete',
        'communities.manage',
        'media.manage',
        'events.manage',
        'logs.view',
        'analytics.view',
        'users.read'
      ]
    },
    MANAGER: {
      name: 'Gestionnaire',
      permissions: [
        'communities.update',
        'events.create',
        'events.update',
        'media.upload',
        'analytics.view'
      ]
    },
    MEMBER: {
      name: 'Membre',
      permissions: [
        'communities.read',
        'events.read',
        'media.read'
      ]
    }
  },

  // ============================================
  // MODULES
  // ============================================
  MODULES: {
    DASHBOARD: {
      enabled: true,
      refreshInterval: 30000 // 30 secondes
    },
    USERS: {
      enabled: true,
      itemsPerPage: 10
    },
    COMMUNITIES: {
      enabled: true,
      itemsPerPage: 10,
      mapProvider: 'leaflet' // leaflet, google, mapbox
    },
    MEDIA: {
      enabled: true,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    },
    EVENTS: {
      enabled: true,
      itemsPerPage: 15
    },
    ANALYTICS: {
      enabled: true,
      chartUpdateInterval: 60000 // 1 minute
    },
    LOGS: {
      enabled: true,
      itemsPerPage: 20,
      retention: 90 // jours
    },
    BACKUPS: {
      enabled: true,
      itemsPerPage: 10
    },
    SETTINGS: {
      enabled: true
    }
  },

  // ============================================
  // COULEURS & THÈME
  // ============================================
  THEME: {
    PRIMARY: '#1565c0',
    PRIMARY_DARK: '#0a3d6b',
    PRIMARY_LIGHT: '#1e88e5',
    ACCENT: '#c9a227',
    SUCCESS: '#4CAF50',
    WARNING: '#ff9800',
    DANGER: '#f44336',
    INFO: '#2196F3'
  },

  // ============================================
  // LOCALES
  // ============================================
  LOCALE: {
    DEFAULT: 'fr',
    SUPPORTED: ['fr', 'en', 'pt'],
    TIMEZONE: 'Africa/Kinshasa'
  },

  // ============================================
  // LOGGING
  // ============================================
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info', // debug, info, warn, error
    CONSOLE: true,
    FILE: true,
    DATABASE: true,
    RETENTION_DAYS: 90,
    ARCHIVE_AFTER_DAYS: 30
  },

  // ============================================
  // API
  // ============================================
  API: {
    ENABLED: true,
    BASE_URL: '/api/v1',
    RATE_LIMIT: true,
    CORS_ENABLED: true,
    TIMEOUT_MS: 30000
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Vérifier si une fonctionnalité est activée
 */
function isFeatureEnabled(featureName) {
  return SUPER_ADMIN_CONFIG.FEATURES[featureName] === true;
}

/**
 * Vérifier les permissions d'un rôle
 */
function hasPermission(roleName, permission) {
  var role = SUPER_ADMIN_CONFIG.ROLES[roleName];
  return role && role.permissions.includes(permission);
}

/**
 * Obtenir les couleurs du thème
 */
function getThemeColor(colorName) {
  return SUPER_ADMIN_CONFIG.THEME[colorName] || '#1565c0';
}

/**
 * Exporter la configuration
 */
if (typeof window !== 'undefined') {
  window.SUPER_ADMIN_CONFIG = SUPER_ADMIN_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPER_ADMIN_CONFIG;
}
