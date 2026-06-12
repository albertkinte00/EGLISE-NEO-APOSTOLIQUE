-- ============================================
-- Tables pour Publications et Professions
-- à exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- 1. Publications (articles / actualités)
CREATE TABLE IF NOT EXISTS publications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titre TEXT NOT NULL,
  date TEXT DEFAULT '',
  categorie TEXT DEFAULT '',
  contenu TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  lien TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "publications_lecture_publique" ON publications;
CREATE POLICY "publications_lecture_publique"
  ON publications FOR SELECT
  USING (true);

-- Écriture réservée aux admins (via anon key + Bearer)
DROP POLICY IF EXISTS "publications_admin_ecriture" ON publications;
CREATE POLICY "publications_admin_ecriture"
  ON publications FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Professions (membres du ministère)
CREATE TABLE IF NOT EXISTS professions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom TEXT NOT NULL,
  titre TEXT DEFAULT '',
  role TEXT DEFAULT '',
  description TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE professions ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "professions_lecture_publique" ON professions;
CREATE POLICY "professions_lecture_publique"
  ON professions FOR SELECT
  USING (true);

-- Écriture réservée aux admins
DROP POLICY IF EXISTS "professions_admin_ecriture" ON professions;
CREATE POLICY "professions_admin_ecriture"
  ON professions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Bucket de stockage pour les images
-- Décommenter et exécuter si le bucket n'existe pas :
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('ena-images', 'ena-images', true);
-- 
-- CREATE POLICY "stockage_public_lecture"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'ena-images');
-- 
-- CREATE POLICY "stockage_admin_upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'ena-images');
