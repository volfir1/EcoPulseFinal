// src/components/tickets/userTicketUtils.js

import { format, parseISO, formatDistanceToNow } from 'date-fns';

// Format dates in a readable way
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy • h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

// Map status to color variant for UI elements
export const getStatusColor = (status) => {
  const statusMap = {
    'open': 'warning',
    'in-progress': 'secondary',
    'resolved': 'success',
    'closed': 'primary'
  };
  return statusMap[status] || 'default';
};

// Get appropriate icon for different ticket status
export const getStatusIcon = (status) => {
  const iconMap = {
    'open': 'alert-circle',
    'in-progress': 'loader',
    'resolved': 'check-circle',
    'closed': 'lock'
  };
  return iconMap[status] || 'help-circle';
};

// Get priority level label and color
export const getPriorityInfo = (priority) => {
  const priorityMap = {
    'low': { label: 'Low', color: 'success' },
    'medium': { label: 'Medium', color: 'warning' },
    'high': { label: 'High', color: 'error' },
    'urgent': { label: 'Urgent', color: 'error' }
  };
  return priorityMap[priority] || { label: 'Normal', color: 'primary' };
};

// Format ticket number with leading zeros
export const formatTicketNumber = (num) => {
  if (!num) return '#000000';
  return `#${String(num).padStart(6, '0')}`;
};

// Helper to determine if the current user is the sender of a message
export const isCurrentUserSender = (message, currentUserId) => {
  if (!message || !currentUserId) return false;
  return message.sender === currentUserId;
};

// Generate avatar initials from a name
export const getInitials = (name) => {
  if (!name) return '?';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (
    names[0].charAt(0).toUpperCase() + 
    names[names.length - 1].charAt(0).toUpperCase()
  );
};

// Parse and format message content with support for line breaks
export const formatMessageContent = (content) => {
  if (!content) return '';
  return content.replace(/\n/g, '<br />');
};    