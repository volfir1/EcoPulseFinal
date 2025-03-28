import React, { useState, useEffect, useCallback, useRef } from 'react';
import { railwayApi } from '@modules/api';
import { 
  Button, 
  Card, 
  p, s, t, bg, elements,
  AppIcon,
  NumberBox,
  SingleYearPicker,
  useSnackbar 
} from '@shared/index';
import { useRecommendations } from './reommendHook';
import { 
  Divider, 
  Chip, 
  Tooltip, 
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { generateRecommendationsPDF } from './recommendPDF';

const EnergyRecommendations = () => {
  const toast = useSnackbar();
  const {
    cityData,
    projections,
    costBenefits,
    energyPotential,
    year,
    handleYearChange,
    isLoading: hookLoading,
  } = useRecommendations();

  const [solarRecommendations, setSolarRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Chart reference for PDF generation
  const chartRef = useRef(null);
  
  // Use a ref to track previous data for smooth transitions
  const prevRecommendationsRef = useRef(null);

  // Initialize budget and year with default values
  const [budgetValue, setBudgetValue] = useState("50000"); // Store as string for input handling
  const [investmentYear, setInvestmentYear] = useState(new Date().getFullYear() + 1);
  
  // Debounce timer reference
  const debounceTimerRef = useRef(null);

  // Function to fetch solar recommendations with debouncing
  const fetchSolarRecommendations = useCallback((budget, year) => {
    if (!budget || !year) return;
    
    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set loading state without full screen overlay for better UX
    setIsLoading(true);
    
    // Set a debounce timeout to prevent multiple rapid API calls
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Convert budget to number if it's a string
        const budgetNum = typeof budget === 'string' ? parseInt(budget, 10) : budget;
        
        // Use railwayApi instead of api
        const response = await railwayApi.get('/solar_recommendations', {
          params: { year: year, budget: budgetNum }
        });
        
        if (response.data && response.data.recommendations) {
          // Store the previous recommendations for smoother transitions
          prevRecommendationsRef.current = solarRecommendations;
          setSolarRecommendations(response.data.recommendations);
        } else {
          console.error('Invalid data format received:', response.data);
          toast.error('Invalid data format received from the server');
        }
      } catch (error) {
        console.error("Error fetching solar recommendations:", error);
        toast.error(`Failed to fetch solar recommendations: ${error.message}`);
      } finally {
        // Always make sure loading state is turned off, even if there's an error
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }, 300); // 300ms debounce delay
    
    // Set a safety timeout to ensure loading state gets cleared even if the API call hangs
    setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoad(false);
    }, 10000); // 10-second maximum loading time
  }, [toast, solarRecommendations]);

  // Initial data load
  useEffect(() => {
    const numericBudget = parseInt(budgetValue, 10);
    if (numericBudget >= 15000) {
      try {
        fetchSolarRecommendations(numericBudget, investmentYear);
      } catch (error) {
        // Make sure loading states are reset if there's an uncaught error
        console.error("Error during initial data load:", error);
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    } else {
      // If we don't fetch data, still need to set initial load to false
      setIsInitialLoad(false);
    }
    
    // Cleanup function to clear any pending debounce timers
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Force loading states to be cleared when component unmounts
      setIsLoading(false);
      setIsInitialLoad(false);
    };
  }, [fetchSolarRecommendations]);

  // Handle budget change with minimum value of 15,000
  const handleBudgetChange = (event) => {
    const value = event.target.value;
    
    // Allow empty string or digits only
    if (value === '' || /^\d*$/.test(value)) {
      // Update the input value immediately for responsive UI
      setBudgetValue(value);
      
      // Only fetch new data if we have a valid number >= 15000
      const numericValue = value === '' ? 0 : parseInt(value, 10);
      if (numericValue >= 15000) {
        fetchSolarRecommendations(numericValue, investmentYear);
      }
    }
  };

  // Handle year change
  const handleInvestmentYearChange = (year) => {
    setInvestmentYear(year);
    const numericBudget = parseInt(budgetValue, 10);
    if (numericBudget >= 15000) {
      fetchSolarRecommendations(numericBudget, year);
    }
  };

  // Find energy production-related items in the cost benefit analysis
  const getEnergyProductionItems = () => {
    if (!solarRecommendations || !solarRecommendations.cost_benefit_analysis) {
      // Fall back to previous data during loading to prevent flickering
      if (isLoading && prevRecommendationsRef.current?.cost_benefit_analysis) {
        return prevRecommendationsRef.current.cost_benefit_analysis.filter(item => 
          item.label.includes("Energy Production")
        );
      }
      return [];
    }
    
    return solarRecommendations.cost_benefit_analysis.filter(item => 
      item.label.includes("Energy Production")
    );
  };

  // Find financial-related items in the cost benefit analysis
  const getFinancialItems = () => {
    if (!solarRecommendations || !solarRecommendations.cost_benefit_analysis) {
      // Fall back to previous data during loading to prevent flickering
      if (isLoading && prevRecommendationsRef.current?.cost_benefit_analysis) {
        return prevRecommendationsRef.current.cost_benefit_analysis.filter(item => 
          !item.label.includes("Energy Production")
        );
      }
      return [];
    }
    
    return solarRecommendations.cost_benefit_analysis.filter(item => 
      !item.label.includes("Energy Production")
    );
  };

  // Get future projections with fallback to previous data during loading
  const getFutureProjections = () => {
    if (!solarRecommendations || !solarRecommendations.future_projections) {
      if (isLoading && prevRecommendationsRef.current?.future_projections) {
        return prevRecommendationsRef.current.future_projections;
      }
      return null;
    }
    return solarRecommendations.future_projections;
  };

  // Check if we should show full screen loading (only on initial load)
  const showFullScreenLoading = isInitialLoad && isLoading;
  
  // Display data from future projections
  const futureProjections = getFutureProjections();
  const energyProductionItems = getEnergyProductionItems();
  const financialItems = getFinancialItems();

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      // Set a separate loading state just for PDF generation
      // but don't affect the main component loading state
      toast.info('Preparing your PDF download...');
      
      const numericBudget = parseInt(budgetValue, 10);
      
      // Prepare data for PDF
      const pdfData = {
        budget: numericBudget,
        year: investmentYear,
        location: cityData.city,
        solarPotential: cityData.location?.solarPotential || "High",
        futureProjections: futureProjections,
        costBenefitAnalysis: [...energyProductionItems, ...financialItems],
      };
      
      // References to elements that need to be captured
      const refs = {
        chartRef: chartRef,
      };
      
      // Generate and download PDF - with no toast as it already handles its own toasts
      const result = await generateRecommendationsPDF(pdfData, refs, toast);
      
      if (!result.success) {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Energy Recommendations</h1>
            <div className="flex items-center text-green-100 text-sm">
              <AppIcon name="location" size={16} className="mr-1" />
              <span>{cityData.city} • {cityData.period}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoading && !isInitialLoad && (
              <CircularProgress size={20} className="text-white mr-3" />
            )}
            
            <Button
              variant="outlined"
              className="text-white border-white hover:bg-green-800"
              onClick={handleDownloadPDF}
              // Remove the loading state disabling to ensure button is always clickable
            >
              <AppIcon name="save" size={18} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Input Controls */}
        <Paper className="mb-6 rounded-lg shadow-sm">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
              <NumberBox
                placeholder="Enter Budget"
                value={budgetValue}
                onChange={handleBudgetChange}
                size="medium"
                variant="outlined"
                className="w-full"
                prefix="₱"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum: ₱15,000</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <SingleYearPicker
                initialYear={investmentYear}
                onYearChange={handleInvestmentYearChange}
                className="w-full"
              />
            </div>
          </div>
        </Paper>

        {/* Two-column layout for Energy Potential and Future Projections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Column 1: Renewable Energy Potential */}
          <div>
            <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
              Renewable Energy Potential
            </Typography>
            
            <Paper className="rounded-lg shadow-sm overflow-hidden h-full">
              <div className="bg-yellow-500 h-1"></div>
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                    <AppIcon name="solar" size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Solar</h3>
                    <p className="text-sm text-gray-600">Potential: {cityData.location?.solarPotential || "High"}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Average 5.5 kWh/m²/day</p>
              </div>
            </Paper>
          </div>

          {/* Column 2: Future Projections */}
          <div>
            <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
              Future Projections
            </Typography>
            
            <Paper className="rounded-lg shadow-sm h-full">
              <div className="p-4">
                {futureProjections ? (
                  <div>
                    <div className="mb-2">
                      <Chip 
                        label={futureProjections.year} 
                        size="small" 
                        className="bg-blue-100 text-blue-700 mb-1 mr-2" 
                      />
                      <span className="font-medium">{futureProjections.title}</span>
                    </div>
                    
                    <div className="relative h-2 bg-gray-200 rounded-full mb-3">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Object.entries(futureProjections)
                        .filter(([key]) => !['year', 'title'].includes(key))
                        .map(([key, value], idx) => (
                          <li key={idx} className="flex">
                            <span className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                            <span>{key}: {value}</span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No projection data available</p>
                  </div>
                )}
              </div>
            </Paper>
          </div>
        </div>

        {/* Estimated Yearly Energy Production */}
        <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
          Estimated Yearly Energy Production
        </Typography>
        
        <div ref={chartRef} className="mb-6">
          <Paper className="rounded-lg shadow-sm overflow-hidden">
            <div className="bg-yellow-500 h-1"></div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                  <AppIcon name="energy" size={20} className="text-yellow-600" />
                </div>
                <div>
                  <Typography variant="subtitle1" className="font-medium">Estimated Yearly Energy Production</Typography>
                  <Typography variant="body2" className="text-gray-600">Total energy production per year</Typography>
                </div>
              </div>
              <Typography variant="h4" className="font-bold text-gray-800 mt-3 ml-3">
                {energyProductionItems.length > 0 
                  ? energyProductionItems[0]?.value 
                  : "Calculating..."}
              </Typography>
            </div>
          </Paper>
        </div>
        
        {/* Cost-Benefit Analysis */}
        <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
          Cost-Benefit Analysis
        </Typography>
        
        <Paper className="rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-500 h-1"></div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Financial Metrics */}
              {financialItems.map((item, index) => (
                <div key={`api-${index}`} className="p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
                      <AppIcon name={item.icon || "chart"} size={16} className="text-green-600" />
                    </div>
                    <Typography variant="subtitle1" className="font-medium">{item.label}</Typography>
                  </div>
                  <Typography variant="h4" className="font-bold text-gray-800 mt-2 ml-2">
                    {item.value}
                  </Typography>
                </div>
              ))}
              
              {/* Show placeholder if no financial items */}
              {financialItems.length === 0 && !showFullScreenLoading && (
                <>
                  <div className="p-3">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
                        <AppIcon name="savings" size={16} className="text-green-600" />
                      </div>
                      <Typography variant="subtitle1" className="font-medium">Estimated Yearly Savings</Typography>
                    </div>
                    <Typography variant="h4" className="font-bold text-gray-800 mt-2 ml-2">
                      Calculating...
                    </Typography>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
                        <AppIcon name="roi" size={16} className="text-green-600" />
                      </div>
                      <Typography variant="subtitle1" className="font-medium">Estimated ROI (Payback Period)</Typography>
                    </div>
                    <Typography variant="h4" className="font-bold text-gray-800 mt-2 ml-2">
                      Calculating...
                    </Typography>
                  </div>
                </>
              )}
            </div>
          </div>
        </Paper>
      </div>
      
      {/* Full-screen Loading Overlay - ONLY shown on initial load */}
      {showFullScreenLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <Paper className="p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <CircularProgress size={24} className="text-green-500" />
              <Typography>Loading initial data...</Typography>
            </div>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default EnergyRecommendations;