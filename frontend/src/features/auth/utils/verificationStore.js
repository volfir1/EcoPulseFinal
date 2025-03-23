// Create a new file: src/features/auth/utils/verificationStore.js

/**
 * Simple utility to store verification information in session storage
 * to maintain verification state across page refreshes
 */
const VERIFICATION_KEY = 'auth_verification_data';

const verificationStore = {
  // Store verification data
  saveVerificationData: (data) => {
    if (!data || !data.userId || !data.email) {
      console.error('Cannot save invalid verification data', data);
      return false;
    }
    
    try {
      sessionStorage.setItem(VERIFICATION_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving verification data', error);
      return false;
    }
  },

  // Get stored verification data
  getVerificationData: () => {
    try {
      const data = sessionStorage.getItem(VERIFICATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving verification data', error);
      return null;
    }
  },

  // Clear verification data
  clearVerificationData: () => {
    try {
      sessionStorage.removeItem(VERIFICATION_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing verification data', error);
      return false;
    }
  }
};

export default verificationStore;