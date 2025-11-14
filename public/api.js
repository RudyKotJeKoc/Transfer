// API Helper Functions

// Get stored auth token
function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// Set auth token
function setAuthToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

// Remove auth token
function removeAuthToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// Get stored user
function getStoredUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Set stored user
function setStoredUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(getApiUrl(endpoint), finalOptions);
        const data = await response.json();

        if (!response.ok) {
            // Token expired or invalid
            if (response.status === 401 || response.status === 403) {
                removeAuthToken();
                window.location.reload();
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API calls
const AuthAPI = {
    async login(username, password) {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success) {
            setAuthToken(response.token);
            setStoredUser(response.user);
        }

        return response;
    },

    async verify() {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.VERIFY, {
                method: 'POST'
            });
            return response.success;
        } catch (error) {
            return false;
        }
    },

    async getMe() {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.ME);
        return response.user;
    },

    logout() {
        removeAuthToken();
        window.location.href = '/';
    }
};

// Machines API calls
const MachinesAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.destination) params.append('destination', filters.destination);
        if (filters.responsible) params.append('responsible', filters.responsible);
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        const endpoint = queryString
            ? `${API_CONFIG.ENDPOINTS.MACHINES}?${queryString}`
            : API_CONFIG.ENDPOINTS.MACHINES;

        const response = await apiRequest(endpoint);
        return response.data;
    },

    async getById(id) {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}`);
        return response.data;
    },

    async create(machineData) {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MACHINES, {
            method: 'POST',
            body: JSON.stringify(machineData)
        });
        return response.data;
    },

    async update(id, updates) {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return response.data;
    },

    async delete(id) {
        await apiRequest(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}`, {
            method: 'DELETE'
        });
    },

    async getHistory(id) {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}/history`);
        return response.data;
    },

    async getStatistics() {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.STATISTICS);
        return response.data;
    }
};
