-- ============================================
-- Insertion des 5 apôtres dans la table professions
-- ============================================

INSERT INTO professions (nom, titre, role, photo_url, description, email, sort_order, is_published) VALUES
(
  'Jean-Luc Schneider',
  'Patriarche adjoint',
  'Apôtre',
  'image/ministere/apotre_patriarche_adjoint.png',
  'Patriarche adjoint de l''Église Néo-Apostolique internationale.',
  '',
  1,
  true
),
(
  'Arnaud Martig',
  'Apôtre de la ville de Brazzaville',
  'Apôtre',
  'image/ministere/apotre_ville_de_brazzaville.png',
  'Apôtre responsable de la ville de Brazzaville.',
  '',
  2,
  true
),
(
  'Aldin Makoundi',
  'Apôtre',
  'Apôtre',
  '',
  '',
  '',
  3,
  true
),
(
  'Kitosukou',
  'Apôtre',
  'Apôtre',
  '',
  '',
  '',
  4,
  true
),
(
  'Massamba Evariste',
  'Apôtre',
  'Apôtre',
  '',
  '',
  '',
  5,
  true
);
