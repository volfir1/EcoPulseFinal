import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Container,
  Grid,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  Wind,
  Sun,
  Waves,
  Flame,
  Leaf,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '@features/modules/api';

// Energy types configuration
const energyTypes = [
  { id: 'all', label: 'All Energy', icon: <BarChart3 size={20} /> },
  { id: 'solar', label: 'Solar', icon: <Sun size={20} /> },
  { id: 'wind', label: 'Wind', icon: <Wind size={20} /> },
  { id: 'hydro', label: 'Hydro', icon: <Waves size={20} /> },
  { id: 'geothermal', label: 'Geothermal', icon: <Flame size={20} /> },
  { id: 'biomass', label: 'Biomass', icon: <Leaf size={20} /> }
];

// Clean the response by replacing "NaN" with "null"
const cleanResponse = (response) => {
  if (typeof response === 'string') {
    return response.replace(/NaN/g, 'null');
  }
  return JSON.stringify(response).replace(/NaN/g, 'null');
};

const RenewableEnergyPage = () => {
  // Navigation hook for routing
  const navigate = useNavigate();
  
  // State for the records
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnergyType, setSelectedEnergyType] = useState('all');
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 10);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  
  // Fetch data from API for the selected energy type
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get data for the selected energy type
      const endpoint = selectedEnergyType === 'all' ? 'solar' : selectedEnergyType;
      
      const response = await api.get(`/api/predictions/${endpoint}/?start_year=${startYear}&end_year=${endYear}`);
      
      // Clean and parse the response
      const dataString = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      const cleanedResponse = cleanResponse(dataString);
      const responseData = JSON.parse(cleanedResponse);
      
      if (responseData.status === "success" && Array.isArray(responseData.predictions)) {
        // Filter to show only non-predicted data (actual data from the database)
        const actualData = responseData.predictions
          .filter(item => !item.isPredicted) // Only include non-predicted data
          .map(item => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            type: selectedEnergyType === 'all' ? endpoint : selectedEnergyType,
            year: item.Year,
            generation: parseFloat(item['Predicted Production']),
            nonRenewableEnergy: item['Non-Renewable Energy (GWh)'] 
              ? parseFloat(item['Non-Renewable Energy (GWh)']) 
              : null,
            population: item['Population (in millions)'] 
              ? parseFloat(item['Population (in millions)']) 
              : null,
            gdp: item['Gross Domestic Product'] === null 
              ? null 
              : parseFloat(item['Gross Domestic Product']),
            isPredicted: false, // These are actual records
            dateAdded: item.createdAt || new Date().toISOString(),
            isDeleted: item.isDeleted || false
          }))
          // Don't show deleted records
          .filter(item => !item.isDeleted);
        
        setRecords(prevRecords => {
          // If we're viewing all energy types, we need to fetch each type individually
          if (selectedEnergyType === 'all') {
            // Keep records of other types that were already loaded
            return [...prevRecords.filter(record => record.type !== endpoint), ...actualData];
          }
          return actualData;
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // You would add proper error handling here
    } finally {
      setLoading(false);
    }
  }, [selectedEnergyType, startYear, endYear]);
  
  // If "all" is selected, fetch data for each energy type
  const fetchAllEnergyTypes = useCallback(async () => {
    setLoading(true);
    try {
      // Clear previous records when selecting "all"
      setRecords([]);
      
      // Define energy type endpoint names
      const endpoints = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
      
      // Fetch each energy type in parallel
      const promises = endpoints.map(async (endpoint) => {
        try {
          const response = await api.get(`/api/predictions/${endpoint}/?start_year=${startYear}&end_year=${endYear}`);
          
          const dataString = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);
          
          const cleanedResponse = cleanResponse(dataString);
          const responseData = JSON.parse(cleanedResponse);
          
          if (responseData.status === "success" && Array.isArray(responseData.predictions)) {
            return responseData.predictions
              .filter(item => !item.isPredicted) // Only include non-predicted data
              .map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                type: endpoint,
                year: item.Year,
                generation: parseFloat(item['Predicted Production']),
                nonRenewableEnergy: item['Non-Renewable Energy (GWh)'] 
                  ? parseFloat(item['Non-Renewable Energy (GWh)']) 
                  : null,
                population: item['Population (in millions)'] 
                  ? parseFloat(item['Population (in millions)']) 
                  : null,
                gdp: item['Gross Domestic Product'] === null 
                  ? null 
                  : parseFloat(item['Gross Domestic Product']),
                isPredicted: false,
                dateAdded: item.createdAt || new Date().toISOString(),
                isDeleted: item.isDeleted || false
              }))
              .filter(item => !item.isDeleted);
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${endpoint} data:`, error);
          return [];
        }
      });
      
      // Wait for all requests to complete
      const results = await Promise.all(promises);
      
      // Combine all results
      const combinedData = results.flat();
      setRecords(combinedData);
    } catch (error) {
      console.error("Error fetching all energy types:", error);
    } finally {
      setLoading(false);
    }
  }, [startYear, endYear]);
  
  // Load data on mount and when energy type changes
  useEffect(() => {
    if (selectedEnergyType === 'all') {
      fetchAllEnergyTypes();
    } else {
      fetchData();
    }
  }, [selectedEnergyType, fetchData, fetchAllEnergyTypes]);
  
  // Handle energy type tab change
  const handleEnergyTypeChange = (_, newValue) => {
    setSelectedEnergyType(newValue);
  };
  
  // Navigate to add record page
  const handleNavigateToAddRecord = () => {
    navigate('/admin/modules/add', { 
      state: { 
        energyType: selectedEnergyType === 'all' ? 'solar' : selectedEnergyType 
      } 
    });
  };
  
  // Handle export
  const handleExport = () => {
    // Implement export functionality here
    console.log("Exporting data...");
  };
  
  // Filter data by energy type
  const filteredRecords = selectedEnergyType === 'all' 
    ? records 
    : records.filter(record => record.type === selectedEnergyType);
  
  // Color utility function for energy types
  const getEnergyTypeColor = (type) => {
    switch(type) {
      case 'solar': return 'warning';
      case 'wind': return 'primary';
      case 'hydro': return 'info';
      case 'geothermal': return 'error';
      case 'biomass': return 'success';
      default: return 'default';
    }
  };
  
  // Icon utility function for energy types
  const getEnergyTypeIcon = (type) => {
    switch(type) {
      case 'solar': return <Sun size={16} />;
      case 'wind': return <Wind size={16} />;
      case 'hydro': return <Waves size={16} />;
      case 'geothermal': return <Flame size={16} />;
      case 'biomass': return <Leaf size={16} />;
      default: return <BarChart3 size={16} />;
    }
  };
  
  return (
    <Container maxWidth="xl" className="py-6">
      {/* Page Header */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-bold">
          Renewable Energy Data
        </Typography>
        
        <Box className="flex gap-2">
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw size={18} />}
            onClick={selectedEnergyType === 'all' ? fetchAllEnergyTypes : fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          
        
          
          <Button 
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleNavigateToAddRecord}
          >
            Add Record
          </Button>
        </Box>
      </Box>
      
      {/* Energy Type Tabs */}
      <Paper sx={{ marginBottom: 3 }} elevation={0} className="border">
        <Tabs
          value={selectedEnergyType}
          onChange={handleEnergyTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="energy type tabs"
        >
          {energyTypes.map((type) => (
            <Tab
              key={type.id}
              value={type.id}
              icon={type.icon}
              label={type.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>
      
      {/* Records Grid */}
      <Box className="mb-6">
        {loading ? (
          // Loading state
          <Box className="py-12 flex justify-center items-center">
            <CircularProgress />
          </Box>
        ) : filteredRecords.length === 0 ? (
          // Empty state
          <Box className="py-12 flex flex-col justify-center items-center border border-dashed rounded-lg bg-gray-50">
            <BarChart3 size={40} className="text-gray-400 mb-2" />
            <Typography variant="h6" className="text-gray-600 mb-1">No Records Found</Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {selectedEnergyType === 'all' 
                ? 'There are no energy records available.' 
                : `There are no ${selectedEnergyType} energy records available.`}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Plus size={18} />}
              onClick={handleNavigateToAddRecord}
            >
              Add New Record
            </Button>
          </Box>
        ) : (
          // Data grid
          <Grid container spacing={3}>
            {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <Card className="h-full">
                  <Box className="p-4">
                    {/* Card Header - Simplified without actions menu */}
                    <Box className="flex items-center gap-2 mb-4">
                      <div className={`p-2 rounded-full bg-${getEnergyTypeColor(record.type)}-50`}>
                        {getEnergyTypeIcon(record.type)}
                      </div>
                      <Typography variant="h6" className="font-medium">
                        Year {record.year}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500 capitalize ml-auto">
                        {record.type}
                      </Typography>
                    </Box>
                    
                    {/* Card Content */}
                    <Box className="mb-3">
                      <Typography variant="body2" color="text.secondary" className="mb-1">
                        Energy Generation
                      </Typography>
                      <Typography variant="h5" color={getEnergyTypeColor(record.type)} className="font-bold">
                        {record.generation.toLocaleString()} GWh
                      </Typography>
                    </Box>
                    
                    {/* Supplementary Data */}
                    <Box className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Non-Renewable
                        </Typography>
                        <Typography variant="body2">
                          {record.nonRenewableEnergy ? record.nonRenewableEnergy.toLocaleString() + ' GWh' : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Population
                        </Typography>
                        <Typography variant="body2">
                          {record.population ? record.population + 'M' : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          GDP
                        </Typography>
                        <Typography variant="body2">
                          {record.gdp ? '$' + record.gdp.toLocaleString() + 'B' : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date Added
                        </Typography>
                        <Typography variant="body2">
                          {new Date(record.dateAdded).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default RenewableEnergyPage;