# Tables existantes et a creer

## Tables deja utilisees dans le projet

- `actualites`
- `evenements`
- `settings`
- `communautes`
- `contacts_communaute`
- `horaires_services`
- `activites_communaute`

## Tables ajoutees ou a creer pour la nouvelle interface

- `site_settings`
  - regle la banniere d'accueil, le texte de bienvenue, le verset, les contacts publics et les liens sociaux
- `annonces`
  - sert pour les messages courts et prioritaires affiches dans la page actualites
- `media_items`
  - sert pour les replays, playlists, directs, liens YouTube, Facebook, audio, etc.

## Tables recommandees plus tard si vous voulez aller plus loin

- `admin_users`
  - utile si vous migrez vers une vraie gestion des roles cote base avec Supabase Auth
- `page_blocks`
  - utile si vous voulez rendre editables aussi les sections statiques de pages comme `eglise.html`, `ministere.html`, `cultes.html`

## Utilisation par le nouveau panneau

- `superadmin`
  - `site_settings`
  - toutes les autres tables de contenu
- `admin`
  - `annonces`
  - `actualites`
  - `evenements`
  - `media_items`
  - `communautes`
  - `contacts_communaute`
  - `horaires_services`
  - `activites_communaute`

## Fichier SQL principal

Le script complet a executer ou adapter se trouve dans [DATABASE_SETUP.sql](/C:/Users/pc/Documents/site_neo_apostolique_complet/DATABASE_SETUP.sql).
