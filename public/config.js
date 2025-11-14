// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        VERIFY: '/api/auth/verify',
        ME: '/api/auth/me',
        MACHINES: '/api/machines',
        STATISTICS: '/api/machines/statistics'
    }
};

// Get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'transfer_auth_token',
    USER: 'transfer_user'
};
