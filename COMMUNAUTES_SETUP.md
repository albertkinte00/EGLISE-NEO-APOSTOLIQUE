# Rubrique Communautés – Guide Supabase

## 📋 Aperçu

Nouvelle rubrique permettant aux utilisateurs de localiser les communautés Néo-Apostoliques avec :
- 🗺️ Carte interactive Google Maps
- 🔍 Recherche par district, quartier, zone ou nom
- 📍 Géolocalisation utilisateur
- 📱 Détails complets de chaque communauté
- 📞 Contacts (téléphone, email, WhatsApp)
- ⏰ Horaires des services (cultes, réunions, études)
- 📅 Activités (jeunesse, prière, etc.)

---

## 🗄️ Tables Supabase à créer

### 1. Table `communautes`
Informations principales des communautés.

**SQL :**
```sql
CREATE TABLE communautes (
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

-- Index pour recherche rapide
CREATE INDEX idx_communautes_nom ON communautes(nom);
CREATE INDEX idx_communautes_active ON communautes(active);
```

**Colonnes :**
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| id | BIGINT | ✅ | ID unique auto-généré |
| nom | TEXT | ✅ | Nom de la communauté |
| district_apostolique | TEXT | ❌ | Ex: "District de Kinshasa" |
| quartier | TEXT | ❌ | Ex: "Poto-Poto" |
| zone | TEXT | ❌ | Ex: "Centre-ville" |
| latitude | FLOAT | ✅ | Coordonnée GPS (ex: -4.2634) |
| longitude | FLOAT | ✅ | Coordonnée GPS (ex: 15.2429) |
| responsable | TEXT | ❌ | Nom du leader/pasteur |
| adresse | TEXT | ❌ | Adresse physique |
| point_repere | TEXT | ❌ | "À côté de..." pour aider |
| photo_url | TEXT | ❌ | URL de l'image de la communauté |
| description | TEXT | ❌ | Infos supplémentaires |
| active | BOOLEAN | ✅ | Affichée sur le site ? |
| created_at | TIMESTAMP | ✅ | Date création (auto) |
| updated_at | TIMESTAMP | ✅ | Date modification (auto) |

---

### 2. Table `contacts_communaute`
Contacts (téléphone, email, WhatsApp) par communauté.

**SQL :**
```sql
CREATE TABLE contacts_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('telephone', 'email', 'whatsapp')),
  valeur TEXT NOT NULL,
  primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_contacts_communaute ON contacts_communaute(communaute_id);
```

**Colonnes :**
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| id | BIGINT | ✅ | ID unique |
| communaute_id | BIGINT | ✅ | Lien vers communauté |
| type | TEXT | ✅ | 'telephone', 'email' ou 'whatsapp' |
| valeur | TEXT | ✅ | Numéro/email (ex: "+242 06 123 45 67") |
| primary | BOOLEAN | ✅ | Contact principal ? |
| created_at | TIMESTAMP | ✅ | Date création |

---

### 3. Table `horaires_services`
Horaires des cultes et services (dimanche 9h30, mercredi 18h, etc.).

**SQL :**
```sql
CREATE TABLE horaires_services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  type_service TEXT NOT NULL CHECK (type_service IN ('culte', 'reunion', 'etude', 'priere')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_horaires_communaute ON horaires_services(communaute_id);
```

**Colonnes :**
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| id | BIGINT | ✅ | ID unique |
| communaute_id | BIGINT | ✅ | Lien vers communauté |
| jour | TEXT | ✅ | Ex: "Dimanche", "Mercredi" |
| heure_debut | TEXT | ✅ | Format "HH:MM" ex: "09:30" |
| heure_fin | TEXT | ✅ | Format "HH:MM" ex: "11:30" |
| type_service | TEXT | ✅ | 'culte', 'reunion', 'etude', 'priere' |
| created_at | TIMESTAMP | ✅ | Date création |

---

### 4. Table `activites_communaute`
Activités complémentaires (réunion jeunesse lundi, prière mercredi, etc.).

**SQL :**
```sql
CREATE TABLE activites_communaute (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  communaute_id BIGINT NOT NULL REFERENCES communautes(id) ON DELETE CASCADE,
  jour TEXT NOT NULL,
  heure TEXT NOT NULL,
  activite TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_activites_communaute ON activites_communaute(communaute_id);
```

**Colonnes :**
| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| id | BIGINT | ✅ | ID unique |
| communaute_id | BIGINT | ✅ | Lien vers communauté |
| jour | TEXT | ✅ | Ex: "Lundi", "Jeudi" |
| heure | TEXT | ✅ | Format "HH:MM" ex: "18:30" |
| activite | TEXT | ✅ | Ex: "Réunion jeunesse", "Prière" |
| description | TEXT | ❌ | Détails supplémentaires |
| created_at | TIMESTAMP | ✅ | Date création |

---

## 🔧 Étapes de configuration

### Étape 1 : Créer les tables dans Supabase

1. Connectez-vous à [Supabase](https://supabase.com)
2. Allez dans **SQL Editor**
3. Créez une nouvelle query
4. Copiez-collez chaque SQL ci-dessus et exécutez

**Ordre de création :**
1. `communautes` (table parent)
2. `contacts_communaute`
3. `horaires_services`
4. `activites_communaute`

### Étape 2 : Configurer Row Level Security (RLS)

Pour la **lecture publique** :

```sql
-- communautes
ALTER TABLE communautes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON communautes FOR SELECT USING (active = true);

-- contacts_communaute
ALTER TABLE contacts_communaute ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON contacts_communaute FOR SELECT USING (true);

-- horaires_services
ALTER TABLE horaires_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON horaires_services FOR SELECT USING (true);

-- activites_communaute
ALTER TABLE activites_communaute ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON activites_communaute FOR SELECT USING (true);
```

**Pour l'admin (écritures) :**
Utiliser des `ADMIN_ALLOWED_EMAIL` (voir section Admin).

### Étape 3 : Configurer Google Maps API

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **Créer un projet** ou en utiliser un existant
3. **Activer les APIs** :
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Credentials** → **Create Credentials** → **API Key**
5. Restreindre la clé aux **HTTP referrers** :
   - Local: `http://localhost*`
   - Production: `https://votre-domaine.com/*`

6. Copier la clé et remplacer dans `communautes.html` :
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

---

## 📂 Fichiers à utiliser

### Site public
- **communautes.html** – Page principale avec carte
- **communautes.js** – Logique Google Maps, recherche, géolocalisation

### Administration
- **admin/communautes-panel.html** – Formulaires d'ajout (à intégrer dans admin/index.html)
- **admin/communautes-admin.js** – Logique CRUD (à ajouter en <script>)

### Intégration
1. Ajouter dans `index.html` nav link:
   ```html
   <a href="communautes.html">Communautés</a>
   ```

2. Dans `admin/index.html`, ajouter:
   ```html
   <!-- Inclure le panel communautés -->
   <!-- Dans <nav class="admin-nav"> -->
   <a href="#communautes">Communautés</a>
   
   <!-- Puis intégrer le contenu de communautes-panel.html dans le main -->
   ```

3. Dans `admin/index.html` avant `</body>`:
   ```html
   <script src="communautes-admin.js"></script>
   ```

---

## 📊 Exemple de données

### Communauté exemple
```json
{
  "nom": "Communauté de Poto-Poto",
  "district_apostolique": "District de Brazzaville",
  "quartier": "Poto-Poto",
  "zone": "Centre-ville",
  "latitude": -4.2634,
  "longitude": 15.2429,
  "responsable": "Pasteur Jean-Luc",
  "adresse": "Rue de l'Église, N°123",
  "point_repere": "À côté de l'école primaire Saint-Paul",
  "photo_url": "image/communautes/poto-poto.jpg",
  "description": "Communauté active avec 150+ membres, activités jeunesse régulières",
  "active": true
}
```

### Contact exemple
```json
{
  "communaute_id": 1,
  "type": "telephone",
  "valeur": "+242 06 123 45 67",
  "primary": true
}
```

### Horaire exemple
```json
{
  "communaute_id": 1,
  "jour": "Dimanche",
  "heure_debut": "09:30",
  "heure_fin": "11:30",
  "type_service": "culte"
}
```

### Activité exemple
```json
{
  "communaute_id": 1,
  "jour": "Mercredi",
  "heure": "18:30",
  "activite": "Réunion jeunesse",
  "description": "Pour les 15-25 ans"
}
```

---

## 🔐 Sécurité

- ✅ API key Google Maps restreinte
- ✅ Supabase ANON_KEY en lecture seule (publique)
- ✅ RLS pour lire les données actives seulement
- ✅ Admin panel sécurisé via Google OAuth
- ⚠️ **À faire** : Backend proxy pour les écritures admin (voir section sécurité)

---

## 🚀 Déploiement

1. **Tester localement** : tout fonctionne avec Supabase cloud
2. **Vérifier les CORS** : Supabase doit autoriser votre domaine
3. **Domaine de production** : Ajouter à Google Cloud Console
4. **Cache** : CDN pour images communautés

---

## 📞 Support & Troubleshooting

| Problème | Solution |
|----------|----------|
| La carte ne s'affiche pas | Vérifier Google Maps API key |
| Pas de résultats recherche | Vérifier les données dans Supabase |
| Erreur "CORS" | Configurer CORS dans Supabase ou utiliser proxy |
| Localisation ne fonctionne pas | HTTPS requis + permission utilisateur |

---

## 📝 Checklist de déploiement

- [ ] Créer les 4 tables Supabase
- [ ] Configurer RLS (Row Level Security)
- [ ] Google Maps API key obtenue
- [ ] Clé Google Maps insérée dans communautes.html
- [ ] `communautes.html` et `communautes.js` en place
- [ ] Panel admin intégré (`communautes-panel.html`)
- [ ] Script admin intégré (`communautes-admin.js` en <script>)
- [ ] Navigation mise à jour
- [ ] Tester sur mobile et desktop
- [ ] Insérer données de test (1-2 communautés)
- [ ] Déployer en production
