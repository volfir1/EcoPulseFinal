// YearRangePicker.jsx - Updated with 2025-2030 defaults and mock data indicator
import React, { useState, useCallback } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import { RefreshCcw, InfoIcon } from 'lucide-react';
import dayjs from 'dayjs';

// Styles for the date pickers
const getPickerStyles = (error) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    width: '120px',
    height: '40px',
    background: '#fff',
    border: error ? '1px solid #d32f2f' : 'none',
    '&:hover': {
      borderColor: error ? '#d32f2f' : 'primary.main',
    },
  },
});

export const YearRangePicker = ({
  // Set default start year to 2025 and end year to 2030
  initialStartYear = 2025,
  initialEndYear = 2030,
  onStartYearChange,
  onEndYearChange,
  usingMockData = false, // New prop to indicate if we're using mock data
}) => {
  // State management - create proper dayjs objects from the year values
  const [startYear, setStartYear] = useState(dayjs().year(initialStartYear));
  const [endYear, setEndYear] = useState(dayjs().year(initialEndYear));
  const [error, setError] = useState(false);

  // Handlers for year changes
  const handleStartYearChange = useCallback((newValue) => {
    if (!newValue || !newValue.isValid()) {
      setError(true);
      return;
    }
    setError(false);
    setStartYear(newValue);
    onStartYearChange?.(newValue.year());
  }, [onStartYearChange]);

  const handleEndYearChange = useCallback((newValue) => {
    if (!newValue || !newValue.isValid()) {
      setError(true);
      return;
    }
    
    // Validate that end year is after start year
    if (newValue.year() < startYear.year()) {
      setError(true);
      return;
    }
    
    setError(false);
    setEndYear(newValue);
    onEndYearChange?.(newValue.year());
  }, [onEndYearChange, startYear]);

  // Reset handler - resets to 2025 and 2030
  const handleReset = useCallback(() => {
    const defaultStartYear = dayjs().year(2025);
    const defaultEndYear = dayjs().year(2030);
    
    setStartYear(defaultStartYear);
    setEndYear(defaultEndYear);
    onStartYearChange?.(defaultStartYear.year());
    onEndYearChange?.(defaultEndYear.year());
    setError(false);
  }, [onStartYearChange, onEndYearChange]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DatePicker
            views={['year']}
            value={startYear}
            onChange={handleStartYearChange}
            slotProps={{
              textField: {
                sx: getPickerStyles(error),
                inputProps: {
                  placeholder: 'Start Year'
                },
                size: "small",
                format: 'YYYY'
              }
            }}
          />

          <Typography variant="body2">to</Typography>

          <DatePicker
            views={['year']}
            value={endYear}
            onChange={handleEndYearChange}
            slotProps={{
              textField: {
                sx: getPickerStyles(error),
                inputProps: {
                  placeholder: 'End Year'
                },
                size: "small",
                format: 'YYYY'
              }
            }}
          />

          <IconButton 
            onClick={handleReset} 
            size="small"
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.main',
              },
              width: 36,
              height: 36
            }}
          >
            <RefreshCcw size={16} />
          </IconButton>
          
          {usingMockData && (
            <Tooltip title="Using simulated data. Some server data may not be available for this date range.">
              <Chip 
                label="Simulation" 
                size="small"
                color="warning"
                variant="outlined"
                icon={<InfoIcon size={14} />}
                sx={{ height: 24 }}
              />
            </Tooltip>
          )}
        </Box>
        
        {error && (
          <Typography variant="caption" color="error">
            Invalid year range
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default YearRangePicker;