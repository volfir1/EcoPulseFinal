import React, { useState, useEffect, useContext } from 'react';
import ticketService from '../../../services/ticketService';
import { useSnackbar } from '@components/toast-notif/ToastNotification';
import  AuthContext from '@shared/context/AuthContext'; // Adjust path as needed

const SubmitTicketSection = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    email: '',
    category: '',
    priority: '',
    description: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get auth context
  const { user, isAuthenticated } = useContext(AuthContext);
  
  // Get toast notification
  const toast = useSnackbar();
  
  // Set user email when available
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Setting email from user:", user.email);
      setTicketForm(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setErrorMessage('You must be logged in to submit a ticket');
      toast.error('You must be logged in to submit a ticket');
      return;
    }
    
    try {
      const ticketData = {
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        description: ticketForm.description
      };
      
      await ticketService.createTicket(ticketData);
      
      toast.success('Ticket submitted successfully!');
      setTicketSubmitted(true);
      
      // Save the original email to reuse it
      const userEmail = ticketForm.email;
      
      setTimeout(() => {
        setTicketSubmitted(false);
        setTicketForm({
          subject: '',
          email: userEmail, // Keep the email for convenience
          category: '',
          priority: '',
          description: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      toast.error(error.message || 'Failed to submit ticket');
      
      // Handle specific errors
      if (error.response && error.response.status === 401) {
        setErrorMessage('Authentication failed. Please log in again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Display authentication warning if not logged in */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You must be logged in to submit a support ticket. Please <a href="/login" className="text-yellow-600 font-medium underline">login</a> to continue.
          </p>
        </div>
      )}
      
      {/* Display error message if any */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}
      
      {ticketSubmitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            Your ticket has been submitted successfully! We'll get back to you soon.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Submit a Support Ticket</h2>
        <form onSubmit={handleSubmitTicket} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={ticketForm.subject}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
              required
              disabled={!isAuthenticated}
            />
          </div>
          
          {/* Email field - auto-populated and read-only when logged in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={ticketForm.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
              required
              readOnly={isAuthenticated}
              disabled={!isAuthenticated}
              style={isAuthenticated ? { backgroundColor: '#f3f4f6' } : {}}
            />
            {isAuthenticated && (
              <p className="mt-1 text-xs text-gray-500">
                This email is associated with your account and cannot be changed.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={ticketForm.category}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
                required
                disabled={!isAuthenticated}
              >
                <option value="">Select Category</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={ticketForm.priority}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
                required
                disabled={!isAuthenticated}
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={ticketForm.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400"
              required
              disabled={!isAuthenticated}
            ></textarea>
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors focus:ring-4 focus:ring-green-200 ${
              !isAuthenticated 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={!isAuthenticated}
          >
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicketSection;