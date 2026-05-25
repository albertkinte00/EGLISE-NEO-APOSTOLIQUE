/**
 * 🔗 Supabase Client - Adapté aux Tables Existantes
 * Version compatible avec la structure RÉELLE du projet
 * 
 * Tables utilisées:
 * - communautes (nom, responsable, adresse, etc.)
 * - contacts_communaute (telephone, email, whatsapp)
 * - horaires_services (jours, heures, types)
 * - activites_communaute (activités)
 * - actualites (titre, date, contenu)
 * - evenements (titre, date, desc)
 * - settings (html_notif)
 */

'use strict';

// ========================================
// CONFIGURATION SUPABASE
// ========================================
const SUPABASE_URL = 'https://soejilvldrainmblqnex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y1nZvJ1zMajnHZ5bMnJj_w_Op4ph2v8';

// ========================================
// CLASSE: SupabaseClientAdapted
// ========================================
class SupabaseClientAdapted {
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

      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  }

  // ========================================
  // COMMUNAUTÉS
  // ========================================

  /**
   * Récupère toutes les communautés
   */
  async getCommunities(filters = {}) {
    let query = '/communautes?select=id,nom,responsable,quartier,adresse,active,created_at';
    
    if (filters.active !== undefined) {
      query += `&active=eq.${filters.active}`;
    }
    if (filters.search) {
      query += `&or=(nom.ilike.%${filters.search}%,responsable.ilike.%${filters.search}%)`;
    }
    
    return this.request('GET', query);
  }

  /**
   * Récupère une communauté spécifique
   */
  async getCommunity(id) {
    const community = await this.request('GET', `/communautes?id=eq.${id}&select=*`);
    if (!community || community.length === 0) return null;
    
    // Charger les contacts, horaires et activités liées
    const [contacts, horaires, activites] = await Promise.all([
      this.getCommunityContacts(id),
      this.getCommunityHoraires(id),
      this.getCommunityActivities(id)
    ]);
    
    return {
      ...community[0],
      contacts,
      horaires,
      activites
    };
  }

  /**
   * Crée une nouvelle communauté
   */
  async createCommunity(data) {
    return this.request('POST', '/communautes', data);
  }

  /**
   * Met à jour une communauté
   */
  async updateCommunity(id, data) {
    return this.request('PATCH', `/communautes?id=eq.${id}`, data);
  }

  /**
   * Supprime une communauté
   */
  async deleteCommunity(id) {
    return this.request('DELETE', `/communautes?id=eq.${id}`);
  }

  /**
   * Active/désactive une communauté
   */
  async toggleCommunityStatus(id, active) {
    return this.updateCommunity(id, { active });
  }

  // ========================================
  // CONTACTS COMMUNAUTÉ
  // ========================================

  /**
   * Récupère les contacts d'une communauté
   */
  async getCommunityContacts(communaute_id) {
    return this.request('GET', `/contacts_communaute?communaute_id=eq.${communaute_id}&select=*`);
  }

  /**
   * Ajoute un contact à une communauté
   */
  async addCommunityContact(communaute_id, type, valeur, isPrimary = false) {
    return this.request('POST', '/contacts_communaute', {
      communaute_id,
      type, // 'telephone', 'email', 'whatsapp'
      valeur,
      is_primary: isPrimary
    });
  }

  /**
   * Met à jour un contact
   */
  async updateCommunityContact(id, data) {
    return this.request('PATCH', `/contacts_communaute?id=eq.${id}`, data);
  }

  /**
   * Supprime un contact
   */
  async deleteCommunityContact(id) {
    return this.request('DELETE', `/contacts_communaute?id=eq.${id}`);
  }

  // ========================================
  // HORAIRES SERVICES
  // ========================================

  /**
   * Récupère les horaires d'une communauté
   */
  async getCommunityHoraires(communaute_id) {
    return this.request('GET', `/horaires_services?communaute_id=eq.${communaute_id}&select=*&order=jour.asc`);
  }

  /**
   * Ajoute un horaire de service
   */
  async addHoraire(communaute_id, jour, heure_debut, heure_fin, type_service) {
    return this.request('POST', '/horaires_services', {
      communaute_id,
      jour,
      heure_debut,
      heure_fin,
      type_service
    });
  }

  /**
   * Met à jour un horaire
   */
  async updateHoraire(id, data) {
    return this.request('PATCH', `/horaires_services?id=eq.${id}`, data);
  }

  /**
   * Supprime un horaire
   */
  async deleteHoraire(id) {
    return this.request('DELETE', `/horaires_services?id=eq.${id}`);
  }

  // ========================================
  // ACTIVITÉS COMMUNAUTÉ
  // ========================================

  /**
   * Récupère les activités d'une communauté
   */
  async getCommunityActivities(communaute_id) {
    return this.request('GET', `/activites_communaute?communaute_id=eq.${communaute_id}&select=*`);
  }

  /**
   * Ajoute une activité
   */
  async addActivity(communaute_id, jour, heure, activite, description = '') {
    return this.request('POST', '/activites_communaute', {
      communaute_id,
      jour,
      heure,
      activite,
      description
    });
  }

  /**
   * Met à jour une activité
   */
  async updateActivity(id, data) {
    return this.request('PATCH', `/activites_communaute?id=eq.${id}`, data);
  }

  /**
   * Supprime une activité
   */
  async deleteActivity(id) {
    return this.request('DELETE', `/activites_communaute?id=eq.${id}`);
  }

  // ========================================
  // ACTUALITÉS
  // ========================================

  /**
   * Récupère toutes les actualités
   */
  async getActualites(limit = 20, offset = 0) {
    return this.request('GET', `/actualites?select=*&order=date.desc&limit=${limit}&offset=${offset}`);
  }

  /**
   * Récupère une actualité spécifique
   */
  async getActualite(id) {
    const data = await this.request('GET', `/actualites?id=eq.${id}&select=*`);
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Crée une nouvelle actualité
   */
  async createActualite(titre, date, contenu) {
    return this.request('POST', '/actualites', {
      titre,
      date,
      contenu
    });
  }

  /**
   * Met à jour une actualité
   */
  async updateActualite(id, data) {
    return this.request('PATCH', `/actualites?id=eq.${id}`, data);
  }

  /**
   * Supprime une actualité
   */
  async deleteActualite(id) {
    return this.request('DELETE', `/actualites?id=eq.${id}`);
  }

  // ========================================
  // ÉVÉNEMENTS
  // ========================================

  /**
   * Récupère tous les événements
   * ⚠️ NOTE: Le champ est "desc" pas "description"
   */
  async getEvenements(limit = 20, offset = 0) {
    // Utilise "desc" pas "description"!
    return this.request('GET', `/evenements?select=id,titre,date,desc&order=date.desc&limit=${limit}&offset=${offset}`);
  }

  /**
   * Récupère un événement spécifique
   */
  async getEvenement(id) {
    const data = await this.request('GET', `/evenements?id=eq.${id}&select=*`);
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Crée un nouvel événement
   */
  async createEvenement(titre, date, desc) {
    return this.request('POST', '/evenements', {
      titre,
      date,
      desc // ⚠️ IMPORTANT: c'est "desc" pas "description"
    });
  }

  /**
   * Met à jour un événement
   */
  async updateEvenement(id, data) {
    return this.request('PATCH', `/evenements?id=eq.${id}`, data);
  }

  /**
   * Supprime un événement
   */
  async deleteEvenement(id) {
    return this.request('DELETE', `/evenements?id=eq.${id}`);
  }

  // ========================================
  // SETTINGS
  // ========================================

  /**
   * Récupère les paramètres (notification HTML)
   */
  async getSettings() {
    const data = await this.request('GET', '/settings?select=id,html_notif,updated_at');
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Met à jour les paramètres (notification HTML)
   */
  async updateSettings(html_notif) {
    // Mettre à jour le premier enregistrement
    return this.request('PATCH', `/settings?id=eq.1`, {
      html_notif,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Obtient juste la notification HTML
   */
  async getNotification() {
    const settings = await this.getSettings();
    return settings ? settings.html_notif : '';
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  /**
   * Teste la connexion à Supabase
   */
  async testConnection() {
    try {
      const communities = await this.getCommunities();
      console.log('✅ Connexion OK. Communautés trouvées:', communities.length);
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
  }

  /**
   * Formate une date pour Supabase (YYYY-MM-DD)
   */
  formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}

// ========================================
// INSTANCE GLOBALE
// ========================================
const supabase = new SupabaseClientAdapted(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test de connexion au chargement
window.addEventListener('load', function() {
  console.log('🔗 Supabase client chargé. Test connexion...');
  supabase.testConnection().then(ok => {
    if (ok) {
      console.log('✅ Prêt à utiliser les données Supabase!');
    } else {
      console.log('⚠️ Vérifier les credentials Supabase');
    }
  });
});
