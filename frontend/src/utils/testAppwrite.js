import { appwriteAuth, databases, appwriteConfig } from '@/services/appwrite';
import { Query } from 'appwrite';

export const testAppwriteConnection = async () => {
  try {
    console.log('Testing Appwrite connection...');
    console.log('Config:', appwriteConfig);
    
    // Test if we have a session
    const session = await appwriteAuth.getSession();
    console.log('Session check:', session);
    
    if (!session.success) {
      console.log('No session, attempting login...');
      const authResult = await appwriteAuth.login(
        import.meta.env.VITE_USERNAME, 
        import.meta.env.VITE_PASSWORD
      );
      console.log('Auth result:', authResult);
      if (!authResult.success) {
        console.error('Authentication failed');
        return false;
      }
    }
    
    console.log('Authentication successful, testing customer collection...');
    
    // Test basic collection access
    try {
      const collections = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        [Query.limit(1)]
      );
      console.log('Customer collection test successful:', collections);
    } catch (collectionError) {
      console.error('Customer collection error:', collectionError);
      
      // Try listing all collections to see what's available
      console.log('Trying to list all collections...');
      const allCollections = await databases.listCollections(appwriteConfig.databaseId);
      console.log('Available collections:', allCollections);
    }
    
    return true;
  } catch (error) {
    console.error('Appwrite connection test failed:', error);
    return false;
  }
};

// Auto-run test when imported in development
if (import.meta.env.DEV) {
  console.log('Running Appwrite connection test...');
  testAppwriteConnection();
}