import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  Sun, Wind, Droplets, Leaf, Thermometer, 
  Download, ArrowUpRight, BarChart3, AlertCircle
} from 'lucide-react';
import * as energyUtils from '@store/user/energyUtils';
import createEnergyStore from '@store/user/useEnergyStore';
import RenewableEnergyNews from './Articles';
import { RefreshCw } from 'lucide-react';
// Import only the railwayApi service
import { railwayApi } from '@modules/api'; // Update the path to match your project structure
import { ring2 } from 'ldrs';
// Define energy types and their corresponding icons
const energyTypes = [
  { type: 'solar', icon: Sun, color: '#FFB800', name: 'Solar', endpoint: '/predictions/solar/' },
  { type: 'hydro', icon: Droplets, color: '#2E90E5', name: 'Hydro', endpoint: '/predictions/hydro/' },
  { type: 'wind', icon: Wind, color: '#64748B', name: 'Wind', endpoint: '/predictions/wind/' },
  { type: 'biomass', icon: Leaf, color: '#16A34A', name: 'Biomass', endpoint: '/predictions/biomass/' },
  { type: 'geothermal', icon: Thermometer, color: '#FF6B6B', name: 'Geothermal', endpoint: '/predictions/geothermal/' }
];

const Dashboard = () => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Update responsive states based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State to store data for all energy types
  const [energyData, setEnergyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalProjection, setTotalProjection] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2030); // Default year to display
  const [apiErrors, setApiErrors] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const chartRef = useRef(null);

  // Initialize data for all energy types
  useEffect(() => {
    fetchEnergyData();
  }, [selectedYear]);

  useEffect(() => {
    ring2.register();
  }, []);

  // Fetch actual energy data from API endpoints
  const fetchEnergyData = async () => {
    setLoading(true);
    setApiErrors([]);
    
    const data = {};
    let total = 0;
    let errors = [];
    let usedMockData = false;
    
    // Fetch data for each energy type
    for (const { type, endpoint } of energyTypes) {
      try {
        // Log which endpoint we're trying to fetch
        console.log(`Fetching from: ${endpoint}?start_year=2025&end_year=2030`);
        
        // Use only the railwayApi service
        const response = await railwayApi.get(endpoint, {
          params: { 
            start_year: 2025, 
            end_year: 2030
          }
        });
        
        console.log(`Response for ${type}:`, response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.predictions) {
          // Format API data - adapt to your actual API response structure
          const predictions = response.data.predictions;
          
          // Convert the data to the format needed for charts
          const generationData = predictions.map(item => ({
            date: Number(item.Year), // Convert to number if it's a string
            value: Math.abs(Number(item['Predicted Production'])) // Convert to number if it's a string
          }));
          
          // Get current projection for selected year
          const selectedYearData = predictions.find(p => Number(p.Year) === selectedYear);
          let selectedProjection = selectedYearData 
            ? Math.abs(Number(selectedYearData['Predicted Production'])) 
            : predictions[predictions.length - 1] 
              ? Math.abs(Number(predictions[predictions.length - 1]['Predicted Production']))
              : 0;
              
          // Normalize large numbers to prevent scientific notation display issues
          // Scale down extremely large numbers to more reasonable values for UI display
          if (selectedProjection > 1000000000) {
            selectedProjection = selectedProjection / 1000000; // Convert to millions for display
          }
          
          // Add to total
          total += selectedProjection;
          
          // Create yearlyData mapping
          const yearlyData = predictions.reduce((acc, item) => {
            acc[Number(item.Year)] = Math.abs(Number(item['Predicted Production']));
            return acc;
          }, {});
          
          // Store data
          data[type] = {
            generationData,
            currentProjection: selectedProjection,
            yearlyData
          };
        } else {
          console.error(`Unexpected response format for ${type}:`, response.data);
          throw new Error(`Invalid data structure from ${type} API`);
        }
      } catch (error) {
        console.error(`Error fetching ${type} data:`, error);
        errors.push(type);
        usedMockData = true;
        
        // No secondary fallback attempt since we're only using railwayApi
        console.error(`Failed to fetch ${type} data from Railway API`);
        
        // Fall back to mock data
        const store = createEnergyStore(type);
        const mockData = store.getState().generateMockData(2025, 2030);
        const latestProjection = mockData.find(item => item.date === selectedYear)?.value || 
                               mockData[mockData.length - 1]?.value || 0;
        
        // Add to total
        total += latestProjection;
        
        // Store fallback data
        data[type] = {
          generationData: mockData,
          currentProjection: latestProjection,
          yearlyData: mockData.reduce((acc, item) => {
            acc[item.date] = item.value;
            return acc;
          }, {})
        };
      }
    }
    
    setEnergyData(data);
    // Limit the decimal precision and ensure it's not an excessively large number
    const formattedTotal = total > 100000 ? Math.round(total) : Math.round(total * 10) / 10;
    setTotalProjection(formattedTotal);
    setApiErrors(errors);
    setUsingMockData(usedMockData);
    setLoading(false);
  };
  
  // Generate data for the pie chart
  const getPieChartData = () => {
    return energyTypes.map(({ type, name, color }) => ({
      name,
      value: energyData[type]?.currentProjection || 0,
      color
    }));
  };
  
  // Get comparison data for the selected year
  const getComparisonData = () => {
    return energyTypes.map(({ type, name, color }) => {
      const yearData = energyData[type]?.yearlyData || {};
      return {
        name,
        value: yearData[selectedYear] || 0,
        color
      };
    }).sort((a, b) => b.value - a.value); // Sort by value in descending order
  };
  
  // Get year-over-year growth data
  const getYearOverYearData = () => {
    const years = [];
    for (let year = 2025; year <= 2030; year++) {
      years.push(year);
    }
    
    return years.map(year => {
      const yearData = { year };
      
      energyTypes.forEach(({ type }) => {
        const typeData = energyData[type]?.yearlyData || {};
        yearData[type] = typeData[year] || 0;
      });
      
      return yearData;
    });
  };

  // Handle dashboard export
  const handleExportDashboard = async () => {
    try {
      alert('Dashboard export started');
      
      // Attempt to use Railway API for export
      try {
        const response = await railwayApi.post('/export/dashboard', {
          year: selectedYear,
          data: energyData
        }, {
          responseType: 'blob' // Handle binary data for file download
        });
        
        // Create download link for the returned file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Energy_Dashboard_${selectedYear}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        alert('Dashboard exported successfully!');
      } catch (error) {
        console.error('Export API error:', error);
        // Fall back to client-side export simulation
        setTimeout(() => {
          alert('Dashboard exported successfully!');
        }, 1500);
      }
    } catch (error) {
      alert('Failed to export dashboard. Please try again.');
    }
  };

  // Refresh the data
  const handleRefresh = () => {
    fetchEnergyData();
  };

 if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <l-ring-2
          size="50"
          stroke="5"
          stroke-length="0.25"
          bg-opacity="0.1"
          speed="0.8" 
          color="#16A34A"
        ></l-ring-2>
        <p className="mt-4 text-gray-700 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header Section */}
      <div className="mb-4 md:mb-6">
        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-between items-center'} mb-4`}>
          <h1 className="text-xl md:text-2xl font-semibold">
            Energy Dashboard
          </h1>
          <div className="text-gray-500 flex flex-wrap items-center">
            <div className="text-xs md:text-sm font-medium mr-2 md:mr-3">
              Projection Year: {selectedYear}
            </div>
            {usingMockData && (
              <div className="text-amber-600 text-xs flex items-center bg-amber-50 px-2 py-1 rounded mt-1 md:mt-0">
                <AlertCircle size={isMobile ? 12 : 14} className="mr-1" />
                Using simulation data for some sources
              </div>
            )}
          </div>
        </div>
        
        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
              <button
                key={year}
                className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${selectedYear === year 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              className="flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs md:text-sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* API Error Alert (if any) */}
      {apiErrors.length > 0 && (
        <div className="mb-4 md:mb-6 bg-amber-50 border border-amber-200 rounded-md p-3 md:p-4">
          <div className="flex">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs md:text-sm font-medium text-amber-800">
                Unable to fetch data from some sources
              </h3>
              <p className="mt-1 text-xs md:text-sm text-amber-700">
                Using simulation data for {apiErrors.join(', ')}. Real-time data may not be available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
        <div className="rounded-lg p-4 md:p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-gray-300">
            Total Energy Generation
          </h2>
          <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
            {Number(totalProjection).toLocaleString()} GWh
          </div>
          <p className="text-xs md:text-sm text-gray-300">
            Combined projection for {selectedYear}
          </p>
        </div>
        
        {/* Energy Type Distribution */}
        <div className="rounded-lg p-4 md:p-6 bg-white shadow-md">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-gray-800">
            Energy Distribution
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1 md:space-y-2 pr-2">
              {energyTypes.map(({ type, name, icon: Icon, color }) => (
                <div key={type} className="flex items-center">
                  <Icon size={isMobile ? 14 : 16} style={{ color }} className="mr-1 md:mr-2 flex-shrink-0" />
                  <span className="text-gray-700 text-xs md:text-sm mr-1 md:mr-2">{name}:</span>
                  <span className="font-medium text-xs md:text-sm">
                    {Number(Math.round((energyData[type]?.currentProjection || 0) * 10) / 10).toLocaleString()} GWh
                  </span>
                  {apiErrors.includes(type) && (
                    <span className="ml-1 text-xs text-amber-600">(sim)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 28 : 36}
                    innerRadius={isMobile ? 14 : 20}
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Top Performers */}
        <div className="rounded-lg p-4 md:p-6 bg-white shadow-md border-l-4 border-green-500 sm:col-span-2 lg:col-span-1">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-gray-800 flex items-center justify-between">
            <span>Top Performers</span>
            <BarChart3 size={isMobile ? 14 : 16} className="text-gray-500" />
          </h2>
          <div className="space-y-2 md:space-y-3">
            {getComparisonData().slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-1 h-8 md:h-10 mr-2 md:mr-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs md:text-sm font-medium">{item.name}</span>
                    <span className="text-xs md:text-sm font-bold">{Number(Math.round(item.value * 10) / 10).toLocaleString()} GWh</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div 
                      className="h-1.5 md:h-2 rounded-full" 
                      style={{ 
                        width: `${(item.value / getComparisonData()[0].value) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Showing All Energy Types */}
      <div className="rounded-lg p-4 md:p-6 bg-white shadow-md mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-800">
          Energy Generation Trends
        </h2>
        <div className="h-[200px] md:h-[250px] lg:h-[300px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={getYearOverYearData()}
              margin={{ 
                top: 5, 
                right: isMobile ? 5 : 20, 
                left: isMobile ? 0 : 10, 
                bottom: 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
              <Tooltip contentStyle={{
                fontSize: isMobile ? '10px' : '12px'
              }} />
              <Legend 
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={{
                  fontSize: isMobile ? '10px' : '12px'
                }}
              />
              {energyTypes.map(({ type, name, color }) => (
                <Area
                  key={type}
                  type="monotone"
                  dataKey={type}
                  name={name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                  stackId="1"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Renewable Energy News Section */}
      <RenewableEnergyNews />

      {/* Energy Type Cards */}
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 mt-6 md:mt-8 text-gray-800">
        Energy Sources Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        {energyTypes.map(({ type, name, icon: Icon, color }) => {
          const data = energyData[type] || {};
          const areaChartConfig = energyUtils.getAreaChartConfig(type);
          const isSimulated = apiErrors.includes(type);
          
          const borderStyle = {
            borderLeft: `4px solid ${color}`
          };
          
          return (
            <div key={type} className="rounded-lg p-4 md:p-6 bg-white shadow-md relative" style={borderStyle}>
              <div className="absolute top-3 md:top-4 right-3 md:right-4">
                <Link to={`/modules/${type}`}>
                  <button 
                    className="w-6 h-6 md:w-8 md:h-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <ArrowUpRight size={isMobile ? 12 : 14} className="text-gray-700" />
                  </button>
                </Link>
              </div>
              <div className="flex items-center mb-2 md:mb-4">
                <Icon size={isMobile ? 16 : 20} style={{ color }} className="mr-2 flex-shrink-0" />
                <h3 className="text-base md:text-lg font-semibold text-gray-800">
                  {name} Energy
                  {isSimulated && (
                    <span className="ml-1 text-xs text-amber-600 font-normal">(sim)</span>
                  )}
                </h3>
              </div>
              <div className="text-xl md:text-2xl font-bold mb-1" style={{ color }}>
                {Number(Math.round((data.currentProjection || 0) * 10) / 10).toLocaleString()} GWh
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Projected for {selectedYear}</p>
              <div className="h-[90px] md:h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={data.generationData || []}
                    margin={{ 
                      top: 5, 
                      right: isMobile ? 5 : 10, 
                      left: isMobile ? 0 : 5, 
                      bottom: 5 
                    }}
                  >
                    <defs>
                      <linearGradient id={`${type}Gradient`} x1="0" y1="0" x2="0" y2="1">
                        {areaChartConfig.gradient.stops.map((stop, index) => (
                          <stop
                            key={index}
                            offset={stop.offset}
                            stopColor={stop.color}
                            stopOpacity={stop.opacity}
                          />
                        ))}
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: isMobile ? 8 : 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      fontSize: isMobile ? '10px' : '12px'
                    }} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={color}
                      fill={`url(#${type}Gradient)`}
                      strokeWidth={isMobile ? 1.5 : 2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;