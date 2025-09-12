import { Query } from 'appwrite';
import { databases, appwriteAuth, appwriteConfig, findTicketsCollection } from '@/services/appwrite';

let ticketsCollectionInitialized = false;

const ensureAuth = async () => {
  try {
    const sessionCheck = await appwriteAuth.getSession();
    if (!sessionCheck.success) {
      // Try to auto-login with environment variables
      const username = import.meta.env.VITE_USERNAME;
      const password = import.meta.env.VITE_PASSWORD;
      
      if (username && password) {
        const authResult = await appwriteAuth.login(username, password);
        if (!authResult.success) {
          throw new Error('Appwrite auto-login failed: ' + authResult.error);
        }
      } else {
        throw new Error('No active Appwrite session and no credentials provided for auto-login');
      }
    }
  } catch (error) {
    // Check if it's a connection timeout or network error
    if (error.message && (error.message.includes('ERR_CONNECTION_TIMED_OUT') || error.message.includes('network'))) {
      throw new Error('Appwrite server is not accessible (connection timeout)');
    }
    throw error;
  }
};

const ensureTicketsCollection = async () => {
  if (!ticketsCollectionInitialized) {
    // Directly set the collection name instead of trying to discover it
    appwriteConfig.collections.tickets = 'tickets';
    ticketsCollectionInitialized = true;
  }
};

const transformTicketDocument = (doc) => {
  if (!doc) return null;
  
  const { $id, $createdAt, $updatedAt, ...data } = doc;
  
  return {
    _id: $id,
    id: $id,
    $id: $id,
    createdAt: $createdAt,
    updatedAt: $updatedAt,
    // Map to actual Appwrite ticket fields
    title: data.workflow || data.title || 'No Title',
    description: data.description || '',
    status: data.status_id?.label || data.status || 'open',
    priority: data.priority || 'medium',
    assignedTo: data.assignee_ids || data.assigned_to || [],
    clientId: data.customer_id?.$id || data.customer_id || '',
    clientName: data.customer_id?.name || '',
    ticketNumber: $id,
    category: data.category || '',
    tags: data.tags || [],
    // Additional Appwrite-specific fields
    workflow: data.workflow,
    customer_id: data.customer_id,
    primary_contact_id: data.primary_contact_id,
    status_id: data.status_id,
    assignee_ids: data.assignee_ids,
    total_hours: data.total_hours || 0,
    billable_hours: data.billable_hours || 0,
    attachments: data.attachments || [],
    part_ids: data.part_ids || [],
    assignment_id: data.assignment_id || [],
    // Include all original fields for debugging
    originalData: data
  };
};

export const appwriteTickets = {
  list: async ({ options = {} }) => {
    try {
      await ensureAuth();
      await ensureTicketsCollection();
      
      const { page = 1, items = 50, search = '', status = '', clientId = '' } = options;
      const limit = parseInt(items, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
      
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
      ];
      
      // Add search query if provided
      if (search) {
        queries.push(Query.search('title', search));
      }
      
      // Add status filter if provided
      if (status) {
        queries.push(Query.equal('status', status));
      }
      
      // Add client filter if provided (only if the field exists in the schema)
      // Commented out since client_id field doesn't exist in tickets collection
      // if (clientId) {
      //   queries.push(Query.equal('client_id', clientId));
      // }
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tickets,
        queries
      );
      
      const transformedDocuments = response.documents.map(transformTicketDocument);
      
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
      
      // Return empty results to prevent UI breaking
      return {
        success: false,
        result: [],
        pagination: {
          page: parseInt(options.page || 1, 10),
          count: 0,
          pages: 0
        },
        error: error.message
      };
    }
  },

  read: async ({ id }) => {
    try {
      await ensureAuth();
      await ensureTicketsCollection();
      
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tickets,
        id
      );
      
      return {
        success: true,
        result: transformTicketDocument(response)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to read ticket'
      };
    }
  },

  search: async ({ options = {} }) => {
    try {
      await ensureAuth();
      await ensureTicketsCollection();
      
      const { q = '', items = 50, clientId = '' } = options;
      const queries = [
        Query.limit(parseInt(items, 10)),
        Query.orderDesc('$createdAt')
      ];
      
      if (q) {
        queries.push(Query.search('title', q));
      }
      
      // Skip client filtering since client_id field doesn't exist in tickets collection
      // if (clientId) {
      //   queries.push(Query.equal('client_id', clientId));
      // }
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tickets,
        queries
      );
      
      const transformedDocuments = response.documents.map(transformTicketDocument);
      
      return {
        success: true,
        result: transformedDocuments
      };
    } catch (error) {
      
      // Return empty results instead of failing completely
      return {
        success: false,
        result: [],
        error: error.message
      };
    }
  },

  getByIds: async ({ ticketIds = [] }) => {
    try {
      if (!ticketIds.length) {
        return {
          success: true,
          result: []
        };
      }

      await ensureAuth();
      await ensureTicketsCollection();
      
      const queries = [
        Query.equal('$id', ticketIds),
        Query.orderDesc('$createdAt')
      ];
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tickets,
        queries
      );
      
      const transformedDocuments = response.documents.map(transformTicketDocument);
      
      return {
        success: true,
        result: transformedDocuments
      };
    } catch (error) {
      
      return {
        success: false,
        result: [],
        error: error.message
      };
    }
  }
};

export default appwriteTickets;