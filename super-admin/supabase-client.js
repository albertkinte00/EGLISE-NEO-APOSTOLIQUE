/**
 * 🔗 Intégration Supabase - Super Admin
 * Client JavaScript pour communiquer avec la base de données
 * 
 * Documentation: https://supabase.io/docs/client/javascript
 */

'use strict';

// ========================================
// CONFIGURATION SUPABASE
// ========================================
const SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

// ✅ CREDENTIALS CONFIRMÉES - Connecté au projet réel!

// ========================================
// CLASSE: SupabaseClient
// ========================================
class SupabaseClient {
  constructor(url, anonKey) {
    this.url = url;
    this.anonKey = anonKey;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    };
  }

  /**
   * Effectue une requête REST API
   */
  async request(method, endpoint, data = null) {
    const fullUrl = `${this.url}/rest/v1${endpoint}`;
    
    const options = {
      method,
      headers: this.headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API');
      }

      if (response.status === 204) return null; // No content
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  }

  // ========================================
  // USERS - Gestion des Utilisateurs
  // ========================================

  /**
   * Récupère tous les utilisateurs
   */
  async getUsers(filters = {}) {
    let query = '';
    
    if (filters.role) query += `&role_id=eq.${filters.role}`;
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.search) query += `&or=(name.ilike.%${filters.search}%,email.ilike.%${filters.search}%)`;
    
    return this.request('GET', `/users?select=*${query}`);
  }

  /**
   * Récupère un utilisateur spécifique
   */
  async getUser(id) {
    return this.request('GET', `/users?id=eq.${id}&select=*`);
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData) {
    return this.request('POST', '/users', userData);
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(id, userData) {
    return this.request('PATCH', `/users?id=eq.${id}`, userData);
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id) {
    return this.request('DELETE', `/users?id=eq.${id}`);
  }

  // ========================================
  // AUTHENTICATION
  // ========================================

  /**
   * Connecte un utilisateur
   */
  async login(email, password, secretKey) {
    // Vérifier les identifiants
    const users = await this.request('GET', `/users?email=eq.${email}&select=*`);
    
    if (users.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Note: La vérification du mot de passe doit se faire côté serveur en production
    // Ici on simule
    
    return users[0];
  }

  /**
   * Crée une session
   */
  async createSession(userId, ipAddress = null) {
    const token = 'super_admin_token_' + Date.now();
    
    return this.request('POST', '/sessions', {
      user_id: userId,
      token,
      ip_address: ipAddress,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  }

  /**
   * Vérifie une session
   */
  async verifySession(token) {
    const sessions = await this.request('GET', `/sessions?token=eq.${token}&select=*`);
    return sessions.length > 0 ? sessions[0] : null;
  }

  // ========================================
  // ACTIVITY LOGS
  // ========================================

  /**
   * Enregistre une activité
   */
  async logActivity(data) {
    return this.request('POST', '/activity_logs', {
      user_id: data.user_id,
      action: data.action,
      module: data.module,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      description: data.description,
      status: data.status || 'info',
      ip_address: data.ip_address,
      details: data.details || null
    });
  }

  /**
   * Récupère les logs d'activité
   */
  async getActivityLogs(filters = {}) {
    let query = '&select=*,user_id(id,name,email)';
    
    if (filters.action) query += `&action=eq.${filters.action}`;
    if (filters.module) query += `&module=eq.${filters.module}`;
    if (filters.user_id) query += `&user_id=eq.${filters.user_id}`;
    if (filters.status) query += `&status=eq.${filters.status}`;
    
    return this.request('GET', `/activity_logs?order=created_at.desc${query}&limit=100`);
  }

  // ========================================
  // COMMUNITIES
  // ========================================

  /**
   * Récupère toutes les communautés
   */
  async getCommunities(filters = {}) {
    let query = '&select=*';
    
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.city) query += `&city=ilike.%${filters.city}%`;
    if (filters.search) query += `&or=(name.ilike.%${filters.search}%,city.ilike.%${filters.search}%)`;
    
    return this.request('GET', `/communities?order=name.asc${query}`);
  }

  /**
   * Crée une communauté
   */
  async createCommunity(data) {
    return this.request('POST', '/communities', data);
  }

  /**
   * Met à jour une communauté
   */
  async updateCommunity(id, data) {
    return this.request('PATCH', `/communities?id=eq.${id}`, data);
  }

  /**
   * Supprime une communauté
   */
  async deleteCommunity(id) {
    return this.request('DELETE', `/communities?id=eq.${id}`);
  }

  // ========================================
  // EVENTS
  // ========================================

  /**
   * Récupère tous les événements
   */
  async getEvents(filters = {}) {
    let query = '&select=*,community_id(name)&order=event_date.desc';
    
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.category) query += `&category=eq.${filters.category}`;
    if (filters.search) query += `&or=(title.ilike.%${filters.search}%,description.ilike.%${filters.search}%)`;
    
    return this.request('GET', `/events?${query}`);
  }

  /**
   * Crée un événement
   */
  async createEvent(data) {
    return this.request('POST', '/events', data);
  }

  /**
   * Met à jour un événement
   */
  async updateEvent(id, data) {
    return this.request('PATCH', `/events?id=eq.${id}`, data);
  }

  /**
   * Supprime un événement
   */
  async deleteEvent(id) {
    return this.request('DELETE', `/events?id=eq.${id}`);
  }

  // ========================================
  // CONTENT
  // ========================================

  /**
   * Récupère tout le contenu
   */
  async getContent(filters = {}) {
    let query = '&select=*,author_id(name)&order=created_at.desc';
    
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.category) query += `&category=eq.${filters.category}`;
    if (filters.featured) query += '&featured=eq.true';
    
    return this.request('GET', `/content?${query}`);
  }

  /**
   * Crée un contenu
   */
  async createContent(data) {
    return this.request('POST', '/content', data);
  }

  /**
   * Met à jour un contenu
   */
  async updateContent(id, data) {
    return this.request('PATCH', `/content?id=eq.${id}`, data);
  }

  /**
   * Supprime un contenu
   */
  async deleteContent(id) {
    return this.request('DELETE', `/content?id=eq.${id}`);
  }

  // ========================================
  // MEDIA
  // ========================================

  /**
   * Récupère tous les médias
   */
  async getMedia(filters = {}) {
    let query = '&select=*,uploaded_by(name)&order=created_at.desc';
    
    if (filters.type) query += `&type=eq.${filters.type}`;
    if (filters.category) query += `&category=eq.${filters.category}`;
    
    return this.request('GET', `/media?${query}`);
  }

  /**
   * Enregistre un média (après upload)
   */
  async registerMedia(data) {
    return this.request('POST', '/media', data);
  }

  /**
   * Supprime un média
   */
  async deleteMedia(id) {
    return this.request('DELETE', `/media?id=eq.${id}`);
  }

  // ========================================
  // BACKUPS
  // ========================================

  /**
   * Récupère les sauvegardes
   */
  async getBackups(filters = {}) {
    let query = '&select=*,created_by(name),restored_by(name)&order=created_at.desc';
    
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.type) query += `&type=eq.${filters.type}`;
    
    return this.request('GET', `/backups?${query}&limit=50`);
  }

  /**
   * Enregistre une sauvegarde
   */
  async createBackup(data) {
    return this.request('POST', '/backups', data);
  }

  /**
   * Met à jour une sauvegarde
   */
  async updateBackup(id, data) {
    return this.request('PATCH', `/backups?id=eq.${id}`, data);
  }

  // ========================================
  // SETTINGS
  // ========================================

  /**
   * Récupère tous les paramètres
   */
  async getSettings() {
    return this.request('GET', '/settings?select=*');
  }

  /**
   * Récupère un paramètre spécifique
   */
  async getSetting(key) {
    const result = await this.request('GET', `/settings?key=eq.${key}&select=value`);
    return result.length > 0 ? result[0].value : null;
  }

  /**
   * Met à jour un paramètre
   */
  async updateSetting(key, value, type = 'string') {
    // Vérifier si existe
    const exists = await this.request('GET', `/settings?key=eq.${key}&select=id`);
    
    if (exists.length > 0) {
      return this.request('PATCH', `/settings?key=eq.${key}`, {
        value,
        type,
        updated_at: new Date().toISOString()
      });
    } else {
      return this.request('POST', '/settings', {
        key,
        value,
        type
      });
    }
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================

  /**
   * Récupère les notifications d'un utilisateur
   */
  async getNotifications(userId, unreadOnly = false) {
    let query = `&user_id=eq.${userId}&order=created_at.desc`;
    
    if (unreadOnly) query += '&read_at=is.null';
    
    return this.request('GET', `/notifications?select=*${query}`);
  }

  /**
   * Crée une notification
   */
  async createNotification(data) {
    return this.request('POST', '/notifications', data);
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationAsRead(id) {
    return this.request('PATCH', `/notifications?id=eq.${id}`, {
      read_at: new Date().toISOString()
    });
  }

  // ========================================
  // PERMISSIONS & ROLES
  // ========================================

  /**
   * Récupère les permissions d'un utilisateur
   */
  async getUserPermissions(userId) {
    return this.request('GET', `/user_permissions?user_id=eq.${userId}&select=permission_id(name)`);
  }

  /**
   * Ajoute une permission à un utilisateur
   */
  async grantPermission(userId, permissionId) {
    return this.request('POST', '/user_permissions', {
      user_id: userId,
      permission_id: permissionId
    });
  }

  /**
   * Retire une permission à un utilisateur
   */
  async revokePermission(userId, permissionId) {
    return this.request('DELETE', `/user_permissions?user_id=eq.${userId}&permission_id=eq.${permissionId}`);
  }

  /**
   * Récupère les rôles
   */
  async getRoles() {
    return this.request('GET', '/roles?select=*&order=level.desc');
  }
}

// ========================================
// INSTANCE GLOBALE
// ========================================
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// EXEMPLES D'UTILISATION
// ========================================

/*
// Exemple 1: Récupérer tous les utilisateurs
supabase.getUsers()
  .then(users => console.log('Utilisateurs:', users))
  .catch(error => console.error('Erreur:', error));

// Exemple 2: Créer un utilisateur
supabase.createUser({
  name: 'Jean Dupont',
  email: 'jean@example.com',
  role_id: 2,
  status: 'active'
})
  .then(user => console.log('Utilisateur créé:', user))
  .catch(error => console.error('Erreur:', error));

// Exemple 3: Enregistrer une activité
supabase.logActivity({
  user_id: 1,
  action: 'CREATE_USER',
  module: 'users',
  entity_type: 'user',
  description: 'Création d\'un nouvel utilisateur',
  status: 'success'
})
  .then(log => console.log('Activité enregistrée:', log))
  .catch(error => console.error('Erreur:', error));

// Exemple 4: Récupérer les communautés
supabase.getCommunities({ status: 'active' })
  .then(communities => console.log('Communautés:', communities))
  .catch(error => console.error('Erreur:', error));

// Exemple 5: Mettre à jour les paramètres
supabase.updateSetting('app_name', 'Ma Super App', 'string')
  .then(() => console.log('Paramètre mis à jour'))
  .catch(error => console.error('Erreur:', error));
*/

// ========================================
// EXPORT POUR UTILISATION EXTERNE
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseClient;
}
