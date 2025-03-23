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
  Tooltip,
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
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import PropTypes from 'prop-types';

// Utility function for parsing dates consistently - reduces code duplication
const parseAndFormatDate = (dateString, formatString = 'MMM d') => {
  if (!dateString) return null;
  
  // Handle "Feb 19" format
  if (dateString.includes(' ')) {
    const [month, day] = dateString.split(' ');
    const currentYear = new Date().getFullYear();
    const fullDate = `${month} ${day}, ${currentYear}`;
    const parsed = new Date(fullDate);
    return formatString ? format(parsed, formatString) : parsed;
  }
  
  // For ISO strings or other formats
  const parsed = parseISO(dateString);
  return isValid(parsed) ? (formatString ? format(parsed, formatString) : parsed) : null;
};

// Stat Card Component
export const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card elevation={1} sx={{ borderRadius: '10px' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{ 
              bgcolor: color,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Enhanced User Dashboard Component with Date Range Selection
export const UserDashboard = ({ data }) => {
  // Get statistics from data or use defaults
  const stats = data.statistics || {
    totalUsers: '0',
    activeUsers: '0',
    newUsers: '0',
    verifiedUsers: '0',
    deletedUsers: '0'
  };

  // Calculate inactive users by including deleted users
  const inactiveUsersCount = parseInt(stats.totalUsers.replace(/,/g, '')) - parseInt(stats.activeUsers.replace(/,/g, ''));

  // Format activity data for chart
  const originalActivityData = data.activityData && data.activityData.length > 0
    ? data.activityData
    : [
        { date: 'Feb 19', totalVisits: 7, activeUsers: 4, newUsers: 2 },
        { date: 'Feb 20', totalVisits: 5, activeUsers: 3, newUsers: 1 },
        { date: 'Feb 21', totalVisits: 6, activeUsers: 4, newUsers: 0 },
        { date: 'Feb 22', totalVisits: 6, activeUsers: 3, newUsers: 2 },
        { date: 'Feb 23', totalVisits: 8, activeUsers: 4, newUsers: 1 },
        { date: 'Feb 24', totalVisits: 10, activeUsers: 4, newUsers: 3 },
        { date: 'Feb 25', totalVisits: 4, activeUsers: 3, newUsers: 0 }
      ];
      
  // Default to showing the last 6 months
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date()
  });
  
  const [presetRange, setPresetRange] = useState('6months');
  const [filteredData, setFilteredData] = useState(originalActivityData);
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  // Prepare preset range options
  const presetRanges = [
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  // Simplified date range handler - reduces code duplication
  const handleDateRangeChange = (type, value) => {
    if (type === 'preset') {
      setPresetRange(value);
      
      if (value === 'custom') {
        setIsCustomRange(true);
        return;
      }
      
      setIsCustomRange(false);
      
      const now = new Date();
      let start = now;
      
      // Mapping of preset values to month counts
      const presetMonths = {
        '30days': 1,
        '3months': 3,
        '6months': 6,
        '1year': 12
      };
      
      start = subMonths(now, presetMonths[value] || 6);
      
      setDateRange({
        startDate: startOfMonth(start),
        endDate: endOfMonth(now)
      });
    } else if (type === 'start') {
      setDateRange({ ...dateRange, startDate: startOfMonth(value) });
    } else if (type === 'end') {
      setDateRange({ ...dateRange, endDate: endOfMonth(value) });
    }
  };
  
  // Handle preset range selection - uses the consolidated function
  const handlePresetChange = (event) => {
    handleDateRangeChange('preset', event.target.value);
  };
  
  // Filter activity data based on selected date range - cleaned up version
  useEffect(() => {
    if (!originalActivityData?.length) return;
    
    const filtered = originalActivityData.filter(item => {
      const itemDate = parseAndFormatDate(item.date, null); // Using our utility function
      if (!itemDate) return false;
      
      return isWithinInterval(itemDate, {
        start: dateRange.startDate,
        end: dateRange.endDate
      });
    }).sort((a, b) => {
      const dateA = parseAndFormatDate(a.date, null);
      const dateB = parseAndFormatDate(b.date, null);
      if (!dateA || !dateB) return 0;
      return dateA - dateB;
    });
    
    setFilteredData(filtered);
  }, [originalActivityData, dateRange]);
  
  // Date range display for the chart title
  const dateRangeDisplay = `${format(dateRange.startDate, 'MMM yyyy')} - ${format(dateRange.endDate, 'MMM yyyy')}`;
  
  // Apply filter with custom range
  const applyCustomRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    // Ensure start date is not after end date
    if (dateRange.startDate > dateRange.endDate) {
      const temp = dateRange.startDate;
      setDateRange({
        startDate: dateRange.endDate,
        endDate: temp
      });
    }
  };
  
  // Calculate statistics for the selected period
  const totalVisitsInPeriod = filteredData.reduce((sum, item) => sum + item.totalVisits, 0);
  const avgActiveUsersInPeriod = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, item) => sum + item.activeUsers, 0) / filteredData.length) 
    : 0;
  const totalNewUsersInPeriod = filteredData.reduce((sum, item) => sum + item.newUsers, 0);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        User Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<People fontSize="medium" sx={{ color: "white" }} />}
            color="#34a853"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <StatCard 
            title="Active Users" 
            value={stats.activeUsers} 
            icon={<TrendingUp fontSize="medium" sx={{ color: "white" }} />}
            color="#8bc34a"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <StatCard 
            title="New Users" 
            value={stats.newUsers} 
            icon={<PersonAdd fontSize="medium" sx={{ color: "white" }} />}
            color="#2196f3"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <StatCard 
            title="Verified Users" 
            value={stats.verifiedUsers} 
            icon={<VerifiedUser fontSize="medium" sx={{ color: "white" }} />}
            color="#ffc107"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <StatCard 
            title="Inactive Users" 
            value={inactiveUsersCount.toString()} 
            icon={<Block fontSize="medium" sx={{ color: "white" }} />}
            color="#f44336"
          />
        </Box>
      </Box>
      
      {/* Enhanced User Activity Chart */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: '4px', border: '1px dashed #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6">
            User Activity
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="date-range-preset-label">Time Period</InputLabel>
            <Select
              labelId="date-range-preset-label"
              value={presetRange}
              label="Time Period"
              onChange={handlePresetChange}
              startAdornment={<CalendarMonth fontSize="small" sx={{ mr: 1 }} />}
            >
              {presetRanges.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {isCustomRange && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <DatePicker
                  label="Start Month"
                  views={['year', 'month']}
                  value={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange('start', date)}
                  renderInput={(params) => <TextField size="small" {...params} helperText={null} />}
                />
                
                <DatePicker
                  label="End Month"
                  views={['year', 'month']}
                  value={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange('end', date)}
                  renderInput={(params) => <TextField size="small" {...params} helperText={null} />}
                  minDate={dateRange.startDate}
                />
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={applyCustomRange}
                  startIcon={<FilterAlt />}
                >
                  Apply
                </Button>
              </Stack>
            </LocalizationProvider>
          </Box>
        )}
        
        <Divider sx={{ mb: 2 }}>
          <Chip 
            icon={<DateRange />} 
            label={dateRangeDisplay} 
            color="primary" 
            variant="outlined" 
          />
        </Divider>
        
        {/* Period Statistics */}
        <Box sx={{ display: 'flex', mb: 3, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Total Visits: <strong>{totalVisitsInPeriod}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg. Active Users: <strong>{avgActiveUsersInPeriod}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New Users: <strong>{totalNewUsersInPeriod}</strong>
          </Typography>
        </Box>
        
        {/* Chart Display */}
        <Box sx={{ height: 300 }}>
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => parseAndFormatDate(value)}
                />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [`${value}`, name]}
                  labelFormatter={(label) => parseAndFormatDate(label, 'MMM d, yyyy') || label}
                />
                <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="totalVisits" 
                  name="Total Visits" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Active Users" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  name="New Users" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No data available for the selected time period
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// PropTypes validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired
};

UserDashboard.propTypes = {
  data: PropTypes.shape({
    statistics: PropTypes.shape({
      totalUsers: PropTypes.string,
      activeUsers: PropTypes.string,
      newUsers: PropTypes.string,
      verifiedUsers: PropTypes.string,
      deletedUsers: PropTypes.string
    }),
    activityData: PropTypes.array
  }).isRequired
};

export default UserDashboard;