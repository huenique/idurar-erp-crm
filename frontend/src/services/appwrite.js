import { Client, Databases, Account } from 'appwrite';
import { getCurrentTenantConfig } from '@/config/tokenConfig';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const appwriteAuth = {
  /**
   * Standard email/password login
   */
  login: async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      return { success: true };
    } catch (error) {
      console.error('Appwrite authentication failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Token-based authentication (from ticketing system)
   * Exchanges custom token for Appwrite session
   */
  loginWithToken: async (userId, tokenSecret) => {
    try {
      console.log('Authenticating with Appwrite custom token...');
      
      // Create session from custom token
      const session = await account.createSession(userId, tokenSecret);
      
      console.log('Token authentication successful');
      return {
        success: true,
        session: session,
        userId: userId
      };
    } catch (error) {
      console.error('Token authentication failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Email-based authentication (fallback from ticketing system)
   * Uses default Appwrite credentials
   */
  loginWithTicketingSystemContext: async () => {
    try {
      const email = import.meta.env.VITE_USERNAME;
      const password = import.meta.env.VITE_PASSWORD;
      
      if (!email || !password) {
        throw new Error('Appwrite credentials not configured');
      }
      
      const config = getCurrentTenantConfig();
      
      console.log('Attempting Appwrite login for ticketing system user');
      console.log('Database context:', config.databaseId);
      
      await account.createEmailPasswordSession(email, password);
      return { success: true, tenantId: config.databaseId };
    } catch (error) {
      console.error('Ticketing system Appwrite authentication failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error) {
      console.error('Appwrite logout failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    try {
      const session = await account.getSession('current');
      return { success: true, session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
};

export const appwriteConfig = {
  get databaseId() {
    return getCurrentTenantConfig().databaseId;
  },
  get bucketsId() {
    return getCurrentTenantConfig().bucketId;
  },
  functionId: import.meta.env.VITE_APPWRITE_FUNCTION_ID,
  collections: {
    customers: 'customers',
    tickets: 'tickets'
  }
};

export const findCustomerCollection = async () => {
  try {
    // Try the known collection name first
    const knownCollectionId = 'customers';

    // Just use the known collection ID since we know it exists
    console.log('Using customers collection:', knownCollectionId);
    appwriteConfig.collections.customers = knownCollectionId;
    return knownCollectionId;
  } catch (error) {
    console.error('Failed to find customer collection:', error);
    // Fallback to 'customers' as default
    appwriteConfig.collections.customers = 'customers';
    return 'customers';
  }
};

export const findTicketsCollection = async () => {
  try {
    const ticketsCollectionId = 'tickets';
    appwriteConfig.collections.tickets = ticketsCollectionId;
    console.log('Using tickets collection:', ticketsCollectionId);
    return ticketsCollectionId;
  } catch (error) {
    console.error('Failed to find tickets collection:', error);
    return 'tickets';
  }
};

export { client };
