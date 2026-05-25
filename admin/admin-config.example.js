/**
 * Configuration de l'accès administration – À COPIER en "admin-config.js"
 * Seul le(s) compte(s) autorisé(s) défini(s) ici peut/peuvent se connecter.
 *
 * 1. Copiez ce fichier et renommez-le en : admin-config.js
 * 2. Remplacez les adresses email par celles de vos administrateurs.
 * 3. Si vous souhaitez utiliser Supabase Auth, activez USE_SUPABASE_AUTH et vérifiez les comptes.
 */
window.ADMIN_CONFIG = {
  ALLOWED_EMAILS: ['albertkintsodiza@gmail.com'],
  ACCESS_CODE: 'neo-admin-secret',
  USE_SUPABASE_AUTH: false,
  SESSION_TIMEOUT_MINUTES: 12,
  SUPABASE_URL: 'https://soejilvldrainmblqnex.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8'
};
