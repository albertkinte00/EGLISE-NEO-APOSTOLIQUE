-- ====================================================
-- ÉGLISE NÉO-APOSTOLIQUE – RUBRIQUE COMMUNAUTÉS
-- Crée les tables pour localiser les communautés
-- Exécuter dans Supabase SQL Editor
-- ====================================================

-- 1. TABLE PRINCIPALE : COMMUNAUTÉS
-- Contient les informations de base de chaque communauté

CREATE TABLE IF NOT EXISTS communautes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  district_apostolique TEXT,
  quartier TEXT,
  zone TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  responsable TEXT,
  adresse TEXT,
  point_repere TEXT,
  photo_url TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour accélérer recherches
CREATE INDEX IF NOT EXISTS idx_communautes_nom ON communautes(nom);
CREATE INDEX IF NOT EXISTS idx_communautes_active ON communautes(active);

-- ====================================================

-- 2. TABLE CONTACTS : Téléphones, emails, WhatsApp
-- Chaque communauté peut avoir plusieurs contacts

CREATE TABLE IF NOT EXISTS contacts_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('telephone', 'email', 'whatsapp')),
  valeur TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_communaute ON contacts_communaute(communaute_id);

-- ====================================================

-- 3. TABLE HORAIRES : Services (cultes, réunions, études)
-- Jours et heures de chaque type de service

CREATE TABLE IF NOT EXISTS horaires_services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  type_service TEXT NOT NULL CHECK (type_service IN ('culte', 'reunion', 'etude', 'priere')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horaires_communaute ON horaires_services(communaute_id);

-- ====================================================

-- 4. TABLE ACTIVITÉS : Activités complémentaires
-- Réunion jeunesse, prière, etc.

CREATE TABLE IF NOT EXISTS activites_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure TEXT NOT NULL,
  activite TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activites_communaute ON activites_communaute(communaute_id);

-- ====================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE communautes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_communaute ENABLE ROW LEVEL SECURITY;
ALTER TABLE horaires_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE activites_communaute ENABLE ROW LEVEL SECURITY;

-- POLITIQUE 1 : Communautés – Lecture publique (actives seulement)
CREATE POLICY "Public read active communities" ON communautes
  FOR SELECT USING (active = true);

-- POLITIQUE 2 : Contacts – Lecture publique
CREATE POLICY "Public read contacts" ON contacts_communaute
  FOR SELECT USING (true);

-- POLITIQUE 3 : Horaires – Lecture publique
CREATE POLICY "Public read horaires" ON horaires_services
  FOR SELECT USING (true);

-- POLITIQUE 4 : Activités – Lecture publique
CREATE POLICY "Public read activites" ON activites_communaute
  FOR SELECT USING (true);

-- ====================================================
-- DONNÉES DE TEST (optionnel)

-- =========================
-- 1. Table des utilisateurs
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  nom TEXT,
  mot_de_passe TEXT, -- (ou géré par Supabase Auth)
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- 2. Table des événements
-- =========================
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  heure TIME,
  lieu TEXT,
  communaute_id BIGINT REFERENCES communautes(id) ON DELETE SET NULL,
  image_url TEXT,
  cree_par BIGINT REFERENCES users(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'publie' CHECK (statut IN ('brouillon', 'publie', 'archive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_communaute ON events(communaute_id);

-- =========================
-- 3. Table des médias
-- =========================
CREATE TABLE IF NOT EXISTS medias (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  communaute_id BIGINT REFERENCES communautes(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  cree_par BIGINT REFERENCES users(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'publie' CHECK (statut IN ('brouillon', 'publie', 'archive')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medias_communaute ON medias(communaute_id);

-- =========================
-- 4. Table des actualités/annonces
-- =========================
CREATE TABLE IF NOT EXISTS news (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  image_url TEXT,
  communaute_id BIGINT REFERENCES communautes(id) ON DELETE SET NULL,
  cree_par BIGINT REFERENCES users(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'publie' CHECK (statut IN ('brouillon', 'publie', 'archive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_communaute ON news(communaute_id);

-- =========================
-- 5. Table des signalements (reports)
-- =========================
CREATE TABLE IF NOT EXISTS signalements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type_objet TEXT NOT NULL CHECK (type_objet IN ('event', 'media', 'news', 'communaute')),
  objet_id BIGINT NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  motif TEXT NOT NULL,
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'traite', 'rejete')),
  commentaire_admin TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  traite_par BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- 6. Table des notifications
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =========================
-- 7. Table de l’historique des actions
-- =========================
CREATE TABLE IF NOT EXISTS historique_actions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  cible_type TEXT NOT NULL,
  cible_id BIGINT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- 8. (Optionnel) Table des statistiques (ou vues matérialisées)
-- =========================
-- À créer selon besoins spécifiques (ex : vues pour nb membres, nb événements, etc.)

/*
INSERT INTO communautes (nom, district_apostolique, quartier, zone, latitude, longitude, responsable, adresse, point_repere, description, active)
VALUES (
  'Communauté de Poto-Poto',
  'District de Brazzaville',
  'Poto-Poto',
  'Centre-ville',
  -4.2634,
  15.2429,
  'Pasteur Jean-Luc',
  'Rue de l''Église, N°123',
  'À côté de l''école primaire Saint-Paul',
  'Communauté active avec 150+ membres, activités jeunesse régulières',
  true
);

-- Communauté 2
INSERT INTO communautes (nom, district_apostolique, quartier, zone, latitude, longitude, responsable, adresse, point_repere, description, active)
VALUES (
  'Communauté de Bacongo',
  'District de Brazzaville',
  'Bacongo',
  'Sud',
  -4.2750,
  15.2400,
  'Frère Arnaud',
  'Avenue du Commerce',
  'Marché de Bacongo',
  'Communauté en croissance',
  true
);

-- Contacts pour Poto-Poto (ID 1)
INSERT INTO contacts_communaute (communaute_id, type, valeur, is_primary)
VALUES 
  (1, 'telephone', '+242 06 123 45 67', true),
  (1, 'whatsapp', '+242 06 123 45 67', false),
  (1, 'email', 'potototo@church.com', false);

-- Horaires pour Poto-Poto (ID 1)
INSERT INTO horaires_services (communaute_id, jour, heure_debut, heure_fin, type_service)
VALUES 
  (1, 'Dimanche', '09:30', '11:30', 'culte'),
  (1, 'Mercredi', '18:00', '19:30', 'reunion'),
  (1, 'Samedi', '14:00', '15:30', 'etude');

-- Activités pour Poto-Poto (ID 1)
INSERT INTO activites_communaute (communaute_id, jour, heure, activite, description)
VALUES 
  (1, 'Lundi', '18:30', 'Réunion jeunesse', 'Pour les 15-25 ans'),
  (1, 'Jeudi', '19:00', 'Prière collective', 'Intercessions');
*/

-- ====================================================
-- FIN – Tables créées et prêtes !
-- ====================================================
-- 
-- Prochaines étapes :
-- 1. Vérifier que les tables existent dans Supabase Dashboard
-- 2. Ajouter votre clé Google Maps API dans communautes.html
-- 3. Intégrer le panel admin dans admin/index.html
-- 4. Ajouter quelques communautés de test
-- 5. Déployer !
-- ====================================================
