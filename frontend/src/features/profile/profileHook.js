import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useSnackbar } from '@shared/index';
import authService from '../../services/authService';
import userService from '../../services/userService';
import { validatePassword } from './validation';
import { Loader } from '@shared/index';

export const useProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  // Profile form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'prefer-not-to-say',
    role: ''
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on component mount and detect if it's a Google account
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'prefer-not-to-say',
        role: user.role || 'user',
        avatar: user.avatar
      });

      // Check if this is a Google account by looking for googleId
      setIsGoogleAccount(!!user.googleId);
    }
  }, [user]);

  // Handle profile form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const getBase64FromImageUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Extract only the base64 data portion
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error("Failed to convert image to base64"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  };

  // Original profile submit function - used for normal profile updates
  const originalHandleProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!user?.id) {
      toast.error("User not authenticated");
      return { success: false, message: "User not authenticated" };
    }
    
    setIsLoading(true);
    
    try {
      const response = await userService.updateProfile(user.id, formData);
      
      if (response.success) {
        // Update local storage with new user data to keep things in sync
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const userData = JSON.parse(userString);
            // Merge updated profile data with the existing user data
            const updatedUserData = {
              ...userData,
              ...formData
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          }
        } catch (localStorageError) {
          console.error("Error updating localStorage:", localStorageError);
          // This error is non-critical, so we continue
        }
        
        toast.success("Profile updated successfully");
        
        // Optionally, refresh the page or re-fetch user data if you have such a function.
        // For example, if using context, you might call refreshUser();
        // window.location.reload(); // Uncomment if a full page reload is desired.
        
        return response;
      } else {
        toast.error(response.message || "Failed to update profile");
        return response;
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while updating profile");
      return { success: false, message: error.message || "An error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
  
    // Check if this is a Google account first
    if (isGoogleAccount) {
      toast.warning(
        "Google-authenticated accounts cannot change passwords here. Please use Google's account settings to manage your password.",
        { duration: 5000 }
      );
      return;
    }
  
    // Validate new password
    const validation = validatePassword(passwordData.newPassword);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }
  
    // Check password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // FIX IS HERE: Pass the userId as the first parameter
      const response = await userService.changePassword(
        user.id,                        // The actual user ID from auth context
        passwordData.currentPassword,   // Current password
        passwordData.newPassword        // New password
      );
  
      if (response.success) {
        toast.success(response.message);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error) {
      // Handle the specific error from the backend
      if (error.message?.includes("Google-authenticated") ||
        error.message?.includes("social login") ||
        error.message?.includes("Cannot change password for this account type")) {
        setIsGoogleAccount(true);
        toast.warning(
          "Google-authenticated accounts cannot change passwords here. Please use Google's account settings to manage your password.",
          { duration: 5000 }
        );
      } else {
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    setIsLoading(true);

    try {
      const response = await authService.deactivateAccount();

      if (response.success) {
        toast.success(response.message || "Account deleted successfully");

        // Log out the user
        await logout();

        // Redirect to a confirmation page
        navigate('/account-deactivated', {
          state: { email: user?.email }
        });
      } else {
        toast.error(response.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting account");
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to handle password reset
  const handlePasswordReset = async (token, newPassword) => {
    setIsLoading(true);
    try {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      const response = await userService.changePassword(token, newPassword);

      if (response.success) {
        toast.success(response.message);
        if (response.accessToken) {
          localStorage.setItem('authToken', response.accessToken);
        }
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file, progressCallback) => {
    try {
      // Get API base URL from environment variable with fallback
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const UPLOAD_URL = `${BASE_URL}/upload/avatar/base64`;
      
      // Convert file to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onload = async () => {
          const base64String = reader.result;
  
          try {
            // Update progress to 10%
            if (progressCallback) progressCallback(10);
  
            // Create unique identifier
            const uniqueId = Date.now();
  
            // Prepare data for upload
            const uploadData = {
              base64Image: base64String,
              avatarId: 'custom-upload',
              uniqueId
            };
  
            // Update progress to 30%
            if (progressCallback) progressCallback(30);
  
            // Make the API call with the dynamic URL
            const response = await fetch(UPLOAD_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              credentials: 'include',
              body: JSON.stringify(uploadData)
            });
  
            // Update progress to 80%
            if (progressCallback) progressCallback(80);
  
            if (!response.ok) {
              throw new Error('Upload failed');
            }
  
            const data = await response.json();
            console.log("Avatar upload response:", data);
  
            // Update progress to 100%
            if (progressCallback) progressCallback(100);
  
            // Return the Cloudinary URL
            const avatarUrl = data.avatar || data.avatarUrl;
  
            // Update user data in localStorage to ensure refresh displays new avatar
            const userString = localStorage.getItem('user');
            if (userString) {
              const userData = JSON.parse(userString);
              userData.avatar = avatarUrl;
              localStorage.setItem('user', JSON.stringify(userData));
            }
  
            resolve(avatarUrl);
          } catch (error) {
            console.error("Error in avatar upload:", error);
            reject(error);
          }
        };
  
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
  
        // Read the file as a data URL (base64)
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };
  const optimizeImage = async (base64String) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (now max 300px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 300;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5)); // More compression: 50% quality
      };
      img.onerror = reject;
      img.src = base64String;
    });
  };
  
  // Helper function to upload default avatar (to be called from UserProfile component)
  const uploadDefaultAvatar = async (avatarId, avatarSrc) => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const fileExtension = avatarSrc.split('.').pop().toLowerCase();
      const contentType = `image/${fileExtension === 'svg' ? 'svg+xml' : fileExtension}`;
      
      // Convert to base64
      const base64Data = await getBase64FromImageUrl(avatarSrc);
      const fullBase64 = `data:${contentType};base64,${base64Data}`;
      
      // Optimize image very aggressively to reduce size
      const optimizedImage = await optimizeImageAggressively(fullBase64);
      
      // First, store the avatar data in a separate API endpoint if exists
      let avatarUrl = "";
      
      // Try to find an avatar upload API endpoint by looking at existing API calls
      // in your code. Based on your existing code, there might be one 
      try {
        // Try localStorage query approach - this gives you access to avatar URL directly
        // This works if your avatar selection function already returns a URL
        avatarUrl = avatarSrc; // Just use the source directly as a URL
        
        // Here, we update the user profile with just the avatarUrl as a string
        // (not an object, which was causing the Mongoose error)
        const userData = {
          ...formData,
          avatar: avatarUrl // This should work if your schema expects avatar to be a string URL
        };
        
        const response = await userService.updateProfile(user.id, userData);
        
        if (!response.success) {
          throw new Error(response.message || "Failed to update avatar");
        }
        
        // Update user data in localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          userData.avatar = avatarUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        toast.success("Avatar updated successfully");
        return avatarUrl;
      } catch (error) {
        console.error("Failed to update avatar:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error(error.message || "Failed to update avatar");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Much more aggressive image optimization function (keeping for future use)
  const optimizeImageAggressively = async (base64String) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set very small max size (150px)
        let width = img.width;
        let height = img.height;
        const maxSize = 150;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        // Round dimensions to integers
        width = Math.floor(width);
        height = Math.floor(height);
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply smoothing for better compression
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to most compressed JPEG format (quality 0.2 = 20%)
        resolve(canvas.toDataURL('image/jpeg', 0.2));
      };
      img.onerror = reject;
      img.src = base64String;
    });
  };
  
  return {
    user,
    formData,
    passwordData,
    isLoading,
    isGoogleAccount,
    handleInputChange,
    handlePasswordChange,
    uploadAvatar,
    uploadDefaultAvatar,
    originalHandleProfileSubmit,
    handlePasswordSubmit,
    handleDeactivateAccount,
    handlePasswordReset
  };
};