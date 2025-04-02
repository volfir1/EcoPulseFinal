//adminSolarHook.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { railwayApi } from '@features/modules/api';
import { useSnackbar } from '@shared/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const useSolarAnalytics = () => {
  // Properly extract the snackbar function
  const toast = useSnackbar();
  
  // Create a wrapper function to handle different toast types
 const enqueueSnackbar = useCallback((message, options = {}) => {
  const variant = options?.variant || 'info';
  
  try {
    if (variant === 'success') {
      toast.success(message);
    } else if (variant === 'error') {
      toast.error(message);
    } else if (variant === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  } catch (error) {
    console.log(`Toast message (${variant}):`, message);
  }
}, [toast]);
  
  const [generationData, setGenerationData] = useState([]);
  const [currentProjection, setCurrentProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStartYear, setSelectedStartYear] = useState(new Date().getFullYear());
  const [selectedEndYear, setSelectedEndYear] = useState(new Date().getFullYear() + 5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Ref for chart element
  const chartRef = useRef(null);
  const cleanResponse = (response) => {
    // Replace "NaN" with "null" in the response string
    return response.replace(/NaN/g, 'null');
  };

  // Fetch data based on selected year range
  const fetchData = useCallback(async (startYear, endYear) => {
    setLoading(true);
    try { 
      console.log(`Fetching solar data for years ${startYear} to ${endYear}`);
      
      const response = await railwayApi.get(`/predictions/solar/?start_year=${startYear}&end_year=${endYear}`);
      console.log("Raw API response:", response);
      
      // Check if we have valid data before processing
      if (response && response.data) {
        // Process raw response data first
        let responseData = response.data;
        
        // Check if the response contains the expected data
        if (responseData.status === "success" && Array.isArray(responseData.predictions)) {
          console.log("Processing predictions:", responseData.predictions);
          
          const formattedData = responseData.predictions.map(item => ({
            date: item.Year,
            value: parseFloat(item['Predicted Production'] || 0),
            nonRenewableEnergy: item.isPredicted ? null : (item['Non-Renewable Energy (GWh)'] ? parseFloat(item['Non-Renewable Energy (GWh)']) : null),
            population: item.isPredicted ? null : (item['Population (in millions)'] ? parseFloat(item['Population (in millions)']) : null),
            gdp: item.isPredicted ? null : (item['Gross Domestic Product'] === null ? null : parseFloat(item['Gross Domestic Product'])),
            isPredicted: item.isPredicted !== undefined ? item.isPredicted : false,
            isDeleted: item.isDeleted !== undefined ? item.isDeleted : false 
          }));
  
          // Calculate current projection
          const latestYear = Math.max(...formattedData.map(item => item.date));
          const latestPrediction = formattedData.find(item => item.date === latestYear);
          if (latestPrediction) {
            setCurrentProjection(latestPrediction.value);
          }
  
          setGenerationData(formattedData);
        } else {
          console.error("Invalid response format:", responseData);
          enqueueSnackbar('Invalid data format in API response', { variant: 'error' });
        }
      } else {
        console.error("Empty or invalid response received");
        enqueueSnackbar('Empty or invalid response from server', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response || error.message);
      enqueueSnackbar(`Error: ${error.response?.data?.message || error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fetch data on component mount and when year range or refresh trigger changes
  useEffect(() => {
    fetchData(selectedStartYear, selectedEndYear);
  }, [selectedStartYear, selectedEndYear, refreshTrigger, fetchData]); 

  // Year range handlers
  const handleStartYearChange = useCallback((year) => {
    setSelectedStartYear(year);
  }, []);

  const handleEndYearChange = useCallback((year) => {
    setSelectedEndYear(year);
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Download data as PDF with chart and table
  const handleDownload = useCallback(async () => {
    try {
      enqueueSnackbar('Preparing your download...', { variant: 'info' });
      
      // Create new PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and metadata
      doc.setFontSize(16);
      doc.text('Solar Power Generation Summary', 15, 15);
      
      doc.setFontSize(11);
      doc.text(`Year Range: ${selectedStartYear} - ${selectedEndYear}`, 15, 25);
      doc.text(`Current Projection: ${currentProjection ? currentProjection.toFixed(2) : 'N/A'} GWh`, 15, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 35);
      
      // If there's a chart reference, capture it
      if (chartRef.current) {
        try {
          // Capture chart as image
          const chartElement = chartRef.current;
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          
          const chartImageData = canvas.toDataURL('image/png');
          
          // Add chart image to PDF
          doc.addImage(
            chartImageData, 
            'PNG', 
            15, // x position
            45, // y position
            180, // width
            80  // height
          );
          
          // Add chart title
          doc.setFontSize(12);
          doc.text('Solar Generation Chart', 15, 45);
        } catch (chartError) {
          console.error('Error capturing chart:', chartError);
          // Continue without chart if it fails
        }
      }
      
      // Add table data - position depends on if chart was included
      const tableY = chartRef.current ? 140 : 45;
      
      // Add table header
      doc.setFontSize(12);
      doc.text('Solar Generation Data Table', 15, tableY - 5);
      
      // Create table data
      doc.autoTable({
        head: [['Year', 'Predicted Production (GWh)']],
        body: generationData.map(item => [item.date, item.value.toFixed(2)]),
        startY: tableY,
        margin: { left: 15, right: 15 },
        headStyles: { fillColor: [255, 165, 0] }, // Orange color for solar
        styles: {
          fontSize: 10,
          cellPadding: 3
        }
      });
      
      // Save PDF
      doc.save('Solar_Power_Generation_Summary.pdf');
      
      enqueueSnackbar('Summary downloaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Failed to download summary. Please try again.', { variant: 'error' });
    }
  }, [generationData, selectedStartYear, selectedEndYear, currentProjection, enqueueSnackbar, chartRef]);

  // Additional data for potential future use (solar-specific data)
  const sunlightData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    direct: 850 + Math.sin(i * 0.5) * 100 + Math.random() * 50,
    diffuse: 200 + Math.sin(i * 0.3) * 30 + Math.random() * 20
  }));

  const panelPerformance = Array.from({ length: 6 }, (_, i) => ({
    panel: `Panel ${i + 1}`,
    efficiency: 22 + Math.sin(i * 0.7) * 2 + Math.random() * 1,
    output: 300 + Math.sin(i * 0.6) * 30 + Math.random() * 20
  }));

  // FIXED: Create, update, and delete methods for data management
  const addRecord = useCallback(async (year, value) => {
    if (!year || !value) {
      enqueueSnackbar('Year and value are required', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // Ensure we're sending a proper payload with the correct field names
      const payload = {
        Year: parseInt(year, 10),
        'Solar (GWh)': parseFloat(value)
      };
      
      // Log the payload for debugging
      console.log('Adding solar record with payload:', payload);
      
      // Make the API call
      const response = await railwayApi.post('/predictions/solar/', payload);
      
      // Check response
      console.log('API response for add record:', response);
      
      // Show success message
      enqueueSnackbar('Solar generation data added successfully', { variant: 'success' });
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add solar generation data';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const updateRecord = useCallback(async (year, payload) => {
    if (!year) {
      enqueueSnackbar('Year is required', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // Ensure we're sending a proper payload with the correct field names
      const formattedPayload = {
        ...payload,
        Year: parseInt(year, 10)
      };
      
      // If payload doesn't include 'Solar (GWh)', try to get it from generation data
      if (!formattedPayload['Solar (GWh)']) {
        const existingRecord = generationData.find(item => item.date === parseInt(year, 10));
        if (existingRecord) {
          formattedPayload['Solar (GWh)'] = existingRecord.value;
        }
      }
      
      // Log the payload for debugging
      console.log('Updating solar record with payload:', formattedPayload);
      
      // Make the API call
      const response = await railwayApi.put(`/update/${year}/`, formattedPayload);
      
      // Check response
      console.log('API response for update record:', response);
      
      // Show success message
      enqueueSnackbar('Solar generation data updated successfully', { variant: 'success' });
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update solar generation data';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [generationData, enqueueSnackbar]);

  const deleteRecord = useCallback(async (year) => {
    if (!year) {
      enqueueSnackbar('Year is required', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // First confirm with the user
      const confirmDelete = window.confirm(`Are you sure you want to delete solar generation data for year ${year}?`);
      if (!confirmDelete) {
        setLoading(false);
        return;
      }
      
      // Ensure we're sending a proper payload
      const payload = { 
        isDeleted: true,
        Year: parseInt(year, 10)
      };
      
      // Log the payload for debugging
      console.log('Deleting solar record with payload:', payload);
      
      // Make the API call
      const response = await railwayApi.put(`/update/${year}/`, payload);
      
      // Check response
      console.log('API response for delete record:', response);
      
      // Show success message
      enqueueSnackbar('Solar generation data deleted successfully', { variant: 'success' });
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete solar generation data';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const recoverRecord = useCallback(async (year) => {
    if (!year) {
      enqueueSnackbar('Year is required', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      // Ensure we're sending a proper payload
      const payload = { 
        isDeleted: false,
        Year: parseInt(year, 10)
      };
      
      // Log the payload for debugging
      console.log('Recovering solar record with payload:', payload);
      
      // Make the API call - ensure we're using the correct endpoint
      const response = await railwayApi.put(`/recover/${year}/`, payload);
      
      // Check response
      console.log('API response for recover record:', response);
      
      // Show success message
      enqueueSnackbar('Solar generation data recovered successfully', { variant: 'success' });
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error recovering data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to recover solar generation data';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  return {
    generationData,
    currentProjection,
    loading,
    selectedStartYear,
    selectedEndYear,
    handleStartYearChange,
    handleEndYearChange,
    handleRefresh,
    handleDownload,
    addRecord,
    updateRecord,
    deleteRecord,
    recoverRecord,
    sunlightData,
    panelPerformance,
    chartRef
  };
};

export default useSolarAnalytics;