-- ============================================
-- Table Galerie Images + améliorations
-- ============================================

-- 1. Ajout de la colonne image_url aux actualités
ALTER TABLE actualites ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Table galerie_images pour la gestion dynamique de la galerie
CREATE TABLE IF NOT EXISTS galerie_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titre TEXT DEFAULT '',
  categorie TEXT NOT NULL DEFAULT 'autres',
  image_url TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE galerie_images ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "galerie_lecture_publique" ON galerie_images;
CREATE POLICY "galerie_lecture_publique"
  ON galerie_images FOR SELECT
  USING (true);

-- Écriture admin
DROP POLICY IF EXISTS "galerie_admin_ecriture" ON galerie_images;
CREATE POLICY "galerie_admin_ecriture"
  ON galerie_images FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_galerie_published ON galerie_images(is_published);
CREATE INDEX IF NOT EXISTS idx_galerie_categorie ON galerie_images(categorie);
