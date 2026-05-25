# 🔗 Guide d'Intégration Supabase - Super Admin

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Initialisation de la BD](#initialisation-de-la-bd)
4. [Utilisation du Client](#utilisation-du-client)
5. [Migration LocalStorage → Supabase](#migration-localstorage--supabase)
6. [Sécurité](#sécurité)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prérequis

- ✅ Compte Supabase créé (https://supabase.com)
- ✅ Projet Supabase initialisé
- ✅ URL Supabase et clé publique récupérées
- ✅ Fichier `super-admin/DATABASE_SETUP.sql`
- ✅ Fichier `super-admin/supabase-client.js`

---

## ⚙️ Configuration Supabase

### Étape 1: Récupérer vos Credentials

1. Allez sur **Supabase Dashboard**
2. Sélectionnez votre projet
3. Allez dans **Settings → API**
4. Copiez:
   - `Project URL` (ex: `https://xxxx.supabase.co`)
   - `Anon/Public Key` (la clé publique)

### Étape 2: Mettre à jour les Credentials

Modifiez les fichiers suivants avec vos vrais credentials:

**Fichier: `super-admin/supabase-client.js`**
```javascript
const SUPABASE_URL = 'https://votre_projet.supabase.co'; // À remplacer
const SUPABASE_ANON_KEY = 'eyJhbGc..._votre_clé'; // À remplacer
```

**Fichier: `super-admin/super-admin.js`**
```javascript
var SUPABASE_URL = 'https://votre_projet.supabase.co'; // À remplacer
var SUPABASE_ANON_KEY = 'eyJhbGc..._votre_clé'; // À remplacer
```

---

## 🗄️ Initialisation de la Base de Données

### Étape 1: Préparer le Script SQL

1. Ouvrez le fichier `super-admin/DATABASE_SETUP.sql`
2. Sélectionnez **TOUT** le contenu (Ctrl+A)
3. Copiez-le (Ctrl+C)

### Étape 2: Exécuter le Script dans Supabase

1. Allez sur **Supabase Dashboard**
2. Cliquez sur **SQL Editor** (à gauche)
3. Cliquez sur **New Query**
4. Collez le contenu du fichier SQL (Ctrl+V)
5. Cliquez sur **Run** (en haut à droite)

### Étape 3: Vérifier la Création

Vous devriez voir:
- ✅ 15 tables créées (users, roles, permissions, etc.)
- ✅ 4 rôles insérés
- ✅ 40+ permissions créées
- ✅ 2 utilisateurs initiaux (super_admin, admin)
- ✅ 3 vues créées
- ✅ Fonctions et triggers activés

### Vérification via SQL Editor

```sql
-- Voir toutes les tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Voir les utilisateurs
SELECT id, name, email, is_super_admin FROM users;

-- Voir les permissions
SELECT COUNT(*) as total_permissions FROM permissions;
```

---

## 🔌 Utilisation du Client Supabase

### Import du Client

Dans vos fichiers HTML/JS:

```html
<!-- À ajouter après <body> -->
<script src="supabase-client.js"></script>
```

### Exemples d'Utilisation

#### 1. Récupérer les Utilisateurs

```javascript
// Récupérer tous les utilisateurs
supabase.getUsers()
  .then(users => {
    console.log('✓ Utilisateurs:', users);
    // Utiliser les données
  })
  .catch(error => console.error('✗ Erreur:', error));

// Avec filtres
supabase.getUsers({ 
  role: 2,
  status: 'active',
  search: 'jean'
})
  .then(users => console.log(users))
  .catch(error => console.error(error));
```

#### 2. Créer un Utilisateur

```javascript
supabase.createUser({
  name: 'Marie Kamba',
  email: 'marie@eglise.com',
  password_hash: 'hash_bcrypt_here', // À générer côté serveur
  phone: '+243123456789',
  role_id: 2,
  status: 'active',
  email_verified: false
})
  .then(user => console.log('✓ Utilisateur créé:', user))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 3. Mettre à jour un Utilisateur

```javascript
supabase.updateUser(1, {
  name: 'Jean Mbolo Modifié',
  email: 'jean.nouveau@eglise.com',
  status: 'active'
})
  .then(user => console.log('✓ Utilisateur mis à jour'))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 4. Enregistrer une Activité

```javascript
supabase.logActivity({
  user_id: 1,
  action: 'CREATE_USER',
  module: 'users',
  entity_type: 'user',
  entity_id: 5,
  description: 'Création de Marie Kamba',
  status: 'success',
  ip_address: '192.168.1.1'
})
  .then(log => console.log('✓ Activité enregistrée'))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 5. Récupérer les Communautés

```javascript
supabase.getCommunities()
  .then(communities => {
    console.log('✓ Communautés:', communities);
  })
  .catch(error => console.error('✗ Erreur:', error));
```

#### 6. Créer une Communauté

```javascript
supabase.createCommunity({
  name: 'Église Sud - Kinshasa',
  slug: 'eglise-sud-kinshasa',
  city: 'Kinshasa',
  country: 'République Démocratique du Congo',
  pastor_name: 'Pasteur Antoine Mwepu',
  email: 'sud@eglise.com',
  phone: '+243555666777',
  latitude: -4.3276,
  longitude: 15.3136,
  status: 'active'
})
  .then(community => console.log('✓ Communauté créée'))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 7. Récupérer les Logs d'Activité

```javascript
supabase.getActivityLogs({ 
  module: 'users',
  status: 'success'
})
  .then(logs => console.log('✓ Logs:', logs))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 8. Récupérer les Paramètres

```javascript
supabase.getSettings()
  .then(settings => {
    console.log('✓ Paramètres:', settings);
  })
  .catch(error => console.error('✗ Erreur:', error));

// Un paramètre spécifique
supabase.getSetting('app_name')
  .then(value => console.log('✓ Nom app:', value))
  .catch(error => console.error('✗ Erreur:', error));
```

#### 9. Mettre à jour un Paramètre

```javascript
supabase.updateSetting('app_name', 'Ma Nouvelle App', 'string')
  .then(() => console.log('✓ Paramètre mis à jour'))
  .catch(error => console.error('✗ Erreur:', error));
```

---

## 🔄 Migration LocalStorage → Supabase

### Fichier: `super-admin/modules/users.js`

**Avant (LocalStorage):**
```javascript
var users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', ... },
  { id: 2, name: 'Bob', email: 'bob@example.com', ... }
];
```

**Après (Supabase):**
```javascript
// Charger depuis Supabase au démarrage
window.addEventListener('load', function() {
  supabase.getUsers()
    .then(function(data) {
      users = data;
      renderTable();
    })
    .catch(function(error) {
      console.error('Erreur lors du chargement:', error);
    });
});

// Lors de la création
function saveSettings() {
  var userData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    // ... autres champs
  };

  if (editingUserId) {
    supabase.updateUser(editingUserId, userData)
      .then(function() {
        showSuccess('Utilisateur mis à jour');
        closeModal();
        renderTable();
      })
      .catch(function(error) {
        showError('Erreur: ' + error.message);
      });
  } else {
    supabase.createUser(userData)
      .then(function(newUser) {
        showSuccess('Utilisateur créé');
        users.push(newUser);
        closeModal();
        renderTable();
      })
      .catch(function(error) {
        showError('Erreur: ' + error.message);
      });
  }
}

// Lors de la suppression
function deleteUser(userId) {
  if (confirm('Êtes-vous sûr ?')) {
    supabase.deleteUser(userId)
      .then(function() {
        showSuccess('Utilisateur supprimé');
        users = users.filter(u => u.id !== userId);
        renderTable();
      })
      .catch(function(error) {
        showError('Erreur: ' + error.message);
      });
  }
}
```

---

## 🔐 Sécurité

### Row Level Security (RLS) - À Activer

Dans Supabase SQL Editor, exécutez:

```sql
-- Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Super Admin voit tout
CREATE POLICY super_admin_all ON users
  FOR ALL USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE is_super_admin = TRUE
    )
  );

-- Utilisateurs voient seulement eux-mêmes
CREATE POLICY users_view_self ON users
  FOR SELECT USING (auth.uid() = id);
```

### CORS - Configuration

Dans Supabase **Settings → API**:
```
Allowed origins: https://votresite.com, http://localhost:3000
```

### Authentification JWT

Les tokens doivent être:
1. Générés côté backend (sécurisé)
2. Envoyés au client avec HttpOnly cookies
3. Validés à chaque requête

---

## 📊 Vérification de la Connexion

Testez la connexion avec cette page HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Supabase</title>
</head>
<body>
  <h1>Test de Connexion Supabase</h1>
  <button onclick="tester()">Tester</button>
  <pre id="result"></pre>

  <script src="supabase-client.js"></script>
  <script>
    function tester() {
      supabase.getUsers()
        .then(users => {
          document.getElementById('result').textContent = 
            '✓ Succès!\n\nUtilisateurs:\n' + 
            JSON.stringify(users, null, 2);
        })
        .catch(error => {
          document.getElementById('result').textContent = 
            '✗ Erreur:\n' + error.message;
        });
    }
  </script>
</body>
</html>
```

---

## 🆘 Troubleshooting

### Erreur: "CORS policy blocked"

**Solution:** Configurer les CORS dans Supabase API settings

### Erreur: "Unauthorized" (401)

**Vérifier:**
- ✓ Clé API correcte
- ✓ RLS policies configurées
- ✓ JWT token valide

### Erreur: "Table not found"

**Vérifier:**
- ✓ Script SQL exécuté complètement
- ✓ Tables visibles dans Table Editor
- ✓ Pas de typo dans noms de tables

### Erreur: "Connection timeout"

**Vérifier:**
- ✓ URL Supabase correcte
- ✓ Connexion internet active
- ✓ Firewall ne bloque pas

### Les données ne se synchronisent pas

**Vérifier:**
- ✓ `supabase.getUsers()` retourne les données
- ✓ Pas d'erreur dans la console (F12)
- ✓ RLS policies permettent la lecture

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [REST API Guide](https://supabase.io/docs/guides/api)
- [Row Level Security](https://supabase.io/docs/guides/auth/row-level-security)

---

## ✅ Checklist d'Intégration

```
□ Credentials Supabase récupérées
□ supabase-client.js mis à jour
□ super-admin.js mis à jour
□ DATABASE_SETUP.sql exécuté
□ Tables visibles dans Supabase
□ Utilisateurs initiaux créés
□ Test de connexion réussi
□ modules/users.js migré vers Supabase
□ RLS policies configurées
□ CORS activé
□ Production ready
```

---

**Prêt à connecter votre application à Supabase ? C'est parti ! 🚀**

*Version: 1.0.0*  
*Last Updated: Mai 2024*
