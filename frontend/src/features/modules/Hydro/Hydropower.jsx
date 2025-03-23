import React from 'react';
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip
} from 'recharts';
import { Droplets } from 'lucide-react';
import { Button, Card, YearPicker,Skeleton } from '@shared/index';
import useEnergyAnalytics from '@store/analytics/useEnergyAnalytics';
import * as energyUtils from '@store/user/energyUtils'

const Hydropower = () => {
  const ENERGY_TYPE = 'hydro';
  const colorScheme = energyUtils.getEnergyColorScheme(ENERGY_TYPE);
  
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
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-[#2E90E5]">
            <Droplets size={24} />
            Hydropower Energy Analytics
          </h1>
          <div className="text-gray-500">
            Selected Range: {selectedStartYear} - {selectedEndYear}
            <span className="text-sm ml-1">({selectedEndYear - selectedStartYear} years)</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <YearPicker
            initialStartYear={selectedStartYear}
            initialEndYear={selectedEndYear}
            onStartYearChange={handleStartYearChange}
            onEndYearChange={handleEndYearChange}
          />
          <div className="flex gap-2">
            <Button 
              className="whitespace-nowrap bg-[#2E90E5] text-white hover:bg-[#2578C5] transition-colors"
              onClick={handleDownload}
            >
              Download Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Card.Hydro className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Power Generation Trend
        </h2>
        <div className="text-3xl font-bold mb-1 text-[#2E90E5]">
          {currentProjection} GWh
        </div>
        <p className="text-gray-600 mb-4">Predictive Analysis Generation projection</p>
        
        {/* Add ref to the chart container */}
        <div className="h-[250px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeGenerationData}>
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
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
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
                  r: 4,
                  fill: "#2E90E5",
                  strokeWidth: 2,
                  stroke: "#FFFFFF"
                }}
                activeDot={{
                  r: 6,
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