import { useState, useCallback } from 'react';
import MarrfaApi from '../services/MarrfaApi';

/**
 * Custom hook for property browsing, searching, and details
 */
export const useProperties = () => {
  // ========== City Properties ==========
  const [cityProperties, setCityProperties] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState(null);

  const fetchCityProperties = useCallback(async (cityName) => {
    if (!cityName) return;
    setCityLoading(true);
    setCityError(null);
    try {
      const data = await MarrfaApi.getCityProperties(cityName);
      setCityProperties(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setCityError(err?.message || 'Failed to fetch city properties');
      throw err;
    } finally {
      setCityLoading(false);
    }
  }, []);

  // ========== Property Search ==========
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);

  const searchProperties = useCallback(async (filters = {}) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await MarrfaApi.searchProperties(filters);
      // Handle pagination metadata if present
      if (data?.data) {
        setSearchResults(Array.isArray(data.data) ? data.data : []);
        setSearchMeta(data?.pagination || data?.meta || null);
      } else {
        setSearchResults(Array.isArray(data) ? data : []);
      }
      return data;
    } catch (err) {
      setSearchError(err?.message || 'Failed to search properties');
      throw err;
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setSearchMeta(null);
  }, []);

  // ========== Area-based Properties ==========
  const [areaProperties, setAreaProperties] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaError, setAreaError] = useState(null);

  const fetchPropertiesByAreas = useCallback(async (areaIds = []) => {
    if (!areaIds || areaIds.length === 0) return;
    setAreaLoading(true);
    setAreaError(null);
    try {
      const data = await MarrfaApi.getPropertiesByAreas(areaIds);
      // Handle both direct array response and nested data structure
      if (data?.items) {
        setAreaProperties(Array.isArray(data.items) ? data.items : []);
        return data.items;
      } else {
        setAreaProperties(Array.isArray(data) ? data : []);
        return data;
      }
    } catch (err) {
      setAreaError(err?.message || 'Failed to fetch area properties');
      throw err;
    } finally {
      setAreaLoading(false);
    }
  }, []);

  // ========== Property Details ==========
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const fetchPropertyDetails = useCallback(async (propertyId) => {
    if (!propertyId) return;
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const data = await MarrfaApi.getPropertyDetails(propertyId);
      setPropertyDetails(data);
      return data;
    } catch (err) {
      setDetailsError(err?.message || 'Failed to fetch property details');
      throw err;
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const clearPropertyDetails = useCallback(() => {
    setPropertyDetails(null);
    setDetailsError(null);
  }, []);

  // ========== Developers ==========
  const [developers, setDevelopers] = useState([]);
  const [developersLoading, setDevelopersLoading] = useState(false);
  const [developersError, setDevelopersError] = useState(null);
  const [developersMeta, setDevelopersMeta] = useState(null);

  const fetchDevelopers = useCallback(async (search = '', page = 1) => {
    setDevelopersLoading(true);
    setDevelopersError(null);
    try {
      const data = await MarrfaApi.getDevelopers(search, page);
      if (data?.data) {
        setDevelopers(Array.isArray(data.data) ? data.data : []);
        setDevelopersMeta(data?.pagination || null);
      } else {
        setDevelopers(Array.isArray(data) ? data : []);
      }
      return data;
    } catch (err) {
      setDevelopersError(err?.message || 'Failed to fetch developers');
      throw err;
    } finally {
      setDevelopersLoading(false);
    }
  }, []);

  return {
    // City properties
    cityProperties,
    cityLoading,
    cityError,
    fetchCityProperties,

    // Search
    searchResults,
    searchLoading,
    searchError,
    searchMeta,
    searchProperties,
    clearSearch,

    // Area-based properties
    areaProperties,
    areaLoading,
    areaError,
    fetchPropertiesByAreas,

    // Property details
    propertyDetails,
    detailsLoading,
    detailsError,
    fetchPropertyDetails,
    clearPropertyDetails,

    // Developers
    developers,
    developersLoading,
    developersError,
    developersMeta,
    fetchDevelopers,
  };
};

export default useProperties;
