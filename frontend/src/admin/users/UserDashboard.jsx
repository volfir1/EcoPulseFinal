import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Avatar,
  Card,
  CardContent,
  Chip,
  Button,
  Tooltip, // Keep Tooltip import if used elsewhere, otherwise removable for this specific component
  Divider,
  FormControl,
  InputLabel,
  Select,
  Stack,
  MenuItem,
  TextField
} from '@mui/material';
import { 
  People, 
  TrendingUp, 
  PersonAdd, 
  VerifiedUser, 
  Block,
  CalendarMonth,
  DateRange,
  FilterAlt
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Updated import path
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import PropTypes from 'prop-types';

// Utility function for parsing dates consistently
const parseAndFormatDate = (dateString, formatString = 'MMM d') => {
  if (!dateString) return null;
  
  let parsed;
  // Handle common shortened date format like "Feb 19" - assumes current year
  if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes(',')) {
    const currentYear = new Date().getFullYear();
    parsed = new Date(`${dateString}, ${currentYear}`);
  } else {
    // Try parsing as ISO or other Date-parsable string
    parsed = parseISO(dateString);
     // Fallback if ISO parsing fails but input might be a Date object already
    if (!isValid(parsed) && dateString instanceof Date) {
        parsed = dateString;
    } else if (!isValid(parsed) && typeof dateString === 'string') {
        // Final attempt for other string formats Date might handle
        parsed = new Date(dateString);
    }
  }
  
  // Check validity and format if requested
  return isValid(parsed) ? (formatString ? format(parsed, formatString) : parsed) : null;
};

// Stat Card Component - No responsive changes needed here as layout is handled by parent
export const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card elevation={1} sx={{ borderRadius: '10px', height: '100%' }}> {/* Ensure cards take full height for alignment */}
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexGrow={1}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              fontWeight="bold"
              // Responsive font size for the main statistic value
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, lineHeight: 1.2 }} 
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{ 
              bgcolor: color,
              width: { xs: 48, sm: 56 }, // Slightly smaller avatar on xs screens
              height: { xs: 48, sm: 56 }
            }}
          >
            {/* Ensure icon scales reasonably within Avatar */}
            {React.cloneElement(icon, { fontSize: 'medium' })} 
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired, // Use element for React components/icons
  color: PropTypes.string.isRequired
};


// Enhanced User Dashboard Component with Responsive Adjustments
export const UserDashboard = ({ data }) => {
  // --- State and Data Preparation (largely unchanged) ---
  const stats = data.statistics || {
    totalUsers: '0',
    activeUsers: '0',
    newUsers: '0',
    verifiedUsers: '0',
    deletedUsers: '0'
  };

  const inactiveUsersCount = (parseInt(stats.totalUsers?.replace(/,/g, '') || '0') - parseInt(stats.activeUsers?.replace(/,/g, '') || '0')).toString();

  const originalActivityData = data.activityData && data.activityData.length > 0
    ? data.activityData
    : [ // Default data remains same
        { date: '2023-02-19T00:00:00Z', totalVisits: 7, activeUsers: 4, newUsers: 2 },
        { date: '2023-02-20T00:00:00Z', totalVisits: 5, activeUsers: 3, newUsers: 1 },
        { date: '2023-02-21T00:00:00Z', totalVisits: 6, activeUsers: 4, newUsers: 0 },
        { date: '2023-02-22T00:00:00Z', totalVisits: 6, activeUsers: 3, newUsers: 2 },
        { date: '2023-02-23T00:00:00Z', totalVisits: 8, activeUsers: 4, newUsers: 1 },
        { date: '2023-02-24T00:00:00Z', totalVisits: 10, activeUsers: 4, newUsers: 3 },
        { date: '2023-02-25T00:00:00Z', totalVisits: 4, activeUsers: 3, newUsers: 0 }
      ];
      
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(subMonths(new Date(), 6)), // Default to start of month 6 months ago
    endDate: endOfMonth(new Date()) // Default to end of current month
  });
  
  const [presetRange, setPresetRange] = useState('6months');
  const [filteredData, setFilteredData] = useState([]);
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  const presetRanges = [
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  const handleDateRangeChange = (type, value) => {
    if (type === 'preset') {
      setPresetRange(value);
      
      if (value === 'custom') {
        setIsCustomRange(true);
        // Don't change dates until custom range is applied
        return; 
      }
      
      setIsCustomRange(false);
      const now = new Date();
      let start = now;
      
      switch (value) {
        case '30days': start = subMonths(now, 1); break;
        case '3months': start = subMonths(now, 3); break;
        case '6months': start = subMonths(now, 6); break;
        case '1year': start = subMonths(now, 12); break;
        default: start = subMonths(now, 6); 
      }
      
      setDateRange({
        // Ensure start/end are boundaries of the months for consistency
        startDate: startOfMonth(start),
        endDate: endOfMonth(now) 
      });
    } else if (type === 'start' && isValid(value)) {
      // Ensure start date is start of the selected month
      const newStartDate = startOfMonth(value);
      if (newStartDate <= dateRange.endDate) {
         setDateRange({ ...dateRange, startDate: newStartDate });
      } else {
         // If start is after end, set both to the new start date's month
         setDateRange({ startDate: newStartDate, endDate: endOfMonth(value) });
      }
    } else if (type === 'end' && isValid(value)) {
       // Ensure end date is end of the selected month
      const newEndDate = endOfMonth(value);
      if (newEndDate >= dateRange.startDate) {
         setDateRange({ ...dateRange, endDate: newEndDate });
      } else {
         // If end is before start, set both to the new end date's month
         setDateRange({ startDate: startOfMonth(value), endDate: newEndDate });
      }
    }
  };
  
  const handlePresetChange = (event) => {
    handleDateRangeChange('preset', event.target.value);
  };
  
  // Apply custom range - this triggers the useEffect below
  const applyCustomRange = () => {
     if (!dateRange.startDate || !dateRange.endDate || !isCustomRange) return;
     
     // Trigger effect by ensuring a state update (even if dates didn't change structurally)
     // Or simply let the existing dateRange state change trigger the effect.
     // No explicit action needed here if handleDateRangeChange correctly updated state.
     // If applying custom range should *also* hide the picker, do that here:
     // setIsCustomRange(false); // Optional: hide picker after applying
  };
  
  // Filter activity data based on selected date range
  useEffect(() => {
    if (!originalActivityData?.length || !dateRange.startDate || !dateRange.endDate) {
      setFilteredData([]);
      return;
    }
    
    const rangeStart = dateRange.startDate;
    const rangeEnd = dateRange.endDate;
    
    const filtered = originalActivityData.filter(item => {
      const itemDate = parseAndFormatDate(item.date, null); // Get Date object
      if (!itemDate) return false; // Skip invalid dates
      
      // Use isWithinInterval for accurate date comparison
      return isWithinInterval(itemDate, { start: rangeStart, end: rangeEnd });
    }).sort((a, b) => { // Sort chronologically
      const dateA = parseAndFormatDate(a.date, null);
      const dateB = parseAndFormatDate(b.date, null);
      if (!dateA || !dateB) return 0;
      return dateA - dateB; // Ascending order
    });
    
    setFilteredData(filtered);
    
  }, [originalActivityData, dateRange]); // Rerun when data or range changes
  
  const dateRangeDisplay = dateRange.startDate && dateRange.endDate 
    ? `${format(dateRange.startDate, 'MMM yyyy')} - ${format(dateRange.endDate, 'MMM yyyy')}`
    : 'Select Date Range';
  
  // Calculate statistics for the filtered period
  const totalVisitsInPeriod = filteredData.reduce((sum, item) => sum + (item.totalVisits || 0), 0);
  const totalActiveUsersSum = filteredData.reduce((sum, item) => sum + (item.activeUsers || 0), 0);
  const avgActiveUsersInPeriod = filteredData.length > 0 
    ? Math.round(totalActiveUsersSum / filteredData.length) 
    : 0;
  const totalNewUsersInPeriod = filteredData.reduce((sum, item) => sum + (item.newUsers || 0), 0);

  return (
    // Apply responsive margins to the main container
    <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, paddingX: { xs: 1, sm: 2, md: 0 }}}> 
      <Typography 
        variant="h6" 
        // Responsive margin bottom and font size for the main title
        sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
      >
        User Dashboard
      </Typography>
      
      {/* Statistics Cards Container - Use Box with flexWrap for responsiveness */}
      <Box 
        sx={{ 
          display: 'grid', 
          // Responsive grid columns: 1 on xs, 2 on sm, 3 on md, 5 on lg
          gridTemplateColumns: { 
             xs: 'repeat(1, 1fr)', 
             sm: 'repeat(2, 1fr)', 
             md: 'repeat(3, 1fr)',
             lg: 'repeat(5, 1fr)',
          },
          // Responsive gap between cards
          gap: { xs: 2, md: 3 }, 
          mb: { xs: 3, md: 4 } 
        }}
      >
        {/* Removed flex: '1 1 200px' - Grid handles sizing */}
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<People sx={{ color: "white" }} />}
          color="#34a853"
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={<TrendingUp sx={{ color: "white" }} />}
          color="#8bc34a"
        />
        <StatCard 
          title="New Users" 
          value={stats.newUsers} 
          icon={<PersonAdd sx={{ color: "white" }} />}
          color="#2196f3"
        />
        <StatCard 
          title="Verified Users" 
          value={stats.verifiedUsers} 
          icon={<VerifiedUser sx={{ color: "white" }} />}
          color="#ffc107"
        />
        <StatCard 
          title="Inactive Users" 
          value={inactiveUsersCount} 
          icon={<Block sx={{ color: "white" }} />}
          color="#f44336"
        />
      </Box>
      
      {/* Enhanced User Activity Chart */}
      <Paper elevation={1} sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: '4px' }}>
        {/* Chart Header - Title and Preset Selector */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            // Responsive margin bottom, allow wrapping, add gap when wrapped
            mb: { xs: 2, sm: 3 }, 
            flexWrap: 'wrap', 
            gap: 2 
          }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            User Activity
          </Typography>
          
          {/* Preset Date Range Selector */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}> {/* Full width on xs */}
            <InputLabel id="date-range-preset-label">Time Period</InputLabel>
            <Select
              labelId="date-range-preset-label"
              value={presetRange}
              label="Time Period"
              onChange={handlePresetChange}
              startAdornment={<CalendarMonth fontSize="small" sx={{ mr: 1, color: 'action.active' }} />} // Added color
            >
              {presetRanges.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Custom Date Range Picker - Conditionally Rendered */}
        {isCustomRange && (
          <Box sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 }, bgcolor: 'grey.100', borderRadius: 1 }}> 
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {/* Use Stack for responsive layout of date pickers and button */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems="center"
              >
                <DatePicker
                  label="Start Month"
                  views={['year', 'month']}
                  value={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange('start', date)}
                  maxDate={dateRange.endDate} // Prevent start > end
                  renderInput={(params) => <TextField size="small" {...params} fullWidth />} // Ensure text field takes space
                />
                
                <DatePicker
                  label="End Month"
                  views={['year', 'month']}
                  value={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange('end', date)}
                  minDate={dateRange.startDate} // Prevent end < start
                  renderInput={(params) => <TextField size="small" {...params} fullWidth />} // Ensure text field takes space
                />
                
                {/* Apply button styling */}
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={applyCustomRange} 
                  startIcon={<FilterAlt />}
                  // Full width on xs, auto on larger screens
                  sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 1, sm: 0 } }} 
                >
                  Apply
                </Button>
              </Stack>
            </LocalizationProvider>
          </Box>
        )}
        
        {/* Divider and Date Range Display Chip */}
        <Divider sx={{ mb: 2 }}>
          <Chip 
            icon={<DateRange />} 
            label={dateRangeDisplay} 
            color="primary" 
            variant="outlined" 
            size="small" // Make chip slightly smaller
          />
        </Divider>
        
        {/* Period Statistics - Use Stack for responsive layout */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} // Column on mobile, row otherwise
          spacing={{ xs: 1, sm: 2 }} // Adjust spacing based on direction
          justifyContent="space-around" 
          alignItems="center" // Center items when stacked vertically
          sx={{ mb: { xs: 2, sm: 3 }, textAlign: { xs: 'center', sm: 'left' } }} // Center text on mobile
        >
          <Typography variant="body2" color="text.secondary">
            Total Visits: <strong>{totalVisitsInPeriod}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg. Active Users: <strong>{avgActiveUsersInPeriod}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New Users: <strong>{totalNewUsersInPeriod}</strong>
          </Typography>
        </Stack>
        
        {/* Chart Display Area */}
        <Box sx={{ height: { xs: 250, sm: 300 } }}> {/* Responsive height for chart */}
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{
                  top: 5,  // Reduced top margin
                  right: 20, // Reduced right margin slightly
                  left: -20,  // Reduced left margin to save space (adjust if Y-axis labels are cut off)
                  bottom: 5, // Reduced bottom margin
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  // Format ticks, adjust angle/interval on smaller screens if needed
                  tickFormatter={(value) => parseAndFormatDate(value)} 
                  // Optional: Improve tick display on small screens
                  // angle={-30} textAnchor="end" height={50} interval="preserveStartEnd"
                   tick={{ fontSize: 10 }} // Smaller font size for ticks
                   
                />
                <YAxis tick={{ fontSize: 10 }} /> 
                <RechartsTooltip 
                  formatter={(value, name) => [`${value}`, name]} // Tooltip value formatting
                  labelFormatter={(label) => parseAndFormatDate(label, 'MMM d, yyyy') || label} // Tooltip label formatting
                   // Style tooltip for better readability
                  contentStyle={{ fontSize: '0.8rem', padding: '5px' }} 
                  itemStyle={{ padding: '2px 0' }}
                />
                 <Legend 
                   wrapperStyle={{ 
                      position: 'relative', 
                      marginTop: '10px', 
                      fontSize: '0.8rem', // Smaller legend font
                      marginLeft: "-10px" // Adjust legend position
                    }} 
                   iconSize={10} // Smaller legend icons
                 />
                <Line 
                  type="monotone" 
                  dataKey="totalVisits" 
                  name="Total Visits" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  dot={false} // Hide dots by default for cleaner look
                  activeDot={{ r: 5 }} // Keep active dot noticeable
                />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Active Users" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  name="New Users" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            // Message when no data is available for the period
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No activity data available for the selected time period
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// PropTypes validation for UserDashboard
UserDashboard.propTypes = {
  data: PropTypes.shape({
    statistics: PropTypes.shape({
      totalUsers: PropTypes.string,
      activeUsers: PropTypes.string,
      newUsers: PropTypes.string,
      verifiedUsers: PropTypes.string,
      deletedUsers: PropTypes.string
    }),
    // Ensure activityData items match the expected structure if possible
    activityData: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      totalVisits: PropTypes.number,
      activeUsers: PropTypes.number,
      newUsers: PropTypes.number
    }))
  }).isRequired
};

export default UserDashboard; // Keep default export if this is the main component of the file