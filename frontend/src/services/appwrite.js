import { Client, Databases, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const appwriteAuth = {
  login: async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      return { success: true };
    } catch (error) {
      console.error('Appwrite authentication failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  logout: async () => {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error) {
      console.error('Appwrite logout failed:', error);
      return { success: false, error: error.message };
    }
  },
  
  getSession: async () => {
    try {
      const session = await account.getSession('current');
      return { success: true, session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const appwriteConfig = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  bucketsId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  functionId: import.meta.env.VITE_APPWRITE_FUNCTION_ID,
  collections: {
    customers: 'customers' // Will be dynamically determined
  }
};

// Function to find the correct customer collection
export const findCustomerCollection = async () => {
  try {
    const collections = await databases.listCollections(appwriteConfig.databaseId);
    console.log('Available collections:', collections.collections.map(c => ({ id: c.$id, name: c.name })));
    
    // Look for collections that might contain customers
    const possibleNames = ['customers', 'customer', 'client', 'clients', 'Customer', 'Customers'];
    
    for (const collection of collections.collections) {
      if (possibleNames.includes(collection.$id) || possibleNames.includes(collection.name)) {
        console.log('Found customer collection:', collection.$id, collection.name);
        appwriteConfig.collections.customers = collection.$id;
        return collection.$id;
      }
    }
    
    // If no match found, return the first collection for testing
    if (collections.collections.length > 0) {
      const firstCollection = collections.collections[0];
      console.log('No customer collection found, using first available:', firstCollection.$id, firstCollection.name);
      appwriteConfig.collections.customers = firstCollection.$id;
      return firstCollection.$id;
    }
    
    throw new Error('No collections found in database');
  } catch (error) {
    console.error('Failed to find customer collection:', error);
    return 'customers'; // fallback
  }
};

export { client };