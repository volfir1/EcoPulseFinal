// src/shared/hooks/useYearPicker.js
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

/**
 * @typedef {import('dayjs').Dayjs} Dayjs
 */

/**
 * Hook to manage a year range selection.
 * @param {object} options - Configuration options.
 * @param {number} [options.initialStartYear=2025] - The initial start year.
 * @param {number} [options.initialEndYear=2030] - The initial end year.
 * @returns {{
 *   startYear: Dayjs,
 *   endYear: Dayjs,
 *   error: boolean,
 *   handleStartYearChange: (newValue: Dayjs | null) => void,
 *   handleEndYearChange: (newValue: Dayjs | null) => void,
 *   handleReset: () => void
 * }} - State and handlers for the year picker.
 */
export const useYearPicker = ({
  initialStartYear = 2025,
  initialEndYear = 2030,
}) => {
  const [startYear, setStartYear] = useState(dayjs().year(initialStartYear));
  const [endYear, setEndYear] = useState(dayjs().year(initialEndYear));
  const [error, setError] = useState(false);

  const validateRange = useCallback((start, end) => {
    if (!start || !start.isValid() || !end || !end.isValid() || end.year() < start.year()) {
      setError(true);
      return false;
    }
    setError(false);
    return true;
  }, []);

  const handleStartYearChange = useCallback((newValue) => {
    const dayjsValue = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);

    if (!dayjsValue || !dayjsValue.isValid()) {
      setError(true); // Indicate error if date is invalid
      // Optionally set startYear to null or keep previous valid state? Depends on UX preference.
      // setStartYear(null);
      return;
    }

    if (validateRange(dayjsValue, endYear)) {
      setStartYear(dayjsValue);
    } else {
        // If only the start year change causes invalidity, update it but keep error=true
        setStartYear(dayjsValue);
        setError(true);
    }
  }, [endYear, validateRange]);

  const handleEndYearChange = useCallback((newValue) => {
    const dayjsValue = dayjs.isDayjs(newValue) ? newValue : dayjs(newValue);

    if (!dayjsValue || !dayjsValue.isValid()) {
       setError(true); // Indicate error if date is invalid
       // setEndYear(null);
       return;
    }

    if (validateRange(startYear, dayjsValue)) {
      setEndYear(dayjsValue);
    } else {
        // If only the end year change causes invalidity, update it but keep error=true
        setEndYear(dayjsValue);
        setError(true);
    }
  }, [startYear, validateRange]);

  const handleReset = useCallback(() => {
    const defaultStartYear = dayjs().year(initialStartYear);
    const defaultEndYear = dayjs().year(initialEndYear);

    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
    setError(false); // Reset error state
  }, [initialStartYear, initialEndYear]);

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