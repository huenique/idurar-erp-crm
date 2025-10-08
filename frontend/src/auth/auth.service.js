import { API_BASE_URL } from '@/config/serverApiConfig';
import { 
  isTokenAuth,
  isEmailAuth,
  getTokenFromUrl,
  getTenantIdFromUrl,
  getUserEmailFromUrl,
  getStoredUserEmail 
} from '@/config/tokenConfig';

import axios from 'axios';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import { appwriteAuth } from '@/services/appwrite';

export const login = async ({ loginData }) => {
  try {
    const response = await axios.post(
      API_BASE_URL + `login?timestamp=${new Date().getTime()}`,
      loginData
    );

    const { status, data } = response;

    if (data.success) {
      // Check authentication method
      if (isTokenAuth()) {
        // Token-based authentication from ticketing system
        const token = getTokenFromUrl();
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId') || urlParams.get('uid');
        const tenantId = getTenantIdFromUrl();
        
        console.log('User from ticketing system (token-based)');
        console.log('Token authentication with tenant:', tenantId);
        
        if (token && userId) {
          const appwriteResult = await appwriteAuth.loginWithToken(userId, token);
          
          if (!appwriteResult.success) {
            console.warn('Token-based Appwrite authentication failed:', appwriteResult.error);
          } else {
            console.log('Successfully authenticated with Appwrite using token');
            console.log('Tenant context:', tenantId);
          }
        } else {
          console.warn('Token or userId missing, cannot authenticate with Appwrite');
        }
      } else if (isEmailAuth()) {
        // Email-based authentication (fallback)
        const userEmail = getUserEmailFromUrl() || getStoredUserEmail();
        const tenantId = getTenantIdFromUrl();
        
        console.log('User from ticketing system (email-based fallback)');
        console.log('Email context:', userEmail, 'Tenant:', tenantId);
        
        const appwriteResult = await appwriteAuth.loginWithTicketingSystemContext();
        
        if (!appwriteResult.success) {
          console.warn('Email-based Appwrite authentication failed:', appwriteResult.error);
        } else {
          console.log('Successfully authenticated with Appwrite using email method');
          console.log('Tenant context:', appwriteResult.tenantId);
        }
      } else {
        // Standard CRM login
        const appwriteResult = await appwriteAuth.login(
          import.meta.env.VITE_USERNAME,
          import.meta.env.VITE_PASSWORD
        );

        if (!appwriteResult.success) {
          console.warn('Default Appwrite authentication failed:', appwriteResult.error);
        }
      }
    }

    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const register = async ({ registerData }) => {
  try {
    const response = await axios.post(API_BASE_URL + `register`, registerData);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const verify = async ({ userId, emailToken }) => {
  try {
    const response = await axios.get(API_BASE_URL + `verify/${userId}/${emailToken}`);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const resetPassword = async ({ resetPasswordData }) => {
  try {
    const response = await axios.post(API_BASE_URL + `resetpassword`, resetPasswordData);

    const { status, data } = response;

    successHandler(
      { data, status },
      {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const logout = async () => {
  axios.defaults.withCredentials = true;
  try {
    const response = await axios.post(API_BASE_URL + `logout?timestamp=${new Date().getTime()}`);
    const { status, data } = response;

    console.log('Attempting Appwrite logout...');
    const appwriteResult = await appwriteAuth.logout();
    console.log('Appwrite logout result:', appwriteResult);
    if (!appwriteResult.success) {
      console.warn('Appwrite logout failed:', appwriteResult.error);
    } else {
      console.log('Appwrite session cleared successfully');
    }

    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};
