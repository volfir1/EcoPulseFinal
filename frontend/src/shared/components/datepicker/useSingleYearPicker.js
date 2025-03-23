// useSingleYearPicker.js - FIXED
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

export const useSingleYearPicker = ({
  initialYear = 2025,
  onYearChange
}) => {
  const [year, setYear] = useState(dayjs().year(initialYear));
  const [error, setError] = useState(false);

  const handleYearChange = useCallback((newValue) => {
    if (!newValue || !newValue.isValid()) {
      setError(true);
      return;
    }
    setError(false);
    setYear(newValue);
    onYearChange?.(newValue.year());
  }, [onYearChange]);

  const handleReset = useCallback(() => {
    const defaultYear = dayjs().year(2025);
    
    setYear(defaultYear);
    onYearChange?.(defaultYear.year());
    setError(false);
  }, [onYearChange]);

  return {
    year,
    error,
    handleYearChange,
    handleReset
  };
};

export default useSingleYearPicker;