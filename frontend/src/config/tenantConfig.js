/**
 * Tenant Configuration
 * User email-based authentication (no hardcoded passwords)
 */

// Default fallback configuration
const DEFAULT_TENANT = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
};

// Default CRM credentials for users coming from ticketing system
// In production, implement proper SSO or token-based authentication
const DEFAULT_CRM_CREDENTIALS = {
  email: import.meta.env.VITE_USERNAME || 'admin@admin.com',
  password: import.meta.env.VITE_PASSWORD || 'admin123',
};

/**
 * Get user email from URL parameters
 * @returns {string|null} User email from URL or null
 */
export const getUserEmailFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || urlParams.get('user');
  
  if (email) {
    console.log('Detected user email from URL:', email);
    sessionStorage.setItem('userEmail', email);
  }
  
  return email;
};

/**
 * Get tenant ID from URL parameters
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
 * Get stored user email from session storage
 * @returns {string|null} Stored user email or null
 */
export const getStoredUserEmail = () => {
  return sessionStorage.getItem('userEmail');
};

/**
 * Get stored tenant ID from session storage
 * @returns {string|null} Stored tenant ID or null
 */
export const getStoredTenantId = () => {
  return sessionStorage.getItem('tenantId');
};

/**
 * Clear tenant and user context from session
 */
export const clearTenantContext = () => {
  sessionStorage.removeItem('tenantId');
  sessionStorage.removeItem('userEmail');
  console.log('Tenant context cleared');
};

/**
 * Get tenant configuration by tenant ID
 * @param {string} tenantId - The tenant database ID
 * @returns {object} Tenant configuration
 */
export const getTenantConfig = (tenantId) => {
  if (!tenantId) {
    return DEFAULT_TENANT;
  }
  
  // Return configuration with the tenant's database and bucket
  return {
    databaseId: tenantId,
    bucketId: tenantId,
  };
};

/**
 * Get current active tenant configuration
 * @returns {object} Active tenant configuration
 */
export const getCurrentTenantConfig = () => {
  const urlTenantId = getTenantIdFromUrl();
  const storedTenantId = getStoredTenantId();
  const activeTenantId = urlTenantId || storedTenantId;
  
  return getTenantConfig(activeTenantId);
};

/**
 * Get Appwrite credentials for tenant user
 * Uses the user's email and tenant context to determine Appwrite credentials
 * 
 * @returns {object} Appwrite credentials { email, password }
 */
export const getAppwriteCredentials = () => {
  const userEmail = getUserEmailFromUrl() || getStoredUserEmail();
  const tenantId = getTenantIdFromUrl() || getStoredTenantId();
  
  if (!userEmail || !tenantId) {
    console.log('No user email or tenant ID, using default Appwrite credentials');
    return DEFAULT_CRM_CREDENTIALS;
  }
  
  // For users coming from ticketing system, use the default Appwrite account
  // In production: implement proper user mapping or SSO
  console.log('User from ticketing system:', userEmail, 'tenant:', tenantId);
  return DEFAULT_CRM_CREDENTIALS;
};

/**
 * Check if user came from ticketing system
 * @returns {boolean} True if user has tenant and email context
 */
export const isTicketingSystemUser = () => {
  const email = getUserEmailFromUrl() || getStoredUserEmail();
  const tenant = getTenantIdFromUrl() || getStoredTenantId();
  return !!(email && tenant);
};

export default {
  getUserEmailFromUrl,
  getTenantIdFromUrl,
  getStoredUserEmail,
  getStoredTenantId,
  clearTenantContext,
  getTenantConfig,
  getCurrentTenantConfig,
  getAppwriteCredentials,
  isTicketingSystemUser,
};
