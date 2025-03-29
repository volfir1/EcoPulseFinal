// useSolarAdmin.js
import { useState, useCallback, useMemo } from 'react';
import { railwayApi } from '@features/modules/api';
import { useSnackbar } from 'notistack';

export const useSolarAdmin = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generationValue, setGenerationValue] = useState({
    totalRenewable: '',
    geothermal: '',
    hydro: '',
    biomass: '',
    solar: '',
    wind: '',
    nonRenewable: '',
    totalPower: '',
    population: '',
    gdp: ''
  });

  // Handle year change in the form
  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
  }, []);

  // Handle generation value change
  const handleGenerationChange = useCallback((event, type) => {
    setGenerationValue(prev => ({
      ...prev,
      [type]: event.target.value
    }));
  }, []);

  // Form validation
  const formValidation = useMemo(() => {
    const errors = {};

    if (!selectedYear) {
      errors.year = 'Year is required';
    }

    const requiredFields = [
      'solar', 'wind', 'hydro', 'geothermal', 'biomass', 
      'nonRenewable', 'population', 'gdp'
    ];
    
    requiredFields.forEach(field => {
      if (!generationValue[field]) {
        errors[field] = `${field} value is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [selectedYear, generationValue]);

  // Submit form data
  const handleSubmit = useCallback(async () => {
    if (!formValidation.isValid) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }

    // Calculate total renewable energy if not provided
    const totalRenewable = generationValue.totalRenewable || 
      (parseFloat(generationValue.solar || 0) +
       parseFloat(generationValue.wind || 0) +
       parseFloat(generationValue.hydro || 0) +
       parseFloat(generationValue.geothermal || 0) +
       parseFloat(generationValue.biomass || 0)).toString();

    // Calculate total power if not provided
    const totalPower = generationValue.totalPower ||
      (parseFloat(totalRenewable) + parseFloat(generationValue.nonRenewable || 0)).toString();

    const payload = {
      Year: selectedYear,
      'Total Renewable Energy (GWh)': parseFloat(totalRenewable),
      'Geothermal (GWh)': parseFloat(generationValue.geothermal),
      'Hydro (GWh)': parseFloat(generationValue.hydro),
      'Biomass (GWh)': parseFloat(generationValue.biomass),
      'Solar (GWh)': parseFloat(generationValue.solar),
      'Wind (GWh)': parseFloat(generationValue.wind),
      'Non-Renewable Energy (GWh)': parseFloat(generationValue.nonRenewable),
      'Total Power Generation (GWh)': parseFloat(totalPower),
      'Population': parseFloat(generationValue.population),
      'Gross Domestic Product (GDP)': parseFloat(generationValue.gdp),
      'isPredicted': selectedYear > new Date().getFullYear(),
      'dateAdded': new Date().toISOString()
    };

    setLoading(true);
    try {
      // Add new record - this is the important API endpoint for saving data
      await railwayApi.post('/create/', payload);
      enqueueSnackbar('Energy data added successfully', { variant: 'success' });
      
      // Reset form after successful submission
      setGenerationValue({
        totalRenewable: '',
        geothermal: '',
        hydro: '',
        biomass: '',
        solar: '',
        wind: '',
        nonRenewable: '',
        totalPower: '',
        population: '',
        gdp: ''
      });
    } catch (error) {
      console.error('Error saving data:', error);
      enqueueSnackbar('Failed to add energy data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, generationValue, enqueueSnackbar, formValidation]);

  // Load sample data for quick testing
  const loadSampleData = useCallback(() => {
    setGenerationValue({
      solar: '1567.52',
      wind: '1346.78',
      hydro: '2105.63',
      geothermal: '945.31',
      biomass: '872.44',
      nonRenewable: '3200.75',
      population: '42.3',
      gdp: '1850',
      totalRenewable: '6837.68',
      totalPower: '10038.43'
    });
  }, []);

  return {
    loading,
    selectedYear,
    generationValue,
    handleYearChange,
    handleGenerationChange,
    handleSubmit,
    loadSampleData,
    formValidation
  };
};

export default useSolarAdmin;