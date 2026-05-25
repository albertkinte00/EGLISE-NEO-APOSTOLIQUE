# 🔐 Super Administrateur - Guide Complet

## 📋 Vue d'ensemble

Le panneau **Super Administrateur** est un espace de contrôle total réservé exclusivement au responsable principal pour gérer l'ensemble de l'application, du site web et de la base de données.

## 🚀 Installation & Configuration

### 1. **Accès au Panneau**

L'accès se fait via:
```
https://your-site.com/super-admin/login.html
```

**Identifiants par défaut:**
- Email: `albertkintsodiza@gmail.com`
- Clé Secrète: `super_secret_key_123`
- Mot de passe: À définir lors de la première connexion

### 2. **Configuration Initiale**

Lors du premier accès, veuillez:

1. Modifier le mot de passe par défaut
2. Configurer la clé secrète personnelle
3. Activer l'authentification 2FA
4. Configurer les paramètres généraux (fuseau horaire, langue)

### 3. **Sécurité**

⚠️ **IMPORTANT** - Recommandations de sécurité:

- ✅ Utiliser un mot de passe fort (min. 12 caractères, mélange de casse, chiffres, symboles)
- ✅ Activer l'authentification 2FA obligatoire
- ✅ Changer régulièrement la clé secrète
- ✅ Enregistrer les logs d'activité
- ✅ Faire des sauvegardes régulières
- ✅ Forcer HTTPS pour toutes les connexions
- ✅ Configurer une limite de sessions (expiration 30 min recommandée)
- ✅ Ne jamais partager les identifiants d'accès

---

## 📊 Modules & Fonctionnalités

### 1. **Dashboard** 📈
- Vue d'ensemble des statistiques
- Graphiques d'activité mensuelle
- Alertes système
- Actions rapides

### 2. **Gestion des Utilisateurs** 👥
- Créer, modifier, supprimer des utilisateurs
- Attribuer des rôles et permissions
- Filtrer et rechercher
- Gérer les statuts (actif/inactif)
- Export de la liste

**Rôles disponibles:**
- `super_admin`: Accès complet au système
- `admin`: Gestion complète sauf utilisateurs
- `manager`: Gestion des communautés et événements
- `member`: Accès utilisateur standard

### 3. **Gestion des Communautés** 🗺️
- Ajouter/modifier/supprimer des communautés
- Gérer les informations (coordonnées, services)
- Configurer la géolocalisation GPS
- Définir les horaires de services
- Gérer les activités
- Importer depuis fichier CSV

### 4. **Contenu du Site** 📄
- Modifier les pages HTML
- Mettre à jour les sections
- Gérer les ménus de navigation
- Éditer le contenu texte/images

### 5. **Médias** 🖼️
- Uploader images, vidéos, documents
- Organiser par catégories
- Compression optimisée
- Galerie de gestion

### 6. **Événements & Annonces** 📅
- Créer et programmer des événements
- Publier des annonces
- Gérer les notifications
- Calendrier d'activités

### 7. **Statistiques** 📊
- Nombre d'utilisateurs actifs
- Fréquentation des pages
- Tendances d'activité
- Statistiques géographiques
- Rapports personnalisés

### 8. **Paramètres Système** ⚙️
- Configuration générale (nom, email, fuseau horaire)
- Paramètres de sécurité (2FA, durée session, HTTPS)
- Activation/désactivation des fonctionnalités
- Mode maintenance
- Sauvegardes automatiques

### 9. **Logs d'Activité** 📋
- Enregistrement de toutes les actions
- Filtrage par type, utilisateur, date
- Recherche globale
- Statistiques d'erreurs
- Export des logs

### 10. **Sauvegardes & Restauration** 💾
- Créer des sauvegardes complètes
- Restaurer des sauvegardes
- Sauvegardes programmées (quotidienne, hebdomadaire, mensuelle)
- Télécharger les sauvegardes
- Historique complet

---

## 🔑 Authentification Renforcée

### Connexion 3 Facteurs:

1. **Email**: `albertkintsodiza@gmail.com`
2. **Mot de passe**: Min. 8 caractères
3. **Clé Secrète**: Code personnalisé

### Options Avancées:
- ☑️ Se souvenir de moi (30 jours)
- 🔐 Authentification Google (bientôt)
- 📱 Code 2FA par SMS (en configuration)

---

## 📁 Structure des Fichiers

```
super-admin/
├── login.html              # Page de connexion sécurisée
├── index.html              # Dashboard principal
├── users.html              # Gestion des utilisateurs
├── settings.html           # Paramètres système
├── backups.html            # Sauvegardes & restauration
├── logs.html               # Logs d'activité
│
├── super-admin.js          # Logique principale
├── modules/
│   └── users.js            # Module de gestion utilisateurs
│
└── README.md               # Ce fichier
```

---

## 🛠️ Configuration Avancée

### Variables d'Environnement

Modifier dans `super-admin.js`:

```javascript
var SUPABASE_URL = 'https://...';
var SUPABASE_ANON_KEY = '...';
var SUPER_ADMIN_EMAIL = 'albertkintsodiza@gmail.com';
```

### Personnalisation du Branding

1. Logo: Modifier `super-admin/index.html` ligne ~50
2. Couleurs: Modifier les variables CSS `:root` dans les fichiers HTML
3. Titre: Modifier `<title>` tags

---

## 🔄 Workflows Courants

### Créer un Nouvel Utilisateur

1. Aller à **Utilisateurs** → **Nouvel Utilisateur**
2. Remplir les informations
3. Sélectionner le rôle
4. Cliquer **Enregistrer**

### Sauvegarder la Base de Données

1. Aller à **Sauvegardes & Restauration**
2. Cliquer **Nouvelle Sauvegarde**
3. Attendre la fin (2-5 minutes)
4. Télécharger le fichier SQL

### Ajouter une Communauté

1. Aller à **Communautés** → **Nouvelle Communauté**
2. Remplir les informations de base
3. Positionner sur la carte
4. Ajouter les coordonnées de contact
5. Définir les horaires de services
6. **Enregistrer**

### Activer le Mode Maintenance

1. Aller à **Paramètres** → **Maintenance**
2. Cocher **Mode Maintenance**
3. Saisir le message (optionnel)
4. **Enregistrer**
5. Le site affichera le message aux visiteurs

---

## ⏱️ Programmation Automatique

### Sauvegardes Programmées

- **Quotidienne**: 02:00 (heure serveur)
- **Hebdomadaire**: Lundi 02:00
- **Mensuelle**: 1er du mois à 02:00

### Maintenance Programmée

Utilisé pour les mises à jour système sans interruption visible.

---

## 📞 Support & Troubleshooting

### Problème: Impossible de se connecter

**Solutions:**
1. Vérifier l'email (casse sensible)
2. Réinitialiser le mot de passe
3. Vérifier la clé secrète
4. Vider le cache navigateur
5. Essayer un navigateur différent

### Problème: Timeout de session

**Solutions:**
1. Aller à **Paramètres** → **Sécurité**
2. Augmenter **Durée de Session** (max 480 min)
3. Cocher "Se souvenir de moi" à la connexion

### Problème: Sauvegarde échouée

**Solutions:**
1. Vérifier l'espace disque disponible
2. Vérifier les permissions Supabase
3. Réessayer plus tard
4. Contacter l'administrateur système

---

## 🔐 Bonnes Pratiques

### Sécurité
- ✅ Changer le mot de passe mensuellement
- ✅ Enregistrer les logs d'activité
- ✅ Faire des sauvegardes hebdomadaires
- ✅ Monitorer les alertes système
- ✅ Garder le navigateur à jour

### Performance
- ✅ Nettoyer les logs toutes les 3 mois
- ✅ Archiver les vieilles sauvegardes
- ✅ Limiter les utilisateurs actifs simultanés
- ✅ Optimiser les images médias

### Maintenance
- ✅ Mettre à jour régulièrement
- ✅ Tester les sauvegardes mensuellement
- ✅ Vérifier les liens cassés
- ✅ Surveiller les performances

---

## 📈 Métriques & Rapports

### Tableaux de Bord

- **Utilisateurs**: Graphiques d'activité, tendances
- **Contenu**: Pages populaires, taux d'engagement
- **Événements**: Calendrier, fréquentation
- **Médias**: Utilisation d'espace, téléchargements

### Export de Données

Les rapports peuvent être exportés en:
- CSV (pour Excel)
- PDF (pour impression)
- JSON (pour intégration)

---

## 🚨 Alertes Système

### Types d'Alertes

1. **Critique** 🔴: Action immédiate requise
2. **Sérieuse** 🟠: Nécessite attention rapide
3. **Avertissement** 🟡: À monitorer
4. **Information** 🔵: Simple notification

### Gestion des Alertes

Accéder via l'icône 🔔 en haut à droite du dashboard.

---

## 📚 Ressources Supplémentaires

- **Supabase Docs**: https://supabase.io/docs
- **Leaflet Maps**: https://leafletjs.com/
- **Chart.js**: https://www.chartjs.org/
- **Documentation Interne**: Voir les fichiers README des modules

---

## 📝 Changelog

### Version 1.0.0 (Mai 2024)

✅ **Fonctionnalités Initiales:**
- Dashboard avec statistiques
- Gestion des utilisateurs
- Paramètres système
- Sauvegardes & restauration
- Logs d'activité
- Authentification 3 facteurs
- Interface responsive
- Mode sombre

📋 **Prochaines Mises à Jour:**
- [ ] Intégration Google 2FA
- [ ] API de gestion complète
- [ ] Webhooks personnalisés
- [ ] Rapports automatisés
- [ ] Sync multi-serveurs

---

## ⚖️ Mentions Légales

**Propriétaire**: Église Néo-Apostolique  
**Responsable**: Albert Kint Sodiza  
**Dernière mise à jour**: Mai 2024

---

**Besoin d'aide?** Contactez l'administrateur système.

🔒 **Cet accès est réservé uniquement à l'administrateur principal.**
