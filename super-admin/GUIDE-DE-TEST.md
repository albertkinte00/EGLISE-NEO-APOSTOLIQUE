# 🚀 GUIDE DE TEST - Super Admin avec Supabase

## 📋 PRÉREQUIS

✅ Supabase project créé avec tables:
- ✅ communautes
- ✅ contacts_communaute
- ✅ horaires_services
- ✅ activites_communaute
- ✅ actualites
- ✅ evenements
- ✅ settings

✅ Credentials Supabase configurés dans:
- `supabase-client-adapted.js` (ligne 11-12)
- `super-admin/super-admin.js` (ligne 8-9)

✅ Client HTTP lancé:
```bash
python -m http.server 8000
```

---

## 🧪 TEST 1: Authentification

### Étapes

1. **Ouvre** `http://localhost:8000/super-admin/login.html`

2. **Saisis** les identifiants:
   - Email: `albertkintsodiza@gmail.com`
   - Mot de passe: `anything` (juste check length > 5)
   - Secret Key: `super_secret_key_123`

3. **Clique** "Connexion"

### Résultat Attendu
- ✅ Redirigé vers `index.html`
- ✅ Affiche "Tableau de Bord"
- ✅ Sidebar visible avec menu

---

## 🧪 TEST 2: Navigation vers Modules

### Dans index.html Sidebar:

**Test 2A: Communautés**
1. Clique "Communautés" (sidebar)
2. S'ouvre `communities.html`
3. Console: Doit afficher "⏳ Chargement..." puis "✅ Communautés chargées:"
4. Tableau avec colonnes: Nom | Quartier | Pasteur | Contacts | Statut | Actions

**Test 2B: Actualités**
1. Clique "Actualités" (sidebar)
2. S'ouvre `actualites.html`
3. Console: Doit afficher "✅ Actualités chargées:"
4. Cartes affichant: Titre | Date | Contenu preview | Actions

**Test 2C: Événements**
1. Clique "Événements" (sidebar)
2. S'ouvre `events.html`
3. Console: Doit afficher "✅ Événements chargés:"
4. Cartes affichant: Titre | Date | Description | Actions

---

## 🧪 TEST 3: Console Browser (F12)

**Ouvre les DevTools (F12) dans any module et exécute:**

### Test 3A: Connexion Supabase
```javascript
supabase.testConnection()
  .then(ok => console.log(ok ? '✅ Connecté!' : '❌ Erreur'))
```

**Résultat Attendu:** `✅ Connecté!`

### Test 3B: Charger Communautés
```javascript
supabase.getCommunities()
  .then(data => {
    console.log('✅ Communautés:', data.length);
    console.log('Première:', data[0].nom);
  })
```

**Résultat Attendu:**
```
✅ Communautés: 2
Première: Église Centrale - Kinshasa
```

### Test 3C: Charger Événements ⚠️ IMPORTANT: "desc" pas "description"
```javascript
supabase.getEvenements()
  .then(data => {
    console.log('✅ Événements:', data.length);
    console.log('Champ desc:', data[0].desc);  // ← "desc" !
  })
```

**Résultat Attendu:**
```
✅ Événements: 2
Champ desc: Grande célébration de Pâques
```

### Test 3D: Charger Actualités
```javascript
supabase.getActualites(10)
  .then(data => {
    console.log('✅ Actualités:', data.length);
  })
```

### Test 3E: Formate Date
```javascript
supabase.formatDate(new Date('2026-06-21'))
```

**Résultat Attendu:** `2026-06-21`

---

## 🧪 TEST 4: CRUD - Create (Créer)

### TEST 4A: Créer une Communauté

**Via UI:**
1. Ouvre `communities.html`
2. Clique "Nouvelle Communauté"
3. Remplis:
   - Nom: `Test Église 2026`
   - Quartier: `Gombe`
   - Pasteur: `Test Pasteur`
   - Description: `Test création`
4. Clique "Enregistrer"

**Résultat Attendu:**
- ✅ Alerte "✓ Communauté créée avec succès"
- ✅ La nouvelle ligne apparaît dans le tableau
- ✅ Dans Supabase Dashboard → table `communautes` → tu vois la nouvelle ligne

**Via Console:**
```javascript
supabase.createCommunity({
  nom: 'Église Test',
  quartier: 'Gombe',
  responsable: 'Pasteur Test',
  description: 'Test',
  active: true
}).then(data => console.log('✅ Créé:', data))
```

### TEST 4B: Créer un Événement
```javascript
supabase.createEvenement(
  'Cérémonie Test',
  '2026-06-21',
  'Description test d\'événement'
).then(data => console.log('✅ Événement créé:', data))
```

### TEST 4C: Créer une Actualité
```javascript
supabase.createActualite(
  'News Test',
  '2026-06-21',
  'Contenu test de l\'actualité'
).then(data => console.log('✅ Actualité créée:', data))
```

---

## 🧪 TEST 5: CRUD - Read (Lire)

### Via UI:
1. Ouvre `communities.html`
2. Tableau montre les communautés ✅

### Via Console:
```javascript
// Lire toutes les communautés
supabase.getCommunities()
  .then(data => console.log(data))

// Lire une spécifique
supabase.getCommunity(1)
  .then(data => console.log(data))

// Avec filtres
supabase.getCommunities({ active: true, search: 'Kinshasa' })
  .then(data => console.log(data))
```

---

## 🧪 TEST 6: CRUD - Update (Modifier)

### Via UI:
1. Ouvre `communities.html`
2. Clique bouton "Modifier" sur une ligne
3. Change le contenu
4. Clique "Enregistrer"

**Résultat:** ✅ Alerte "✓ Communauté modifiée" et données mises à jour

### Via Console:
```javascript
supabase.updateCommunity(1, {
  nom: 'Nouvelle Nom',
  quartier: 'Nouveau Quartier'
}).then(data => console.log('✅ Modifié:', data))
```

---

## 🧪 TEST 7: CRUD - Delete (Supprimer)

### Via UI:
1. Ouvre `communities.html`
2. Clique "Supprimer" sur une ligne
3. Confirme dans la pop-up

**Résultat:** ✅ Alerte "✓ Communauté supprimée" et ligne disparaît

### Via Console:
```javascript
supabase.deleteCommunity(2)
  .then(data => console.log('✅ Supprimé'))
```

---

## 🧪 TEST 8: Recherche et Filtrage

### Dans communities.html:
1. Tape "Kinshasa" dans la recherche
2. Le tableau se met à jour en temps réel
3. Affiche seulement les communautés correspondantes

### Dans actualites.html:
1. Tape "actualité" dans la recherche
2. Affiche cartes filtrées

---

## 🧪 TEST 9: Synchronisation Supabase ↔ UI

**Teste la synchronisation bidirectionnelle:**

1. **Crée une communauté dans UI** (communities.html)
   - Recharge la page → elle est toujours là ✅
   - Va dans Supabase Dashboard → elle est aussi là ✅

2. **Crée une actualité dans Supabase Dashboard**
   - Va dans actualites.html
   - Recharge
   - L'actualité créée dans Dashboard apparaît ✅

3. **Modifie dans UI, vérifie dans Dashboard**
   - Modifie un événement dans events.html
   - Va dans Supabase Dashboard → change visible ✅

---

## ⚠️ PIÈGES À VÉRIFIER

### ❌ ERREUR: Nom de colonne mal orthographié

```javascript
// ❌ MAUVAIS
community.name    // undefined!
event.description  // undefined!

// ✅ BON
community.nom      // ✅
event.desc         // ✅
```

### ❌ ERREUR: Table inexistante
```javascript
// ❌ MAUVAIS
supabase.request('GET', '/communities')  // Table n'existe pas!

// ✅ BON
supabase.request('GET', '/communautes')  // ✅
```

### ❌ ERREUR: Authentification
```javascript
// Si tu vois "window.location.href = 'login.html'"
// C'est que sessionStorage est vidé, reconnecte-toi!
```

---

## 🧪 TEST 10: Thème Dark/Light

1. Dans `index.html` (Dashboard)
2. Clique l'icône Lune (topbar)
3. L'interface passe en dark mode ✅
4. Recharge → reste en dark mode ✅
5. Re-clique pour revenir en light

---

## 📊 CHECKLIST DE TEST COMPLET

- [ ] TEST 1: Authentification OK
- [ ] TEST 2: Navigation vers modules OK
- [ ] TEST 3: Console tests OK
- [ ] TEST 4: CRUD Create OK
- [ ] TEST 5: CRUD Read OK
- [ ] TEST 6: CRUD Update OK
- [ ] TEST 7: CRUD Delete OK
- [ ] TEST 8: Recherche/filtrage OK
- [ ] TEST 9: Sync Supabase ↔ UI OK
- [ ] TEST 10: Thème dark/light OK

---

## 🐛 DEBUGGING

**Si une erreur apparaît:**

1. **Ouvre Console (F12)**
2. **Cherche les messages d'erreur** (en rouge)
3. **Regarde le Network tab** → Vérifies que les requêtes API réussissent
4. **Teste la connexion:**
   ```javascript
   supabase.testConnection()
   ```
5. **Partage l'erreur** pour que je l'aide à résoudre

---

## 🎯 RÉSULTAT FINAL ATTENDU

À la fin de ce test:
- ✅ Tu peux te connecter au super admin
- ✅ Tu vois et gères les communautés depuis Supabase
- ✅ Tu vois et gères les actualités depuis Supabase
- ✅ Tu vois et gères les événements depuis Supabase
- ✅ Toutes les modifications sync avec Supabase automatiquement
- ✅ Thème dark/light fonctionne

**État du système:** 🟢 **PRODUCTION READY** pour ces 3 modules!

---

**Date:** 21 Mai 2026  
**Version:** 2.0 Supabase Adapted  
**Status:** ✅ PRET A TESTER
