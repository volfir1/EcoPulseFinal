// recommendationsHook.js
import { useState, useEffect } from 'react';
import { useSnackbar } from '@shared/index';
import dayjs from 'dayjs';
import { initialData } from './data';

export const useRecommendations = () => {
  const toast = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(dayjs(initialData.cityData.year));
  const [cityData, setCityData] = useState(initialData.cityData);
  const [projections, setProjections] = useState(initialData.projections);
  const [costBenefits, setCostBenefits] = useState(initialData.costBenefits);
  const [energyPotential, setEnergyPotential] = useState(initialData.energyPotential);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call - this would be replaced with actual data fetching in production
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, you would update state with the fetched data
        // setCityData(response.data.cityData);
        // setProjections(response.data.projections);
        // etc.
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch recommendations data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (newValue) => {
    if (!newValue || !newValue.isValid()) return;
    setYear(newValue);
    setCityData(prev => ({
      ...prev,
      year: newValue.year().toString()
    }));
  };

  const handleDownloadPDF = () => {
    try {
      setIsLoading(true);
      toast.info('Preparing PDF download...');
      
      // Simulate PDF generation
      setTimeout(() => {
        setIsLoading(false);
        toast.success('PDF downloaded successfully!');
      }, 2000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
      setIsLoading(false);
    }
  };

  return {
    cityData,
    projections,
    costBenefits,
    energyPotential,
    handleDownloadPDF,
    year,
    handleYearChange,
    isLoading,
    setIsLoading
  };
};