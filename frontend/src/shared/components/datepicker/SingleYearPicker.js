// SingleYearPicker.jsx
import React, { useState, useCallback } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Typography, IconButton } from '@mui/material';
import { RefreshCcw } from 'lucide-react';
import dayjs from 'dayjs';

// Styles for the date picker
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

export const SingleYearPicker = ({
  initialYear = dayjs().year(),
  onYearChange,
}) => {
  // State management
  const [singleYear, setSingleYear] = useState(dayjs(initialYear.toString()));
  const [error, setError] = useState(false);

  // Handler for year change
  const handleYearChange = useCallback((newValue) => {
    if (!newValue || !newValue.isValid()) {
      setError(true);
      return;
    }
    setError(false);
    setSingleYear(newValue);
    onYearChange?.(newValue.year());
  }, [onYearChange]);

  // Reset handler
  const handleReset = useCallback(() => {
    const currentYear = dayjs().year();
    const defaultYear = dayjs(currentYear.toString());
    
    setSingleYear(defaultYear);
    onYearChange?.(defaultYear.year());
    setError(false);
  }, [onYearChange]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DatePicker
            views={['year']}
            value={singleYear}
            onChange={handleYearChange}
            slotProps={{
              textField: {
                sx: getPickerStyles(error),
                inputProps: {
                  placeholder: 'Year'
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
        </Box>
        
        {error && (
          <Typography variant="caption" color="error">
            Invalid year
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default SingleYearPicker;