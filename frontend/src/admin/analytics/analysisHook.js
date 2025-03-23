import { useState } from 'react';
import { analyticsData } from './data';

export const useAnalytics = () => {
  const [data, setData] = useState(analyticsData);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'monthly',
    energyType: 'all'
  });

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
    // Add date filtering logic here
  };

  const handleEnergyTypeFilter = (type) => {
    setFilters(prev => ({ ...prev, energyType: type }));
    // Add type filtering logic here
  };

  const handleDataUpload = async (file) => {
    setLoading(true);
    try {
      // Upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update data after successful upload
      setData(prevData => ({ ...prevData }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return {
    data,
    loading,
    filters,
    handleDateRangeChange,
    handleEnergyTypeFilter,
    handleDataUpload,
    getStatusColor
  };
};