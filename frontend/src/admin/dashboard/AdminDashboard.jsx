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
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
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
  Sun,
  Wind,
  Droplets,
  RefreshCw,
  Info
} from 'lucide-react';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import { Button } from '@shared/index';
import useEnergyDashboard from './hook';
import { formatNumber, formatPercentage, getChangeColor, formatDate } from './util';
import { performanceMetrics } from './data';
import { YearPicker } from '@shared/index';

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
        <Box sx={{ py: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnergyDashboard = () => {
  // Theme and media queries for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);

  // State for year range - this is the single source of truth
  const [yearRange, setYearRange] = useState({
    startYear: 2025,
    endYear: 2030
  });

  // Initialize energy dashboard hook with year range
  const {
    loading,
    energyData,
    energySummary,
    refreshData,
    chartRefs
  } = useEnergyDashboard(yearRange);

  // Create a properly debounced refresh function
  const debouncedRefresh = useCallback(
    debounce((range) => {
      console.log("Refreshing with year range:", range);
      refreshData(range);
    }, 500),
    [refreshData]
  );

  // Year picker handlers - directly update the yearRange state
  const handleStartYearChange = useCallback((year) => {
    console.log("Start year changed to:", year);
    setYearRange(prev => {
      const newRange = { ...prev, startYear: year };
      // Schedule refresh with updated range
      debouncedRefresh(newRange);
      return newRange;
    });
  }, [debouncedRefresh]);

  const handleEndYearChange = useCallback((year) => {
    console.log("End year changed to:", year);
    setYearRange(prev => {
      const newRange = { ...prev, endYear: year };
      // Schedule refresh with updated range
      debouncedRefresh(newRange);
      return newRange;
    });
  }, [debouncedRefresh]);

  // Update using mock data flag
  useEffect(() => {
    setUsingMockData(energySummary.usingMockData || false);
  }, [energySummary.usingMockData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle refreshing data with current year range
  const handleRefreshWithYearRange = () => {
    console.log("Manual refresh with year range:", yearRange);
    refreshData(yearRange);
  };

  // Calculate chart heights based on screen size
  const getChartHeight = () => {
    if (isMobile) return 200;
    if (isTablet) return 250;
    return 256; // 64 * 4 = h-64 in original code
  };

  const getLargeChartHeight = () => {
    if (isMobile) return 300;
    if (isTablet) return 350;
    return 384; // 96 * 4 = h-96 in original code
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 4, md: 6 }, 
        maxWidth: '7xl', 
        mx: 'auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, maxWidth: '7xl', mx: 'auto' }}>
      {/* Header - Responsive layout that stacks on mobile */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        mb: { xs: 3, md: 6 },
        gap: { xs: 2, md: 0 }
      }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
            Energy Management Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System overview and performance metrics
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          width: { xs: '100%', md: 'auto' }
        }}>
          {/* Pass current year range values and handlers to YearPicker */}
          <YearPicker
            initialStartYear={yearRange.startYear}
            initialEndYear={yearRange.endYear}
            onStartYearChange={handleStartYearChange}
            onEndYearChange={handleEndYearChange}
            usingMockData={usingMockData}
          />
        </Box>
      </Box>

      {/* Tabs - Adjusts layout for mobile */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="energy dashboard tabs"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{ 
            flex: 1,
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 90 },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab 
            label="Overview" 
            icon={<Activity size={isMobile ? 14 : 16} />} 
            iconPosition="start"
          />
          <Tab 
            label="Energy" 
            icon={<TrendingUp size={isMobile ? 14 : 16} />} 
            iconPosition="start"
          />
        </Tabs>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshCw size={18} />}
          onClick={handleRefreshWithYearRange}
          sx={{ 
            fontSize: '0.7rem', 
            padding: '0px 10px', 
            minWidth: { xs: '100%', sm: '150px' }, 
            height: '2.5rem', 
            marginTop: { xs: 0, sm: '1rem' }, 
            marginBottom: { xs: 2, sm: 0 },
            borderRadius: '30px'
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Cards - Responsive grid that stacks on smaller screens */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 6 } }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 2,
              '&:hover': { boxShadow: 2, transition: 'box-shadow 0.3s' }
            }}>
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 } 
                }}>
                  <TrendingUp size={isMobile ? 20 : 24} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                    {energySummary.totalProduction || '3250'} GWh
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="success.main" 
                      sx={{ fontWeight: 'medium', mr: 1 }}
                    >
                      +{energySummary.productionIncrease || '12.5'}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      year over year
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
                    Total Energy Production
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 2,
              '&:hover': { boxShadow: 2, transition: 'box-shadow 0.3s' }
            }}>
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 } 
                }}>
                  <Sun size={isMobile ? 20 : 24} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                    {energySummary.performance.find(p => p.name === 'Solar')?.value || 320} GWh
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontWeight: 'medium', 
                        mr: 1,
                        color: getChangeColor(energySummary.performance.find(p => p.name === 'Solar')?.change || 15.2)
                      }}
                    >
                      {formatPercentage(energySummary.performance.find(p => p.name === 'Solar')?.change || 15.2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      vs last year
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
                    Solar Generation
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 2,
              '&:hover': { boxShadow: 2, transition: 'box-shadow 0.3s' }
            }}>
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: 'warning.main', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 } 
                }}>
                  <Wind size={isMobile ? 20 : 24} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold' }}>
                    {energySummary.performance.find(p => p.name === 'Wind')?.value || 250} GWh
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontWeight: 'medium', 
                        mr: 1,
                        color: getChangeColor(energySummary.performance.find(p => p.name === 'Wind')?.change || 8.7)
                      }}
                    >
                      {formatPercentage(energySummary.performance.find(p => p.name === 'Wind')?.change || 8.7)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      vs last year
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }} color="textSecondary">
                    Wind Generation
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Distribution & Yearly Forecast */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Energy Distribution - Responsive chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 2,
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 600 }}>
                Energy Source Distribution
              </Typography>
              <Box sx={{ height: getChartHeight() }} ref={chartRefs.distribution}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energySummary.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 20 : 30}
                      outerRadius={isMobile ? 60 : 80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={isMobile ? null : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {energySummary.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} GWh`, 'Generation']} />
                    <Legend 
                      layout={isMobile ? "horizontal" : "vertical"} 
                      align={isMobile ? "center" : "right"} 
                      verticalAlign={isMobile ? "bottom" : "middle"}
                      wrapperStyle={isMobile ? { fontSize: '0.75rem' } : {}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Yearly Forecast - Dynamically based on selected year range */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 2,
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 600 }}>
                Yearly Energy Forecast ({yearRange.startYear}-{yearRange.endYear})
              </Typography>
              <Box sx={{ height: getChartHeight() }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={energyData.totalByYear || []}
                    margin={{ 
                      top: 20, 
                      right: isMobile ? 10 : 30, 
                      left: isMobile ? 0 : 20, 
                      bottom: 5 
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      domain={[yearRange.startYear, yearRange.endYear]}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickCount={isMobile ? 3 : Math.min(6, yearRange.endYear - yearRange.startYear + 1)}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <RechartsTooltip formatter={(value) => [`${value} GWh`, 'Total Production']} />
                    <Legend wrapperStyle={isMobile ? { fontSize: '0.75rem' } : {}} />
                    <Line 
                      type="monotone" 
                      dataKey="solar" 
                      name="Solar Energy" 
                      stroke="#FFB800" 
                      strokeWidth={2}
                      dot={{ r: isMobile ? 3 : 4 }}
                      activeDot={{ r: isMobile ? 5 : 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wind" 
                      name="Wind Energy" 
                      stroke="#64748B" 
                      strokeWidth={2}
                      dot={{ r: isMobile ? 3 : 4 }}
                      activeDot={{ r: isMobile ? 5 : 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hydro" 
                      name="Hydro Energy" 
                      stroke="#2E90E5" 
                      strokeWidth={2}
                      dot={{ r: isMobile ? 3 : 4 }}
                      activeDot={{ r: isMobile ? 5 : 6 }}
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
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography variant={isMobile ? "h6" : "h5"}>
            Energy Management ({yearRange.startYear}-{yearRange.endYear})
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 6 } }}>
          {energySummary.performance && energySummary.performance.map((source) => (
            <Grid item xs={12} sm={6} md={4} key={source.name}>
              <Paper sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 2,
                height: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {source.name === 'Solar' && <Sun size={isMobile ? 18 : 20} sx={{ color: 'yellow.500', mr: 2 }} />}
                    {source.name === 'Wind' && <Wind size={isMobile ? 18 : 20} sx={{ color: 'slate.500', mr: 2 }} />}
                    {source.name === 'Hydro' && <Droplets size={isMobile ? 18 : 20} sx={{ color: 'blue.500', mr: 2 }} />}
                    {!['Solar', 'Wind', 'Hydro'].includes(source.name) && <Activity size={isMobile ? 18 : 20} sx={{ color: 'gray.500', mr: 2 }} />}
                    <Typography variant="h6">{source.name}</Typography>
                  </Box>
                  <Chip 
                    label={formatPercentage(source.change)} 
                    size="small"
                    color={source.change >= 0 ? 'success' : 'error'}
                    sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  />
                </Box>
                
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  sx={{ fontWeight: 'bold', mb: 2, color: source.color }}
                >
                  {source.value} GWh
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
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
        
        <Paper sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          border: 1, 
          borderColor: 'divider', 
          borderRadius: 2,
          mb: { xs: 3, md: 6 }
        }}>
          <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 600 }}>
            Yearly Energy Production Trends
          </Typography>
          <Box sx={{ height: getLargeChartHeight() }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={energyData.totalByYear || []}
                margin={{ 
                  top: 20, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 20, 
                  bottom: 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  type="number" 
                  domain={[yearRange.startYear, yearRange.endYear]} 
                  tickCount={isMobile ? 3 : Math.min(6, yearRange.endYear - yearRange.startYear + 1)}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <RechartsTooltip />
                <Legend 
                  wrapperStyle={isMobile ? { fontSize: '0.75rem' } : {}}
                  layout={isMobile ? "horizontal" : "vertical"} 
                  verticalAlign={isMobile ? "bottom" : "middle"} 
                  align={isMobile ? "center" : "right"}
                />
                
                {energySummary.pieData && energySummary.pieData.map((source) => (
                  <Line
                    key={source.name}
                    type="monotone"
                    dataKey={source.name.toLowerCase()}
                    name={source.name}
                    stroke={source.color}
                    strokeWidth={2}
                    dot={{ r: isMobile ? 3 : 4 }}
                    activeDot={{ r: isMobile ? 5 : 6 }}
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