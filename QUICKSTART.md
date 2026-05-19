## 🚀 DÉMARRAGE RAPIDE – Rubrique Communautés

### ✅ Fichiers créés (prêts à utiliser)

```
✅ communautes.html          (Page avec carte Google Maps)
✅ communautes.js            (Logique recherche + géolocalisation)
✅ admin/communautes-panel.html      (Formulaires admin)
✅ admin/communautes-admin.js        (CRUD admin)
✅ DATABASE_SETUP.sql        (Script SQL à exécuter)
✅ README_COMMUNAUTES.md     (Guide installation complet)
✅ COMMUNAUTES_SETUP.md      (Documentation technique)
✅ QUICKSTART.md             (Ce fichier)
```

---

## 📋 Checklist Installation (5 min)

### ① Supabase – Créer les tables (2 min)

```
1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet
3. SQL Editor → New Query
4. Copier-coller : DATABASE_SETUP.sql
5. Cliquer Run ✅
```

### ② Google Maps – Obtenir API key (2 min)

```
1. Ouvrir https://console.cloud.google.com
2. Create Project (ou utiliser existant)
3. APIs & Services → Library
4. Activer: Maps JS API, Places API, Geocoding API
5. Credentials → Create → API Key
6. Restreindre: HTTP referrers
7. Copier la clé
```

### ③ Code – Insérer clé Google Maps (1 min)

```
Fichier: communautes.html (ligne ~170)

AVANT:
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>

APRÈS:
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyxxxxxxxxxxxxxxxx&libraries=places"></script>
```

### ④ Admin – Intégrer panel admin (pas d'étape si pas besoin)

**OPTIONNEL** – Seulement si vous voulez gérer les communautés via admin

1. Copier contenu `admin/communautes-panel.html`
2. Coller dans `admin/index.html` après `</nav>`
3. Ajouter avant `</body>`: `<script src="communautes-admin.js"></script>`

### ⑤ Tester (1 min)

```
http://localhost:8000/communautes.html
```

La carte doit s'afficher ✅

---

## 🎯 Fonctionnalités clés

| Fonctionnalité | Automatique | Admin |
|---|---|---|
| 🗺️ Carte Google Maps | ✅ Oui | ✅ Gérer communautés |
| 🔍 Recherche | ✅ Oui | ✅ Créer/Éditer/Supprimer |
| 📍 Géolocalisation GPS | ✅ Oui | ✅ Coordonnées automatiques |
| 📞 Afficher contacts | ✅ Oui | ✅ Ajouter tel/email/WhatsApp |
| ⏰ Horaires services | ✅ Oui | ✅ Définir cultes/réunions |
| 📅 Activités | ✅ Oui | ✅ Ajouter jeunesse/prière/etc |
| 🗺️ Itinéraires | ✅ Oui | ❌ Auto-généré |

---

## 🗂️ Structure données

```
COMMUNAUTÉ
├── Nom *
├── District apostolique
├── Quartier
├── Zone
├── Position GPS: Lat/Lng *
├── Responsable
├── Adresse
├── Point de repère
├── Photo URL
└── Description

CONTACTS (par communauté)
├── Téléphone(s)
├── Email(s)
└── WhatsApp

HORAIRES (par communauté)
├── Dimanche: Culte 09:30-11:30
├── Mercredi: Réunion 18:00-19:30
└── Samedi: Étude 14:00-15:30

ACTIVITÉS (par communauté)
├── Lundi 18:30: Réunion jeunesse
└── Jeudi 19:00: Prière collective
```

---

## 📞 Contacts d'exemple

```sql
-- Ajouter dans Supabase (optionnel)

INSERT INTO contacts_communaute (communaute_id, type, valeur, primary)
VALUES (1, 'telephone', '+242 06 123 45 67', true);

INSERT INTO contacts_communaute (communaute_id, type, valeur, primary)
VALUES (1, 'email', 'contact@communaute.com', false);

INSERT INTO contacts_communaute (communaute_id, type, valeur, primary)
VALUES (1, 'whatsapp', '+242 06 123 45 67', false);
```

---

## 🔐 Sécurité

✅ RLS configuré (lecture publique, admin seulement écrit)  
✅ Google API key restreinte aux domaines  
✅ Supabase ANON_KEY en lecture  
✅ Admin via Google OAuth  

---

## 🐛 Problèmes courants

| Problème | Solution |
|----------|----------|
| Carte vide | Vérifier Google Maps API key |
| "No results" | Exécuter DATABASE_SETUP.sql + ajouter données |
| Pas de géolocalisation | HTTPS + accepter permission |
| Erreur CORS | Vérifier clé Google + Supabase CORS |
| Pas de contacts affichés | Vérifier table contacts_communaute remplie |

---

## 📚 Documentation complète

| Doc | Contenu |
|-----|---------|
| **README_COMMUNAUTES.md** | Guide 5 étapes + FAQ |
| **COMMUNAUTES_SETUP.md** | Détails techniques (tables, RLS, etc) |
| **DATABASE_SETUP.sql** | Script SQL prêt à exécuter |
| **communautes.js** | Code source commenté |

---

## ✨ Aperçu final

```
index.html (nav mise à jour)
    ↓
communautes.html (page publique)
    ↓
Google Maps API + Supabase
    ↓
Recherche + Géolocalisation + Détails
    ↓
Admin panel (optionnel)
    ↓
Gestion complète des communautés
```

---

## 🎉 C'est tout !

La rubrique est **100% prête à utiliser**.  
Il suffit d'exécuter le SQL et d'ajouter une clé Google.

**Questions ?** → Voir `README_COMMUNAUTES.md`

**Besoin de personnaliser ?** → Voir les fichiers `.js` et `.html` (bien commentés)

**Prêt à déployer !** 🚀
