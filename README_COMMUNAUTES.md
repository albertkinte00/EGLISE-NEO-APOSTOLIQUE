# Rubrique Communautés – GUIDE COMPLET

## 📌 Résumé

Nouvelle rubrique **"Localiser une Communauté"** permettant aux utilisateurs de:
- 🗺️ Voir les communautés sur une **carte Google Maps interactive**
- 🔍 **Rechercher** par district, quartier, zone ou nom
- 📍 Obtenir les **communautés les plus proches** (géolocalisation GPS)
- 📞 Consulter les **contacts** (téléphone, email, WhatsApp)
- ⏰ Voir les **horaires des cultes** et services
- 📅 Connaître les **activités** (réunion jeunesse, prière, etc.)
- 🗺️ Obtenir les **itinéraires** vers la communauté

---

## 🗂️ Fichiers créés / modifiés

### 📄 Pages et scripts

| Fichier | Rôle |
|---------|------|
| **communautes.html** | Page publique avec carte et recherche |
| **communautes.js** | Logique Google Maps + géolocalisation + Supabase |
| **admin/communautes-panel.html** | Formulaires d'administration (à intégrer) |
| **admin/communautes-admin.js** | CRUD admin pour gérer communautés |

### 📋 Configuration

| Fichier | Description |
|---------|-------------|
| **DATABASE_SETUP.sql** | Script SQL à exécuter dans Supabase (4 tables + RLS) |
| **COMMUNAUTES_SETUP.md** | Documentation détaillée des tables et configuration |

### ✏️ Modifiés

| Fichier | Changement |
|---------|-----------|
| **index.html** | Ajout lien "Communautés" dans la nav |

---

## 🚀 Installation en 5 étapes

### Étape 1️⃣ : Créer les tables Supabase

**Fichier:** `DATABASE_SETUP.sql`

1. Ouvrez [Supabase Console](https://supabase.com/dashboard)
2. Allez dans votre projet
3. Menu **SQL Editor** → **New Query**
4. Copier tout le contenu de `DATABASE_SETUP.sql`
5. Coller dans Supabase
6. Cliquer **Run**

✅ **Résultat:** 4 tables créées + RLS activé + Indices

---

### Étape 2️⃣ : Obtenir Google Maps API key

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. **Create a new project** (ou utiliser existant)
3. Menu **APIs & Services** → **Library**
4. Chercher et activer:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
5. **Credentials** → **Create Credentials** → **API Key**
6. Restreindre aux **HTTP referrers**:
   - Local: `http://localhost*`
   - Prod: `https://votre-domaine.com/*`
7. Copier la clé

Puis remplacer dans `communautes.html` ligne ~170:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

Par:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyxxxxxxxxxxxxxxxx&libraries=places"></script>
```

---

### Étape 3️⃣ : Intégrer le panel admin

**Fichiers:** `admin/communautes-panel.html` + `admin/communautes-admin.js`

#### Dans `admin/index.html` :

**A) Dans `<nav class="admin-nav">` (chercher vers ligne 50) :**

Ajouter:
```html
<a href="#communautes">Communautés</a>
<a href="#contacts-gestion">Contacts</a>
<a href="#horaires-gestion">Horaires</a>
<a href="#activites-gestion">Activités</a>
```

**B) Après `</nav>` (avant `<div class="form-section" id="notif">) :**

Copier **tout le contenu** de `admin/communautes-panel.html` et coller.

**C) Avant `</body>` (chercher vers fin du fichier) :**

Ajouter:
```html
<script src="communautes-admin.js"></script>
```

Après les autres <script> (après admin.js).

---

### Étape 4️⃣ : Tester localement

```bash
# À la racine du projet
python -m http.server 8000
# ou
npx http-server
```

Ouvrir:
- **Publique:** http://localhost:8000/communautes.html
- **Admin:** http://localhost:8000/admin/index.html → Se connecter → Onglet "Communautés"

✅ La carte doit s'afficher + recherche fonctionner

---

### Étape 5️⃣ : Ajouter des données

**Dans l'admin :**

1. Aller dans **Espace d'administration** → Onglet **Communautés**
2. Cliquer **"➕ Ajouter une communauté"**
3. Remplir le formulaire:
   - **Nom** *
   - **District**
   - **Quartier**
   - **Latitude/Longitude** * (ex: -4.2634, 15.2429)
   - Contact, adresse, photo, description
4. Cliquer **"Créer"**
5. Ajouter contacts, horaires, activités

**Ou SQL direct :**

Décommenter la section "DONNÉES DE TEST" dans `DATABASE_SETUP.sql` et exécuter.

---

## 🗺️ Fonctionnalités détaillées

### 1. 🔍 Recherche
- Tapez district, quartier, zone ou nom
- Résultats en temps réel
- Carte zoom sur résultats

### 2. 📍 Géolocalisation
- Bouton "📍 Ma position"
- Affiche votre localisation (GPS)
- Liste communautés triées par distance

### 3. 📞 Contacts
Affiche automatiquement:
- Téléphones (cliquables)
- Emails
- WhatsApp

### 4. 🗺️ Itinéraires
- Bouton "🗺️ Itinéraire" → Google Maps
- Calcule trajet depuis votre position

### 5. 📅 Horaires & Activités
- Cultes (dimanche, etc.)
- Réunions, études bibliques, prières
- Activités jeunesse, etc.

---

## 🔧 Configuration avancée

### 📧 Admin : Multiple Gmail

Dans `admin/admin-config.js`:

```javascript
// Un seul admin
window.ADMIN_ALLOWED_EMAIL = 'albertkintsodiza@gmail.com';

// OU plusieurs admins
window.ADMIN_ALLOWED_EMAILS = [
  'albertkintsodiza@gmail.com',
  'apôtre1@gmail.com',
  'responsable@gmail.com'
];
```

### 🎨 Personnaliser couleurs

Dans `communautes.html` `<style>`:

```css
/* Bleu → Rouge par exemple */
.btn-primary { background: #d32f2f; }
#map { /* Styles carte */ }
```

### 📍 Changer centre initial carte

Dans `communautes.js` ligne ~45:

```javascript
// Brazzaville
var brazzaville = { lat: -4.2634, lng: 15.2429 };
// → Changer pour autre ville
var brazzaville = { lat: -4.0, lng: 15.0 };
```

---

## 📱 Responsive design

✅ Fonctionne sur:
- Desktop (grid 2 colonnes)
- Tablet (grid 1 colonne)
- Mobile (full width)

Google Maps tactile adapté.

---

## 🔒 Sécurité

✅ **Déjà fait:**
- Supabase RLS (Row Level Security)
- Lecture publique des données
- Admin sécurisé via Google OAuth

⚠️ **À améliorer (optionnel):**
- Backend proxy pour écritures
- Rate limiting
- Audit logging

---

## 📊 Structure Supabase

```
communautes (table principale)
├── id (bigint)
├── nom (text)
├── latitude (float)
├── longitude (float)
├── district_apostolique, quartier, zone (text)
├── responsable (text)
├── adresse, point_repere (text)
├── photo_url (text)
├── description (text)
├── active (boolean)
└── timestamps

contacts_communaute (lien N:1)
├── communaute_id
├── type: 'telephone', 'email', 'whatsapp'
├── valeur
└── primary (boolean)

horaires_services (lien N:1)
├── communaute_id
├── jour: 'Dimanche', 'Mercredi', etc.
├── heure_debut, heure_fin: 'HH:MM'
└── type_service: 'culte', 'reunion', 'etude', 'priere'

activites_communaute (lien N:1)
├── communaute_id
├── jour, heure
├── activite: 'Réunion jeunesse', etc.
└── description
```

---

## ⚡ Performance

- ✅ Indices Supabase (recherche rapide)
- ✅ Lazy loading images
- ✅ Caching localStorage notifications
- ✅ Google Maps API optimisée

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Carte vide | Vérifier Google Maps API key |
| "No results" | Ajouter communautés en admin |
| Géolocalisation refuse | HTTPS + Permission utilisateur |
| Erreur CORS | Vérifier Supabase CORS settings |
| Recherche ne marche pas | Vérifier données Supabase (table active) |

---

## 📝 Checklist déploiement

- [ ] `DATABASE_SETUP.sql` exécuté (4 tables créées)
- [ ] RLS configuré (vérifier Supabase)
- [ ] Google Maps API key obtenue et insérée
- [ ] `communautes.html` et `communautes.js` en place
- [ ] Admin panel intégré (`communautes-panel.html`)
- [ ] Script admin ajouté (`communautes-admin.js` <script>)
- [ ] Navigation mise à jour (lien "Communautés")
- [ ] Données de test ajoutées (1-2 communautés)
- [ ] Test mobile + desktop ✅
- [ ] HTTPS configuré (pour géolocalisation)
- [ ] Déployer en production

---

## 📞 Support

Pour questions:
1. Vérifier `COMMUNAUTES_SETUP.md` (détails techniques)
2. Vérifier `DATABASE_SETUP.sql` (schémas)
3. Consulter Supabase docs
4. Consulter Google Maps docs

---

**Créé:** Mai 2026  
**Dernière mise à jour:** 17 Mai 2026
