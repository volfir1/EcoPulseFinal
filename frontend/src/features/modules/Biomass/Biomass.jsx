import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { Leaf } from 'lucide-react';
import { Button, Card, YearPicker, Skeleton } from '@shared/index';
import useEnergyAnalytics from '@store/analytics/useEnergyAnalytics';
import * as energyUtils from '@store/user/energyUtils'

const Biomass = () => {
  const ENERGY_TYPE = 'biomass';
  const colorScheme = energyUtils.getEnergyColorScheme(ENERGY_TYPE);
  
  // Use unified hook with 'biomass' as the energy type
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

  if (loading) {
    // Use unified skeleton component with the appropriate energy type
    return <Skeleton.EnergyPageSkeleton energyType={ENERGY_TYPE} CardComponent={Card.Biomass} />;
  }

  // Make sure generation data is properly defined
  const safeGenerationData = Array.isArray(generationData) ? generationData : [];

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colorScheme.primaryColor }}>
            <Leaf size={24} />
            Biomass Energy Analytics
          </h1>
          <div className="text-gray-500">
            <div className="text-sm font-medium">
              Selected Range: {selectedStartYear} - {selectedEndYear}  ({selectedEndYear - selectedStartYear} year/s)
            </div>
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

      {/* Charts Section */}
      <Card.Biomass className="p-6 mb-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Power Generation Trend
        </h2>
        <div className="text-3xl font-bold mb-1" style={{ color: colorScheme.primaryColor }}>
          {currentProjection} GWh
        </div>
        <p className="text-gray-600 mb-4">Predictive Analysis Generation projection</p>
        <div className="h-[250px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeGenerationData}>
              <defs>
                <linearGradient id="biomassGradient" x1="0" y1="0" x2="0" y2="1">
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
      </Card.Biomass>
    </div>
  );
};

export default Biomass;