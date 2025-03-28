import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { railwayApi } from '@modules/api';
import { exportRecommendationPDF } from './recommendationExport';
import { SingleYearPicker } from '@shared/index';

// Prototype Button component with enhanced styling
const Button = ({ children, className, variant, onClick, disabled, icon, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 
      ${variant === 'primary' 
        ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
        : variant === 'danger'
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {icon && icon}
    {children}
  </button>
);

// Enhanced Card component
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg ${className}`}>
    {children}
  </div>
);

// Enhanced NumberBox component with improved validation and feedback
const NumberBox = ({ label, value, placeholder, disabled, onChange, error, helperText }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="number"
      step="0.01"
      className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${disabled ? 'bg-gray-100' : ''}`}
      placeholder={placeholder}
      value={value || ''}
      disabled={disabled}
      readOnly={disabled}
      onChange={onChange}
    />
    {error && helperText && (
      <p className="mt-1 text-xs text-red-500">{helperText}</p>
    )}
  </div>
);

// Badge component for status indicators
const Badge = ({ children, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color] || colorClasses.gray}`}>
      {children}
    </span>
  );
};

// Empty state component
const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center p-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
      {icon}
    </div>
    <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {action && (
      <div className="mt-4">{action}</div>
    )}
  </div>
);

// Search highlight component
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.toString().split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? 
          <span key={i} className="bg-yellow-200 font-medium">{part}</span> : 
          <span key={i}>{part}</span>
      )}
    </span>
  );
};

// Main component
const RecommendationAdminPrototype = () => {
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  
  // State for years
  const [addModalYear, setAddModalYear] = useState(new Date().getFullYear());
  const [editModalYear, setEditModalYear] = useState(new Date().getFullYear());
  
  // Loading and notification states
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  
  // API data state
  const [apiData, setApiData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'year', direction: 'asc' });
  
  // Filter state
  const [filterYear, setFilterYear] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  
  // Function to fetch recommendation data from API using railwayApi
  const fetchRecommendationData = useCallback(async () => {
    setIsTableLoading(true);
    setTableError(null);
    
    try {
      const response = await railwayApi.get('/add/recommendations');
      
      if (response.data.status === 'success') {
        const records = response.data.records || [];
        console.log('Fetched recommendation records:', records);
        
        // Format the records for table display
        const formattedRecords = records.map(record => ({
          id: record._id,
          year: record.Year,
          solarCost: record["Solar Cost (PHP/W)"],
          meralcoRate: record["MERALCO Rate (PHP/kWh)"]
        }));
        
        setApiData(formattedRecords);
      } else {
        setTableError(`Error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error fetching recommendation data:', err);
      setTableError(`Failed to load data: ${err.message}`);
    } finally {
      setIsTableLoading(false);
    }
  }, []);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchRecommendationData();
  }, [fetchRecommendationData]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        e.preventDefault();
        clearSearch();
      }
      
      // Ctrl/Cmd + N for new record
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isAddModalOpen && !isEditModalOpen) {
        e.preventDefault();
        openAddModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery, isAddModalOpen, isEditModalOpen]);
  
  // Handler for year changes
  const handleAddYearChange = (year) => {
    setAddModalYear(year);
    setSelectedRecord({
      ...selectedRecord,
      Year: year
    });
  };
  
  const handleEditYearChange = (year) => {
    setEditModalYear(year);
    setSelectedRecord({
      ...selectedRecord,
      Year: year
    });
  };
  
  // Separate functions for opening add and edit modals
  const openAddModal = () => {
    // Initialize with empty record or defaults
    const defaultYear = new Date().getFullYear();
    setAddModalYear(defaultYear);
    setSelectedRecord({
      Year: defaultYear,
      "Solar Cost (PHP/W)": "",
      "MERALCO Rate (PHP/kWh)": ""
    });
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (record) => {
    setEditModalYear(record.Year);
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };
  
  // Close functions
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => setIsEditModalOpen(false);

  // Function to save recommendation data to database using railwayApi
  const handleSaveRecommendation = async () => {
    setIsLoading(true);
    
    try {
      // Prepare the data payload with just the required fields
      // Convert string values to numbers using parseFloat
      const payload = {
        Year: addModalYear,
        "Solar Cost (PHP/W)": parseFloat(selectedRecord["Solar Cost (PHP/W)"]) || 0,
        "MERALCO Rate (PHP/kWh)": parseFloat(selectedRecord["MERALCO Rate (PHP/kWh)"]) || 0
      };
      
      console.log('Saving recommendation with payload:', payload);
      
      // Make API request to backend using railwayApi
      const response = await railwayApi.post('/add/recommendations', payload);
      
      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Recommendation created successfully!',
          type: 'success'
        });
        closeAddModal();
        // Refresh data after successful save
        fetchRecommendationData();
      } else {
        setNotification({
          open: true,
          message: `Error: ${response.data.message || 'Unknown error'}`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error saving recommendation:', err);
      let errorMessage = 'Failed to save recommendation';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out - the server took too long to respond';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check if the backend server is running';
      } else if (err.response) {
        errorMessage = err.response.data.message || err.message;
      }
      
      setNotification({
        open: true,
        message: `Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add update function for editing records using railwayApi
  const handleUpdateRecommendation = async () => {
    setIsLoading(true);
    
    try {
      // Prepare the data payload with just the required fields
      // Convert string values to numbers using parseFloat
      const payload = {
        Year: editModalYear,
        "Solar Cost (PHP/W)": parseFloat(selectedRecord["Solar Cost (PHP/W)"]) || 0,
        "MERALCO Rate (PHP/kWh)": parseFloat(selectedRecord["MERALCO Rate (PHP/kWh)"]) || 0
      };
      
      console.log('Updating recommendation with payload:', payload);
      
      // Make API request to backend using railwayApi
      const response = await railwayApi.put(`/add/recommendations/${selectedRecord.id}`, payload);
      
      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Recommendation updated successfully!',
          type: 'success'
        });
        closeEditModal();
        // Refresh data after successful update
        fetchRecommendationData();
      } else {
        setNotification({
          open: true,
          message: `Error: ${response.data.message || 'Unknown error'}`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating recommendation:', err);
      let errorMessage = 'Failed to update recommendation';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out - the server took too long to respond';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check if the backend server is running';
      } else if (err.response) {
        errorMessage = err.response.data.message || err.message;
      }
      
      setNotification({
        open: true,
        message: `Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add functionality to delete a record using railwayApi
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setIsLoading(true);
    try {
      const response = await railwayApi.delete(`/add/recommendations/${recordId}`);
      
      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Recommendation deleted successfully!',
          type: 'success'
        });
        fetchRecommendationData();
      } else {
        setNotification({
          open: true,
          message: `Error: ${response.data.message || 'Unknown error'}`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting recommendation:', err);
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Add handleInputChange function
  const handleInputChange = (field, e) => {
    setSelectedRecord(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Export to PDF function
  const handleExportPDF = async () => {
    try {
      const success = await exportRecommendationPDF(filteredData);
      
      if (success) {
        setNotification({
          open: true,
          message: 'PDF exported successfully!',
          type: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: 'Failed to export PDF. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setNotification({
        open: true,
        message: 'Error exporting PDF: ' + error.message,
        type: 'error'
      });
    }
  };
  
  // Search functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Sort function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Filter functions
  const openFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const closeFilterMenu = () => {
    setFilterMenuAnchor(null);
  };
  
  const handleFilterYear = (year) => {
    setFilterYear(year === filterYear ? null : year);
    closeFilterMenu();
  };
  
  const clearFilters = () => {
    setFilterYear(null);
    closeFilterMenu();
  };
  
  // Computed properties for the table data
  
  // Step 1: Filter the data
  const getFilteredData = () => {
    let result = [...apiData];
    
    // Apply year filter if set
    if (filterYear !== null) {
      result = result.filter(item => item.year === filterYear);
    }
    
    // Apply search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(row => (
        String(row.year).toLowerCase().includes(query) ||
        String(row.solarCost).toLowerCase().includes(query) ||
        String(row.meralcoRate).toLowerCase().includes(query)
      ));
    }
    
    return result;
  };
  
  // Step 2: Sort the filtered data
  const getSortedData = (data) => {
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
  };
  
  // Get available years for filtering
  const availableYears = [...new Set(apiData.map(row => row.year))].sort();
  
  // Get the final data to display
  const filteredData = getFilteredData();
  const displayData = getSortedData(filteredData);
  
  // Get sort icon for column headers
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Energy Recommendations</h1>
            <p className="text-gray-500">Generate and manage energy recommendations based on regional data</p>
          </div>
        </div>
        <Tooltip title="Add New Recommendation (Ctrl+N)" arrow>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={openAddModal}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            }
          >
            Add New Recommendation
          </Button>
        </Tooltip>
      </div>

      {/* Data Table with active filters */}
      <Card className="mb-6 overflow-visible">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-medium">Recommendation History</h2>
            
            {/* Filter chips */}
            {filterYear !== null && (
              <div className="flex flex-wrap gap-2">
                <Chip 
                  label={`Year: ${filterYear}`} 
                  color="primary"
                  variant="outlined" 
                  onDelete={() => setFilterYear(null)}
                  size="small"
                  className="bg-green-50 text-green-700 border-green-300"
                />
                
                {(filterYear !== null) && (
                  <Button 
                    variant="secondary" 
                    className="text-xs py-1 px-2 h-8"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
            {/* Search box with keyboard shortcut hint */}
            <div className="flex items-center relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search records... (Ctrl+F)" 
                className="border border-gray-300 rounded-md py-2 pl-10 pr-12 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                value={searchQuery}
                onChange={handleSearchChange}
                ref={searchInputRef}
              />
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="rounded-full p-1 hover:bg-gray-200 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Filter button */}
              <Button 
                variant="secondary" 
                className="flex items-center gap-1"
                onClick={openFilterMenu}
                disabled={apiData.length === 0}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                }
              >
                Filter
              </Button>
              
              {/* Filter menu */}
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={closeFilterMenu}
                PaperProps={{
                  style: {
                    maxHeight: 300,
                    minWidth: 150,
                  },
                }}
              >
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Filter by Year</h3>
                </div>
                {availableYears.map((year) => (
                  <MenuItem 
                    key={year} 
                    onClick={() => handleFilterYear(year)}
                    style={{
                      backgroundColor: filterYear === year ? 'rgba(22, 163, 74, 0.1)' : undefined
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">
                        {filterYear === year && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      {year}
                    </div>
                  </MenuItem>
                ))}
              </Menu>
              
              {/* Refresh button */}
              <Tooltip title="Refresh data" arrow>
                <Button 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  onClick={fetchRecommendationData}
                  disabled={isTableLoading}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  {isTableLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </Tooltip>
              
              {/* Export button */}
              <Tooltip title="Export to PDF" arrow>
                <Button 
                  variant="primary"
                  onClick={handleExportPDF}
                  disabled={displayData.length === 0 || isTableLoading}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Export
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Table content */}
        <div className="overflow-x-auto">
          {isTableLoading ? (
            <div className="flex justify-center items-center p-12">
              <CircularProgress size={40} />
              <span className="ml-3 text-gray-500">Loading recommendation data...</span>
            </div>
          ) : tableError ? (
            <div className="text-center p-12 bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600">{tableError}</p>
              <Button 
                variant="primary"
                className="mt-4"
                onClick={fetchRecommendationData}
              >
                Try Again
              </Button>
            </div>
          ) : apiData.length === 0 ? (
            <EmptyState 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="No recommendation records found"
              description="Add your first recommendation to get started"
              action={
                <Button
                  variant="primary"
                  onClick={openAddModal}
                  className="mt-2"
                >
                  Add New Recommendation
                </Button>
              }
            />
          ) : displayData.length === 0 ? (
            <EmptyState 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No matching records found"
              description="Try adjusting your search or filters"
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterYear(null);
                  }}
                  className="mt-2"
                >
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('year')}
                  >
                    <div className="flex items-center">
                      Year
                      {getSortIcon('year')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('solarCost')}
                  >
                    <div className="flex items-center">
                      Solar Cost (PHP/W)
                      {getSortIcon('solarCost')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('meralcoRate')}
                  >
                    <div className="flex items-center">
                      MERALCO Rate (PHP/kWh)
                      {getSortIcon('meralcoRate')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((row) => (
                  <tr key={row.id} className="hover:bg-green-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <HighlightText text={row.year} highlight={searchQuery} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HighlightText text={row.solarCost} highlight={searchQuery} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <HighlightText text={row.meralcoRate} highlight={searchQuery} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Tooltip title="Edit record" arrow>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded"
                          onClick={() => {
                            const record = {
                              ...row,
                              Year: row.year,
                              "Solar Cost (PHP/W)": row.solarCost,
                              "MERALCO Rate (PHP/kWh)": row.meralcoRate
                            };
                            openEditModal(record);
                          }}
                        >
                          Edit
                        </button>
                      </Tooltip>
                      <Tooltip title="Delete record" arrow>
                        <button 
                          className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                          onClick={() => handleDeleteRecord(row.id)}
                        >
                          Delete
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination footer */}
        {!isTableLoading && !tableError && displayData.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{displayData.length}</span> of <span className="font-medium">{apiData.length}</span> records
              {(searchQuery.trim() || filterYear !== null) && displayData.length !== apiData.length && (
                <span className="ml-1 italic text-gray-400">(filtered from {apiData.length} total)</span>
              )}
            </div>
            <div className="flex items-center">
              <Button variant="secondary" className="mr-2" disabled>
                Previous
              </Button>
              <Button variant="secondary" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal - Simplified with just Year and Input Parameters */}
      <Dialog open={isAddModalOpen} onClose={closeAddModal} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">Add New Recommendation</span>
          <IconButton onClick={closeAddModal} size="small">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="p-4 space-y-6">
            {/* Year picker with SingleYearPicker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <SingleYearPicker
                initialYear={addModalYear}
                onYearChange={handleAddYearChange}
              />
            </div>
            
            {/* Input Parameters */}
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Input Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberBox
                  label="Solar Cost (PHP/W)"
                  value={selectedRecord["Solar Cost (PHP/W)"]}
                  placeholder="Enter value"
                  onChange={(e) => handleInputChange("Solar Cost (PHP/W)", e)}
                  error={!selectedRecord["Solar Cost (PHP/W)"]}
                  helperText={!selectedRecord["Solar Cost (PHP/W)"] ? "This field is required" : ""}
                />
                <NumberBox
                  label="MERALCO Rate (PHP/kWh)"
                  value={selectedRecord["MERALCO Rate (PHP/kWh)"]}
                  placeholder="Enter value"
                  onChange={(e) => handleInputChange("MERALCO Rate (PHP/kWh)", e)}
                  error={!selectedRecord["MERALCO Rate (PHP/kWh)"]}
                  helperText={!selectedRecord["MERALCO Rate (PHP/kWh)"] ? "This field is required" : ""}
                />
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            variant="secondary"
            onClick={closeAddModal}
            className="mr-2"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveRecommendation}
            disabled={isLoading || !selectedRecord["Solar Cost (PHP/W)"] || !selectedRecord["MERALCO Rate (PHP/kWh)"]}
          >
            {isLoading ? (
              <div className="flex items-center">
                <CircularProgress size={16} color="inherit" className="mr-2" />
                Saving...
              </div>
            ) : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal - Similar to Add Modal */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">Edit Recommendation</span>
          <IconButton onClick={closeEditModal} size="small">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="p-4 space-y-6">
            {/* Year picker (disabled for edit mode) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <SingleYearPicker
                initialYear={editModalYear}
                onYearChange={handleEditYearChange}
                disabled={true}
              />
            </div>
            
            {/* Input Parameters */}
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Input Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberBox
                  label="Solar Cost (PHP/W)"
                  value={selectedRecord["Solar Cost (PHP/W)"]}
                  placeholder="Enter value"
                  onChange={(e) => handleInputChange("Solar Cost (PHP/W)", e)}
                  error={!selectedRecord["Solar Cost (PHP/W)"]}
                  helperText={!selectedRecord["Solar Cost (PHP/W)"] ? "This field is required" : ""}
                />
                <NumberBox
                  label="MERALCO Rate (PHP/kWh)"
                  value={selectedRecord["MERALCO Rate (PHP/kWh)"]}
                  placeholder="Enter value"
                  onChange={(e) => handleInputChange("MERALCO Rate (PHP/kWh)", e)}
                  error={!selectedRecord["MERALCO Rate (PHP/kWh)"]}
                  helperText={!selectedRecord["MERALCO Rate (PHP/kWh)"] ? "This field is required" : ""}
                />
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            variant="secondary"
            onClick={closeEditModal}
            className="mr-2"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateRecommendation}
            disabled={isLoading || !selectedRecord["Solar Cost (PHP/W)"] || !selectedRecord["MERALCO Rate (PHP/kWh)"]}
          >
            {isLoading ? (
              <div className="flex items-center">
                <CircularProgress size={16} color="inherit" className="mr-2" />
                Updating...
              </div>
            ) : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.type} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Keyboard shortcuts helper */}
      <div className="fixed bottom-4 right-4">
        <Tooltip
          title={
            <div className="p-1">
              <p className="font-medium mb-1">Keyboard Shortcuts:</p>
              <ul className="text-xs">
                <li className="mb-1">
                  <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded mr-1">Ctrl+F</span>
                  <span>Search</span>
                </li>
                <li className="mb-1">
                  <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded mr-1">Esc</span>
                  <span>Clear search</span>
                </li>
                <li>
                  <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded mr-1">Ctrl+N</span>
                  <span>New recommendation</span>
                </li>
              </ul>
            </div>
          }
          arrow
          placement="left"
        >
          <div className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 transition-colors text-white rounded-full p-2 cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default RecommendationAdminPrototype;