/**
 * Configuration admin / superadmin
 * Copier ce fichier vers admin-config.js puis adapter les valeurs.
 */

window.ENAC_SUPABASE_URL = 'https://votre-projet.supabase.co';
window.ENAC_SUPABASE_ANON_KEY = 'votre_cle_publishable_supabase';

window.ADMIN_USERS = [
  {
    email: 'superadmin@example.com',
    role: 'superadmin',
    name: 'Super Administrateur'
  },
  {
    email: 'admin@example.com',
    role: 'admin',
    name: 'Equipe Communication'
  }
];

window.ADMIN_GOOGLE_CLIENT_ID = 'VOTRE_CLIENT_ID.apps.googleusercontent.com';
