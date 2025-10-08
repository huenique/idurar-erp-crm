/**
 * Token Configuration
 * Handles secure token-based authentication from ticketing system
 */

/**
 * Get token from URL parameters
 * @returns {string|null} Token from URL or null
 */
export const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    console.log('Detected authentication token from URL');
    // Store in sessionStorage for reference
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('authMethod', 'token');
  }
  
  return token;
};

/**
 * Get tenant ID from URL parameters (for additional context)
 * @returns {string|null} Tenant ID from URL or null
 */
export const getTenantIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantId = urlParams.get('tenant') || urlParams.get('db');
  
  if (tenantId) {
    console.log('Detected tenant ID from URL:', tenantId);
    sessionStorage.setItem('tenantId', tenantId);
  }
  
  return tenantId;
};

/**
 * Get email from URL parameters (fallback auth method)
 * @returns {string|null} Email from URL or null
 */
export const getEmailFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || urlParams.get('user');
  
  if (email) {
    console.log('Detected user email from URL:', email);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('authMethod', 'email');
  }
  
  return email;
};

/**
 * Get stored tenant ID from session storage
 * @returns {string|null} Stored tenant ID or null
 */
export const getStoredTenantId = () => {
  return sessionStorage.getItem('tenantId');
};

/**
 * Get authentication method used
 * @returns {string} 'token', 'email', or 'manual'
 */
export const getAuthMethod = () => {
  return sessionStorage.getItem('authMethod') || 'manual';
};

/**
 * Check if user came from ticketing system with token
 * @returns {boolean} True if token-based auth
 */
export const isTokenAuth = () => {
  return getAuthMethod() === 'token';
};

/**
 * Check if user came from ticketing system with email
 * @returns {boolean} True if email-based auth  
 */
export const isEmailAuth = () => {
  return getAuthMethod() === 'email';
};

/**
 * Check if user came from ticketing system (any method)
 * @returns {boolean} True if from ticketing system
 */
export const isFromTicketingSystem = () => {
  const method = getAuthMethod();
  return method === 'token' || method === 'email';
};

/**
 * Clear all authentication context from session
 */
export const clearAuthContext = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('tenantId');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('authMethod');
  console.log('Authentication context cleared');
};

/**
 * Get current tenant configuration
 * @returns {object} Tenant configuration
 */
export const getCurrentTenantConfig = () => {
  const tenantId = getTenantIdFromUrl() || getStoredTenantId();
  
  if (!tenantId) {
    return {
      databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
      bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
    };
  }
  
  return {
    databaseId: tenantId,
    bucketId: tenantId,
  };
};

export default {
  getTokenFromUrl,
  getTenantIdFromUrl,
  getEmailFromUrl,
  getStoredTenantId,
  getAuthMethod,
  isTokenAuth,
  isEmailAuth,
  isFromTicketingSystem,
  clearAuthContext,
  getCurrentTenantConfig,
};

/**
 * Alias for getEmailFromUrl (for consistency with imports)
 */
export const getUserEmailFromUrl = getEmailFromUrl;

/**
 * Get stored user email from session storage
 */
export const getStoredUserEmail = () => {
  return sessionStorage.getItem('userEmail');
};
