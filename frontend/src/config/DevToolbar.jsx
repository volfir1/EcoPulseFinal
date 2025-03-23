// src/components/DevToolbar.jsx
import React from 'react';
import { useAuth } from '@context/AuthContext';
import { CONFIG } from '@config/configIndex';

const DevToolbar = () => {
  const { user, setUser, isAuthenticated } = useAuth();
  
  // Only show in development mode with SKIP_AUTH enabled
  if (!(CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development')) {
    return null;
  }
  
  const switchToRole = (role) => {
    if (!user) {
      console.error('No user found to switch roles');
      return;
    }
    
    console.log(`Switching role from ${user.role} to ${role}`);
    
    const updatedUser = {
      ...user,
      role: role
    };
    
    // Update both context and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // In some cases, you might also need to update CONFIG
    if (window.DEV_CONFIG) {
      window.DEV_CONFIG.DEFAULT_ROLE = role;
    }
    
    // Force a page reload to ensure all components update
    window.location.reload();
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f44336',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 9999,
        borderTop: '2px solid #b71c1c',
        fontSize: '14px'
      }}
    >
      <div>
        <strong>DEV MODE: AUTH BYPASSED</strong> | 
        Authenticated: <strong>{isAuthenticated ? 'YES' : 'NO'}</strong> | 
        Role: <strong>{user?.role || 'none'}</strong>
      </div>
      <div>
        <button 
          onClick={() => switchToRole('user')}
          style={{
            marginRight: '8px',
            padding: '4px 8px',
            backgroundColor: user?.role === 'user' ? '#4caf50' : '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: user?.role === 'user' ? 'white' : 'black',
            fontWeight: 'bold'
          }}
        >
          Switch to User
        </button>
        <button 
          onClick={() => switchToRole('admin')}
          style={{
            padding: '4px 8px',
            backgroundColor: user?.role === 'admin' ? '#2196f3' : '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: user?.role === 'admin' ? 'white' : 'black',
            fontWeight: 'bold'
          }}
        >
          Switch to Admin
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            backgroundColor: '#ff9800',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          Test Login Flow
        </button>
        <button 
  onClick={() => {
    console.log('Current user:', user);
    console.log('LocalStorage user:', JSON.parse(localStorage.getItem('user') || '{}'));
    console.log('Config:', CONFIG);
  }}
  style={{
    marginLeft: '8px',
    padding: '4px 8px',
    backgroundColor: '#673ab7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'white',
    fontWeight: 'bold'
  }}
>
  Debug
</button>
      </div>
    </div>
  );
};

export default DevToolbar;