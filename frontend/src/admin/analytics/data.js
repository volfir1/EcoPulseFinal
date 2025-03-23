export const analyticsData = {
    statistics: {
      totalOutput: '1,860 kWh',
      averageEfficiency: '87%',
      peakDemand: '520 kWh',
      savings: '₱45,000'
    },
    monthlyGeneration: [
      { month: 'Jan', solar: 400, wind: 300, hydro: 350 },
      { month: 'Feb', solar: 450, wind: 320, hydro: 360 },
      { month: 'Mar', solar: 420, wind: 310, hydro: 340 },
      { month: 'Apr', solar: 480, wind: 350, hydro: 380 },
      { month: 'May', solar: 500, wind: 380, hydro: 400 },
      { month: 'Jun', solar: 520, wind: 400, hydro: 420 }
    ],
    performance: [
      {
        id: 1,
        type: 'solar',
        output: '450 kWh',
        efficiency: 92,
        status: 'optimal',
        trend: '+12%',
        details: 'Peak performance at 2PM'
      },
      {
        id: 2,
        type: 'wind',
        output: '380 kWh',
        efficiency: 88,
        status: 'warning',
        trend: '-5%',
        details: 'Low wind speeds detected'
      },
      {
        id: 3,
        type: 'hydro',
        output: '410 kWh',
        efficiency: 90,
        status: 'optimal',
        trend: '+8%',
        details: 'Stable water flow'
      },
      {
        id: 4,
        type: 'geothermal',
        output: '320 kWh',
        efficiency: 85,
        status: 'optimal',
        trend: '+2%',
        details: 'Normal operation'
      },
      {
        id: 5,
        type: 'biomass',
        output: '290 kWh',
        efficiency: 82,
        status: 'warning',
        trend: '-3%',
        details: 'Maintenance scheduled'
      }
    ],
    insights: {
      recommendations: [
        'Optimize solar panel angles for summer season',
        'Schedule maintenance for biomass facility',
        'Monitor wind turbine efficiency'
      ],
      alerts: [
        'Low wind speed warning in sector B',
        'Maintenance due for biomass generator'
      ],
      trends: {
        daily: '+8%',
        weekly: '+15%',
        monthly: '+22%'
      }
    }
  };
  
  export const filterOptions = {
    dateRanges: ['daily', 'weekly', 'monthly', 'yearly'],
    energyTypes: ['all', 'solar', 'wind', 'hydro', 'geothermal', 'biomass']
  };