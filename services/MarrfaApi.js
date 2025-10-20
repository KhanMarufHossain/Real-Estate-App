import ApiClient, { TokenManager } from './ApiClient';

export const MarrfaApi = {
  // ========== JWT Management ==========
  async fetchJwt(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) throw new Error('Email required to request JWT');

    // Try cache first
    const cached = await TokenManager.loadTokenFromCache(normalized);
    if (cached) return cached;

    console.log('[MarrfaApi.fetchJwt] Requesting JWT for:', normalized);
    const res = await ApiClient.post('/jwt', { email: normalized });
    const token = res?.data?.token || res?.data?.accessToken || res?.data?.jwt || res?.data;
    if (!token || typeof token !== 'string') {
      throw new Error('JWT token missing in response');
    }
    await TokenManager.saveTokenToCache(normalized, token, 50); // default TTL ~50 mins
    console.log('[MarrfaApi.fetchJwt] JWT received for', normalized, token ? `${token.substring(0, 20)}...` : 'NONE');
    return token;
  },

  // ========== User Management ==========
  async postUser(userPayload, emailForJwt) {
    const email = emailForJwt || userPayload?.email;
    if (!email) throw new Error('Email is required to post user');
    
    // Fetch JWT and ensure it's set in TokenManager
    const token = await this.fetchJwt(email);
    console.log('[MarrfaApi.postUser] JWT obtained:', token ? `${token.substring(0, 20)}...` : 'NONE');
    console.log('[MarrfaApi.postUser] Payload:', JSON.stringify(userPayload, null, 2));
    console.log('[MarrfaApi.postUser] Posting user to /users with Authorization bearer...');
    const res = await ApiClient.post('/users', userPayload);
    console.log('[MarrfaApi.postUser] Success response:', res?.status);
    return res?.data;
  },

  async getUserPhone(email) {
    if (!email) throw new Error('Email is required');
    await this.fetchJwt(email);

    const res = await ApiClient.get('/userphone', {
      params: { email: String(email).trim().toLowerCase() }
    });
    return res?.data;
  },

  async updateUserPhone(email, phoneDetails) {
    if (!email) throw new Error('Email is required');
    if (!phoneDetails?.phone) throw new Error('Phone details required');
    await this.fetchJwt(email);

    const res = await ApiClient.patch('/userphone', phoneDetails, {
      params: { email: String(email).trim().toLowerCase() }
    });
    return res?.data;
  },

  // ========== Saved Properties (Favorites) ==========
  async addSavedProperty(email, propertyId) {
    if (!email || !propertyId) throw new Error('Email and property ID required');
    await this.fetchJwt(email);

    const res = await ApiClient.post('/savedreellyproperty', {
      id: propertyId,
      user: String(email).trim().toLowerCase()
    });
    return res?.data;
  },

  async getSavedProperties(email) {
    if (!email) throw new Error('Email is required');
    await this.fetchJwt(email);

    const res = await ApiClient.get('/savedproperty', {
      params: { email: String(email).trim().toLowerCase() }
    });
    return res?.data;
  },

  async removeSavedProperty(email, propertyId) {
    if (!email || !propertyId) throw new Error('Email and property ID required');
    await this.fetchJwt(email);

    const res = await ApiClient.delete('/savedproperty', {
      params: {
        email: String(email).trim().toLowerCase(),
        id: propertyId
      }
    });
    return res?.data;
  },

  // ========== City Properties ==========
  // As per Postman: GET https://api-for-app.vercel.app/cityproperty?cityName=Dubai (no auth required)
  async getCityProperties(cityName) {
    if (!cityName) throw new Error('cityName is required');
    console.log('[MarrfaApi.getCityProperties] Fetching city properties for:', cityName);
    const res = await ApiClient.get('/cityproperty', {
      params: { cityName }
    });
    return res?.data;
  },

  async searchProperties(filters = {}) {
    const res = await ApiClient.get('/properties', { params: filters });
    return res?.data;
  },

  async getPropertiesByAreas(areaIds = []) {
    if (!areaIds || areaIds.length === 0) {
      throw new Error('At least one area ID is required');
    }
    console.log('[MarrfaApi.getPropertiesByAreas] Fetching properties for areas:', areaIds);
    
    // Convert array to comma-separated string for API
    const areasParam = Array.isArray(areaIds) ? areaIds.join(',') : areaIds;
    
    const res = await ApiClient.get('/properties', {
      params: { areas: areasParam }
    });
    return res?.data;
  },

  async getPropertyDetails(propertyId) {
    if (!propertyId) throw new Error('Property ID is required');
    const res = await ApiClient.get('/single', {
      params: { id: propertyId }
    });
    return res?.data;
  },

  // ========== Recommendations & Tracking ==========
  async getRecommendedProperties(email) {
    if (!email) throw new Error('Email is required');
    await this.fetchJwt(email);

    const res = await ApiClient.get(`/marrfacollectionspublic/${String(email).trim().toLowerCase()}`);
    return res?.data;
  },

  async updateChatbotMessage(messageId, email, userMessage, timestamp) {
    if (!email || !messageId) throw new Error('Email and message ID required');
    await this.fetchJwt(email);

    const res = await ApiClient.patch(
      `/updatemessage/${messageId}/${String(email).trim().toLowerCase()}`,
      {
        user: userMessage,
        timeStamp: timestamp || Date.now()
      }
    );
    return res?.data;
  },

  // ========== Developers ==========
  // Use the public developers endpoint defined in Postman (no auth)
  async getDevelopers(search = '', page = 1) {
    console.log('[MarrfaApi.getDevelopers] Fetching developers:', { search, page });
    const res = await ApiClient.get('https://marrfa.com/api/developers', {
      params: { search, page }
    });
    return res?.data;
  },

  // ========== Register Interest ==========
  async registerInterest(payload, email) {
    if (!email) throw new Error('Email is required for register interest');
    if (!payload?.propertyId) throw new Error('Property ID is required');
    
    // Ensure JWT is fetched and set
    await this.fetchJwt(email);

    console.log('[MarrfaApi.registerInterest] Submitting:', payload);
    const res = await ApiClient.post('/registerinterest', payload);
    console.log('[MarrfaApi.registerInterest] Response:', res?.status);
    return res?.data;
  },

  // ========== Schedule Call ==========
  async scheduleCall(payload, email) {
    if (!email) throw new Error('Email is required for schedule call');
    if (!payload?.propertyId) throw new Error('Property ID is required');
    
    // Ensure JWT is fetched and set
    await this.fetchJwt(email);

    console.log('[MarrfaApi.scheduleCall] Submitting:', payload);
    const res = await ApiClient.post('/schedulecall', payload);
    console.log('[MarrfaApi.scheduleCall] Response:', res?.status);
    return res?.data;
  },
};

export default MarrfaApi;