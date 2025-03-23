'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Container,
  Paper,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Divider
} from '@mui/material';
import { ChevronLeft, Save } from 'lucide-react';
import { SingleYearPicker } from '@shared/index';
import useSolarAdmin from './inputHook';

const ModelInputPage = () => {
  // Navigation hook
  const navigate = useNavigate();
  
  // Get ALL functions from the hook at the top level
  const { 
    loading, 
    handleSubmit: submitToApi, 
    formValidation,
    handleYearChange: hookYearChange,
    handleGenerationChange: hookGenerationChange
  } = useSolarAdmin();
  
  // Form state
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    solar: '',
    wind: '',
    hydro: '',
    geothermal: '',
    biomass: '',
    totalRenewable: '',
    nonRenewableEnergy: '',
    totalPower: '',
    population: '',
    gdp: '',
    isPredicted: false
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Handle year change
  const handleYearChange = useCallback((year) => {
    setFormData(prev => ({ ...prev, year }));
    
    // Set isPredicted automatically if year is in the future
    const currentYear = new Date().getFullYear();
    if (year > currentYear && !formData.isPredicted) {
      setFormData(prev => ({ ...prev, isPredicted: true }));
    }
    
    // Also update the hook's year state
    hookYearChange(year);
  }, [formData.isPredicted, hookYearChange]);
  
  // Calculate total renewable energy and total power
  useEffect(() => {
    const solar = parseFloat(formData.solar) || 0;
    const wind = parseFloat(formData.wind) || 0;
    const hydro = parseFloat(formData.hydro) || 0;
    const geothermal = parseFloat(formData.geothermal) || 0;
    const biomass = parseFloat(formData.biomass) || 0;
    const nonRenewable = parseFloat(formData.nonRenewableEnergy) || 0;
    
    // Calculate total renewable energy
    const totalRenewable = solar + wind + hydro + geothermal + biomass;
    
    // Calculate total power generation
    const totalPower = totalRenewable + nonRenewable;
    
    setFormData(prev => ({
      ...prev,
      totalRenewable: totalRenewable > 0 ? totalRenewable.toFixed(2) : '',
      totalPower: totalPower > 0 ? totalPower.toFixed(2) : ''
    }));
  }, [formData.solar, formData.wind, formData.hydro, formData.geothermal, formData.biomass, formData.nonRenewableEnergy]);
  
  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // If checkbox, use checked value; otherwise, use regular value
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Update hook's state for API submission
    // Map the field names if they differ
    const hookFieldMap = {
      nonRenewableEnergy: 'nonRenewable'
    };
    
    const hookFieldName = hookFieldMap[name] || name;
    
    // Only update hook state for relevant fields
    if (['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'nonRenewableEnergy', 'population', 'gdp', 'totalRenewable', 'totalPower'].includes(name)) {
      hookGenerationChange({ target: { value: inputValue } }, hookFieldName);
    }
  }, [errors, hookGenerationChange]);
  
  // Load sample data
  const loadSampleData = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      solar: '1567.52',
      wind: '1346.78',
      hydro: '2105.63',
      geothermal: '945.31',
      biomass: '872.44',
      nonRenewableEnergy: '3200.75',
      population: '42.3',
      gdp: '1850'
      // totalRenewable and totalPower will be calculated by useEffect
    }));
    
    // Also load sample data to the hook state
    hookGenerationChange({ target: { value: '1567.52' } }, 'solar');
    hookGenerationChange({ target: { value: '1346.78' } }, 'wind');
    hookGenerationChange({ target: { value: '2105.63' } }, 'hydro');
    hookGenerationChange({ target: { value: '945.31' } }, 'geothermal');
    hookGenerationChange({ target: { value: '872.44' } }, 'biomass');
    hookGenerationChange({ target: { value: '3200.75' } }, 'nonRenewable');
    hookGenerationChange({ target: { value: '42.3' } }, 'population');
    hookGenerationChange({ target: { value: '1850' } }, 'gdp');
  }, [hookGenerationChange]);
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    
    // Ensure at least one energy value is provided
    const hasEnergyValue = formData.solar || formData.wind || formData.hydro || 
                          formData.geothermal || formData.biomass;
                          
    if (!hasEnergyValue) {
      newErrors.general = 'At least one energy value is required';
    }
    
    // Validate number fields
    const numericFields = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 
                          'nonRenewableEnergy', 'population', 'gdp'];
                          
    numericFields.forEach(field => {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        newErrors[field] = 'Must be a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  // Handle form submission using the hook's submitToApi
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Data is already synced with the hook via handleInputChange
      // Just call the submit function without trying to use hooks inside this function
      await submitToApi();
      
      // Navigate back to dashboard on success
      navigate('/dashboard');
    }
  }, [validateForm, navigate, submitToApi]);
  
  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <Container maxWidth="lg" className="py-6">
      {/* Page Header */}
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h4" component="h1" className="font-bold">
          Add Energy Record
        </Typography>
        <Button 
          variant="outlined" 
          onClick={loadSampleData}
          size="small"
        >
          Load Sample Data
        </Button>
      </Box>
      
      {/* Form */}
      <Paper elevation={0} className="border p-6 mb-6">
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={4}>
            {/* Year Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="mb-3 font-medium">
                Year
              </Typography>
              <Box className="mb-4">
                <SingleYearPicker
                  initialYear={formData.year}
                  onYearChange={handleYearChange}
                />
                {errors.year && (
                  <Typography variant="caption" color="error" className="mt-1 block">
                    {errors.year}
                  </Typography>
                )}
              </Box>
              
              {/* Projected Data Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    name="isPredicted"
                    checked={formData.isPredicted}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Projected data"
              />
            </Grid>
            
            {/* General error */}
            {errors.general && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error">
                  {errors.general}
                </Typography>
              </Grid>
            )}
            
            {/* Energy Inputs */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="mb-3 font-medium">
                Energy Values
              </Typography>
              
              <Grid container spacing={3}>
                {/* Solar */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="solar"
                    label="Solar Energy (GWh)"
                    value={formData.solar}
                    onChange={handleInputChange}
                    placeholder="Enter solar generation"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.solar}
                    helperText={errors.solar}
                  />
                </Grid>
                
                {/* Wind */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="wind"
                    label="Wind Energy (GWh)"
                    value={formData.wind}
                    onChange={handleInputChange}
                    placeholder="Enter wind generation"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.wind}
                    helperText={errors.wind}
                  />
                </Grid>
                
                {/* Hydro */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="hydro"
                    label="Hydroelectric Energy (GWh)"
                    value={formData.hydro}
                    onChange={handleInputChange}
                    placeholder="Enter hydro generation"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.hydro}
                    helperText={errors.hydro}
                  />
                </Grid>
                
                {/* Geothermal */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="geothermal"
                    label="Geothermal Energy (GWh)"
                    value={formData.geothermal}
                    onChange={handleInputChange}
                    placeholder="Enter geothermal generation"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.geothermal}
                    helperText={errors.geothermal}
                  />
                </Grid>
                
                {/* Biomass */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="biomass"
                    label="Biomass Energy (GWh)"
                    value={formData.biomass}
                    onChange={handleInputChange}
                    placeholder="Enter biomass generation"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.biomass}
                    helperText={errors.biomass}
                  />
                </Grid>
                
                {/* Total Renewable Energy - Auto-calculated and read-only */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="totalRenewable"
                    label="Total Renewable Energy (GWh)"
                    value={formData.totalRenewable}
                    InputProps={{
                      readOnly: true,
                    }}
                    placeholder="Auto-calculated"
                    fullWidth
                    variant="outlined"
                    helperText="Automatically calculated"
                  />
                </Grid>
                
                {/* Non-Renewable Energy */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="nonRenewableEnergy"
                    label="Non-Renewable Energy (GWh)"
                    value={formData.nonRenewableEnergy}
                    onChange={handleInputChange}
                    placeholder="Enter non-renewable energy"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.nonRenewableEnergy}
                    helperText={errors.nonRenewableEnergy}
                  />
                </Grid>
                
                {/* Total Power Generation - Auto-calculated and read-only */}
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    name="totalPower"
                    label="Total Power Generation (GWh)"
                    value={formData.totalPower}
                    InputProps={{
                      readOnly: true,
                    }}
                    placeholder="Auto-calculated"
                    fullWidth
                    variant="outlined"
                    helperText="Automatically calculated"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Additional Data Section */}
            <Grid item xs={12}>
              <Divider className="my-4" />
              <Typography variant="subtitle1" className="mb-3 font-medium">
                Additional Data
              </Typography>
              
              <Grid container spacing={3}>
                {/* Population */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="population"
                    label="Population (in millions)"
                    value={formData.population}
                    onChange={handleInputChange}
                    placeholder="Enter population in millions"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.population}
                    helperText={errors.population}
                  />
                </Grid>
                
                {/* GDP */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="gdp"
                    label="Gross Domestic Product (GDP)"
                    value={formData.gdp}
                    onChange={handleInputChange}
                    placeholder="Enter GDP value"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!errors.gdp}
                    helperText={errors.gdp}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Submission error */}
            {errors.submission && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error">
                  {errors.submission}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          {/* Form Actions */}
          <Box className="mt-8 flex justify-end gap-3">
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              startIcon={<ChevronLeft size={18} />}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              startIcon={<Save size={18} />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Record'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ModelInputPage;
