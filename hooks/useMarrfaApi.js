import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MarrfaApi from '../services/MarrfaApi';

/**
 * Custom hook for Marrfa API interactions with automatic JWT handling
 * and user email injection from AuthContext
 */
export const useMarrfaApi = () => {
  const { user } = useAuth();
  const userEmail = user?.email;

  // ========== User Phone ==========
  const [phoneData, setPhoneData] = useState(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(null);

  const fetchUserPhone = useCallback(async () => {
    if (!userEmail) return;
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const data = await MarrfaApi.getUserPhone(userEmail);
      setPhoneData(data);
      return data;
    } catch (err) {
      setPhoneError(err?.message || 'Failed to fetch phone');
      throw err;
    } finally {
      setPhoneLoading(false);
    }
  }, [userEmail]);

  const updateUserPhone = useCallback(async (phoneDetails) => {
    if (!userEmail) throw new Error('User not authenticated');
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const data = await MarrfaApi.updateUserPhone(userEmail, phoneDetails);
      setPhoneData(data);
      return data;
    } catch (err) {
      setPhoneError(err?.message || 'Failed to update phone');
      throw err;
    } finally {
      setPhoneLoading(false);
    }
  }, [userEmail]);

  // ========== Saved Properties ==========
  const [savedProperties, setSavedProperties] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState(null);

  const fetchSavedProperties = useCallback(async () => {
    if (!userEmail) return;
    setSavedLoading(true);
    setSavedError(null);
    try {
      const data = await MarrfaApi.getSavedProperties(userEmail);
      setSavedProperties(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setSavedError(err?.message || 'Failed to fetch saved properties');
      throw err;
    } finally {
      setSavedLoading(false);
    }
  }, [userEmail]);

  const addSavedProperty = useCallback(async (propertyId) => {
    if (!userEmail) throw new Error('User not authenticated');
    setSavedLoading(true);
    setSavedError(null);
    try {
      const data = await MarrfaApi.addSavedProperty(userEmail, propertyId);
      // Refresh saved properties list
      await fetchSavedProperties();
      return data;
    } catch (err) {
      setSavedError(err?.message || 'Failed to save property');
      throw err;
    } finally {
      setSavedLoading(false);
    }
  }, [userEmail, fetchSavedProperties]);

  const removeSavedProperty = useCallback(async (propertyId) => {
    if (!userEmail) throw new Error('User not authenticated');
    setSavedLoading(true);
    setSavedError(null);
    try {
      const data = await MarrfaApi.removeSavedProperty(userEmail, propertyId);
      // Refresh saved properties list
      await fetchSavedProperties();
      return data;
    } catch (err) {
      setSavedError(err?.message || 'Failed to remove property');
      throw err;
    } finally {
      setSavedLoading(false);
    }
  }, [userEmail, fetchSavedProperties]);

  const isSaved = useCallback((propertyId) => {
    return savedProperties.some(prop => prop?.id === propertyId || prop?._id === propertyId);
  }, [savedProperties]);

  // ========== Recommendations ==========
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userEmail) return;
    setRecommendationsLoading(true);
    setRecommendationsError(null);
    try {
      const data = await MarrfaApi.getRecommendedProperties(userEmail);
      setRecommendations(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setRecommendationsError(err?.message || 'Failed to fetch recommendations');
      throw err;
    } finally {
      setRecommendationsLoading(false);
    }
  }, [userEmail]);

  return {
    // User email from context
    userEmail,
    isAuthenticated: !!userEmail,

    // Phone management
    phoneData,
    phoneLoading,
    phoneError,
    fetchUserPhone,
    updateUserPhone,

    // Saved properties (Favorites)
    savedProperties,
    savedLoading,
    savedError,
    fetchSavedProperties,
    addSavedProperty,
    removeSavedProperty,
    isSaved,

    // Recommendations
    recommendations,
    recommendationsLoading,
    recommendationsError,
    fetchRecommendations,
  };
};

export default useMarrfaApi;
