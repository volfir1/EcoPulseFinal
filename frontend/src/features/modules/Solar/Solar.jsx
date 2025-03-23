import React from 'react';
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip
} from 'recharts';
import { Sun } from 'lucide-react';
import { Button, Card, YearPicker, Skeleton } from '@shared/index';
import useEnergyAnalytics from '@store/analytics/useEnergyAnalytics';
import * as energyUtils from '@store/user/energyUtils'


const SolarEnergy = () => {
  const ENERGY_TYPE = 'solar';
  const colorScheme = energyUtils.getEnergyColorScheme(ENERGY_TYPE);
  
  // Use unified hook with 'solar' as the energy type
  const {
    generationData,
    currentProjection,
    loading,
    selectedStartYear,
    selectedEndYear,
    handleStartYearChange,
    handleEndYearChange,
    handleDownload,
    chartRef
  } = useEnergyAnalytics(ENERGY_TYPE);

  // Get chart configurations from unified utils
  const areaChartConfig = energyUtils.getAreaChartConfig(ENERGY_TYPE);
  const gridConfig = energyUtils.getGridConfig();
  
  // Get metric card data if needed
  const metricCardData = energyUtils.getMetricCardData(ENERGY_TYPE, currentProjection);

  if (loading) {
    // Use the unified skeleton with the appropriate energy type
    return <Skeleton.EnergyPageSkeleton energyType={ENERGY_TYPE} CardComponent={Card.Solar} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colorScheme.primaryColor }}>
            <Sun size={24} />
            Solar Energy Analytics
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
            className="w-full"
          />
          <div className="flex gap-2">
            <Button 
              className="whitespace-nowrap text-white transition-colors"
              style={{ 
                backgroundColor: colorScheme.primaryColor,
                ':hover': {
                  backgroundColor: colorScheme.secondaryColor
                }
              }}
              onClick={handleDownload}
            >
              Download Summary
            </Button>
          </div>
        </div>
      </div>

      <Card.Solar className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Power Generation Trend
        </h2>
        <div className="text-3xl font-bold mb-1" style={{ color: colorScheme.primaryColor }}>
          {currentProjection} GWh
        </div>
        <p className="text-gray-600 mb-4">Predictive Analysis Generation projection</p>
        {/* Add ref to the chart container */}
        <div className="h-[250px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generationData}>
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
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
              <CartesianGrid {...gridConfig.cartesianGrid} />
              <XAxis {...gridConfig.xAxis} dataKey="date" />
              <YAxis {...gridConfig.yAxis} />
              <Tooltip {...areaChartConfig.tooltip} />
              <Area {...areaChartConfig.area} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Solar>
    </div>
  );
};

export default SolarEnergy; 