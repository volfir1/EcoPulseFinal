import { nodeApi } from '@modules/api'; 

// Helper to normalize API responses - Kept, operates on response data
const normalizeResponse = (response) => {
  // Check if response exists and has data
  if (!response || !response.data) {
     // Return structure indicating failure and empty data
     return { success: false, data: [], message: 'Invalid or empty response from server' };
  }
  
  // Check if response already follows the { success: boolean, data: any, message?: string } structure
  if (typeof response.data.success === 'boolean' && response.data.data !== undefined) {
     return {
       success: response.data.success,
       // Ensure data is always an array if it's supposed to be multiple items, or the object itself
       data: response.data.data, 
       message: response.data.message 
     };
  } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      // Handle cases where server might just return the object/data directly on success
      // Assume success if we get here with an object and no explicit 'success: false'
      return {
         success: true,
         data: response.data
      }
   } else if (Array.isArray(response.data)) {
      // Handle cases where server returns just an array
      return {
         success: true,
         data: response.data
      }
   } else {
     // Fallback for unexpected structures - treat as success but log a warning
     console.warn("normalizeResponse received an unexpected structure:", response.data);
     return { success: true, data: response.data };
   }
};


const ticketService = {
  // Create a new ticket - Uses nodeApi
  createTicket: async (ticketData) => {
    try {
      console.log("Creating ticket with data:", ticketData);
      // Use nodeApi instead of axiosInstance
      const response = await nodeApi.post('/ticket', ticketData); 
      return normalizeResponse(response);
    } catch (error) {
      console.error('Ticket creation error:', error);
      // Re-throw the error; nodeApi's interceptor might have already formatted it.
      // If nodeApi doesn't format errors, adjust catch block here.
      throw error; 
    }
  },

  // Get tickets for logged-in user - Uses nodeApi
  getUserTickets: async () => {
    try {
      console.log("Fetching user tickets...");
      // Use nodeApi instead of axiosInstance
      const response = await nodeApi.get('/ticket/user'); 
      console.log("User tickets API response:", response);
      const result = normalizeResponse(response);
      console.log("Normalized user tickets:", result);
       // Ensure data is always an array if success is true
       if (result.success && !Array.isArray(result.data)) {
         console.warn("getUserTickets expected an array but got:", typeof result.data);
         result.data = []; // Default to empty array if not an array
       }
      return result;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      // Assuming nodeApi's interceptor provides a structured error with a message
       return { success: false, data: [], message: error.message || 'Failed to fetch user tickets' };
      // Or: throw error; 
    }
  },

  // Get all tickets (admin only) - Uses nodeApi
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      // Use nodeApi instead of axiosInstance
      // Note: Ensure nodeApi's baseURL is correct for the '/ticket/all' endpoint
      const response = await nodeApi.get(`/ticket/all`, { params }); // Pass filters as params
      const result = normalizeResponse(response);
      // Ensure data is always an array if success is true
       if (result.success && !Array.isArray(result.data)) {
         console.warn("getAllTickets expected an array but got:", typeof result.data);
         result.data = []; // Default to empty array if not an array
       }
      return result;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return { success: false, data: [], message: error.message || 'Failed to fetch all tickets' };
      // Or: throw error;
    }
  },

  // Get ticket statistics - Uses nodeApi
  getTicketStats: async () => {
    try {
       // Use nodeApi instead of axiosInstance
      const response = await nodeApi.get('/ticket/stats');
      const result = normalizeResponse(response);
       // Validate the structure of stats data if successful
       if (result.success && typeof result.data !== 'object') {
          console.error('getTicketStats received non-object data:', result.data);
          // Return error structure
          return { success: false, data: null, message: 'Invalid statistics data received' };
       }
      return result;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return { 
        success: false, 
        data: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, unassigned: 0 },
        message: error.message || 'Failed to fetch ticket stats'
      };
    }
  },

  // Get specific ticket - Uses nodeApi
  getTicket: async (id) => {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        return { success: false, message: 'Invalid ticket ID provided', data: null };
      }
      
      console.log(`Fetching ticket with ID ${id}`);
       // Use nodeApi instead of axiosInstance
      const response = await nodeApi.get(`/ticket/${id}`);
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      return { success: false, data: null, message: error.message || `Failed to fetch ticket ${id}` };
      // Or: throw error;
    }
  },

  // Update ticket status - Uses nodeApi
  updateTicketStatus: async (id, status) => {
    try {
      if (!id || !status) {
        return { success: false, message: 'Ticket ID and status are required', data: null };
      }
      // Use nodeApi instead of axiosInstance
      const response = await nodeApi.put(`/ticket/${id}/status`, { status }); 
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error updating ticket ${id} status:`, error);
       return { success: false, data: null, message: error.message || `Failed to update status for ticket ${id}` };
      // Or: throw error;
    }
  },

  // Reply to ticket - Uses nodeApi
  replyToTicket: async (id, content) => {
    try {
      if (!id || !content) {
         return { success: false, message: 'Ticket ID and content are required', data: null };
      }
      // Use nodeApi instead of axiosInstance
      const response = await nodeApi.post(`/ticket/${id}/reply`, { content }); 
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error replying to ticket ${id}:`, error);
       return { success: false, data: null, message: error.message || `Failed to reply to ticket ${id}` };
      // Or: throw error;
    }
  },

  // Assign ticket - Uses nodeApi
  assignTicket: async (id, adminId) => {
    try {
      if (!id || !adminId) {
         return { success: false, message: 'Ticket ID and admin ID are required', data: null };
      }
      // Use nodeApi instead of axiosInstance
      const response = await nodeApi.put(`/ticket/${id}/assign`, { adminId }); 
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error assigning ticket ${id}:`, error);
       return { success: false, data: null, message: error.message || `Failed to assign ticket ${id}` };
      // Or: throw error;
    }
  },

  // Delete ticket - Uses nodeApi
  deleteTicket: async (id) => {
    try {
      if (!id) {
         return { success: false, message: 'Ticket ID is required' };
      }
      // Use nodeApi instead of axiosInstance
      await nodeApi.delete(`/ticket/${id}`); 
      return { success: true, message: 'Ticket deleted successfully', data: null }; 
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
       return { success: false, message: error.message || `Failed to delete ticket ${id}` };
      // Or: throw error;
    }
  },
  
  // Get admin users for assignment - Uses nodeApi
  getAdmins: async () => {
    try {
       // Use nodeApi instead of axiosInstance
      const response = await nodeApi.get('/ticket/admins');
      const result = normalizeResponse(response);
       // Ensure data is always an array if success is true
       if (result.success && !Array.isArray(result.data)) {
         console.warn("getAdmins expected an array but got:", typeof result.data);
         result.data = []; // Default to empty array if not an array
       }
      return result;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch admin users',
        data: []
      };
    }
  }
};

export default ticketService;