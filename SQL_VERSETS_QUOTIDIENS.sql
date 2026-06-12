-- ============================================
-- Table Versets Quotidiens (message biblique du jour)
-- Auto-rotation toutes les 24h, inspiré du Catéchisme NAC
-- ============================================

CREATE TABLE IF NOT EXISTS versets_quotidiens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  texte TEXT NOT NULL,
  reference TEXT NOT NULL,
  source TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE versets_quotidiens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "versets_lecture_publique" ON versets_quotidiens;
CREATE POLICY "versets_lecture_publique"
  ON versets_quotidiens FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "versets_admin_ecriture" ON versets_quotidiens;
CREATE POLICY "versets_admin_ecriture"
  ON versets_quotidiens FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_versets_published ON versets_quotidiens(is_published);
CREATE INDEX IF NOT EXISTS idx_versets_ordre ON versets_quotidiens(sort_order);

-- ============================================
-- Données initiales (versets inspirés du Catéchisme NAC)
-- ============================================
INSERT INTO versets_quotidiens (texte, reference, source, sort_order, is_published) VALUES

-- Dieu le Père
('Il y a un seul Dieu et Père de tous, qui est au-dessus de tous, et parmi tous, et en tous.', 'Éphésiens 4:6', 'Catéchisme NAC – Dieu', 1, true),
('Dieu est amour ; et celui qui demeure dans l''amour demeure en Dieu, et Dieu demeure en lui.', '1 Jean 4:16', 'Catéchisme NAC – Dieu', 2, true),
('Dieu créa l''homme à son image, il le créa à l''image de Dieu, il créa l''homme et la femme.', 'Genèse 1:27', 'Catéchisme NAC – Création', 3, true),

-- Jésus-Christ
('Moi, je suis le chemin, la vérité et la vie. Nul ne vient au Père que par moi.', 'Jean 14:6', 'Catéchisme NAC – Jésus-Christ', 4, true),
('Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.', 'Matthieu 28:19', 'Catéchisme NAC – Jésus-Christ', 5, true),
('Je suis la porte. Si quelqu''un entre par moi, il sera sauvé.', 'Jean 10:9', 'Catéchisme NAC – Jésus-Christ', 6, true),

-- Saint-Esprit
('Le Consolateur, le Saint-Esprit que le Père enverra en mon nom, vous enseignera toutes choses.', 'Jean 14:26', 'Catéchisme NAC – Saint-Esprit', 7, true),
('Repentez-vous, et que chacun de vous soit baptisé au nom de Jésus-Christ pour le pardon de vos péchés ; et vous recevrez le don du Saint-Esprit.', 'Actes 2:38', 'Catéchisme NAC – Saint-Esprit', 8, true),
('L''Esprit lui-même intercède pour nous par des soupirs inexprimables.', 'Romains 8:26', 'Catéchisme NAC – Saint-Esprit', 9, true),

-- L'Église
('Dieu a tout mis sous les pieds du Christ, et l''a donné pour chef suprême à l''Église, qui est son corps.', 'Éphésiens 1:22-23', 'Catéchisme NAC – L''Église', 10, true),
('Vous êtes le corps du Christ, et vous êtes ses membres, chacun pour sa part.', '1 Corinthiens 12:27', 'Catéchisme NAC – L''Église', 11, true),
('Tu es Pierre, et sur cette pierre je bâtirai mon Église, et les portes du séjour des morts ne prévaudront point contre elle.', 'Matthieu 16:18', 'Catéchisme NAC – L''Église', 12, true),

-- Saint Baptême
('Celui qui croira et qui sera baptisé sera sauvé, mais celui qui ne croira pas sera condamné.', 'Marc 16:16', 'Catéchisme NAC – Saint Baptême', 13, true),
('Nous avons donc été ensevelis avec lui par le baptême en sa mort, afin que, comme Christ est ressuscité des morts, nous marchions aussi en nouveauté de vie.', 'Romains 6:4', 'Catéchisme NAC – Saint Baptême', 14, true),
('Si un homme ne naît d''eau et d''Esprit, il ne peut entrer dans le royaume de Dieu.', 'Jean 3:5', 'Catéchisme NAC – Saint Baptême', 15, true),

-- Sceau
('Pierre et Jean leur imposèrent les mains, et ils reçurent le Saint-Esprit.', 'Actes 8:17', 'Catéchisme NAC – Saint Sceau', 16, true),
('Vous avez été scellés du Saint-Esprit qui avait été promis, lequel est un gage de notre héritage.', 'Éphésiens 1:13-14', 'Catéchisme NAC – Saint Sceau', 17, true),
('Celui qui nous affermit avec vous en Christ et qui nous a oints, c''est Dieu, qui nous a aussi marqués d''un sceau.', '2 Corinthiens 1:21-22', 'Catéchisme NAC – Saint Sceau', 18, true),

-- Sainte-Cène
('Le Seigneur Jésus, dans la nuit où il fut livré, prit du pain, et, après avoir rendu grâces, le rompit et dit : Ceci est mon corps qui est pour vous.', '1 Corinthiens 11:23-24', 'Catéchisme NAC – Sainte-Cène', 19, true),
('Je suis le pain de vie. Celui qui vient à moi n''aura jamais faim, et celui qui croit en moi n''aura jamais soif.', 'Jean 6:35', 'Catéchisme NAC – Sainte-Cène', 20, true),
('Jésus prit du pain et dit : Prenez, mangez, ceci est mon corps. Il prit une coupe et dit : Ceci est mon sang, le sang de l''alliance.', 'Matthieu 26:26-28', 'Catéchisme NAC – Sainte-Cène', 21, true),

-- Ministère apostolique
('Jésus leur dit : Paix soit avec vous ! Comme le Père m''a envoyé, moi aussi je vous envoie.', 'Jean 20:21', 'Catéchisme NAC – Ministère apostolique', 22, true),
('Il a donné les uns comme apôtres, les autres comme prophètes, les autres comme évangélistes, les autres comme pasteurs et docteurs.', 'Éphésiens 4:11', 'Catéchisme NAC – Ministère', 23, true),
('Nous sommes donc ambassadeurs pour Christ, comme si Dieu exhortait par nous.', '2 Corinthiens 5:20', 'Catéchisme NAC – Ministère', 24, true),

-- Vie chrétienne (foi, amour, espérance)
('La foi est une ferme assurance des choses qu''on espère, une démonstration de celles qu''on ne voit pas.', 'Hébreux 11:1', 'Catéchisme NAC – Foi', 25, true),
('La foi vient de ce qu''on entend, et ce qu''on entend vient de la parole de Dieu.', 'Romains 10:17', 'Catéchisme NAC – Foi', 26, true),
('Aimez-vous les uns les autres comme je vous ai aimés.', 'Jean 15:12', 'Catéchisme NAC – Amour', 27, true),
('Nous aimons parce qu''il nous a aimés le premier.', '1 Jean 4:19', 'Catéchisme NAC – Amour', 28, true),
('Béni soit Dieu qui nous a régénérés pour une espérance vivante par la résurrection de Jésus-Christ.', '1 Pierre 1:3', 'Catéchisme NAC – Espérance', 29, true),

-- Prière et pardon
('Vous donc, priez ainsi : Notre Père qui es aux cieux, que ton nom soit sanctifié.', 'Matthieu 6:9', 'Catéchisme NAC – Prière', 30, true),
('Ne vous inquiétez de rien, mais en toute chose faites connaître vos demandes à Dieu par la prière.', 'Philippiens 4:6', 'Catéchisme NAC – Prière', 31, true),
('Si vous pardonnez aux hommes leurs offenses, votre Père céleste vous pardonnera aussi.', 'Matthieu 6:14', 'Catéchisme NAC – Pardon', 32, true),

-- Eschatologie et résurrection
('Le Seigneur lui-même descendra du ciel, et les morts en Christ ressusciteront premièrement. Ensuite nous serons enlevés avec eux dans les nuées.', '1 Thessaloniciens 4:16-17', 'Catéchisme NAC – Eschatologie', 33, true),
('Voici le tabernacle de Dieu avec les hommes ! Il essuiera toute larme de leurs yeux, et la mort ne sera plus.', 'Apocalypse 21:3-4', 'Catéchisme NAC – Eschatologie', 34, true),

-- Unité
('Que tous soient un, comme toi, Père, tu es en moi et moi en toi, afin qu''eux aussi soient un en nous.', 'Jean 17:21', 'Catéchisme NAC – Unité', 35, true),

-- Résurrection
('Christ est ressuscité des morts, prémices de ceux qui sont morts. Car, comme la mort est venue par un homme, la résurrection des morts vient par un homme.', '1 Corinthiens 15:20-21', 'Catéchisme NAC – Résurrection', 36, true),

-- Consécration
('Je vous exhorte à offrir vos corps comme un sacrifice vivant, saint, agréable à Dieu, ce qui est votre culte raisonnable.', 'Romains 12:1', 'Catéchisme NAC – Vie chrétienne', 37, true),

-- Fruit de l'Esprit
('Le fruit de l''Esprit c''est l''amour, la joie, la paix, la patience, la bonté, la bienveillance, la foi, la douceur, la maîtrise de soi.', 'Galates 5:22-23', 'Catéchisme NAC – Saint-Esprit', 38, true);
