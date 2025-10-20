import ApiClient from './ApiClient';
import MarrfaApi from './MarrfaApi';

/**
 * FavoritesService - Centralized service for managing saved properties
 * 
 * API Endpoints:
 * - POST /savedreellyproperty - Save a property
 * - GET /savedproperty?email={email} - Get all saved properties
 * - DELETE /savedproperty?email={email}&id={propertyId} - Remove saved property
 * 
 * All requests require JWT token in Authorization header: Bearer {token}
 */

export const FavoritesService = {
  /**
   * Add a property to favorites
   * @param {string} email - User email
   * @param {number} propertyId - Property ID to save
   * @returns {Promise<any>} - API response
   */
  async addFavorite(email, propertyId) {
    if (!email || !propertyId) {
      throw new Error('Email and property ID are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Ensure JWT token is available
    await MarrfaApi.fetchJwt(normalizedEmail);
    
    console.log('[FavoritesService] Adding favorite:', { email: normalizedEmail, propertyId });
    
    const response = await ApiClient.post('/savedreellyproperty', {
      id: Number(propertyId),
      user: normalizedEmail
    });
    
    console.log('[FavoritesService] Favorite added successfully');
    return response.data;
  },

  /**
   * Get all saved properties for a user
   * @param {string} email - User email
   * @returns {Promise<Array>} - Array of saved properties
   */
  async getFavorites(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Ensure JWT token is available
    await MarrfaApi.fetchJwt(normalizedEmail);
    
    console.log('[FavoritesService] Fetching favorites for:', normalizedEmail);
    
    const response = await ApiClient.get('/savedproperty', {
      params: { email: normalizedEmail }
    });
    
    console.log('[FavoritesService] RAW API RESPONSE:', JSON.stringify(response.data, null, 2));
    
    // API returns {items: [...]} structure, not {properties: [...]}
    const favorites = Array.isArray(response.data) 
      ? response.data 
      : response.data?.items || response.data?.properties || [];
    
    console.log('[FavoritesService] Parsed favorites:', favorites.length, 'items');
    console.log('[FavoritesService] First item:', favorites[0]);
    
    return favorites;
  },

  /**
   * Remove a property from favorites
   * @param {string} email - User email
   * @param {number} propertyId - Property ID to remove
   * @returns {Promise<any>} - API response
   */
  async removeFavorite(email, propertyId) {
    if (!email || !propertyId) {
      throw new Error('Email and property ID are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Ensure JWT token is available
    await MarrfaApi.fetchJwt(normalizedEmail);
    
    console.log('[FavoritesService] Removing favorite:', { email: normalizedEmail, propertyId });
    
    const response = await ApiClient.delete('/savedproperty', {
      params: {
        email: normalizedEmail,
        id: Number(propertyId)
      }
    });
    
    console.log('[FavoritesService] Favorite removed successfully');
    return response.data;
  },

  /**
   * Check if a property is in favorites
   * @param {string} email - User email
   * @param {number} propertyId - Property ID to check
   * @returns {Promise<boolean>} - True if property is favorited
   */
  async isFavorite(email, propertyId) {
    try {
      const favorites = await this.getFavorites(email);
      return favorites.some(fav => fav.id === Number(propertyId));
    } catch (error) {
      console.error('[FavoritesService] Error checking favorite status:', error);
      return false;
    }
  }
};

export default FavoritesService;
