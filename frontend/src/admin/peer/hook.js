import { useState, useCallback, useEffect, useMemo } from 'react';
import { railwayApi } from '@modules/api';

export const usePeerToPeer = () => {
  // State for data from MongoDB
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'asc' });
  
  // Fetch data from MongoDB via Railway API
  const fetchData = useCallback(async (retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data from Railway API');
      
      const response = await railwayApi.get('/peertopeer/records');
      console.log('MongoDB data response:', response.data);
      
      if (response.data.status === 'success') {
        const records = response.data.records || [];
        console.log(`Received ${records.length} records from MongoDB`);
        
        if (records.length > 0) {
          // Process the MongoDB data for table display
          const processedData = processMongoDataForTable(records);
          console.log('Processed data:', processedData);
          setTableData(processedData);
        } else {
          setError('No data available in the database');
        }
      } else {
        setError(`Error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error fetching peer-to-peer data:', err);
      
      // Retry logic - only retry for network/timeout errors up to 2 times
      if ((err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') && retryCount < 2) {
        console.log(`Retrying fetch attempt ${retryCount + 1}...`);
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, 2000); // Wait 2 seconds before retry
        return;
      }
      
      // Show user-friendly error message based on error type
      if (err.code === 'ECONNABORTED') {
        setError(`Request timed out. The server is taking too long to respond. Please try again later.`);
      } else if (err.code === 'ERR_NETWORK') {
        setError(`Network error. Unable to connect to the server. Please check your internet connection.`);
      } else {
        setError(`Error fetching data: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Process MongoDB data for table display
  const processMongoDataForTable = (records) => {
    // Extract unique years from records
    const years = [...new Set(records.map(record => record.Year || record.year))].sort();
    
    // Create a consolidated record for each year
    return years.map(year => {
      // Get all records for this year
      const yearRecords = records.filter(r => (r.Year || r.year) === year);
      
      // Create base record object
      const consolidatedRecord = {
        _id: yearRecords[0]._id, // Use first record's ID for reference
        year: year,
        cebuTotal: 0,
        negrosTotal: 0,
        panayTotal: 0,
        leyteSamarTotal: 0,
        boholTotal: 0,
        visayasTotal: 0,
        visayasConsumption: 0,
        solarCost: 0,
        meralcoRate: 0,
        allRecords: yearRecords // Store all related records for this year
      };
      
      // Extract specific values from the records
      yearRecords.forEach(record => {
        // Helper function to safely get numeric values
        const getNumericValue = (value) => {
          if (value === null || value === undefined) return 0;
          if (typeof value === 'number') return value;
          if (typeof value === 'string') {
            const parsed = parseFloat(value.replace(/,/g, ''));
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };
        
        // Update consolidated record based on data in individual record
        Object.keys(record).forEach(key => {
          // Handle Cebu data
          if (key === 'Cebu Total Power Generation (GWh)') {
            consolidatedRecord.cebuTotal = getNumericValue(record[key]);
          }
          // Handle Negros data
          else if (key === 'Negros Total Power Generation (GWh)') {
            consolidatedRecord.negrosTotal = getNumericValue(record[key]);
          }
          // Handle Panay data
          else if (key === 'Panay Total Power Generation (GWh)') {
            consolidatedRecord.panayTotal = getNumericValue(record[key]);
          }
          // Handle Leyte-Samar data
          else if (key === 'Leyte-Samar Total Power Generation (GWh)') {
            consolidatedRecord.leyteSamarTotal = getNumericValue(record[key]);
          }
          // Handle Bohol data
          else if (key === 'Bohol Total Power Generation (GWh)') {
            consolidatedRecord.boholTotal = getNumericValue(record[key]);
          }
          // Handle Visayas data
          else if (key === 'Visayas Total Power Generation (GWh)') {
            consolidatedRecord.visayasTotal = getNumericValue(record[key]);
          }
          else if (key === 'Visayas Total Power Consumption (GWh)') {
            consolidatedRecord.visayasConsumption = getNumericValue(record[key]);
          }
          // Handle recommendation parameters
          else if (key === 'Solar Cost (PHP/W)') {
            consolidatedRecord.solarCost = getNumericValue(record[key]);
          }
          else if (key === 'MERALCO Rate (PHP/kWh)') {
            consolidatedRecord.meralcoRate = getNumericValue(record[key]);
          }
        });
      });
      
      return consolidatedRecord;
    });
  };
  
  // Handle delete record
  const handleDeleteRecord = useCallback(async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setIsLoading(true);
    try {
      const response = await railwayApi.delete(`/api/peertopeer/records/${recordId}`);
      
      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Record deleted successfully!',
          type: 'success'
        });
        fetchData();
      } else {
        setNotification({
          open: true,
          message: `Error: ${response.data.message}`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  // Handle save record
  const handleSaveRecord = useCallback(async (isEditing, selectedRecord, formValues, selectedYear) => {
    setIsLoading(true);
    
    try {
      // Build the payload with form values
      const payload = {
        Year: selectedYear,
        ...formValues
      };
      
      console.log('Saving record with payload:', payload);
      
      let response;
      if (isEditing && selectedRecord._id) {
        // Update existing record
        response = await railwayApi.put(`/peertopeer/records/${selectedRecord._id}`, payload);
      } else {
        // Create new record
        response = await railwayApi.post('/create/peertopeer/', payload);
      }
      
      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: isEditing ? 'Record updated successfully!' : 'Record created successfully!',
          type: 'success'
        });
        
        // Refresh data after successful save
        fetchData();
        return true;
      } else {
        setNotification({
          open: true,
          message: `Error: ${response.data.message || 'Unknown error'}`,
          type: 'error'
        });
        return false;
      }
    } catch (err) {
      console.error('Error in handleSaveRecord:', err);
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        type: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);
  
  // Filtering and sorting functions
  const getFilteredData = useCallback(() => {
    if (!searchQuery.trim()) {
      return tableData;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return tableData.filter(row => {
      return (
        String(row.year).toLowerCase().includes(query) ||
        String(row.cebuTotal).toLowerCase().includes(query) ||
        String(row.negrosTotal).toLowerCase().includes(query) ||
        String(row.panayTotal).toLowerCase().includes(query) ||
        String(row.leyteSamarTotal).toLowerCase().includes(query) ||
        String(row.boholTotal).toLowerCase().includes(query) ||
        String(row.visayasTotal).toLowerCase().includes(query) ||
        String(row.visayasConsumption).toLowerCase().includes(query)
      );
    });
  }, [tableData, searchQuery]);

  const getSortedData = useCallback((data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortConfig]);
  
  // Get filtered and sorted data
  const filteredData = useMemo(() => getFilteredData(), [getFilteredData]);
  const displayData = useMemo(() => getSortedData(filteredData), [getSortedData, filteredData]);
  
  // Reset notification
  const handleNotificationClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);
  
  // Request sort
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);
  
  // Set search query
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    tableData,
    isLoading,
    error,
    notification,
    searchQuery,
    sortConfig,
    filteredData,
    displayData,
    fetchData,
    handleDeleteRecord,
    handleSaveRecord,
    handleNotificationClose,
    requestSort,
    handleSearchChange,
    clearSearch
  };
};