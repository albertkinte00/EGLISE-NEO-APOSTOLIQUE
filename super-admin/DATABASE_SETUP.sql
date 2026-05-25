-- ========================================
-- 🔐 SUPER ADMINISTRATEUR - SETUP SQL
-- BASE DE DONNÉES COMPLÈTE POUR SUPABASE
-- ========================================

-- Supprimer les tables si elles existent (optionnel)
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS backups CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

-- ========================================
-- 1. TABLE: ROLES
-- ========================================
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description, level) VALUES
('super_admin', 'Super Administrateur avec accès complet', 4),
('admin', 'Administrateur avec accès étendu', 3),
('manager', 'Gestionnaire avec accès limité', 2),
('member', 'Membre avec accès minimal', 1);

-- ========================================
-- 2. TABLE: PERMISSIONS
-- ========================================
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50),
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissions (name, description, module, action) VALUES
-- Utilisateurs
('users.view', 'Voir les utilisateurs', 'users', 'view'),
('users.create', 'Créer des utilisateurs', 'users', 'create'),
('users.edit', 'Modifier les utilisateurs', 'users', 'edit'),
('users.delete', 'Supprimer les utilisateurs', 'users', 'delete'),

-- Communautés
('communities.view', 'Voir les communautés', 'communities', 'view'),
('communities.create', 'Créer des communautés', 'communities', 'create'),
('communities.edit', 'Modifier les communautés', 'communities', 'edit'),
('communities.delete', 'Supprimer les communautés', 'communities', 'delete'),

-- Événements
('events.view', 'Voir les événements', 'events', 'view'),
('events.create', 'Créer des événements', 'events', 'create'),
('events.edit', 'Modifier les événements', 'events', 'edit'),
('events.delete', 'Supprimer les événements', 'events', 'delete'),

-- Contenu
('content.view', 'Voir le contenu', 'content', 'view'),
('content.create', 'Créer du contenu', 'content', 'create'),
('content.edit', 'Modifier le contenu', 'content', 'edit'),
('content.delete', 'Supprimer le contenu', 'content', 'delete'),

-- Médias
('media.view', 'Voir les médias', 'media', 'view'),
('media.upload', 'Uploader des médias', 'media', 'upload'),
('media.delete', 'Supprimer des médias', 'media', 'delete'),

-- Paramètres
('settings.view', 'Voir les paramètres', 'settings', 'view'),
('settings.edit', 'Modifier les paramètres', 'settings', 'edit'),

-- Sauvegardes
('backups.view', 'Voir les sauvegardes', 'backups', 'view'),
('backups.create', 'Créer des sauvegardes', 'backups', 'create'),
('backups.restore', 'Restaurer des sauvegardes', 'backups', 'restore'),
('backups.delete', 'Supprimer des sauvegardes', 'backups', 'delete'),

-- Logs
('logs.view', 'Voir les logs', 'logs', 'view'),
('logs.clear', 'Effacer les logs', 'logs', 'clear'),

-- Système
('system.maintenance', 'Mode maintenance', 'system', 'maintenance'),
('system.admin', 'Accès administrateur système', 'system', 'admin');

-- ========================================
-- 3. TABLE: USERS
-- ========================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  role_id INTEGER REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'active',
  is_super_admin BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  secret_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Données initiales
INSERT INTO users (name, email, password_hash, phone, role_id, status, is_super_admin, secret_key, email_verified) VALUES
('Albert Kint Sodiza', 'albertkintsodiza@gmail.com', '$2a$10$super_admin_hash', '+243123456789', 1, 'active', TRUE, 'super_secret_key_123', TRUE),
('Admin Général', 'admin@eglise.com', '$2a$10$admin_hash', '+243987654321', 2, 'active', FALSE, NULL, TRUE);

-- ========================================
-- 4. TABLE: USER_PERMISSIONS (Association M2M)
-- ========================================
CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission_id)
);

-- Permissions Super Admin (tous les droits)
INSERT INTO user_permissions (user_id, permission_id)
SELECT u.id, p.id 
FROM users u, permissions p 
WHERE u.email = 'albertkintsodiza@gmail.com';

-- ========================================
-- 5. TABLE: SESSIONS
-- ========================================
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ========================================
-- 6. TABLE: ACTIVITY_LOGS
-- ========================================
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id INTEGER,
  description TEXT,
  status VARCHAR(20), -- success, warning, danger, info
  ip_address VARCHAR(45),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_logs_module ON activity_logs(module);
CREATE INDEX idx_logs_created_at ON activity_logs(created_at DESC);

-- Données initiales
INSERT INTO activity_logs (user_id, action, module, entity_type, description, status, ip_address) VALUES
(1, 'LOGIN', 'auth', 'user', 'Connexion réussie', 'success', '192.168.1.1'),
(1, 'CREATE_USER', 'users', 'user', 'Création utilisateur Admin Général', 'success', '192.168.1.1');

-- ========================================
-- 7. TABLE: SETTINGS
-- ========================================
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20), -- string, boolean, integer, json
  category VARCHAR(50), -- general, security, features, maintenance
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO settings (key, value, type, category) VALUES
('app_name', 'Église Néo-Apostolique', 'string', 'general'),
('app_version', '1.0.0', 'string', 'general'),
('admin_email', 'albertkintsodiza@gmail.com', 'string', 'general'),
('timezone', 'Africa/Kinshasa', 'string', 'general'),
('language', 'fr', 'string', 'general'),
('maintenance_mode', 'false', 'boolean', 'maintenance'),
('maintenance_message', 'Le site est en maintenance', 'string', 'maintenance'),
('session_timeout', '1800', 'integer', 'security'),
('force_https', 'true', 'boolean', 'security'),
('enable_2fa', 'false', 'boolean', 'security'),
('enable_logs', 'true', 'boolean', 'security'),
('log_retention_days', '90', 'integer', 'security'),
('feature_communities', 'true', 'boolean', 'features'),
('feature_events', 'true', 'boolean', 'features'),
('feature_media', 'true', 'boolean', 'features'),
('feature_content', 'true', 'boolean', 'features'),
('backup_auto_enabled', 'true', 'boolean', 'features'),
('backup_frequency', 'weekly', 'string', 'features'),
('backup_retention_days', '90', 'integer', 'features');

-- ========================================
-- 8. TABLE: BACKUPS
-- ========================================
CREATE TABLE backups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- full, partial, daily, weekly, manual
  size_mb DECIMAL(10,2),
  file_path VARCHAR(255),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  restored_at TIMESTAMP,
  restored_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, restored
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_backups_created_at ON backups(created_at DESC);
CREATE INDEX idx_backups_status ON backups(status);

-- ========================================
-- 9. TABLE: COMMUNITIES (Communautés)
-- ========================================
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  address VARCHAR(255),
  city VARCHAR(50),
  country VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  established_year INTEGER,
  pastor_name VARCHAR(100),
  members_count INTEGER DEFAULT 0,
  logo_url VARCHAR(255),
  image_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communities_status ON communities(status);
CREATE INDEX idx_communities_city ON communities(city);

-- ========================================
-- 10. TABLE: EVENTS (Événements)
-- ========================================
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  description TEXT,
  content TEXT,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  event_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(255),
  category VARCHAR(50), -- service, celebration, seminar, workshop, other
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
  max_attendees INTEGER,
  attendees_count INTEGER DEFAULT 0,
  image_url VARCHAR(255),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_community_id ON events(community_id);

-- ========================================
-- 11. TABLE: CONTENT (Contenu)
-- ========================================
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(255),
  category VARCHAR(50), -- page, blog, news, prayer, scripture, other
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  featured BOOLEAN DEFAULT FALSE,
  page_name VARCHAR(50), -- home, about, mission, ministry, etc.
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(255),
  image_url VARCHAR(255),
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_page_name ON content(page_name);

-- ========================================
-- 12. TABLE: MEDIA (Médias)
-- ========================================
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- image, video, document, audio
  mime_type VARCHAR(50),
  file_path VARCHAR(255) NOT NULL UNIQUE,
  file_size_mb DECIMAL(10,2),
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  category VARCHAR(50), -- gallery, news, events, media, other
  tags VARCHAR(255),
  is_public BOOLEAN DEFAULT TRUE,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- ========================================
-- 13. TABLE: NOTIFICATIONS
-- ========================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- alert, warning, info, success
  title VARCHAR(150) NOT NULL,
  message TEXT,
  data JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- ========================================
-- 14. TABLE: API_KEYS (Clés API)
-- ========================================
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  key VARCHAR(255) UNIQUE NOT NULL,
  secret VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- ========================================
-- 15. TABLE: AUDIT_TRAIL (Historique des modifications)
-- ========================================
CREATE TABLE audit_trail (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at DESC);

-- ========================================
-- VUES (VIEWS) - Pour faciliter les requêtes
-- ========================================

-- Vue: Utilisateurs avec leurs rôles et permissions
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.status,
  r.name as role_name,
  COUNT(DISTINCT up.permission_id) as permissions_count
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_permissions up ON u.id = up.user_id
GROUP BY u.id, u.name, u.email, u.status, r.name;

-- Vue: Utilisateurs avec détails complets
CREATE OR REPLACE VIEW v_user_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.status,
  u.is_super_admin,
  u.last_login,
  u.created_at,
  r.name as role_name,
  r.level as role_level,
  STRING_AGG(DISTINCT p.name, ', ') as permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_permissions up ON u.id = up.user_id
LEFT JOIN permissions p ON up.permission_id = p.id
GROUP BY u.id, u.name, u.email, u.phone, u.status, u.is_super_admin, u.last_login, u.created_at, r.name, r.level;

-- Vue: Logs avec infos utilisateur
CREATE OR REPLACE VIEW v_activity_logs_detailed AS
SELECT 
  al.id,
  al.action,
  al.module,
  al.description,
  al.status,
  al.created_at,
  u.name as user_name,
  u.email as user_email
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- ========================================
-- FONCTIONS
-- ========================================

-- Fonction: Mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour communities
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON communities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour content
CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour media
CREATE TRIGGER update_media_updated_at
BEFORE UPDATE ON media
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Enregistrer log d'activité
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id INTEGER,
  p_action VARCHAR,
  p_module VARCHAR,
  p_description TEXT,
  p_status VARCHAR DEFAULT 'info',
  p_ip_address VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_log_id INTEGER;
BEGIN
  INSERT INTO activity_logs (user_id, action, module, description, status, ip_address)
  VALUES (p_user_id, p_action, p_module, p_description, p_status, p_ip_address)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- SÉCURITÉ - Row Level Security (RLS)
-- ========================================

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Politique: Super Admin voit tout
CREATE POLICY admin_all_users ON users
  FOR ALL
  USING (
    auth.uid()::text = (SELECT id::text FROM users WHERE is_super_admin = TRUE LIMIT 1)
  );

-- ========================================
-- COMMENTAIRES - Documentation SQL
-- ========================================

COMMENT ON TABLE users IS 'Stocke tous les utilisateurs du système';
COMMENT ON TABLE roles IS 'Définit les rôles disponibles (super_admin, admin, manager, member)';
COMMENT ON TABLE permissions IS 'Définit les permissions granulaires du système';
COMMENT ON TABLE user_permissions IS 'Association M2M entre utilisateurs et permissions';
COMMENT ON TABLE activity_logs IS 'Enregistre toutes les actions effectuées';
COMMENT ON TABLE communities IS 'Stocke les communautés/églises';
COMMENT ON TABLE events IS 'Stocke les événements et services';
COMMENT ON TABLE content IS 'Stocke le contenu éditorial (pages, articles, etc)';
COMMENT ON TABLE media IS 'Stocke les informations sur les fichiers multimédias';
COMMENT ON TABLE settings IS 'Stocke les paramètres de configuration du système';
COMMENT ON TABLE backups IS 'Enregistre les sauvegardes effectuées';
COMMENT ON TABLE sessions IS 'Gère les sessions utilisateur actives';
COMMENT ON TABLE notifications IS 'Enregistre les notifications';
COMMENT ON TABLE api_keys IS 'Gère les clés API pour accès tiers';
COMMENT ON TABLE audit_trail IS 'Enregistre l\'historique de toutes les modifications';

-- ========================================
-- FIN DU SCRIPT
-- ========================================
-- Ce script crée une base de données complète et prête à l'emploi
-- pour le système Super Admin de l'Église Néo-Apostolique
--
-- Instructions d'utilisation:
-- 1. Copier ce contenu complet
-- 2. Aller sur Supabase -> SQL Editor
-- 3. Créer une nouvelle requête
-- 4. Coller le contenu
-- 5. Cliquer sur "Run"
--
-- Les tables seront créées avec:
-- - Données initiales pour super admin
-- - Rôles et permissions prédéfinis
-- - Indices de performance optimisés
-- - Vues pour faciliter les requêtes
-- - Fonctions et triggers automatiques
-- - Sécurité RLS intégrée
-- ========================================
