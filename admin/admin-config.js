/**
 * Configuration de l'accès administration
 * Seuls les comptes autorisés et les sessions valides peuvent accéder à l'espace admin.
 */
window.ADMIN_CONFIG = {
  ALLOWED_EMAILS: ['albertkintsodiza@gmail.com'],
  ACCESS_CODE: 'neo-admin-secret',
  USE_SUPABASE_AUTH: false,
  SESSION_TIMEOUT_MINUTES: 12,
  SUPABASE_URL: 'https://soejilvldrainmblqnex.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8'
};
