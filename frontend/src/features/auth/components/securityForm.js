import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, FormField, Button } from '@shared/index';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import DeactivateAccountModal from './DeactivateAccountModal';

export const SecurityForm = ({ 
  passwordData, 
  handlePasswordChange, 
  handleSubmit,
  handleDeactivateAccount
}) => {
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  
  const openDeactivateModal = () => setIsDeactivateModalOpen(true);
  const closeDeactivateModal = () => setIsDeactivateModalOpen(false);
  
  const confirmDeactivation = () => {
    handleDeactivateAccount();
    closeDeactivateModal();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Settings</h2>
        <p className="text-gray-600">Update your password and security preferences</p>
      </div>

      {/* Password Change Section */}
      <Card.Base variant="outline" className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-2 bg-primary-50 rounded-full">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium">Change Password</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your current password"
          />
          
          <FormField
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your new password"
            helperText="Use at least 8 characters with a mix of letters, numbers & symbols"
          />
          
          <FormField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Confirm your new password"
          />

          <div className="pt-2">
            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </div>
        </form>
      </Card.Base>

      {/* Account Deactivation Section */}
      <Card.Base variant="outline" className="p-6 border-red-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-2 bg-red-50 rounded-full">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Deactivate Account</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Deactivating your account will remove your access to all EcoPulse services. This action can be reversed within 5 hours by following the recovery link sent to your email.
          </p>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              After 5 hours, you'll need to wait 24 hours before requesting another recovery link. After 30 days, your account data may be permanently deleted.
            </p>
          </div>
        </div>

        <Button 
          variant="danger" 
          onClick={openDeactivateModal}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Deactivate Account
        </Button>
      </Card.Base>

      {/* Deactivation Modal */}
      <DeactivateAccountModal
        isOpen={isDeactivateModalOpen}
        onClose={closeDeactivateModal}
        onConfirm={confirmDeactivation}
      />
    </div>
  );
};

SecurityForm.propTypes = {
  passwordData: PropTypes.shape({
    currentPassword: PropTypes.string,
    newPassword: PropTypes.string,
    confirmPassword: PropTypes.string
  }).isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleDeactivateAccount: PropTypes.func.isRequired
};

export default SecurityForm;