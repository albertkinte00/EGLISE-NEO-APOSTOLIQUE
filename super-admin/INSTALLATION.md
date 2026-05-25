# 🔐 Super Administrateur - Guide d'Installation

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation Rapide](#installation-rapide)
3. [Configuration Initiale](#configuration-initiale)
4. [Sécurisation](#sécurisation)
5. [Déploiement en Production](#déploiement-en-production)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prérequis

Avant de commencer, assurez-vous que vous avez :

- ✅ Accès FTP/SFTP au serveur
- ✅ Compte Supabase créé et configuré
- ✅ Node.js 14+ (optionnel, pour le build)
- ✅ Navigateur moderne (Chrome, Firefox, Edge, Safari)
- ✅ Connexion HTTPS configurée

---

## 🚀 Installation Rapide

### Étape 1: Télécharger les Fichiers

Tous les fichiers du Super Admin se trouvent dans le dossier `super-admin/`:

```
super-admin/
├── login.html              # Page de connexion
├── index.html              # Dashboard
├── users.html              # Gestion utilisateurs
├── settings.html           # Paramètres
├── backups.html            # Sauvegardes
├── logs.html               # Logs d'activité
├── super-admin.js          # Script principal
├── config.js               # Configuration
├── modules/
│   └── users.js            # Module utilisateurs
└── README.md               # Documentation
```

### Étape 2: Uploader sur le Serveur

Utilisez FTP/SFTP pour uploader le dossier `super-admin/` à la racine de votre site:

```
votresite.com/
├── index.html
├── admin-access.html       # 🆕 Nouvelle page d'accès
├── admin/                  # Admin existant
└── super-admin/            # 🆕 Nouveau dossier Super Admin
    ├── login.html
    ├── index.html
    └── ...
```

### Étape 3: Vérifier l'Accès

Ouvrir dans le navigateur:
```
https://votresite.com/admin-access.html
```

Vous devriez voir deux options :
- 🔐 Super Administrateur
- 👨‍💼 Administration

---

## ⚙️ Configuration Initiale

### Configuration 1: Variables d'Environnement

Modifier `super-admin/config.js` avec vos informations:

```javascript
SUPER_ADMIN_CONFIG = {
  APP_NAME: 'Votre Nom d\'Application',
  
  AUTH: {
    SUPER_ADMIN_EMAIL: 'votre@email.com',  // 🔴 À adapter
    SESSION_TIMEOUT_MINUTES: 30,
    ENABLE_2FA: true
  },
  
  SUPABASE: {
    URL: 'https://votre-project.supabase.co',      // 🔴 À adapter
    ANON_KEY: 'votre_anon_key'                      // 🔴 À adapter
  },
  
  // ... reste de la configuration
}
```

### Configuration 2: Clé Secrète Personnelle

1. Ouvrir `super-admin/login.html`
2. Modifier la ligne ~230:
   ```javascript
   var SUPER_ADMIN_SECRET_KEY = 'votre_clé_secrète_personnelle';
   ```
3. Choisir une clé forte (min. 16 caractères, mélange de symboles/chiffres)

### Configuration 3: Première Connexion

1. Aller à `https://votresite.com/admin-access.html`
2. Cliquer **Accéder au Super Admin**
3. Entrer:
   - **Email**: `votre@email.com` (défini dans config.js)
   - **Mot de passe**: Votre mot de passe
   - **Clé Secrète**: `votre_clé_secrète_personnelle`

---

## 🔒 Sécurisation

### Étape 1: Configuration HTTPS

```nginx
# Nginx - Forcer HTTPS
server {
    listen 80;
    server_name votresite.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votresite.com;
    
    ssl_certificate /chemin/vers/certificat.crt;
    ssl_certificate_key /chemin/vers/cle.key;
    
    # ... configuration reste
}
```

### Étape 2: Protéger le Dossier Super Admin

```apache
# .htaccess dans super-admin/
# Restreindre l'accès à certaines IPs (optionnel)
<Files "login.html">
    # Require ip 192.168.1.0/24  # Optionnel: IP de bureau
</Files>

# Désactiver l'accès au config.js
<Files "config.js">
    Deny from all
</Files>
```

### Étape 3: Headers de Sécurité

Ajouter à votre `web.config` (IIS) ou `.htaccess` (Apache):

```apache
# Headers de sécurité
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# CSP (Content Security Policy)
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
```

### Étape 4: Logs & Monitoring

1. Activer les logs dans `config.js`:
   ```javascript
   LOGGING: {
     ENABLED: true,
     LEVEL: 'info',
     DATABASE: true,
     RETENTION_DAYS: 90
   }
   ```

2. Monitorer les tentatives de connexion échouées

3. Configurer les alertes de sécurité

---

## 🌍 Déploiement en Production

### Checklist Avant Production

- [ ] HTTPS activé et certificat valide
- [ ] Mot de passe admin changé
- [ ] Clé secrète personnalisée
- [ ] 2FA activé
- [ ] Sauvegardes programmées
- [ ] Logs d'activité activés
- [ ] Permissions correctement configurées
- [ ] Adresses IP autorisées configurées
- [ ] Email de notifications validé
- [ ] Base de données Supabase testée

### Étape 1: Déploiement du Code

```bash
# Via Git
git clone https://github.com/albertkinte00/EGLISE-NEO-APOSTOLIQUE.git
cd EGLISE-NEO-APOSTOLIQUE
git checkout super-admin

# Ou via FTP (uploader le dossier super-admin/)
```

### Étape 2: Vérifier la Configuration Supabase

```sql
-- Vérifier que les tables existent
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier les RLS policies
SELECT * FROM pg_policies;
```

### Étape 3: Tester l'Accès

1. Accéder à `https://votresite.com/admin-access.html`
2. Cliquer sur Super Admin
3. Tester la connexion avec les identifiants
4. Vérifier que le dashboard se charge
5. Tester la création d'un utilisateur
6. Vérifier que les logs enregistrent l'action

### Étape 4: Activer les Sauvegardes Automatiques

1. Aller à **Sauvegardes & Restauration**
2. Cocher **Sauvegardes programmées**
3. Sélectionner la fréquence (recommandé: **Hebdomadaire**)
4. Enregistrer

---

## 🐛 Troubleshooting

### Problème: "Page non trouvée" (404)

**Cause**: Les fichiers n'ont pas été uploadés correctement

**Solution**:
1. Vérifier que le dossier `super-admin/` existe
2. Vérifier que `login.html` existe dans `super-admin/`
3. Vérifier les permissions d'accès (644 pour fichiers, 755 pour dossiers)

### Problème: "Erreur de connexion Supabase"

**Cause**: URLs ou clés incorrectes dans `config.js`

**Solution**:
1. Vérifier l'URL Supabase (copier de https://app.supabase.com)
2. Vérifier la clé ANON_KEY (dans Supabase → Settings → API)
3. Vérifier que CORS est configuré pour votre domaine

### Problème: "Impossible de se connecter"

**Cause**: Email ou mot de passe incorrect

**Solution**:
1. Vérifier l'email dans `config.js`
2. Réinitialiser le mot de passe
3. Vérifier la clé secrète (casse sensible)
4. Vider le cache navigateur

### Problème: "Session expirée"

**Cause**: Durée de session trop courte

**Solution**:
1. Augmenter `SESSION_TIMEOUT_MINUTES` dans `config.js`
2. Cocher "Se souvenir de moi" à la connexion

### Problème: "Erreur 500 interne"

**Cause**: Erreur serveur

**Solution**:
1. Vérifier les logs serveur
2. Vérifier que Supabase est accessible
3. Vérifier que Node.js/PHP est à jour

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifier le fichier `super-admin/logs.html` pour les erreurs
2. Ouvrir la console de développement (F12)
3. Vérifier les messages d'erreur
4. Contacter l'administrateur système

---

## 📚 Documentation Supplémentaire

- **Supabase**: https://supabase.io/docs
- **Security**: Voir `super-admin/README.md`
- **Configuration**: Voir `super-admin/config.js`

---

## ✅ Checklist Post-Installation

- [ ] Super Admin accessible via HTTPS
- [ ] Connexion fonctionnelle
- [ ] Dashboard chargé correctement
- [ ] Utilisateurs gérables
- [ ] Communautés visibles
- [ ] Sauvegardes programmées
- [ ] Logs d'activité enregistrés
- [ ] Mode sombre fonctionne
- [ ] Responsive sur mobile
- [ ] Tous les modules chargent

---

**Installation complétée ! 🎉**

Bienvenue dans votre Super Administrateur. Retrouvez plus d'informations dans [README.md](README.md).
