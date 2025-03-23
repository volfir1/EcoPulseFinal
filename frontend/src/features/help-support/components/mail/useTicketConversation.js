// src/components/tickets/useTicketConversation.js
import { useState, useEffect, useCallback, useContext } from 'react';
import { useSnackbar } from '@shared/index';
import AuthContext from '@shared/context/AuthContext';
import ticketService from '../../../../services/ticketService'; // Adjust the path as needed

const useTicketConversation = (ticketId) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { showSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);

  // Fetch ticket data
  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setError('Invalid ticket ID');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching ticket conversation for ticket ID: ${ticketId}`);
      
      const response = await ticketService.getTicket(ticketId);
      console.log('Ticket API response:', response);
      
      if (response.success) {
        const ticketData = response.data;
        console.log('Ticket data to be set:', ticketData);
        setTicket(ticketData);
      } else {
        const errorMsg = response.message || 'Failed to load ticket details';
        console.error(errorMsg);
        setError(errorMsg);
        showSnackbar(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      const errorMsg = err.message || 'Error loading ticket';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [ticketId, showSnackbar]);

  // Send a reply
  const sendReply = async () => {
    if (!replyContent.trim()) {
      showSnackbar('Reply content cannot be empty', 'warning');
      return;
    }

    try {
      console.log(`Sending reply to ticket ${ticketId}:`, replyContent);
      const response = await ticketService.replyToTicket(ticketId, replyContent);
      
      if (response.success) {
        setTicket(response.data);
        setReplyContent('');
        showSnackbar('Reply sent successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to send reply', 'error');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      showSnackbar(err.message || 'Failed to send reply', 'error');
    }
  };

  // Mark as resolved (for users)
  const markAsResolved = async () => {
    try {
      console.log(`Marking ticket ${ticketId} as resolved`);
      const response = await ticketService.updateTicketStatus(ticketId, 'resolved');

      if (response.success) {
        setTicket(response.data);
        showSnackbar('Ticket marked as resolved', 'success');
      } else {
        showSnackbar(response.message || 'Failed to update ticket status', 'error');
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      showSnackbar(err.message || 'Failed to update ticket status', 'error');
    }
  };

  // Update ticket status (for admins)
  const updateTicketStatus = async (status) => {
    if (!user || user.role !== 'admin') {
      showSnackbar('Not authorized to update ticket status', 'error');
      return;
    }
    
    try {
      console.log(`Updating ticket ${ticketId} status to ${status}`);
      const response = await ticketService.updateTicketStatus(ticketId, status);

      if (response.success) {
        setTicket(response.data);
        showSnackbar(`Ticket ${status} successfully`, 'success');
      } else {
        showSnackbar(response.message || 'Failed to update ticket status', 'error');
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      showSnackbar(err.message || 'Failed to update ticket status', 'error');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    loading,
    error,
    replyContent,
    setReplyContent,
    sendReply,
    markAsResolved,
    updateTicketStatus,
    refreshTicket: fetchTicket
  };
};

export default useTicketConversation;