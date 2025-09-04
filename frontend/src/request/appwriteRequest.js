import { Query } from 'appwrite';
import { databases, appwriteAuth, appwriteConfig, findCustomerCollection } from '@/services/appwrite';

let collectionInitialized = false;

const ensureAuth = async () => {
  const sessionCheck = await appwriteAuth.getSession();
  if (!sessionCheck.success) {
    throw new Error('No active Appwrite session. Please login first.');
  }
};

const ensureCollection = async () => {
  if (!collectionInitialized) {
    await findCustomerCollection();
    collectionInitialized = true;
  }
};

const transformAppwriteDocument = (doc) => {
  if (!doc) return null;
  
  const { $id, $createdAt, $updatedAt, customer_contact_ids, ...data } = doc;
  
  // Extract contact info from relationship
  let contact = '';
  let phone = '';
  let email = '';
  
  if (customer_contact_ids && customer_contact_ids.length > 0) {
    const primaryContact = customer_contact_ids[0];
    const firstName = primaryContact.first_name || '';
    const lastName = primaryContact.last_name || '';
    contact = `${firstName} ${lastName}`.trim();
    phone = primaryContact.contact_number || primaryContact.phone || '';
    email = primaryContact.email || '';
  }
  
  return {
    _id: $id,
    createdAt: $createdAt,
    updatedAt: $updatedAt,
    name: data.name || '',
    address: data.address || '',
    contact: contact,
    phone: phone,
    email: email,
    abn: data.abn || '',
    modified: $updatedAt
  };
};

const transformToAppwriteData = (data) => {
  const { _id, createdAt, updatedAt, contact, phone, email, modified, ...cleanData } = data;
  return {
    name: cleanData.name || '',
    address: cleanData.address || '',
    abn: cleanData.abn || ''
  };
};

export const appwriteRequest = {
  create: async ({ entity, jsonData }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const appwriteData = transformToAppwriteData(jsonData);
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        'unique()',
        appwriteData
      );
      
      return {
        success: true,
        result: transformAppwriteDocument(response)
      };
    } catch (error) {
      console.error('Appwrite create error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create document'
      };
    }
  },

  read: async ({ entity, id }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        id
      );
      
      return {
        success: true,
        result: transformAppwriteDocument(response)
      };
    } catch (error) {
      console.error('Appwrite read error:', error);
      return {
        success: false,
        message: error.message || 'Failed to read document'
      };
    }
  },

  update: async ({ entity, id, jsonData }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const appwriteData = transformToAppwriteData(jsonData);
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        id,
        appwriteData
      );
      
      return {
        success: true,
        result: transformAppwriteDocument(response)
      };
    } catch (error) {
      console.error('Appwrite update error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update document'
      };
    }
  },

  delete: async ({ entity, id }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        id
      );
      
      return {
        success: true,
        result: { _id: id }
      };
    } catch (error) {
      console.error('Appwrite delete error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete document'
      };
    }
  },

  list: async ({ entity, options = {} }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const { page = 1, items = 10 } = options;
      const limit = parseInt(items, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
      
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
// Query.select(['$id', '$createdAt', '$updatedAt', 'name', 'address', 'abn', 'customer_contact_ids.*']) // Removed to see all fields
      ];
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        queries
      );
      
      const transformedDocuments = response.documents.map(transformAppwriteDocument);
      
      return {
        success: true,
        result: transformedDocuments,
        pagination: {
          page: page,
          count: response.total,
          pages: Math.ceil(response.total / limit)
        }
      };
    } catch (error) {
      console.error('Appwrite list error:', error);
      return {
        success: false,
        message: error.message || 'Failed to list documents'
      };
    }
  },

  search: async ({ entity, options = {} }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const { q = '', items = 50 } = options; // Increased limit for dropdowns
      const queries = [
        Query.limit(parseInt(items, 10)),
        Query.orderDesc('$createdAt')
      ];
      
      if (q) {
        queries.push(Query.search('name', q));
      }
      
      // Try without select first to see what fields are available
      console.log('Appwrite search - entity:', entity, 'options:', options);
      console.log('Using collection:', appwriteConfig.collections.customers);
      
      // First try without select to see raw data
      const basicQueries = [
        Query.limit(parseInt(items, 10)),
        Query.orderDesc('$createdAt')
      ];
      
      if (q) {
        basicQueries.push(Query.search('name', q));
      }
      
      console.log('Basic queries:', basicQueries);
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        basicQueries
      );
      
      console.log('Appwrite search response:', response);
      console.log('Raw documents:', response.documents);
      
      const transformedDocuments = response.documents.map(transformAppwriteDocument);
      console.log('Transformed search documents:', transformedDocuments);
      
      return {
        success: true,
        result: transformedDocuments
      };
    } catch (error) {
      console.error('Appwrite search error:', error);
      
      try {
        console.log('Trying fallback search without select...');
        const fallbackResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.customers,
          [Query.limit(parseInt(options.items || 10, 10))]
        );
        
        console.log('Fallback response:', fallbackResponse);
        const transformedDocuments = fallbackResponse.documents.map(transformAppwriteDocument);
        
        return {
          success: true,
          result: transformedDocuments
        };
      } catch (fallbackError) {
        return {
          success: false,
          message: error.message || 'Failed to search documents'
        };
      }
    }
  },

  filter: async ({ entity, options = {} }) => {
    try {
      await ensureAuth();
      await ensureCollection();
      
      if (entity !== 'client') {
        throw new Error(`Appwrite integration only available for client entity`);
      }
      
      const { filter, equal } = options;
      const queries = [
        Query.orderDesc('$createdAt'),
// Query.select(['$id', '$createdAt', '$updatedAt', 'name', 'address', 'abn', 'customer_contact_ids.*']) // Removed to see all fields
      ];
      
      if (filter && equal) {
        queries.push(Query.equal(filter, equal));
      }
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        queries
      );
      
      const transformedDocuments = response.documents.map(transformAppwriteDocument);
      
      return {
        success: true,
        result: transformedDocuments
      };
    } catch (error) {
      console.error('Appwrite filter error:', error);
      return {
        success: false,
        message: error.message || 'Failed to filter documents'
      };
    }
  }
};

export default appwriteRequest;