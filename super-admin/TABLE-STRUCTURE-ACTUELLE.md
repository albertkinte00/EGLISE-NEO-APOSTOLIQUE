# 📊 STRUCTURE DE TES TABLES SUPABASE

## ✅ Tables Confirmées (7 tables)

### 1. **communautes** → Module communities.html
```sql
PRIMARY FIELDS:
- id (clé primaire)
- nom (texte) ← NOM DE LA COMMUNAUTÉ
- responsable (texte) ← LEADER/PASTEUR
- district_apostolique (texte)
- quartier (texte)
- zone (texte)
- adresse (texte)
- point_repere (texte) ← point de repère
- latitude, longitude ← coordonnées GPS
- photo_url (texte) ← image
- description (texte)
- active (booléen) ← statut
- created_at, updated_at (timestamps)
```

### 2. **contacts_communaute** → Relations vers communautes
```sql
PRIMARY FIELDS:
- id (clé primaire)
- communaute_id (clé étrangère) ← LIEN À communautes
- type (texte) → 'telephone' | 'email' | 'whatsapp'
- valeur (texte) ← NUMÉRO/EMAIL/URL
- is_primary (booléen) ← contact principal?
- created_at (timestamp)
```

### 3. **horaires_services** → Module horaires.html
```sql
PRIMARY FIELDS:
- id (clé primaire)
- communaute_id (clé étrangère) ← LIEN À communautes
- jour (texte) ← jour de la semaine (lundi, mardi...)
- heure_debut (texte) ← ex: "09:00"
- heure_fin (texte) ← ex: "11:00"
- type_service (texte) → 'culte' | 'reunion' | 'etude' | 'priere'
- created_at (timestamp)
```

### 4. **activites_communaute** → Relations vers communautes
```sql
PRIMARY FIELDS:
- id (clé primaire)
- communaute_id (clé étrangère) ← LIEN À communautes
- jour (texte)
- heure (texte)
- activite (texte) ← NOM/TYPE D'ACTIVITÉ
- description (texte)
- created_at (timestamp)
```

### 5. **actualites** → Module actualites.html
```sql
PRIMARY FIELDS:
- id (clé primaire)
- titre (varchar 255) ← TITRE DE LA NEWS
- date (DATE) ← date de publication
- contenu (texte) ← CONTENU COMPLET
- created_at (timestamp)
```

### 6. **evenements** → Module events.html
```sql
PRIMARY FIELDS:
- id (clé primaire)
- titre (varchar 255) ← TITRE DE L'ÉVÉNEMENT
- date (DATE) ← DATE DE L'ÉVÉNEMENT
- desc (texte) ← DESCRIPTION ⚠️ NOTE: c'est "desc" PAS "description"!
- created_at (timestamp)
```

### 7. **settings** → Configuration du site
```sql
PRIMARY FIELDS:
- id (clé primaire)
- html_notif (texte) ← HTML notification/message
- updated_at (timestamp)
```

---

## 🔗 Correspondances: Super Admin ↔ Tes Tables

| Super Admin Module | Ta Table | Champs Clés | Action |
|-------------------|----------|-------------|--------|
| **communities.html** | communautes | nom, responsable, adresse, active | ✅ Adapter |
| **events.html** | evenements | titre, date, desc | ✅ Adapter |
| **[nouveau]** actualites.html | actualites | titre, date, contenu | ✅ Créer |
| **settings.html** | settings | html_notif | ✅ Adapter |
| **[nouveau]** horaires.html | horaires_services | jour, heure_debut, heure_fin, type_service | ✅ Créer |
| **users.html** | — | — | ❌ Pas nécessaire (tu gères via Supabase dashboard) |

---

## 🚨 PIÈGES IMPORTANTS À NOTER

### ⚠️ evenements → "desc" NOT "description"
```javascript
// ✅ CORRECT
supabase.request('GET', '/evenements?select=*')
  .then(events => {
    events.forEach(e => {
      let description = e.desc;  // ← "desc" pas "description"
    });
  });

// ❌ FAUX
events.forEach(e => {
  let description = e.description;  // ← ERREUR! Champ n'existe pas
});
```

### ⚠️ communautes a "nom" pas "name"
```javascript
// ✅ CORRECT
communautes.forEach(c => {
  console.log(c.nom);  // ← "nom" en français
});

// ❌ FAUX
communautes.forEach(c => {
  console.log(c.name);  // ← ERREUR!
});
```

### ⚠️ Accès aux Contacts/Horaires/Activités via FK
```javascript
// Pour afficher contacts d'une communauté:
supabase.request('GET', `/contacts_communaute?communaute_id=eq.${communaute_id}&select=*`)

// Pour afficher horaires d'une communauté:
supabase.request('GET', `/horaires_services?communaute_id=eq.${communaute_id}&select=*`)

// Pour afficher activités d'une communauté:
supabase.request('GET', `/activites_communaute?communaute_id=eq.${communaute_id}&select=*`)
```

---

## 📋 Plan d'Adaptation des Modules

### Phase 1: Adapter les modules EXISTANTS (3 fichiers)

**1. super-admin/communities.html**
```
Charge depuis: communautes
Affiche: nom, responsable, adresse, active
Colonnes du tableau: nom | responsable | quartier | adresse | statut | actions
Boutons: Ajouter | Éditer | Supprimer
```

**2. super-admin/events.html**
```
Charge depuis: evenements
Affiche: titre, date, desc
Colonnes: titre | date | statut | actions
Attention: utiliser "desc" pas "description"!
```

**3. super-admin/settings.html**
```
Charge depuis: settings
Affiche/modifie: html_notif
Éditeur: textarea avec l'HTML
```

### Phase 2: Créer les NOUVEAUX modules (2 fichiers)

**1. super-admin/actualites.html**
```
Charge depuis: actualites
Affiche: titre, date, contenu
Tableau: titre | date | contenu_preview | actions
CRUD complet
```

**2. super-admin/horaires.html**
```
Charge depuis: horaires_services
Mais affiche par COMMUNAUTÉ
Tableau: communaute | jour | heure_debut - heure_fin | type | actions
Dropdown pour sélectionner communauté
```

---

## ✅ NEXT STEPS

1. **Adapter supabase-client.js** - méthodes conformes aux vraies tables
2. **Adapter communities.html** - charger depuis ta table communautes
3. **Adapter events.html** - charger depuis ta table evenements (attention: "desc")
4. **Adapter settings.html** - charger html_notif depuis settings
5. **Créer actualites.html** - nouveau module pour actualites
6. **Créer horaires.html** - nouveau module pour horaires_services

---

## 🧪 Test Rapide Console

```javascript
// Ouvre la console (F12) et test:

// Test 1: Lister les communautes
supabase.request('GET', '/communautes?select=nom,responsable,active')
  .then(data => console.log('✓ Communautes:', data))
  .catch(e => console.error('✗ Erreur:', e));

// Test 2: Lister les événements
supabase.request('GET', '/evenements?select=titre,date,desc')
  .then(data => console.log('✓ Événements:', data))
  .catch(e => console.error('✗ Erreur:', e));

// Test 3: Lister les actualités
supabase.request('GET', '/actualites?select=titre,date')
  .then(data => console.log('✓ Actualités:', data))
  .catch(e => console.error('✗ Erreur:', e));
```

---

**Prêt? On commence à adapter les modules! 🚀**
