import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base Axios instance for Marrfa external API
const api = axios.create({
  baseURL: 'https://api-for-app.vercel.app',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export const TokenManager = {
  setAuthToken(token) {
    authToken = token || null;
  },

  getAuthToken() {
    return authToken;
  },

  async loadTokenFromCache(email) {
    try {
      const key = `marrfa:jwt:${String(email).toLowerCase()}`;
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.token) return null;
      // Soft-expiry check; default 50 minutes TTL if no expiry stored
      const now = Date.now();
      const expMs = parsed.expMs || 0;
      if (expMs && now >= expMs) {
        return null;
      }
      authToken = parsed.token;
      return parsed.token;
    } catch (e) {
      return null;
    }
  },

  async saveTokenToCache(email, token, ttlMinutes = 50) {
    try {
      const expMs = Date.now() + ttlMinutes * 60 * 1000;
      const key = `marrfa:jwt:${String(email).toLowerCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify({ token, expMs }));
      authToken = token;
    } catch (e) {
      // ignore cache write failures
    }
  },
};

// Inject Authorization header if token exists
api.interceptors.request.use((config) => {
  // Ensure headers object exists
  config.headers = config.headers || {};
  
  // Set Content-Type if not already set
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  // Set Authorization header if token exists
  if (authToken) {
    config.headers['authorization'] = `Bearer ${authToken}`;
    console.log(`[ApiClient] Request to ${config.url} with Authorization: Bearer ${authToken.substring(0, 20)}...`);
  } else {
    console.warn(`[ApiClient] Request to ${config.url} WITHOUT Authorization token!`);
  }
  
  return config;
});

// Enhanced response interceptor with detailed error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error('[ApiClient] Response Error:', {
        url: err.config?.url,
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
        headers: err.response.headers,
      });
    } else if (err.request) {
      console.error('[ApiClient] No Response:', {
        url: err.config?.url,
        message: err.message,
      });
    } else {
      console.error('[ApiClient] Request Setup Error:', err.message);
    }
    return Promise.reject(err);
  }
);

export default api;
