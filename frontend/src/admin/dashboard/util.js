import React from 'react';

// Format numbers with appropriate units (K for thousands, M for millions)
export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(1);
};

// Format percentage with sign and 1 decimal place
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '-';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Get color based on percentage change (green for positive, red for negative)
export const getChangeColor = (percentage) => {
  if (percentage > 0) return 'text-green-500';
  if (percentage < 0) return 'text-red-500';
  return 'text-gray-500';
};

// Get color for each energy source
export const getSourceColor = (source) => {
  if (!source) return '#9333EA'; // Default purple
  
  const sourceLower = source.toLowerCase();
  
  switch (sourceLower) {
    case 'wind':
      return '#64748B'; // Slate
    case 'solar':
      return '#FFB800'; // Gold/Yellow
    case 'hydro':
    case 'hydropower':
      return '#2E90E5'; // Blue
    case 'geothermal':
      return '#FF6B6B'; // Red
    case 'biomass':
      return '#16A34A'; // Green
    default:
      return '#9333EA'; // Purple (default)
  }
};

// Format date as relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

// Calculate the growth rate between two values
export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Format number as currency
export const formatCurrency = (value, currencySymbol = '₱') => {
  if (!value && value !== 0) return '-';
  
  return `${currencySymbol}${formatNumber(value)}`;
};

// Convert data array to CSV format for export
export const convertToCSV = (data, fields) => {
  if (!data || !data.length) return '';
  
  // Header row
  const header = fields.map(field => field.label || field.key).join(',');
  
  // Data rows
  const rows = data.map(item => {
    return fields.map(field => {
      const value = field.format ? field.format(item[field.key]) : item[field.key];
      // Wrap strings with commas in quotes
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

// Download content as a file
export const downloadFile = (content, filename, mimeType = 'text/csv') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export data as CSV file
export const exportToCSV = (data, fields, filename) => {
  const csvContent = convertToCSV(data, fields);
  downloadFile(csvContent, filename);
};

// Get chart configuration for different chart types
export const getChartConfig = (chartType) => {
  const baseConfig = {
    tooltip: {
      formatter: (value) => [`${value.toFixed(2)} GWh`, 'Generation'],
      labelFormatter: (label) => `${label}`
    },
    xAxis: {
      axisLine: { stroke: '#E0E0E0' },
      tickLine: false
    },
    yAxis: {
      axisLine: { stroke: '#E0E0E0' },
      tickLine: false
    }
  };
  
  switch (chartType) {
    case 'bar':
      return {
        ...baseConfig,
        bar: {
          radius: [4, 4, 0, 0],
          barSize: 20
        }
      };
    case 'pie':
      return {
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
        },
        tooltip: {
          formatter: (value) => [`${value.toFixed(2)} GWh`, 'Generation'],
          labelFormatter: (name) => `Source: ${name}`
        }
      };
    case 'line':
      return {
        ...baseConfig,
        line: {
          strokeWidth: 2,
          dot: {
            r: 4,
            strokeWidth: 2
          },
          activeDot: {
            r: 6,
            strokeWidth: 2
          }
        }
      };
    default:
      return baseConfig;
  }
};

// Calculate summary statistics from data
export const calculateSummaryStats = (data) => {
  if (!data || !data.length) return {};
  
  // Calculate total values
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  // Find highest value
  const highest = data.reduce((max, item) => {
    return (item.value || 0) > max.value ? { name: item.name, value: item.value } : max;
  }, { name: '', value: 0 });
  
  // Find lowest value
  const lowest = data.reduce((min, item) => {
    return (item.value || 0) < min.value || min.value === 0 ? { name: item.name, value: item.value } : min;
  }, { name: '', value: data[0]?.value || 0 });
  
  // Calculate average
  const average = total / data.length;
  
  return {
    total,
    highest,
    lowest,
    average
  };
};

// Generate random ID for keys
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Format ISO date string to local format
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Truncate long text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Map status to appropriate color
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return 'text-green-500';
    case 'warning':
    case 'pending':
    case 'in-progress':
      return 'text-amber-500';
    case 'error':
    case 'failed':
    case 'inactive':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

// Parse number from string with safety
export const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export default {
  formatNumber,
  formatPercentage,
  getChangeColor,
  getSourceColor,
  formatRelativeTime,
  calculateGrowthRate,
  formatCurrency,
  convertToCSV,
  downloadFile,
  exportToCSV,
  getChartConfig,
  calculateSummaryStats,
  generateId,
  formatDate,
  truncateText,
  getStatusColor,
  parseNumber
};