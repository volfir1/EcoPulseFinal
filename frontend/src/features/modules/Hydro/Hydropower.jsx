import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip
} from 'recharts';
import { Droplets } from 'lucide-react';
import { Button, Card, YearPicker, Skeleton } from '@shared/index';
import useEnergyAnalytics from '@store/analytics/useEnergyAnalytics';
import * as energyUtils from '@store/user/energyUtils'

const Hydropower = () => {
  const ENERGY_TYPE = 'hydro';
  const colorScheme = energyUtils.getEnergyColorScheme(ENERGY_TYPE);
  
  // Add state to track screen size
  const [isMobile, setIsMobile] = useState(false);
  
  // Update isMobile state based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for tablets
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Use unified hook with 'hydro' as the energy type
  const {
    generationData,
    currentProjection,
    loading,
    selectedStartYear,
    selectedEndYear,
    handleStartYearChange,
    handleEndYearChange,
    handleDownload,
    waterFlowData,
    turbineEfficiency,
    chartRef
  } = useEnergyAnalytics(ENERGY_TYPE);

  // Get chart configurations from unified utils
  const areaChartConfig = energyUtils.getAreaChartConfig(ENERGY_TYPE);
  const gridConfig = energyUtils.getGridConfig();

  if (loading) {
    // Use the unified skeleton with the appropriate energy type
    return <Skeleton.EnergyPageSkeleton energyType={ENERGY_TYPE} CardComponent={Card.Hydro} />;
  }

  // Make sure generation data is properly defined
  const safeGenerationData = Array.isArray(generationData) ? generationData : [];

  return (
    <div className="p-3 md:p-6">
      {/* Header Section */}
      <div className="mb-4 md:mb-6">
        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-between items-center'} mb-4`}>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-[#2E90E5]">
            <Droplets size={isMobile ? 20 : 24} />
            Hydropower Energy Analytics
          </h1>
          <div className="text-sm md:text-base text-gray-500">
            Selected Range: {selectedStartYear} - {selectedEndYear}
            <span className="text-xs md:text-sm ml-1">({selectedEndYear - selectedStartYear} years)</span>
          </div>
        </div>

        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
          <YearPicker
            initialStartYear={selectedStartYear}
            initialEndYear={selectedEndYear}
            onStartYearChange={handleStartYearChange}
            onEndYearChange={handleEndYearChange}
            className={`${isMobile ? 'w-full' : 'w-2/3'}`}
          />
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button 
              className="whitespace-nowrap bg-[#2E90E5] text-white hover:bg-[#2578C5] transition-colors text-sm md:text-base w-full md:w-auto"
              onClick={handleDownload}
            >
              Download Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Card.Hydro className="p-3 md:p-6 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-800">
          Power Generation Trend
        </h2>
        <div className="text-2xl md:text-3xl font-bold mb-1 text-[#2E90E5]">
          {currentProjection} GWh
        </div>
        <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Predictive Analysis Generation projection</p>
        
        {/* Add ref to the chart container with responsive height */}
        <div className="h-[200px] md:h-[250px] lg:h-[300px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={safeGenerationData}
              margin={{ 
                top: 5, 
                right: isMobile ? 5 : 20, 
                left: isMobile ? 0 : 10, 
                bottom: 5 
              }}
            >
              <defs>
                <linearGradient id="hydroGradient" x1="0" y1="0" x2="0" y2="1">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickFormatter={isMobile ? (value) => (typeof value === 'string' ? value.split(' ')[0] : value) : undefined}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2E90E5"
                fill="url(#hydroGradient)"
                strokeWidth={2}
                dot={{
                  r: isMobile ? 3 : 4,
                  fill: "#2E90E5",
                  strokeWidth: 2,
                  stroke: "#FFFFFF"
                }}
                activeDot={{
                  r: isMobile ? 5 : 6,
                  fill: "#2E90E5",
                  stroke: "#FFFFFF",
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Hydro>
    </div>
  );
};

export default Hydropower;