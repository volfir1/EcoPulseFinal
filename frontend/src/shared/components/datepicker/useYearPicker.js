// useYearPicker.js - FIXED
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

export const useYearPicker = ({
  // Set default start year to 2025 and end year to 2030
  initialStartYear = 2025,
  initialEndYear = 2030,
  onStartYearChange,
  onEndYearChange
}) => {
  // Use provided values or fallback to defaults
  const [startYear, setStartYear] = useState(dayjs().year(initialStartYear));
  const [endYear, setEndYear] = useState(dayjs().year(initialEndYear));
  const [error, setError] = useState(false);

  const handleStartYearChange = useCallback((newValue) => {
    const dayjsValue = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue)
  
    if (!dayjsValue || !dayjsValue.isValid()) {
      setError(true);
      return;
    }
    //getYearValue
    const year = dayjsValue.year()

    setLoading(true);
    setYearRange(prev => ({ ...prev, startYear: year}))
    setError(false);
    setStartYear(dayjsValue);
    onStartYearChange?.(year);
  }, [onStartYearChange]);

  const handleEndYearChange = useCallback((newValue) => {
    const dayjsValue = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);

    if (!dayjsValue || !dayjsValue.isValid()) {
      setError(true);
      return;
    }
    
    const year = dayjsValue.year()

    // Validate that end year is after start year
    if (dayjsValue.year() < startYear.year()) {
      setError(true);
      return;
    }
    
    setLoading(true)
    setYearRange(prev => ({ ...prev, endYear: year}))
    setError(false);
    setEndYear(dayjsValue);
    onEndYearChange?.(year);
  }, [onEndYearChange, startYear]);

  // Reset handler - now resets to 2025 and 2030
  const handleReset = useCallback(() => {
    const defaultStartYear = dayjs().year(2025);
    const defaultEndYear = dayjs().year(2030);
    
    setLoading(true)
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
    setYearRange({
      startYear: 2025,
      endYear: 2030
    })
    onStartYearChange?.(defaultStartYear.year());
    onEndYearChange?.(defaultEndYear.year());
    setError(false);
  }, [onStartYearChange, onEndYearChange]);

  return {
    startYear,
    endYear,
    error,
    handleStartYearChange,
    handleEndYearChange,
    handleReset
  };
};

export default useYearPicker;
