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
-- Décommenter pour ajouter des données de test
-- ====================================================

/*
-- Communauté 1
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
