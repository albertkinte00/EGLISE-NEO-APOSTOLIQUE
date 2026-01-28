/**
 * Configuration de l'accès admin – À COPIER en "admin-config.js"
 * Seul(s) le(s) compte(s) Gmail défini(s) ici pourra(pourront) accéder à l'administration.
 *
 * 1. Copiez ce fichier et renommez-le en : admin-config.js
 * 2. Remplacez votremail@gmail.com par votre adresse Gmail.
 * 3. Créez un Client ID Google :
 *    - Allez sur https://console.cloud.google.com/
 *    - Créez un projet ou sélectionnez-en un
 *    - Menu "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth client ID"
 *    - Type : "Web application"
 *    - Authorized JavaScript origins : l’URL de votre site (ex. https://votresite.com ou http://localhost)
 *    - Copiez le "Client ID" (ex. 123456-xxx.apps.googleusercontent.com) ci-dessous
 */
window.ADMIN_ALLOWED_EMAIL = 'albertkintsodiza@gmail.com';  // une seule adresse
// Ou plusieurs : window.ADMIN_ALLOWED_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];

window.ADMIN_GOOGLE_CLIENT_ID = 'VOTRE_CLIENT_ID.apps.googleusercontent.com';
