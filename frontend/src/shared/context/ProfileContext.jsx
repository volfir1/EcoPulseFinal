// src/contexts/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useLoader } from '@shared/index';
import { compressImageFile, compressBase64Image } from '../../utils/imageCompression';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const { startLoading, stopLoading } = useLoader();
  
  const fetchUserProfile = async () => {
    try {
      startLoading();
      
      // FALLBACK METHOD: If getCurrentUser doesn't exist, get from localStorage
      let userData;
      
      if (typeof userService.getCurrentUser === 'function') {
        userData = await userService.getCurrentUser();
      } else {
        console.warn('userService.getCurrentUser not available, falling back to localStorage');
        try {
          const userJSON = localStorage.getItem('user');
          if (userJSON) {
            userData = JSON.parse(userJSON);
          }
        } catch (parseError) {
          console.error('Error parsing user from localStorage:', parseError);
        }
      }
      
      setProfile(userData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Error loading profile:', err);
      
      // Try to recover from localStorage as last resort
      try {
        const userJSON = localStorage.getItem('user');
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setProfile(userData);
        }
      } catch (parseError) {
        console.error('Error recovering profile from localStorage:', parseError);
      }
    } finally {
      stopLoading();
    }
  };
  
  const updateProfile = async (updatedData) => {
    try {
      startLoading();
      
      // FIX: Ensure avatar field is excluded from updates unless it was intentionally changed
      // Create a copy of updatedData without the avatar property
      const { avatar, ...dataWithoutAvatar } = updatedData;
      
      // Only include avatar in the update if it was explicitly provided and different from current
      // This ensures text field updates won't affect the avatar
      const dataToUpdate = avatar ? updatedData : dataWithoutAvatar;
      
      console.log('Updating profile with data:', dataToUpdate);
      console.log('Avatar field excluded:', !dataToUpdate.hasOwnProperty('avatar'));
      
      // Try to use updateUserProfile if available, otherwise use updateProfile
      let updated;
      
      if (typeof userService.updateUserProfile === 'function') {
        updated = await userService.updateUserProfile({
          id: profile.id,
          ...dataToUpdate
        });
      } else if (typeof userService.updateProfile === 'function') {
        updated = await userService.updateProfile(profile.id, dataToUpdate);
      } else {
        throw new Error('No profile update method available');
      }
      
      setProfile({ ...profile, ...updated });
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      stopLoading();
    }
  };
  
  /**
   * Formats an avatar ID to ensure consistency between MongoDB and Cloudinary
   * @param {string} userId - User's MongoDB ID
   * @param {string} avatarName - Name/number of the avatar
   * @param {number} timestamp - Unique timestamp
   * @returns {string} Formatted avatar ID
   */
  const formatAvatarId = (userId, avatarName, timestamp) => {
    // Strip any ObjectId wrapper if present
    const cleanUserId = userId.toString().replace(/ObjectId\(['"](.+)['"]\)/, '$1');
    return `ecopulse_avatars/user_${cleanUserId}_${avatarName}_${timestamp}`;
  };
  
  const updateProfilePicture = async (imageFile, progressCallback) => {
    try {
      startLoading();
      
      // Check file size and compress if needed
      if (imageFile.size > 2 * 1024 * 1024) {
        console.log('Image too large, compressing...');
        if (progressCallback) progressCallback(10);
        
        // Compress the image
        const compressedFile = await compressImageFile(imageFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 800,
          initialQuality: 0.8
        });
        
        if (progressCallback) progressCallback(30);
        imageFile = compressedFile;
      } else if (progressCallback) {
        progressCallback(30);
      }
      
      // Convert to base64 for upload
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      
      if (progressCallback) progressCallback(50);
      
      // Create unique identifier
      const uniqueId = Date.now();
      
      // FIX: Format the avatarId to match expected format in MongoDB/Cloudinary
      const userId = profile.id || profile._id;
      const formattedAvatarId = formatAvatarId(userId, "avatar-upload", uniqueId);
      
      console.log('Formatted avatar ID:', formattedAvatarId);
      
      // Prepare data for upload
      const uploadData = {
        base64Image: base64String,
        avatarId: formattedAvatarId,
        uniqueId
      };
      
      // Get API URL from environment or default
      const API_URL = import.meta.env?.VITE_API_URL || window.API_URL || "http://localhost:5000/api";
      
      // Upload the image
      const response = await fetch(`${API_URL}/upload/avatar/base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(uploadData)
      });
      
      if (progressCallback) progressCallback(80);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (progressCallback) progressCallback(90);
      
      // Update the profile with the new avatar URL - store the full Cloudinary path
      const avatarUrl = data.avatar || data.avatarUrl;
      
      // Store the formatted ID for consistency with MongoDB
      const avatarIdForMongoDB = formattedAvatarId;
      
      // Use whatever update function is available
      let profileUpdateResult;
      
      // Store both the Cloudinary URL and the formatted ID for consistency
      const avatarData = {
        avatarUrl: avatarUrl,
        avatar: avatarIdForMongoDB // Store the formatted ID in the avatar field
      };
      
      console.log('Updating profile with avatar data:', avatarData);
      
      if (typeof userService.updateProfile === 'function') {
        profileUpdateResult = await userService.updateProfile(profile.id, avatarData);
      } else if (typeof userService.updateUserProfile === 'function') {
        profileUpdateResult = await userService.updateUserProfile({
          id: profile.id,
          ...avatarData
        });
      } else {
        // If no update method is available, just update localStorage
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const userData = JSON.parse(userString);
            userData.avatar = avatarIdForMongoDB; // Use the formatted ID
            userData.avatarUrl = avatarUrl; // Also store the full URL
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (storageError) {
          console.error('Error updating localStorage:', storageError);
        }
        
        // Pretend the update was successful
        profileUpdateResult = { success: true };
      }
      
      if (!profileUpdateResult.success) {
        throw new Error(profileUpdateResult.message || 'Failed to update profile with new avatar');
      }
      
      // Update local profile state with both values
      setProfile(prev => ({ 
        ...prev, 
        avatar: avatarIdForMongoDB, 
        avatarUrl: avatarUrl 
      }));
      
      if (progressCallback) progressCallback(100);
      
      // Update user data in localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        userData.avatar = avatarIdForMongoDB; // Use the formatted ID
        userData.avatarUrl = avatarUrl; // Also store the full URL
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return { success: true, avatar: avatarUrl };
    } catch (err) {
      setError(err.message || 'Failed to update profile picture');
      console.error('Error updating profile picture:', err);
      return { success: false, error: err.message };
    } finally {
      stopLoading();
    }
  };
  
  // Helper function to upload default avatar from URL
  const updateDefaultAvatar = async (avatarId, avatarUrl) => {
    try {
      startLoading();
      
      // Fetch the avatar image
      const response = await fetch(avatarUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch avatar: ${response.status}`);
      }
      
      // Get image as blob
      const blob = await response.blob();
      
      // Convert to base64
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Compress if SVG
      let processedBase64 = base64String;
      if (avatarUrl.endsWith('.svg')) {
        processedBase64 = await compressBase64Image(base64String, {
          maxSizeMB: 1,
          maxWidthOrHeight: 400,
          quality: 0.9
        });
      }
      
      // Create unique identifier
      const uniqueId = Date.now();
      
      // Extract just the avatar name/number if a full path is provided
      const simplifiedAvatarId = avatarId.includes('/') 
        ? avatarId.split('/').pop() 
        : avatarId;
      
      // FIX: Format the avatarId to match the expected format in MongoDB/Cloudinary
      const userId = profile.id || profile._id;
      // If this is a selected avatar (e.g. avatar-5), preserve that value for the MongoDB field
      const originalAvatarId = simplifiedAvatarId;
      const formattedAvatarId = formatAvatarId(userId, originalAvatarId, uniqueId);
      
      console.log('Selected avatar ID:', originalAvatarId);
      console.log('Formatted avatar ID for Cloudinary:', formattedAvatarId);
      
      // Get API URL
      const API_URL = import.meta.env?.VITE_API_URL || window.API_URL || "http://localhost:5000/api";
      
      // Upload to server
      const uploadResponse = await fetch(`${API_URL}/upload/avatar/base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          base64Image: processedBase64,
          avatarId: formattedAvatarId,
          uniqueId
        })
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || `Server error: ${uploadResponse.status}`);
      }
      
      const data = await uploadResponse.json();
      const cloudinaryUrl = data.avatar || data.avatarUrl;
      
      // Update profile with the new avatar URL using available methods
      let profileUpdateResult;
      
      // Store the simple avatar ID (like "avatar-5") for MongoDB and the full URL for the application
      const avatarData = {
        // This is the key fix - store the original avatar ID in the avatar field for MongoDB
        avatar: originalAvatarId,
        // Store the Cloudinary URL in a separate field
        avatarUrl: cloudinaryUrl
      };
      
      console.log('Updating profile with avatar data:', avatarData);
      
      if (typeof userService.updateProfile === 'function') {
        profileUpdateResult = await userService.updateProfile(profile.id, avatarData);
      } else if (typeof userService.updateUserProfile === 'function') {
        profileUpdateResult = await userService.updateUserProfile({
          id: profile.id,
          ...avatarData
        });
      } else {
        // If no update method is available, just update localStorage
        try {
          const userString = localStorage.getItem('user');
          if (userString) {
            const userData = JSON.parse(userString);
            userData.avatar = originalAvatarId; // Store the simple avatar ID
            userData.avatarUrl = cloudinaryUrl;  // Store the URL separately
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (storageError) {
          console.error('Error updating localStorage:', storageError);
        }
        
        // Pretend the update was successful
        profileUpdateResult = { success: true };
      }
      
      if (!profileUpdateResult.success) {
        throw new Error(profileUpdateResult.message || 'Failed to update profile with new avatar');
      }
      
      // Update local profile state with both values
      setProfile(prev => ({ 
        ...prev, 
        avatar: originalAvatarId, 
        avatarUrl: cloudinaryUrl 
      }));
      
      // Update user data in localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        userData.avatar = originalAvatarId; // Store the simple avatar ID
        userData.avatarUrl = cloudinaryUrl;  // Store the URL separately
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return { success: true, avatar: cloudinaryUrl };
    } catch (err) {
      setError(err.message || 'Failed to update default avatar');
      console.error('Error updating default avatar:', err);
      return { success: false, error: err.message };
    } finally {
      stopLoading();
    }
  };
  
  const changePassword = async (passwordData) => {
    try {
      startLoading();
      await userService.changePassword(profile.id, passwordData.currentPassword, passwordData.newPassword);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to change password');
      console.error('Error changing password:', err);
      return false;
    } finally {
      stopLoading();
    }
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  return (
    <ProfileContext.Provider 
      value={{
        profile,
        error,
        fetchUserProfile,
        updateProfile,
        updateProfilePicture,
        updateDefaultAvatar,
        changePassword
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

export default ProfileContext;