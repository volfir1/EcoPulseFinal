import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  Avatar,
  LinearProgress,
  CircularProgress,
  Chip,
  Button as MuiButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Sun,
  Wind,
  Droplets,
  RefreshCw,
  Key,
  Settings,
  Download,
  Eye,
  Info
} from 'lucide-react';
import dayjs from 'dayjs';
import{ debounce }from '@mui/material';
import { Button } from '@shared/index';
import useEnergyDashboard from './hook';
import { formatNumber, formatPercentage, getChangeColor, formatDate } from './util';
import { performanceMetrics } from './data';
import {useYearPicker, YearPicker} from '@shared/index';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`energy-tabpanel-${index}`}
      aria-labelledby={`energy-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnergyDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Initialize year picker state and handlers
  const {
    startYear,
    endYear,
    error,
    handleStartYearChange,
    handleEndYearChange,
    handleReset
  } = useYearPicker({
    initialStartYear: 2025,
    initialEndYear: 2030,
    onStartYearChange: (year) => {
      setYearRange(prev => ({ ...prev, startYear: year }));
    },
    onEndYearChange: (year) => {
      setYearRange(prev => ({ ...prev, endYear: year }));
    }
  });
  
 

  // State for year range
  const [yearRange, setYearRange] = useState({
    startYear: startYear.year(),
    endYear: endYear.year()
  });
  
  // Initialize energy dashboard hook with year range
  const {
    loading,
    energyData,
    energySummary,
    refreshData,
    chartRefs
  } = useEnergyDashboard(yearRange);
  

  const debounceRefresh = useCallback(
    debounce((range)=>{
      refreshData(range)
    },500),
    [refreshData]
  )
  //UseEffect to trigger refresh for the year picker
  useEffect(()=>{
    if (yearRange.startYear && yearRange.endYear){
      refreshData(yearRange)
    }
  },[yearRange,refreshData])

  // Update using mock data flag
  useEffect(() => {
    // Set flag to true if we have API errors
    setUsingMockData(energySummary.usingMockData || false);
  }, [energySummary.usingMockData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle refreshing data with current year range
  const handleRefreshWithYearRange = () => {
    refreshData(yearRange);
  };

  if (loading) {
    return (
      <Box className="p-6 max-w-7xl mx-auto flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold">
            Energy Management Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System overview and performance metrics
          </Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <YearPicker
            initialStartYear={yearRange.startYear}
            initialEndYear={yearRange.endYear}
            onStartYearChange={handleStartYearChange}
            onEndYearChange={handleEndYearChange}
            usingMockData={usingMockData}
          />
          
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="energy dashboard tabs">
          <Tab label="Overview" icon={<Activity size={16} />} iconPosition="start" />
          <Tab label="Energy" icon={<TrendingUp size={16} />} iconPosition="start" />
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshCw size={18} />}
            onClick={handleRefreshWithYearRange}
            sx={{ fontSize: '0.7rem', padding: '0px 10px', minWidth: '150px', height: '2.5rem', marginTop: '1rem', borderRadius: '30px' }}
          >
            Refresh Data
          </Button>
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {energySummary.totalProduction || '3250'} GWh
                  </Typography>
                  <Box className="flex items-center">
                    <Typography 
                      variant="body2" 
                      color="success.main" 
                      className="font-medium mr-1"
                    >
                      +{energySummary.productionIncrease || '12.5'}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      year over year
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="mt-1" color="textSecondary">
                    Total Energy Production
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <Sun />
                </Avatar>
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {energySummary.performance.find(p => p.name === 'Solar')?.value || 320} GWh
                  </Typography>
                  <Box className="flex items-center">
                    <Typography 
                      variant="body2" 
                      className={`font-medium mr-1 ${getChangeColor(energySummary.performance.find(p => p.name === 'Solar')?.change || 15.2)}`}
                    >
                      {formatPercentage(energySummary.performance.find(p => p.name === 'Solar')?.change || 15.2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      vs last year
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="mt-1" color="textSecondary">
                    Solar Generation
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                  <Wind />
                </Avatar>
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {energySummary.performance.find(p => p.name === 'Wind')?.value || 250} GWh
                  </Typography>
                  <Box className="flex items-center">
                    <Typography 
                      variant="body2" 
                      className={`font-medium mr-1 ${getChangeColor(energySummary.performance.find(p => p.name === 'Wind')?.change || 8.7)}`}
                    >
                      {formatPercentage(energySummary.performance.find(p => p.name === 'Wind')?.change || 8.7)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      vs last year
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="mt-1" color="textSecondary">
                    Wind Generation
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} className="mb-6">
          {/* Energy Generation Chart */}
          <Grid item xs={12}>
            <Paper className="p-4 border rounded-lg h-full">
              <Typography variant="h6" className="mb-3 font-semibold">
                Energy Generation Overview
              </Typography>
              <Box className="h-80" ref={chartRefs.overview}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceMetrics.weeklyGeneration}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="solar" name="Solar" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="wind" name="Wind" fill="#64748B" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="hydro" name="Hydro" fill="#2E90E5" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Distribution & Yearly Forecast */}
        <Grid container spacing={3}>
          {/* Energy Distribution */}
          <Grid item xs={12} md={6}>
            <Paper className="p-4 border rounded-lg">
              <Typography variant="h6" className="mb-3 font-semibold">
                Energy Source Distribution
              </Typography>
              <Box className="h-64" ref={chartRefs.distribution}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energySummary.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {energySummary.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} GWh`, 'Generation']} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Yearly Forecast */}
          <Grid item xs={12} md={6}>
            <Paper className="p-4 border rounded-lg h-full">
              <Typography variant="h6" className="mb-3 font-semibold">
                Yearly Energy Forecast
              </Typography>
              <Box className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { year: 2025, value: 3250 },
                      { year: 2026, value: 3680 },
                      { year: 2027, value: 4120 },
                      { year: 2028, value: 4580 },
                      { year: 2029, value: 5100 },
                      { year: 2030, value: 5650 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value} GWh`, 'Total Production']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Total Energy Production" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Energy Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box className="mb-4 flex justify-between">
          <Typography variant="h5">
            Energy Management
          </Typography>
         
        </Box>
        
        <Grid container spacing={3} className="mb-6">
          {energySummary.performance && energySummary.performance.map((source) => (
            <Grid item xs={12} md={4} key={source.name}>
              <Paper className="p-4 border rounded-lg">
                <Box className="flex justify-between mb-2">
                  <Box className="flex items-center">
                    {source.name === 'Solar' && <Sun size={20} className="text-yellow-500 mr-2" />}
                    {source.name === 'Wind' && <Wind size={20} className="text-slate-500 mr-2" />}
                    {source.name === 'Hydro' && <Droplets size={20} className="text-blue-500 mr-2" />}
                    {!['Solar', 'Wind', 'Hydro'].includes(source.name) && <Activity size={20} className="text-gray-500 mr-2" />}
                    <Typography variant="h6">{source.name}</Typography>
                  </Box>
                  <Chip 
                    label={formatPercentage(source.change)} 
                    size="small"
                    color={source.change >= 0 ? 'success' : 'error'}
                  />
                </Box>
                
                <Typography variant="h4" className="font-bold mb-2" style={{ color: source.color }}>
                  {source.value} GWh
                </Typography>
                
                <Typography variant="body2" color="textSecondary" className="mb-2">
                  {source.percentage.toFixed(1)}% of total generation
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={source.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: '#f3f4f6', 
                    '& .MuiLinearProgress-bar': { 
                      bgcolor: source.color 
                    } 
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Paper className="p-4 border rounded-lg mb-6">
          <Typography variant="h6" className="mb-3 font-semibold">
            Yearly Energy Production Trends
          </Typography>
          <Box className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={energyData.totalByYear || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  type="number" 
                  domain={[yearRange.startYear, yearRange.endYear]} 
                  tickCount={Math.min(6, yearRange.endYear - yearRange.startYear + 1)} 
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                
                {energySummary.pieData && energySummary.pieData.map((source) => (
                  <Line
                    key={source.name}
                    type="monotone"
                    dataKey={source.name.toLowerCase()}
                    name={source.name}
                    stroke={source.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
        
        
      </TabPanel>
      
     
    </Box>
  );
};

export default EnergyDashboard;