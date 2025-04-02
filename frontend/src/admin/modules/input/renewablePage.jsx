import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Container, // Using Container for max-width control
  Grid,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  useTheme, // Import useTheme to access theme values like spacing and colors
  Chip
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
  Download, // Download icon imported but handleExport function is placeholder
  RefreshCw
} from 'lucide-react'; // Assuming lucide-react icons are properly installed and work

// Make sure API import path is correct
import { railwayApi } from '@features/modules/api'; 

// --- Energy types configuration (Unchanged) ---
const energyTypes = [
  { id: 'all', label: 'All Energy', icon: <BarChart3 size={20} /> },
  { id: 'solar', label: 'Solar', icon: <Sun size={20} /> },
  { id: 'wind', label: 'Wind', icon: <Wind size={20} /> },
  { id: 'hydro', label: 'Hydro', icon: <Waves size={20} /> },
  { id: 'geothermal', label: 'Geothermal', icon: <Flame size={20} /> },
  { id: 'biomass', label: 'Biomass', icon: <Leaf size={20} /> }
];

// --- Helper function to clean NaN (Unchanged) ---
const cleanResponse = (response) => {
  const stringified = typeof response === 'string' ? response : JSON.stringify(response);
  // Be careful with replacing NaN globally; ensure it doesn't break valid parts of the data.
  // Replacing with null is usually safe for JSON parsing.
  return stringified.replace(/NaN/g, 'null'); 
};

const RenewableEnergyPage = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Access MUI theme

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnergyType, setSelectedEnergyType] = useState('all');
  // Consider making years configurable or derived
  const [startYear] = useState(new Date().getFullYear() - 10); 
  const [endYear] = useState(new Date().getFullYear());

  // --- Data Fetching Logic (using useCallback, minimal changes needed for responsiveness) ---
  const fetchData = useCallback(async (endpoint) => {
     setLoading(true);
     try {
         const response = await railwayApi.get(`/predictions/${endpoint}/?start_year=${startYear}&end_year=${endYear}`);
         const cleanedResponse = cleanResponse(response.data);
         const responseData = JSON.parse(cleanedResponse);

         if (responseData.status === "success" && Array.isArray(responseData.predictions)) {
             return responseData.predictions
                 .filter(item => !item.isPredicted && !item.isDeleted) // Filter actual, non-deleted records
                 .map(item => ({
                     id: item.id || Math.random().toString(36).substr(2, 9), // Fallback ID
                     type: endpoint,
                     year: item.Year,
                     // Safely parse numbers, default to 0 or null if invalid
                     generation: parseFloat(item['Predicted Production']) || 0, 
                     nonRenewableEnergy: parseFloat(item['Non-Renewable Energy (GWh)']) || null,
                     population: parseFloat(item['Population (in millions)']) || null,
                     gdp: item['Gross Domestic Product'] !== undefined && item['Gross Domestic Product'] !== null
                     ? parseFloat(item['Gross Domestic Product'])
                     : null,
                     isPredicted: false,
                     dateAdded: item.createdAt || new Date().toISOString(),
                     isDeleted: false // Already filtered
                 }));
         }
         return []; // Return empty array on failure
     } catch (error) {
         console.error(`Error fetching ${endpoint} data:`, error);
         // TODO: Add user-facing error feedback (e.g., Snackbar)
         return []; // Return empty array on error
     } finally {
          // We manage loading state outside if multiple fetches happen
          // setLoading(false); 
     }
  }, [startYear, endYear]); // Dependencies for fetching single type

  const fetchAllEnergyTypes = useCallback(async () => {
    setLoading(true);
    setRecords([]); // Clear previous records
    const endpoints = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
    try {
      // Fetch all types in parallel
      const promises = endpoints.map(endpoint => fetchData(endpoint));
      const results = await Promise.all(promises);
      const combinedData = results.flat(); // Combine results from all fetches
      setRecords(combinedData);
    } catch (error) {
      console.error("Error fetching all energy types:", error);
      // TODO: Add user-facing error feedback
    } finally {
      setLoading(false); // Set loading false after all fetches complete
    }
  }, [startYear, endYear, fetchData]); // Dependencies for fetching all types

  // Load data effect
  useEffect(() => {
    if (selectedEnergyType === 'all') {
      fetchAllEnergyTypes();
    } else {
      // Fetch single type and handle loading state
      const loadSingle = async () => {
          setLoading(true);
          const data = await fetchData(selectedEnergyType);
          setRecords(data);
          setLoading(false);
      }
      loadSingle();
    }
  }, [selectedEnergyType, fetchData, fetchAllEnergyTypes]); // Re-run if type or fetch functions change

  const handleEnergyTypeChange = (_, newValue) => {
    setSelectedEnergyType(newValue);
  };

  const handleNavigateToAddRecord = () => {
    navigate('/admin/modules/add', { 
      state: { energyType: selectedEnergyType === 'all' ? 'solar' : selectedEnergyType } 
    });
  };

  const handleRefresh = () => {
      if (selectedEnergyType === 'all') {
          fetchAllEnergyTypes();
      } else {
         const loadSingle = async () => {
              setLoading(true);
              const data = await fetchData(selectedEnergyType);
              setRecords(data);
              setLoading(false);
          }
          loadSingle();
      }
  }

  const handleExport = () => {
    console.log("Exporting data..."); // Placeholder
    // Implement actual export logic (e.g., CSV generation) based on 'records' state
  };

  // --- Memoize filtered records (optional but good practice if filtering is complex) ---
  // const filteredRecords = useMemo(() => {
  //    return selectedEnergyType === 'all' 
  //      ? records 
  //      : records.filter(record => record.type === selectedEnergyType);
  // }, [records, selectedEnergyType]);
  // Using direct filtering is fine for this simple case:
  const filteredRecords = selectedEnergyType === 'all' 
    ? records 
    : records.filter(record => record.type === selectedEnergyType);
  
  // --- Utility Functions (using MUI theme colors) ---
  const getEnergyTypeColor = (type) => {
    switch(type) {
      case 'solar': return 'warning'; // Refers to theme.palette.warning
      case 'wind': return 'primary';  // Refers to theme.palette.primary
      case 'hydro': return 'info';     // Refers to theme.palette.info
      case 'geothermal': return 'error';    // Refers to theme.palette.error
      case 'biomass': return 'success';  // Refers to theme.palette.success
      default: return 'text.secondary'; // Default MUI text color
    }
  };

   const getEnergyTypeBackgroundColor = (type) => {
    // Use theme's light color variations for background
     switch(type) {
       case 'solar': return theme.palette.warning.light;
       case 'wind': return theme.palette.primary.light;
       case 'hydro': return theme.palette.info.light;
       case 'geothermal': return theme.palette.error.light;
       case 'biomass': return theme.palette.success.light;
       default: return theme.palette.grey[100]; // Use a light grey from theme
     }
   };

  const getEnergyTypeIcon = (type) => {
    // Icons remain the same
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
    // Using Container for responsive max-width and centering. Adjust padding responsively.
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}> 
      
      {/* --- Page Header --- */}
      <Box sx={{
        display: 'flex',
        // Stack vertically on small screens, row on medium and up
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between',
        // Align items differently based on direction
        alignItems: { xs: 'flex-start', md: 'center' },
        // Responsive margin bottom
        mb: { xs: 3, md: 4 },
        gap: 2 // Add gap for spacing between title and buttons when stacked or in row
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '1.8rem', md: '2.125rem' } }}> 
        {/* Use sx for responsive font size */}
          Renewable Energy Data
        </Typography>
        
        {/* Button Group */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto'} }}> 
         {/* Allow buttons to wrap, full width on xs */}
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw size={18} />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ flexGrow: { xs: 1, sm: 0 } }} // Allow button to grow on xs
          >
            Refresh
          </Button>
          
           {/* Add Export Button - Placeholder functionality */}
          {/* <Button 
            variant="outlined" 
            startIcon={<Download size={18} />}
            onClick={handleExport}
            disabled={loading || records.length === 0} // Disable if no records
             sx={{ flexGrow: { xs: 1, sm: 0 } }}
          >
            Export Data
          </Button> */}
          
          <Button 
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleNavigateToAddRecord}
             sx={{ flexGrow: { xs: 1, sm: 0 } }}
          >
            Add Record
          </Button>
        </Box>
      </Box>
      
      {/* --- Energy Type Tabs --- */}
       {/* Add responsive margin bottom to Paper */}
       <Paper sx={{ mb: { xs: 2, md: 3 } }} elevation={1}> 
        <Tabs
          value={selectedEnergyType}
          onChange={handleEnergyTypeChange}
          variant="scrollable" // KEEP: Essential for responsiveness
          scrollButtons="auto" // KEEP: Show scroll buttons automatically if needed
          allowScrollButtonsMobile // KEEP: Ensure buttons work on mobile
          // centered // REMOVE THIS LINE to fix the error
          aria-label="energy type tabs"
          sx={{ 
            // Adjust minWidth for tabs on different screen sizes
             '& .MuiTab-root': { minWidth: { xs: 80, sm: 110 }, p: { xs: 1, sm: '12px 16px'} }, 
             // Add border bottom to container, not individual tabs
              borderBottom: 1, borderColor: 'divider'
           }} 
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
      
      {/* --- Records Grid / Loading / Empty State --- */}
       {/* Use responsive margin bottom */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}> 
        {loading ? (
          // Loading state - centered
          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Loading energy data...</Typography>
          </Box>
        ) : filteredRecords.length === 0 ? (
          // Empty state - improved styling using sx and theme
          <Box sx={{ 
             py: { xs: 4, sm: 6 }, 
             display: 'flex', 
             flexDirection: 'column', 
             justifyContent: 'center', 
             alignItems: 'center', 
             textAlign: 'center',
             border: `1px dashed ${theme.palette.divider}`, 
             borderRadius: theme.shape.borderRadius, 
             bgcolor: 'grey.50', // Use theme grey color
             px: 2 // Add some horizontal padding
            }}>
            <BarChart3 size={40} color={theme.palette.text.secondary} /> {/* Use theme color */}
            <Typography variant="h6" color="text.primary" sx={{ mt: 2, mb: 1 }}> {/* Adjust margins */}
               No Records Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}> {/* Adjust margin */}
              {selectedEnergyType === 'all' 
                ? 'No energy records available for the selected period.' 
                : `No ${selectedEnergyType} records found for the selected period.`}
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
          // Data grid - Grid itself is responsive
          <Grid container spacing={{ xs: 2, md: 3 }}> {/* Responsive spacing */}
            {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id || record.year + record.type}> {/* Ensure stable key */}
                 {/* Use sx for Card height/display */}
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Use sx for padding */}
                  <Box sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}> 
                    {/* Card Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
                       {/* Icon Background using theme colors */}
                      <Box sx={{ 
                         p: 1, borderRadius: '50%', // Make it circular
                         bgcolor: getEnergyTypeBackgroundColor(record.type), 
                         display: 'flex', // Center icon inside
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: `${getEnergyTypeColor(record.type)}.dark` // Use darker color for icon itself for contrast
                        }}>
                        {getEnergyTypeIcon(record.type)}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Year {record.year}
                      </Typography>
                      {/* Chip for type looks nicer */}
                       <Chip 
                          label={record.type} 
                          size="small" 
                          // Get MUI color string (e.g., 'warning')
                          color={getEnergyTypeColor(record.type).split('.')[0]} // Extract 'warning' from 'warning.main' if needed, adjust based on color string format
                          variant="outlined"
                          sx={{ ml: 'auto', textTransform: 'capitalize' }} 
                       />
                    </Box>
                    
                    {/* Card Content - Main Stat */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Energy Generation
                      </Typography>
                      {/* Use theme color directly */}
                      <Typography variant="h5" 
                         sx={{ fontWeight: 'bold', color: `${getEnergyTypeColor(record.type)}.main`, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}> 
                        {record.generation?.toLocaleString() ?? 'N/A'} GWh 
                        {/* Use nullish coalescing for safety */}
                      </Typography>
                    </Box>
                    
                    {/* Supplementary Data - Responsive Grid */}
                     {/* Use sx for grid layout instead of Tailwind classes */}
                    <Box sx={{ 
                       display: 'grid', 
                       gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // Stack on xs, 2 columns on sm+
                       gap: theme.spacing(1.5, 2) // Use theme spacing for gap (row, column)
                      }}>
                      {/* Repeated block structure for supplementary data */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Non-Renewable</Typography>
                        <Typography variant="body2">{record.nonRenewableEnergy?.toLocaleString() ?? 'N/A'} GWh</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Population</Typography>
                        <Typography variant="body2">{record.population ? `${record.population}M` : 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">GDP (Billion)</Typography> {/* Clarify unit */}
                        <Typography variant="body2">{record.gdp ? `₱${record.gdp.toLocaleString()}` : 'N/A'}</Typography>
                      </Box>
                       <Box>
                         <Typography variant="caption" color="text.secondary" display="block">Date Added</Typography>
                         <Typography variant="body2">
                            {isValid(new Date(record.dateAdded)) ? format(new Date(record.dateAdded), 'MM/dd/yyyy') : 'N/A'} {/* Format date */}
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

// Need date-fns for formatting - add if not already present
// npm install date-fns 
// or yarn add date-fns
import { format, isValid } from 'date-fns'; // Import at the top

export default RenewableEnergyPage;