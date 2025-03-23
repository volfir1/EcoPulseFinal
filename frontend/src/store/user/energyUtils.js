import { theme } from '@shared/index';

// Energy type configurations for colors and other visual settings
const energyConfig = {
  solar: {
    primaryColor: '#FFB800',
    secondaryColor: '#FFCD49',
    gradientOpacity: {
      start: 0.2,
      end: 0
    },
    downloadFileName: 'Solar_Power_Generation_Summary.pdf'
  },
  hydro: {
    primaryColor: '#2E90E5',
    secondaryColor: '#4FA2EA',
    gradientOpacity: {
      start: 0.3,
      end: 0
    },
    downloadFileName: 'Hydro_Power_Generation_Summary.pdf'
  },
  wind: {
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    gradientOpacity: {
      start: 0.25,
      end: 0
    },
    downloadFileName: 'Wind_Power_Generation_Summary.pdf'
  },
  biomass: {
    primaryColor: '#16A34A',
    secondaryColor: '#22C55E',
    gradientOpacity: {
      start: 0.2,
      end: 0.05
    },
    downloadFileName: 'Biomass_Power_Generation_Summary.pdf'
  },
  // Add geothermal configuration
  geothermal: {
    primaryColor: '#FF6B6B',
    secondaryColor: '#FF9E9E',
    gradientOpacity: {
      start: 0.2,
      end: 0
    },
    downloadFileName: 'Geothermal_Power_Generation_Summary.pdf'
  }
};

// Common chart configurations that can be shared across all energy types
const { text, background, divider } = theme.palette;

/**
 * Get Area Chart Configuration for the specified energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @returns {object} Area chart configuration object
 */
export const getAreaChartConfig = (energyType = 'solar') => {
  const config = energyConfig[energyType] || energyConfig.solar;
  
  return {
    gradient: {
      id: `${energyType}Gradient`,
      stops: [
        { 
          offset: '5%', 
          color: config.secondaryColor, 
          opacity: config.gradientOpacity.start 
        },
        { 
          offset: '95%', 
          color: config.secondaryColor, 
          opacity: config.gradientOpacity.end 
        }
      ]
    },
    area: {
      type: 'monotone',
      dataKey: 'value',
      stroke: config.primaryColor,
      fill: `url(#${energyType}Gradient)`,
      strokeWidth: 2,
      dot: {
        r: 4,
        fill: config.primaryColor,
        strokeWidth: 2,
        stroke: '#FFFFFF'
      },
      activeDot: {
        r: 6,
        fill: config.primaryColor,
        stroke: '#FFFFFF',
        strokeWidth: 2
      }
    },
    tooltip: {
      contentStyle: {
        backgroundColor: background.paper,
        border: `1px solid ${divider}`,
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }
  };
};

/**
 * Get Line Chart Configuration for the specified energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @param {object} dataKeys - Object with keys for primary and secondary lines
 * @returns {object} Line chart configuration object
 */
export const getLineChartConfig = (energyType = 'solar', dataKeys = { primary: 'value1', secondary: 'value2' }) => {
  const config = energyConfig[energyType] || energyConfig.solar;
  const secondaryColor = energyType === 'biomass' ? '#0EA5E9' : 
                         (energyType === 'geothermal' ? '#FFA500' : theme.palette.elements.wind);
  
  const lineNames = {
    solar: { primary: 'Irradiance', secondary: 'Power' },
    hydro: { primary: 'Water Flow', secondary: 'Generation' },
    wind: { primary: 'Wind Speed', secondary: 'Power' },
    biomass: { primary: 'Agricultural', secondary: 'Forestry' },
    geothermal: { primary: 'Temperature', secondary: 'Output' }
  };
  
  const names = lineNames[energyType] || lineNames.solar;
  
  return {
    lines: [
      {
        type: 'monotone',
        dataKey: dataKeys.primary,
        name: names.primary,
        stroke: config.primaryColor,
        strokeWidth: 2,
        dot: { 
          r: 4,
          fill: config.primaryColor,
          strokeWidth: 2,
          stroke: '#FFFFFF'
        },
        activeDot: {
          r: 6,
          fill: config.primaryColor,
          strokeWidth: 2,
          stroke: '#FFFFFF'
        }
      },
      {
        type: 'monotone',
        dataKey: dataKeys.secondary,
        name: names.secondary,
        stroke: secondaryColor,
        strokeWidth: 2,
        dot: { 
          r: 4,
          fill: secondaryColor,
          strokeWidth: 2,
          stroke: '#FFFFFF'
        },
        activeDot: {
          r: 6,
          fill: secondaryColor,
          strokeWidth: 2,
          stroke: '#FFFFFF'
        }
      }
    ],
    tooltip: {
      contentStyle: {
        backgroundColor: background.paper,
        border: `1px solid ${divider}`,
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }
  };
};

/**
 * Get Bar Chart Configuration for the specified energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @param {string} dataKey - The data key to use for the bar chart
 * @returns {object} Bar chart configuration object
 */
export const getBarChartConfig = (energyType = 'solar', dataKey = 'efficiency') => {
  const config = energyConfig[energyType] || energyConfig.solar;
  
  return {
    bar: {
      dataKey,
      fill: config.primaryColor,
      radius: [4, 4, 0, 0],
      opacity: 0.8
    },
    tooltip: {
      contentStyle: {
        backgroundColor: background.paper,
        border: `1px solid ${divider}`,
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }
  };
};

/**
 * Get Grid Configuration - shared across all chart types
 * @returns {object} Grid configuration object
 */
export const getGridConfig = () => ({
  cartesianGrid: {
    strokeDasharray: '3 3',
    vertical: false,
    stroke: '#e5e7eb'
  },
  xAxis: {
    stroke: text.secondary,
    tickLine: true,
    fontSize: 12,
    tickMargin: 12,
    tick: { fill: text.secondary }
  },
  yAxis: {
    stroke: text.secondary,
    tickLine: true,
    fontSize: 12,
    tickMargin: 12,
    tick: { fill: text.secondary }
  }
});

/**
 * Generate metric card data based on energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @param {number} currentProjection - The current projection value
 * @returns {Array} Array of metric card data objects
 */
export const getMetricCardData = (energyType = 'solar', currentProjection = 0) => {
  const metricsByType = {
    solar: [
      {
        title: 'Total Generation',
        value: `${Math.round(currentProjection * 10) / 10} GWh`,
        subtitle: 'Annual projection'
      },
      {
        title: 'Panel Efficiency',
        value: '22.5%',
        subtitle: 'Average efficiency'
      },
      {
        title: 'Daily Peak',
        value: '42.8 MWh',
        subtitle: 'Highest generation'
      }
    ],
    hydro: [
      {
        title: 'Total Generation',
        value: `${Math.round(currentProjection * 10) / 10} GWh`,
        subtitle: 'Annual projection'
      },
      {
        title: 'Turbine Efficiency',
        value: '85.2%',
        subtitle: 'Average efficiency'
      },
      {
        title: 'Water Flow',
        value: '1,250 m³/s',
        subtitle: 'Average flow rate'
      }
    ],
    wind: [
      {
        title: 'Total Generation',
        value: `${Math.round(currentProjection * 10) / 10} GWh`,
        subtitle: 'Annual projection'
      },
      {
        title: 'Turbine Uptime',
        value: '92.7%',
        subtitle: 'Operational time'
      },
      {
        title: 'Wind Velocity',
        value: '16.4 m/s',
        subtitle: 'Average speed'
      }
    ],
    biomass: [
      {
        title: 'Total Generation',
        value: `${Math.round(currentProjection * 10) / 10} GWh`,
        subtitle: 'Annual projection'
      },
      {
        title: 'Feedstock Usage',
        value: '5,200 tons',
        subtitle: 'Current stock'
      },
      {
        title: 'Conversion Rate',
        value: '82.3%',
        subtitle: 'Average efficiency'
      }
    ],
    // Add geothermal-specific metrics
    geothermal: [
      {
        title: 'Total Generation',
        value: `${Math.round(currentProjection * 10) / 10} GWh`,
        subtitle: 'Annual projection'
      },
      {
        title: 'Well Temperature',
        value: '285°C',
        subtitle: 'Average temperature'
      },
      {
        title: 'Field Capacity',
        value: '74.6%',
        subtitle: 'Resource utilization'
      }
    ]
  };
  
  return metricsByType[energyType] || metricsByType.solar;
};

/**
 * Get the color scheme for a specific energy type
 * @param {string} energyType - 'solar', 'hydro', 'wind', 'biomass', or 'geothermal'
 * @returns {object} Color configuration
 */
export const getEnergyColorScheme = (energyType = 'solar') => {
  return energyConfig[energyType] || energyConfig.solar;
};
  
export default {
  getAreaChartConfig,
  getLineChartConfig,
  getBarChartConfig,
  getGridConfig,
  getMetricCardData,
  getEnergyColorScheme
};