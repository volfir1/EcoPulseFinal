import { useState, useEffect } from 'react';
import api from '../../features/modules/api';

export const usePeerForm = (initialRecord = {}) => {
  const [formValues, setFormValues] = useState({
    // Cebu
    "Cebu Geothermal (GWh)": '',
    "Cebu Hydro (GWh)": '',
    "Cebu Biomass (GWh)": '',
    "Cebu Solar (GWh)": '',
    "Cebu Wind (GWh)": '',
    "Cebu Total Renewable Energy (GWh)": '',
    "Cebu Total Non-Renewable Energy (GWh)": '',
    "Cebu Total Power Generation (GWh)": '',
    
    // Negros
    "Negros Geothermal (GWh)": '',
    "Negros Hydro (GWh)": '',
    "Negros Biomass (GWh)": '',
    "Negros Solar (GWh)": '',
    "Negros Wind (GWh)": '',
    "Negros Total Renewable Energy (GWh)": '',
    "Negros Total Non-Renewable Energy (GWh)": '',
    "Negros Total Power Generation (GWh)": '',
    
    // Panay
    "Panay Geothermal (GWh)": '',
    "Panay Hydro (GWh)": '',
    "Panay Biomass (GWh)": '',
    "Panay Solar (GWh)": '',
    "Panay Wind (GWh)": '',
    "Panay Total Renewable Energy (GWh)": '',
    "Panay Total Non-Renewable Energy (GWh)": '',
    "Panay Total Power Generation (GWh)": '',
    
    // Leyte-Samar
    "Leyte-Samar Geothermal (GWh)": '',
    "Leyte-Samar Hydro (GWh)": '',
    "Leyte-Samar Biomass (GWh)": '',
    "Leyte-Samar Solar (GWh)": '',
    "Leyte-Samar Wind (GWh)": '',
    "Leyte-Samar Total Renewable (GWh)": '',
    "Leyte-Samar Total Non-Renewable (GWh)": '',
    "Leyte-Samar Total Power Generation (GWh)": '',
    
    // Bohol
    "Bohol Geothermal (GWh)": '',
    "Bohol Hydro (GWh)": '',
    "Bohol Biomass (GWh)": '',
    "Bohol Solar (GWh)": '',
    "Bohol Wind (GWh)": '',
    "Bohol Total Renewable (GWh)": '',
    "Bohol Total Non-Renewable (GWh)": '',
    "Bohol Total Power Generation (GWh)": '',
    
    // Visayas
    "Visayas Total Power Generation (GWh)": '',
    "Visayas Total Power Consumption (GWh)": '',
    
    // Recommendation Parameters
    "Solar Cost (PHP/W)": '',
    "MERALCO Rate (PHP/kWh)": '',
    
    // Year
    year: new Date().getFullYear()
  });

  const resetForm = () => {
    setFormValues({
      // Reset all fields to empty strings
      "Cebu Geothermal (GWh)": '',
      "Cebu Hydro (GWh)": '',
      "Cebu Biomass (GWh)": '',
      "Cebu Solar (GWh)": '',
      "Cebu Wind (GWh)": '',
      "Cebu Total Renewable Energy (GWh)": '',
      "Cebu Total Non-Renewable Energy (GWh)": '',
      "Cebu Total Power Generation (GWh)": '',
      
      // ... reset all other fields
      "Negros Geothermal (GWh)": '',
      "Negros Hydro (GWh)": '',
      "Negros Biomass (GWh)": '',
      "Negros Solar (GWh)": '',
      "Negros Wind (GWh)": '',
      "Negros Total Renewable Energy (GWh)": '',
      "Negros Total Non-Renewable Energy (GWh)": '',
      "Negros Total Power Generation (GWh)": '',
      
      "Panay Geothermal (GWh)": '',
      "Panay Hydro (GWh)": '',
      "Panay Biomass (GWh)": '',
      "Panay Solar (GWh)": '',
      "Panay Wind (GWh)": '',
      "Panay Total Renewable Energy (GWh)": '',
      "Panay Total Non-Renewable Energy (GWh)": '',
      "Panay Total Power Generation (GWh)": '',
      
      "Leyte-Samar Geothermal (GWh)": '',
      "Leyte-Samar Hydro (GWh)": '',
      "Leyte-Samar Biomass (GWh)": '',
      "Leyte-Samar Solar (GWh)": '',
      "Leyte-Samar Wind (GWh)": '',
      "Leyte-Samar Total Renewable (GWh)": '',
      "Leyte-Samar Total Non-Renewable (GWh)": '',
      "Leyte-Samar Total Power Generation (GWh)": '',
      
      "Bohol Geothermal (GWh)": '',
      "Bohol Hydro (GWh)": '',
      "Bohol Biomass (GWh)": '',
      "Bohol Solar (GWh)": '',
      "Bohol Wind (GWh)": '',
      "Bohol Total Renewable (GWh)": '',
      "Bohol Total Non-Renewable (GWh)": '',
      "Bohol Total Power Generation (GWh)": '',
      
      "Visayas Total Power Generation (GWh)": '',
      "Visayas Total Power Consumption (GWh)": '',
      
      "Solar Cost (PHP/W)": '',
      "MERALCO Rate (PHP/kWh)": '',
      
      year: new Date().getFullYear()
    });
  };

  const setFormValue = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to calculate regional renewable energy totals
  const calculateRenewableEnergy = (region) => {
    const geothermal = parseFloat(formValues[`${region} Geothermal (GWh)`]) || 0;
    const hydro = parseFloat(formValues[`${region} Hydro (GWh)`]) || 0;
    const biomass = parseFloat(formValues[`${region} Biomass (GWh)`]) || 0;
    const solar = parseFloat(formValues[`${region} Solar (GWh)`]) || 0;
    const wind = parseFloat(formValues[`${region} Wind (GWh)`]) || 0;

    const total = geothermal + hydro + biomass + solar + wind;
    
    // Make field name consistent for all regions
    const fieldName = region === 'Leyte-Samar' || region === 'Bohol'
      ? `${region} Total Renewable (GWh)`
      : `${region} Total Renewable Energy (GWh)`;
    
    setFormValue(fieldName, total.toFixed(2));
  };
  
  // Function to calculate total power generation
  const calculateTotalGeneration = (region) => {
    // Make field name consistent for all regions
    const renewableField = region === 'Leyte-Samar' || region === 'Bohol'
      ? `${region} Total Renewable (GWh)`
      : `${region} Total Renewable Energy (GWh)`;
    
    const nonRenewableField = region === 'Leyte-Samar' || region === 'Bohol'
      ? `${region} Total Non-Renewable (GWh)`
      : `${region} Total Non-Renewable Energy (GWh)`;
      
    const renewable = parseFloat(formValues[renewableField]) || 0;
    const nonRenewable = parseFloat(formValues[nonRenewableField]) || 0;
    
    const total = renewable + nonRenewable;
    setFormValue(`${region} Total Power Generation (GWh)`, total.toFixed(2));
  };

  // Function to calculate Visayas total power generation
  const calculateVisayasTotal = () => {
    const cebuTotal = parseFloat(formValues["Cebu Total Power Generation (GWh)"]) || 0;
    const negrosTotal = parseFloat(formValues["Negros Total Power Generation (GWh)"]) || 0;
    const panayTotal = parseFloat(formValues["Panay Total Power Generation (GWh)"]) || 0;
    const leyteSamarTotal = parseFloat(formValues["Leyte-Samar Total Power Generation (GWh)"]) || 0;
    const boholTotal = parseFloat(formValues["Bohol Total Power Generation (GWh)"]) || 0;
    
    const total = cebuTotal + negrosTotal + panayTotal + leyteSamarTotal + boholTotal;
    setFormValue("Visayas Total Power Generation (GWh)", total.toFixed(2));
  };

  // Function to handle form submission
  const handleSubmit = async (isEditing = false) => {
    try {
      // Prepare the data to be sent
      const formattedData = {
        Year: formValues.year,
        // Cebu region data
        "Cebu Total Power Generation (GWh)": formValues["Cebu Total Power Generation (GWh)"],
        "Cebu Total Renewable Energy (GWh)": formValues["Cebu Total Renewable Energy (GWh)"],
        "Cebu Total Non-Renewable Energy (GWh)": formValues["Cebu Total Non-Renewable Energy (GWh)"],
        "Cebu Geothermal (GWh)": formValues["Cebu Geothermal (GWh)"],
        "Cebu Hydro (GWh)": formValues["Cebu Hydro (GWh)"],
        "Cebu Biomass (GWh)": formValues["Cebu Biomass (GWh)"],
        "Cebu Solar (GWh)": formValues["Cebu Solar (GWh)"],
        "Cebu Wind (GWh)": formValues["Cebu Wind (GWh)"],
        
        // Negros region data
        "Negros Total Power Generation (GWh)": formValues["Negros Total Power Generation (GWh)"],
        "Negros Total Renewable Energy (GWh)": formValues["Negros Total Renewable Energy (GWh)"],
        "Negros Total Non-Renewable Energy (GWh)": formValues["Negros Total Non-Renewable Energy (GWh)"],
        "Negros Geothermal (GWh)": formValues["Negros Geothermal (GWh)"],
        "Negros Hydro (GWh)": formValues["Negros Hydro (GWh)"],
        "Negros Biomass (GWh)": formValues["Negros Biomass (GWh)"],
        "Negros Solar (GWh)": formValues["Negros Solar (GWh)"],
        "Negros Wind (GWh)": formValues["Negros Wind (GWh)"],
        
        // Panay region data
        "Panay Total Power Generation (GWh)": formValues["Panay Total Power Generation (GWh)"],
        "Panay Total Renewable Energy (GWh)": formValues["Panay Total Renewable Energy (GWh)"],
        "Panay Total Non-Renewable Energy (GWh)": formValues["Panay Total Non-Renewable Energy (GWh)"],
        "Panay Geothermal (GWh)": formValues["Panay Geothermal (GWh)"],
        "Panay Hydro (GWh)": formValues["Panay Hydro (GWh)"],
        "Panay Biomass (GWh)": formValues["Panay Biomass (GWh)"],
        "Panay Solar (GWh)": formValues["Panay Solar (GWh)"],
        "Panay Wind (GWh)": formValues["Panay Wind (GWh)"],
        
        // Leyte-Samar region data
        "Leyte-Samar Total Power Generation (GWh)": formValues["Leyte-Samar Total Power Generation (GWh)"],
        "Leyte-Samar Total Renewable (GWh)": formValues["Leyte-Samar Total Renewable (GWh)"],
        "Leyte-Samar Total Non-Renewable (GWh)": formValues["Leyte-Samar Total Non-Renewable (GWh)"],
        "Leyte-Samar Geothermal (GWh)": formValues["Leyte-Samar Geothermal (GWh)"],
        "Leyte-Samar Hydro (GWh)": formValues["Leyte-Samar Hydro (GWh)"],
        "Leyte-Samar Biomass (GWh)": formValues["Leyte-Samar Biomass (GWh)"],
        "Leyte-Samar Solar (GWh)": formValues["Leyte-Samar Solar (GWh)"],
        "Leyte-Samar Wind (GWh)": formValues["Leyte-Samar Wind (GWh)"],
        
        // Bohol region data
        "Bohol Total Power Generation (GWh)": formValues["Bohol Total Power Generation (GWh)"],
        "Bohol Total Renewable (GWh)": formValues["Bohol Total Renewable (GWh)"],
        "Bohol Total Non-Renewable (GWh)": formValues["Bohol Total Non-Renewable (GWh)"],
        "Bohol Geothermal (GWh)": formValues["Bohol Geothermal (GWh)"],
        "Bohol Hydro (GWh)": formValues["Bohol Hydro (GWh)"],
        "Bohol Biomass (GWh)": formValues["Bohol Biomass (GWh)"],
        "Bohol Solar (GWh)": formValues["Bohol Solar (GWh)"],
        "Bohol Wind (GWh)": formValues["Bohol Wind (GWh)"],
        
        // Visayas total
        "Visayas Total Power Generation (GWh)": formValues["Visayas Total Power Generation (GWh)"],
        "Visayas Total Power Consumption (GWh)": formValues["Visayas Total Power Consumption (GWh)"],
        
        // Recommendation parameters
        "Solar Cost (PHP/W)": formValues["Solar Cost (PHP/W)"],
        "MERALCO Rate (PHP/kWh)": formValues["MERALCO Rate (PHP/kWh)"],
      };

      // Determine if this is an edit or a new record
      if (isEditing) {
        // Update an existing record
        const response = await api.put(`/api/update/${formValues.year}/`, formattedData);
        console.log('Record updated successfully:', response.data);
        return {
          success: true,
          message: 'Record updated successfully',
          data: response.data
        };
      } else {
        // Create a new record
        const response = await api.post('/api/create/peertopeer/', formattedData);
        console.log('Record created successfully:', response.data);
        return {
          success: true,
          message: 'Record created successfully',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred while saving the record',
        error
      };
    }
  };

  // Effect hooks to auto-calculate values when dependencies change
  useEffect(() => {
    calculateRenewableEnergy('Cebu');
  }, [
    formValues["Cebu Geothermal (GWh)"],
    formValues["Cebu Hydro (GWh)"],
    formValues["Cebu Biomass (GWh)"],
    formValues["Cebu Solar (GWh)"],
    formValues["Cebu Wind (GWh)"]
  ]);

  useEffect(() => {
    calculateRenewableEnergy('Negros');
  }, [
    formValues["Negros Geothermal (GWh)"],
    formValues["Negros Hydro (GWh)"],
    formValues["Negros Biomass (GWh)"],
    formValues["Negros Solar (GWh)"],
    formValues["Negros Wind (GWh)"]
  ]);

  useEffect(() => {
    calculateRenewableEnergy('Panay');
  }, [
    formValues["Panay Geothermal (GWh)"],
    formValues["Panay Hydro (GWh)"],
    formValues["Panay Biomass (GWh)"],
    formValues["Panay Solar (GWh)"],
    formValues["Panay Wind (GWh)"]
  ]);

  useEffect(() => {
    calculateRenewableEnergy('Leyte-Samar');
  }, [
    formValues["Leyte-Samar Geothermal (GWh)"],
    formValues["Leyte-Samar Hydro (GWh)"],
    formValues["Leyte-Samar Biomass (GWh)"],
    formValues["Leyte-Samar Solar (GWh)"],
    formValues["Leyte-Samar Wind (GWh)"]
  ]);

  useEffect(() => {
    calculateRenewableEnergy('Bohol');
  }, [
    formValues["Bohol Geothermal (GWh)"],
    formValues["Bohol Hydro (GWh)"],
    formValues["Bohol Biomass (GWh)"],
    formValues["Bohol Solar (GWh)"],
    formValues["Bohol Wind (GWh)"]
  ]);

  // Calculate total power generation when renewable or non-renewable changes
  useEffect(() => {
    calculateTotalGeneration('Cebu');
  }, [
    formValues["Cebu Total Renewable Energy (GWh)"],
    formValues["Cebu Total Non-Renewable Energy (GWh)"]
  ]);

  useEffect(() => {
    calculateTotalGeneration('Negros');
  }, [
    formValues["Negros Total Renewable Energy (GWh)"],
    formValues["Negros Total Non-Renewable Energy (GWh)"]
  ]);

  useEffect(() => {
    calculateTotalGeneration('Panay');
  }, [
    formValues["Panay Total Renewable Energy (GWh)"],
    formValues["Panay Total Non-Renewable Energy (GWh)"]
  ]);

  useEffect(() => {
    calculateTotalGeneration('Leyte-Samar');
  }, [
    formValues["Leyte-Samar Total Renewable (GWh)"],
    formValues["Leyte-Samar Total Non-Renewable (GWh)"]
  ]);

  useEffect(() => {
    calculateTotalGeneration('Bohol');
  }, [
    formValues["Bohol Total Renewable (GWh)"],
    formValues["Bohol Total Non-Renewable (GWh)"]
  ]);

  // Calculate Visayas total when any regional total changes
  useEffect(() => {
    calculateVisayasTotal();
  }, [
    formValues["Cebu Total Power Generation (GWh)"],
    formValues["Negros Total Power Generation (GWh)"],
    formValues["Panay Total Power Generation (GWh)"],
    formValues["Leyte-Samar Total Power Generation (GWh)"],
    formValues["Bohol Total Power Generation (GWh)"]
  ]);

  return {
    formValues,
    setFormValue,
    resetForm,
    handleSubmit
  };
};
