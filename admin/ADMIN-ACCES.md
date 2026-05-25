# Acces a l'administration

Le nouveau panneau `admin/index.html` gere deux niveaux :

- `admin` : contenu quotidien (annonces, actualites, evenements, medias, communautes)
- `superadmin` : tout le contenu + reglages globaux du site

## Configuration

Editez `admin/admin-config.js` puis renseignez :

```js
window.ENAC_SUPABASE_URL = 'https://votre-projet.supabase.co';
window.ENAC_SUPABASE_ANON_KEY = 'votre_cle_publishable_supabase';

window.ADMIN_USERS = [
  { email: 'superadmin@example.com', role: 'superadmin', name: 'Super Admin' },
  { email: 'admin@example.com', role: 'admin', name: 'Equipe Communication' }
];

window.ADMIN_GOOGLE_CLIENT_ID = 'VOTRE_CLIENT_ID.apps.googleusercontent.com';
```

## Google Sign-In

1. Ouvrir Google Cloud Console
2. Creer ou choisir un projet
3. Aller dans `APIs & Services > Credentials`
4. Creer un `OAuth client ID`
5. Type : `Web application`
6. Ajouter vos origines JavaScript autorisees :
   - `http://localhost`
   - `http://127.0.0.1`
   - votre domaine de production

## Important

Le role `admin` ou `superadmin` est defini dans `ADMIN_USERS`.

Pour une securite forte cote base, il faut ensuite aligner les politiques RLS Supabase avec votre methode d'authentification. Dans cette version, l'interface est prete, mais le controle final des ecritures depend de vos politiques Supabase.
