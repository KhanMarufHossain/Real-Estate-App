import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FavoritesService from '../services/FavoritesService';

/**
 * Custom hook to manage favorites across the app
 * 
 * Features:
 * - Centralized favorites state
 * - Optimistic UI updates
 * - Automatic syncing with backend
 * - Error handling with rollback
 */

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState(null);

  // Debug: Log whenever favorites state changes
  useEffect(() => {
    console.log('[useFavorites] Favorites state changed:', favorites.length, 'items');
    console.log('[useFavorites] Current favorites:', favorites.map(f => ({ id: f.id, name: f.name })));
  }, [favorites]);

  // Load favorites when user is available
  useEffect(() => {
    if (user?.email) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.email]);

  /**
   * Load all favorites from backend
   */
  const loadFavorites = useCallback(async () => {
    if (!user?.email) return;

    console.log('[useFavorites] Loading favorites for user:', user.email);
    setFavoritesLoading(true);
    setFavoritesError(null);

    try {
      const data = await FavoritesService.getFavorites(user.email);
      console.log('[useFavorites] Received data from service:', data);
      console.log('[useFavorites] Data type:', typeof data, 'Is array:', Array.isArray(data));
      console.log('[useFavorites] Data length:', data?.length);
      setFavorites(data);
      console.log('[useFavorites] State updated with', data.length, 'favorites');
    } catch (error) {
      console.error('[useFavorites] Error loading favorites:', error);
      setFavoritesError(error.message);
    } finally {
      setFavoritesLoading(false);
    }
  }, [user?.email]);

  /**
   * Check if a property is favorited
   */
  const isFavorited = useCallback((propertyId) => {
    return favorites.some(fav => fav.id === Number(propertyId));
  }, [favorites]);

  /**
   * Toggle favorite status with optimistic update
   */
  const toggleFavorite = useCallback(async (property) => {
    if (!user?.email) {
      console.warn('[useFavorites] User not logged in');
      return;
    }

    const propertyId = property.id;
    const isCurrentlyFavorited = isFavorited(propertyId);

    // Optimistic update
    if (isCurrentlyFavorited) {
      // Remove from UI immediately
      setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
    } else {
      // Add to UI immediately
      setFavorites(prev => [...prev, property]);
    }

    try {
      // Make API call
      if (isCurrentlyFavorited) {
        await FavoritesService.removeFavorite(user.email, propertyId);
        console.log('[useFavorites] Property removed from favorites:', propertyId);
      } else {
        await FavoritesService.addFavorite(user.email, propertyId);
        console.log('[useFavorites] Property added to favorites:', propertyId);
      }
    } catch (error) {
      console.error('[useFavorites] Error toggling favorite:', error);
      
      // Rollback optimistic update on error
      if (isCurrentlyFavorited) {
        setFavorites(prev => [...prev, property]);
      } else {
        setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
      }
      
      setFavoritesError(error.message);
    }
  }, [user?.email, favorites, isFavorited]);

  /**
   * Add a property to favorites
   */
  const addFavorite = useCallback(async (property) => {
    if (!user?.email) {
      console.warn('[useFavorites] User not logged in');
      return;
    }

    const propertyId = property.id;

    // Don't add if already favorited
    if (isFavorited(propertyId)) {
      return;
    }

    // Optimistic update
    setFavorites(prev => [...prev, property]);

    try {
      await FavoritesService.addFavorite(user.email, propertyId);
      console.log('[useFavorites] Property added to favorites:', propertyId);
    } catch (error) {
      console.error('[useFavorites] Error adding favorite:', error);
      
      // Rollback on error
      setFavorites(prev => prev.filter(fav => fav.id !== propertyId));
      setFavoritesError(error.message);
    }
  }, [user?.email, isFavorited]);

  /**
   * Remove a property from favorites
   */
  const removeFavorite = useCallback(async (propertyId) => {
    if (!user?.email) {
      console.warn('[useFavorites] User not logged in');
      return;
    }

    // Find the property to restore if rollback needed
    const property = favorites.find(fav => fav.id === propertyId);

    // Optimistic update
    setFavorites(prev => prev.filter(fav => fav.id !== propertyId));

    try {
      await FavoritesService.removeFavorite(user.email, propertyId);
      console.log('[useFavorites] Property removed from favorites:', propertyId);
    } catch (error) {
      console.error('[useFavorites] Error removing favorite:', error);
      
      // Rollback on error
      if (property) {
        setFavorites(prev => [...prev, property]);
      }
      setFavoritesError(error.message);
    }
  }, [user?.email, favorites]);

  return {
    favorites,
    favoritesLoading,
    favoritesError,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    loadFavorites,
  };
};

export default useFavorites;
