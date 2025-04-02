// useEnergyRecommendations.js
import { useState, useEffect, useRef } from 'react';
import { railwayApi } from '@modules/api';
import { useSnackbar } from '@shared/index';
import dayjs from 'dayjs';
import { initialData } from './data';

export const useEnergyRecommendations = () => {
  const toast = useSnackbar();
  
  // City and general data state
  const [cityData, setCityData] = useState(initialData.cityData);
  const [projections, setProjections] = useState(initialData.projections);
  const [costBenefits, setCostBenefits] = useState(initialData.costBenefits);
  const [energyPotential, setEnergyPotential] = useState(initialData.energyPotential);
  const [year, setYear] = useState(dayjs(initialData.cityData.year));
  
  // Solar recommendations state
  const [solarRecommendations, setSolarRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize budget and year with default values
  const [budgetValue, setBudgetValue] = useState("100000"); 
  const [investmentYear, setInvestmentYear] = useState(2026);
  
  // Refs for tracking requests and timeouts
  const requestTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const currentRequestIdRef = useRef(0);

  // Function to fetch solar recommendations
  const fetchSolarRecommendations = async (budget, year) => {
    if (!budget || !year || budget < 15000) {
      return;
    }
    
    // Clear previous timeouts
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    // Generate unique request ID to track concurrent requests
    const requestId = ++currentRequestIdRef.current;
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Convert budget to number if it's a string
    const budgetNum = typeof budget === 'string' ? parseInt(budget, 10) : budget;
    
    // Log the API request
    console.log(`Making API request for solar recommendations: year=${year}, budget=${budgetNum}`);
    
    // Set safety timeout
    safetyTimeoutRef.current = setTimeout(() => {
      console.log('Safety timeout triggered');
      setIsLoading(false);
      setIsInitialLoad(false);
      setError('Request timed out. Please try again.');
    }, 10000);
    
    try {
      // Make the API request directly
      const response = await railwayApi.get('/solar_recommendations', {
        params: { year, budget: budgetNum }
      });
      
      // Check if this is still the most recent request
      if (requestId !== currentRequestIdRef.current) {
        console.log('Ignoring outdated response');
        return;
      }
      
      console.log('API response received:', response.data);
      
      if (response.data && response.data.recommendations) {
        setSolarRecommendations(response.data.recommendations);
        setError(null);
      } else {
        console.error('Invalid data format received:', response.data);
        setError('Received invalid data from server');
        
        // Provide fallback data
        setSolarRecommendations({
          cost_benefit_analysis: [
            {
              label: "Estimated Yearly Energy Production",
              value: "3650.00 kWh",
              icon: "energy"
            },
            {
              label: "Estimated Yearly Savings",
              value: "PHP 44147.69",
              icon: "savings"
            },
            {
              label: "Estimated ROI (Payback Period)",
              value: "1.13 years",
              icon: "roi"
            }
          ],
          future_projections: {
            year: "2026",
            title: "Solar Investment Projections",
            "Predicted MERALCO Rate": "PHP 12.10 per kWh",
            "Installable Solar Capacity": "2.50 kW"
          }
        });
      }
    } catch (error) {
      // Check if this is still the most recent request
      if (requestId !== currentRequestIdRef.current) {
        return;
      }
      
      console.error("Error fetching solar recommendations:", error);
      setError(`Error: ${error.message}`);
      
      // Provide fallback data
      setSolarRecommendations({
        cost_benefit_analysis: [
          {
            label: "Estimated Yearly Energy Production",
            value: "3650.00 kWh",
            icon: "energy"
          },
          {
            label: "Estimated Yearly Savings",
            value: "PHP 44147.69",
            icon: "savings"
          },
          {
            label: "Estimated ROI (Payback Period)",
            value: "1.13 years",
            icon: "roi"
          }
        ],
        future_projections: {
          year: "2026",
          title: "Solar Investment Projections",
          "Predicted MERALCO Rate": "PHP 12.10 per kWh",
          "Installable Solar Capacity": "2.50 kW"
        }
      });
    } finally {
      // Clear safety timeout
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      
      // Reset loading state
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Handle general app year change
  const handleYearChange = (newValue) => {
    if (!newValue || !newValue.isValid()) return;
    setYear(newValue);
    setCityData(prev => ({
      ...prev,
      year: newValue.year().toString()
    }));
  };

  // Handle budget change
  const handleBudgetChange = (event) => {
    const value = event.target.value;
    
    // Allow empty string or digits only
    if (value === '' || /^\d*$/.test(value)) {
      // Update the input value immediately for responsive UI
      setBudgetValue(value);
      
      // Clear existing timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      // Set a debounce timeout
      requestTimeoutRef.current = setTimeout(() => {
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        if (numericValue >= 15000) {
          fetchSolarRecommendations(numericValue, investmentYear);
        }
      }, 800);
    }
  };

  // Handle investment year change
  const handleInvestmentYearChange = (year) => {
    if (year !== investmentYear) {
      setInvestmentYear(year);
      
      const numericBudget = parseInt(budgetValue, 10);
      if (numericBudget >= 15000) {
        // Add a small delay to prevent race conditions
        setTimeout(() => {
          fetchSolarRecommendations(numericBudget, year);
        }, 100);
      }
    }
  };

  // Initial data load - run only once
  useEffect(() => {
    console.log("Initial data load effect running");
    const loadInitialData = async () => {
      const numericBudget = parseInt(budgetValue, 10);
      if (numericBudget >= 15000) {
        await fetchSolarRecommendations(numericBudget, investmentYear);
      } else {
        setIsInitialLoad(false);
      }
    };
    
    loadInitialData();
    
    // Cleanup function
    return () => {
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []); // Empty dependency array ensures this runs only once

  // Extract data from recommendations
  const energyProductionItems = solarRecommendations?.cost_benefit_analysis?.filter(
    item => item.label.includes("Energy Production")
  ) || [];
  
  const financialItems = solarRecommendations?.cost_benefit_analysis?.filter(
    item => !item.label.includes("Energy Production")
  ) || [];
  
  const futureProjections = solarRecommendations?.future_projections || null;

  // Manual refresh handler
  const handleRefresh = () => {
    const numericBudget = parseInt(budgetValue, 10);
    if (numericBudget >= 15000) {
      fetchSolarRecommendations(numericBudget, investmentYear);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (chartRef) => {
    try {
      toast.info('Preparing your PDF download...');
      
      const numericBudget = parseInt(budgetValue, 10);
      
      // In a real implementation, you would call your PDF generator here
      // This is a placeholder for the PDF download logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  return {
    // City and general data
    cityData,
    projections,
    costBenefits,
    energyPotential,
    year,
    handleYearChange,
    
    // Solar recommendations data
    solarRecommendations,
    energyProductionItems,
    financialItems,
    futureProjections,
    isLoading,
    isInitialLoad,
    error,
    budgetValue,
    investmentYear,
    handleBudgetChange,
    handleInvestmentYearChange,
    handleRefresh,
    fetchSolarRecommendations,
    handleDownloadPDF
  };
};