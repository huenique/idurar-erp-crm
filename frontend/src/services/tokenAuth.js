/**
 * Token Authentication Service
 * Handles Appwrite custom token authentication
 */

import { account } from './appwrite';
import { getTokenFromUrl, getTenantIdFromUrl } from '@/config/tokenConfig';

/**
 * Authenticate using Appwrite custom token
 * Exchanges token for a full Appwrite session
 * 
 * @param {string} token - The custom token from URL
 * @param {string} userId - The user ID (extracted from token metadata)
 * @returns {Promise<{success: boolean, session?: object, error?: string}>}
 */
export const loginWithToken = async (token, userId) => {
  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  if (!userId) {
    return { success: false, error: 'No user ID provided' };
  }

  try {
    console.log('Authenticating with Appwrite custom token...');
    
    // Exchange token for session
    // Appwrite SDK method: createSession(userId, secret)
    const session = await account.createSession(userId, token);
    
    console.log('Token authentication successful');
    console.log('Session created:', session.$id);
    
    return {
      success: true,
      session: session
    };
  } catch (error) {
    console.error('Token authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Token authentication failed'
    };
  }
};

/**
 * Auto-authenticate if token is present in URL
 * This is the main entry point for token-based auth
 * 
 * @returns {Promise<{success: boolean, method: string, tenantId?: string, error?: string}>}
 */
export const autoAuthenticateWithToken = async () => {
  const token = getTokenFromUrl();
  const tenantId = getTenantIdFromUrl();
  
  if (!token) {
    console.log('No token found in URL');
    return { success: false, method: 'none' };
  }

  console.log('Token detected, attempting authentication...');
  console.log('Tenant context:', tenantId || 'auto-detect');

  // The userId should ideally be passed along with the token
  // For now, we'll need to extract it from the token response
  // or have it passed as another URL parameter
  
  // Check if userId is in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId') || urlParams.get('uid');
  
  if (!userId) {
    console.error('User ID not found in URL. Token authentication requires userId parameter.');
    return {
      success: false,
      method: 'token',
      error: 'Missing user ID'
    };
  }

  const result = await loginWithToken(token, userId);
  
  if (result.success) {
    return {
      success: true,
      method: 'token',
      tenantId: tenantId,
      session: result.session
    };
  }

  return {
    success: false,
    method: 'token',
    error: result.error
  };
};

/**
 * Check if current session is valid
 * @returns {Promise<boolean>}
 */
export const hasValidSession = async () => {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  loginWithToken,
  autoAuthenticateWithToken,
  hasValidSession,
};
