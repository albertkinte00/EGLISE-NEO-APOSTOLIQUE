# Accès à l’administration (réservé à votre Gmail)

Seul le compte Gmail que vous indiquez dans la configuration peut se connecter à l’admin.

## Étapes

### 1. Ouvrir la configuration

Ouvrez le fichier **admin-config.js** (à la racine du dossier `admin/`).

### 2. Mettre votre adresse Gmail

Remplacez `votremail@gmail.com` par votre vraie adresse Gmail :

```js
window.ADMIN_ALLOWED_EMAIL = 'votre.vrai@gmail.com';
```

### 3. Créer un « Client ID » Google

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/).
2. Créez un projet ou choisissez-en un.
3. Menu **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
4. Type : **Web application**.
5. **Authorized JavaScript origins** : l’URL de votre site  
   - En local : `http://localhost` ou `http://127.0.0.1`  
   - En ligne : `https://votredomaine.com` (sans slash final).
6. Créez et copiez le **Client ID** (ex. `123456-xxxx.apps.googleusercontent.com`).

### 4. Coller le Client ID dans admin-config.js

```js
window.ADMIN_GOOGLE_CLIENT_ID = '123456-xxxx.apps.googleusercontent.com';
```

Enregistrez le fichier. Désormais, en ouvrant la page **admin/index.html**, vous verrez « Connexion administration » et le bouton **Se connecter avec Google**. Seul le Gmail défini dans `ADMIN_ALLOWED_EMAIL` pourra accéder au contenu.

Pour autoriser **plusieurs** Gmail, vous pouvez utiliser dans `admin-config.js` :

```js
window.ADMIN_ALLOWED_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];
```

(et ne pas définir `ADMIN_ALLOWED_EMAIL`).

**Déconnexion** : utiliser le bouton « Se déconnecter » en haut à droite de l’admin. La session expire après 12 heures.
