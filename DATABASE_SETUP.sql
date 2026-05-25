-- ==========================================================
-- EGLISE NEO-APOSTOLIQUE - SCHEMA ADMIN / SUPERADMIN
-- Compatible avec le nouveau panneau admin/index.html
-- A executer dans Supabase SQL Editor
-- ==========================================================

-- ----------------------------------------------------------
-- 1. PARAMETRES GLOBAUX DU SITE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGINT PRIMARY KEY,
  notification_html TEXT,
  home_welcome_text TEXT,
  home_verse_text TEXT,
  home_verse_ref TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  contact_map_embed_url TEXT,
  youtube_url TEXT,
  facebook_url TEXT,
  whatsapp_url TEXT,
  nac_today_url TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 2. ANNONCES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS annonces (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  badge TEXT,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annonces_published ON annonces(is_published);

-- ----------------------------------------------------------
-- 3. ACTUALITES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS actualites (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT NOT NULL,
  date TEXT,
  contenu TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE actualites ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS link_label TEXT;
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_actualites_published ON actualites(is_published);

-- ----------------------------------------------------------
-- 4. EVENEMENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS evenements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT NOT NULL,
  date TEXT,
  "desc" TEXT,
  location TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE evenements ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE evenements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_evenements_published ON evenements(is_published);

-- ----------------------------------------------------------
-- 5. MEDIAS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  titre TEXT NOT NULL,
  categorie TEXT,
  description TEXT,
  url TEXT,
  link_label TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_items_published ON media_items(is_published);

-- ----------------------------------------------------------
-- 6. COMMUNAUTES
-- ----------------------------------------------------------
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communautes_nom ON communautes(nom);
CREATE INDEX IF NOT EXISTS idx_communautes_active ON communautes(active);

-- ----------------------------------------------------------
-- 7. CONTACTS DES COMMUNAUTES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('telephone', 'email', 'whatsapp')),
  valeur TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_communaute ON contacts_communaute(communaute_id);

-- ----------------------------------------------------------
-- 8. HORAIRES DES COMMUNAUTES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS horaires_services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  type_service TEXT NOT NULL CHECK (type_service IN ('culte', 'reunion', 'etude', 'priere')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horaires_communaute ON horaires_services(communaute_id);

-- ----------------------------------------------------------
-- 9. ACTIVITES DES COMMUNAUTES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS activites_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure TEXT NOT NULL,
  activite TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activites_communaute ON activites_communaute(communaute_id);

-- ----------------------------------------------------------
-- 10. LEGACY TABLE OPTIONNELLE POUR COMPATIBILITE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  html_notif TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 11. RLS
-- ----------------------------------------------------------
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE communautes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_communaute ENABLE ROW LEVEL SECURITY;
ALTER TABLE horaires_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE activites_communaute ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "Public read site settings" ON site_settings;
CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read annonces" ON annonces;
CREATE POLICY "Public read annonces" ON annonces
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read actualites" ON actualites;
CREATE POLICY "Public read actualites" ON actualites
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read evenements" ON evenements;
CREATE POLICY "Public read evenements" ON evenements
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read media items" ON media_items;
CREATE POLICY "Public read media items" ON media_items
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read active communities" ON communautes;
CREATE POLICY "Public read active communities" ON communautes
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read community contacts" ON contacts_communaute;
CREATE POLICY "Public read community contacts" ON contacts_communaute
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read community horaires" ON horaires_services;
CREATE POLICY "Public read community horaires" ON horaires_services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read community activites" ON activites_communaute;
CREATE POLICY "Public read community activites" ON activites_communaute
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read legacy settings" ON settings;
CREATE POLICY "Public read legacy settings" ON settings
  FOR SELECT USING (true);

-- ----------------------------------------------------------
-- 12. NOTES IMPORTANTES
-- ----------------------------------------------------------
-- Le nouveau panneau admin utilise une cle publishable cote navigateur.
-- Pour autoriser les ecritures de facon securisee, vous devez completer
-- vos politiques RLS selon votre methode d'authentification reelle.
-- Sans cela, seules les lectures publiques sont garanties.
--
-- Si vous voulez une ecriture directe depuis le navigateur avec la cle
-- anon/publishable, il faudra mettre en place une politique specifique
-- adaptee a Supabase Auth ou passer par une Edge Function securisee.
-- ==========================================================
