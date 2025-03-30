// adminGeoHook.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { railwayApi } from '@features/modules/api';
import { useSnackbar } from '@shared/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const useGeothermalAnalytics = () => {
  // Properly extract the snackbar function
  const snackbar = useSnackbar();
  const enqueueSnackbar = snackbar?.enqueueSnackbar || 
                         (message => console.log('Snackbar message:', message));
  
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
// Fetch data based on selected year range
const fetchData = useCallback(async (startYear, endYear) => {
  setLoading(true);
  try {
    const response = await railwayApi.get(`/predictions/wind/?start_year=${startYear}&end_year=${endYear}`);
    
    // Clean the response by replacing "NaN" with "null"
    // First convert response.data to a string if it's not already one
    const dataString = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    
    // Now clean the string
    const cleanedResponse = cleanResponse(dataString);

    // Parse the cleaned JSON string
    const responseData = JSON.parse(cleanedResponse);

    // Check if the response contains the expected data
    if (responseData.status === "success" && Array.isArray(responseData.predictions)) {
      const formattedData = responseData.predictions.map(item => ({
        date: item.Year,
        value: parseFloat(item['Predicted Production']),
        nonRenewableEnergy: item.isPredicted ? null : (item['Non-Renewable Energy (GWh)'] ? parseFloat(item['Non-Renewable Energy (GWh)']) : null),
        population: item.isPredicted ? null : (item['Population (in millions)'] ? parseFloat(item['Population (in millions)']) : null),
        gdp: item.isPredicted ? null : (item['Gross Domestic Product'] === null ? null : parseFloat(item['Gross Domestic Product'])),
        isPredicted: item.isPredicted !== undefined ? item.isPredicted : false, // Ensure isPredicted is included
        isDeleted: item.isDeleted !== undefined ? item.isDeleted : false 
      }));

      // Log the raw fetched data and the formatted data to verify the isPredicted column
      console.log("Raw fetched data:", responseData.predictions);
      console.log("Formatted data:", formattedData);

      setGenerationData(formattedData);
    } else {
      throw new Error("Invalid data format in API response");
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    enqueueSnackbar('Failed to fetch data. Please try again.', { variant: 'error' });
  } finally {
    setLoading(false);
  }
}, [enqueueSnackbar]);

  // Fetch data on component mount and when year range or refresh trigger changes
  useEffect(() => {
    fetchData(selectedStartYear, selectedEndYear);
  }, [selectedStartYear, selectedEndYear, refreshTrigger]); // fetchData removed

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
      try {
        enqueueSnackbar('Preparing your download...', { variant: 'info' });
      } catch (error) {
        console.log('Preparing download...');
      }
      
      // Create new PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and metadata
      doc.setFontSize(16);
      doc.text('Geothermal Power Generation Summary', 15, 15);
      
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
          doc.text('Geothermal Generation Chart', 15, 45);
        } catch (chartError) {
          console.error('Error capturing chart:', chartError);
          // Continue without chart if it fails
        }
      }
      
      // Add table data - position depends on if chart was included
      const tableY = chartRef.current ? 140 : 45;
      
      // Add table header
      doc.setFontSize(12);
      doc.text('Geothermal Generation Data Table', 15, tableY - 5);
      
      // Create table data
      doc.autoTable({
        head: [['Year', 'Predicted Production (GWh)']],
        body: generationData.map(item => [item.date, item.value.toFixed(2)]),
        startY: tableY,
        margin: { left: 15, right: 15 },
        headStyles: { fillColor: [255, 107, 107] }, // Red color for geothermal
        styles: {
          fontSize: 10,
          cellPadding: 3
        }
      });
      
      // Save PDF
      doc.save('Geothermal_Power_Generation_Summary.pdf');
      
      try {
        enqueueSnackbar('Summary downloaded successfully!', { variant: 'success' });
      } catch (error) {
        console.log('Summary downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      
      try {
        enqueueSnackbar('Failed to download summary. Please try again.', { variant: 'error' });
      } catch (snackbarError) {
        console.error('Error showing notification:', snackbarError);
        alert('Failed to download summary. Please try again.');
      }
    }
  }, [generationData, selectedStartYear, selectedEndYear, currentProjection, enqueueSnackbar, chartRef]);

  // Additional data for potential future use
  const temperatureData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    surface: 150 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
    deep: 280 + Math.sin(i * 0.3) * 5 + Math.random() * 3
  }));

  const wellPerformance = Array.from({ length: 6 }, (_, i) => ({
    well: `Well ${i + 1}`,
    pressure: 85 + Math.sin(i * 0.7) * 10 + Math.random() * 5,
    output: 2600 + Math.sin(i * 0.6) * 300 + Math.random() * 200
  }));

  // Create, update, and delete methods for data management
  const addRecord = useCallback(async (year, value) => {
    setLoading(true);
    try {
      const payload = {
        Year: year,
        'Geothermal (GWh)': value
      };
      
      await railwayApi.post('/predictions/wind/', payload);
      
      try {
        enqueueSnackbar('Geothermal generation data added successfully', { variant: 'success' });
      } catch (error) {
        console.log('Geothermal generation data added successfully');
      }
      
      setRefreshTrigger(prev => prev + 1); // Trigger refetch
    } catch (error) {
      console.error('Error adding data:', error);
      
      try {
        enqueueSnackbar('Failed to add geothermal generation data', { variant: 'error' });
      } catch (snackbarError) {
        console.error('Error showing notification:', snackbarError);
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const updateRecord = useCallback(async (year, payload) => {
    setLoading(true);
    try {
      await railwayApi.put(`/update/${year}/`, payload);
      
      try {
        enqueueSnackbar('Geothermal generation data updated successfully', { variant: 'success' });
      } catch (error) {
        console.log('Geothermal generation data updated successfully');
      }
      
      setRefreshTrigger(prev => prev + 1); // Trigger refetch
    } catch (error) {
      console.error('Error updating data:', error);
      
      try {
        enqueueSnackbar('Failed to update geothermal generation data', { variant: 'error' });
      } catch (snackbarError) {
        console.error('Error showing notification:', snackbarError);
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const deleteRecord = useCallback(async (year) => {
    setLoading(true);
    try {
      await railwayApi.put(`/update/${year}/`, { isDeleted: true });
      
      try {
        enqueueSnackbar('Geothermal generation data deleted successfully', { variant: 'success' });
      } catch (error) {
        console.log('Geothermal generation data deleted successfully');
      }
      
      setRefreshTrigger(prev => prev + 1); // Trigger refetch
    } catch (error) {
      console.error('Error deleting data:', error);
      
      try {
        enqueueSnackbar('Failed to delete geothermal generation data', { variant: 'error' });
      } catch (snackbarError) {
        console.error('Error showing notification:', snackbarError);
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const recoverRecord = useCallback(async (year) => {
    setLoading(true);
    try {
      await railwayApi.put(`/recover/${year}/`, { isDeleted: false });
      
      try {
        enqueueSnackbar('Geothermal generation data recovered successfully', { variant: 'success' });
      } catch (error) {
        console.log('Geothermal generation data deleted successfully');
      }
      
      setRefreshTrigger(prev => prev + 1); // Trigger refetch
    } catch (error) {
      console.error('Error recovering data:', error);
      
      try {
        enqueueSnackbar('Failed to recover geothermal generation data', { variant: 'error' });
      } catch (snackbarError) {
        console.error('Error showing notification:', snackbarError);
      }
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
    temperatureData,
    wellPerformance,
    chartRef // Export the chart ref
  };
};

export default useGeothermalAnalytics;