import { useEffect, useRef } from 'react';
import { useSnackbar } from '@shared/index';
import createEnergyStore from '../user/useEnergyStore';

// Create individual stores for each energy type
const solarStore = createEnergyStore('solar');
const hydroStore = createEnergyStore('hydro');
const windStore = createEnergyStore('wind');
const biomassStore = createEnergyStore('biomass');
const geothermalStore = createEnergyStore('geothermal'); 

// Map of energy types to their stores
const stores = {
  solar: solarStore,
  hydro: hydroStore,
  wind: windStore,
  biomass: biomassStore,
  geothermal: geothermalStore
};

/**
 * Hook to access energy analytics for a specific energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @returns {object} Energy analytics data and functions
 */
const useEnergyAnalytics = (energyType) => {
  // Validate energy type
  if (!['solar', 'hydro', 'wind', 'biomass', 'geothermal'].includes(energyType)) {
    throw new Error(`Invalid energy type: ${energyType}. Must be one of: solar, hydro, wind, biomass, geothermal`);
  }
  
  // Get the appropriate store
  const store = stores[energyType];
  
  // Get toast notifications - will be null if not available
  let toast;
  try {
    toast = useSnackbar();
  } catch (error) {
    // If toast provider is not available, create a dummy object
    toast = {
      info: () => {},
      success: () => {},
      error: () => {},
      warning: () => {}
    };
    console.log('Toast provider not available');
  }
  
  // Create ref for chart
  const chartRef = useRef(null);
  
  // Select state from the store
  const generationData = store(state => state.generationData);
  const currentProjection = store(state => state.currentProjection);
  const loading = store(state => state.loading);
  const selectedStartYear = store(state => state.selectedStartYear);
  const selectedEndYear = store(state => state.selectedEndYear);
  const additionalData = store(state => state.additionalData);
  const config = store(state => state.config);
  const apiError = store(state => state.apiError);
  
  // Get actions from the store
  const initialize = store(state => state.initialize);
  const setYearRange = store(state => state.setYearRange);
  const setChartRef = store(state => state.setChartRef);
  const handleDownload = store(state => state.handleDownload);
  
  // Initialize data and set chart ref on component mount
  useEffect(() => {
    // Initialize the data
    initialize();
    
    // Set the chart ref in the store
    setChartRef(chartRef);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialize, setChartRef]);
  
  // Show a notification when using mock data (only once)
  // Using a more direct approach without options that might cause errors
  useEffect(() => {
    if (apiError && apiError.usingMockData) {
      try {
        toast.info(`Using simulated ${energyType} data for years ${selectedStartYear}-${selectedEndYear}.`);
      } catch (error) {
        console.log('Error showing toast notification:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiError]);
  
  // Handle year changes
  const handleStartYearChange = (year) => setYearRange(year, selectedEndYear);
  const handleEndYearChange = (year) => setYearRange(selectedStartYear, year);
  
  // Handle PDF download with toast
  const handleDownloadWithToast = () => handleDownload(toast);
  
  // Extract energy-specific additional data
  let specificData = {};
  
  if (energyType === 'solar') {
    specificData = {
      irradianceData: additionalData.irradianceData || [],
      panelPerformance: additionalData.panelPerformance || []
    };
  } else if (energyType === 'hydro') {
    specificData = {
      waterFlowData: additionalData.waterFlowData || [],
      turbineEfficiency: additionalData.turbineEfficiency || []
    };
  } else if (energyType === 'wind') {
    specificData = {
      windSpeedData: additionalData.windSpeedData || [],
      turbinePerformance: additionalData.turbinePerformance || []
    };
  } else if (energyType === 'biomass') {
    specificData = {
      feedstockData: additionalData.feedstockData || [],
      efficiencyData: additionalData.efficiencyData || []
    };
  } else if (energyType === 'geothermal') {
    specificData = {
      temperatureData: additionalData.temperatureData || [],
      wellPerformance: additionalData.wellPerformance || []
    };
  }
  
  // Return a combined object with all the data and functions
  return {
    // Common data
    generationData,
    currentProjection,
    loading,
    selectedStartYear,
    selectedEndYear,
    chartRef,
    config,
    apiError,
    
    // Actions
    handleStartYearChange,
    handleEndYearChange,
    handleDownload: handleDownloadWithToast,
    
    // Flag to indicate if using mock data
    usingMockData: apiError?.usingMockData || false,
    
    // Energy-specific data
    ...specificData
  };
};

export default useEnergyAnalytics;