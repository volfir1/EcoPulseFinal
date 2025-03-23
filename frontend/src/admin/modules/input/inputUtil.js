// solarAdminUtils.js
import React from 'react';
import { AppIcon, theme } from '@shared/index';

// The main issue is in getTableColumns - we need to prevent function recreation
export const getTableColumns = (handleEdit, handleDelete) => [
  { 
    id: 'year', 
    label: 'Year', 
    align: 'left',
    sortable: true
  },
  { 
    id: 'generation', 
    label: 'Generation (GWh)', 
    align: 'right',
    sortable: true,
    format: (value) => value ? value.toFixed(2) : '0.00'
  },
  { 
    id: 'dateAdded', 
    label: 'Date Added', 
    align: 'center',
    sortable: true,
    format: (value) => value ? new Date(value).toLocaleDateString() : '-',
  },
  { 
    id: 'actions', 
    label: 'Actions', 
    align: 'center',
    sortable: false,
    // Use a static format function that doesn't create new functions on each render
    format: (_, row) => <ActionButtons row={row} onEdit={handleEdit} onDelete={handleDelete} />
  }
];

// Create a separate component for the action buttons
const ActionButtons = React.memo(({ row, onEdit, onDelete }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(row);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(row.id);
  };
  
  return (
    <div className="flex justify-center gap-2">
      <button 
        onClick={handleEdit}
        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
        title="Edit"
      >
        <AppIcon name="edit" size={18} />
      </button>
      <button 
        onClick={handleDelete}
        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
        title="Delete"
      >
        <AppIcon name="trash" size={18} />
      </button>
    </div>
  );
});

export const formatDataForChart = (data) => {
  if (!data || data.length === 0) return [];
  
  // Sort by year ascending
  return [...data]
    .sort((a, b) => a.year - b.year)
    .map(item => ({
      year: item.year.toString(),
      value: item.generation
    }));
};

export const getChartConfig = () => {
  const { elements } = theme.palette;
  
  return {
    bar: {
      dataKey: 'value',
      fill: elements.solar,
      radius: [4, 4, 0, 0],
      barSize: 30,
      name: 'Generation (GWh)'
    },
    tooltip: {
      formatter: (value) => [`${value.toFixed(2)} GWh`, 'Generation'],
      labelFormatter: (label) => `Year: ${label}`
    },
    xAxis: {
      dataKey: 'year',
      axisLine: { stroke: '#E0E0E0' },
      tickLine: false
    },
    yAxis: {
      axisLine: { stroke: '#E0E0E0' },
      tickLine: false,
      // This base label will be extended in the component
      label: ''
    },
    // Default line configuration
    line: {
      stroke: elements.solar,
      strokeWidth: 2,
      dot: {
        r: 4,
        fill: elements.solar,
        stroke: '#fff',
        strokeWidth: 2
      },
      activeDot: {
        r: 6,
        fill: elements.solar,
        stroke: '#fff',
        strokeWidth: 2
      }
    }
  };
};

export const validateInputs = (year, generation) => {
  const errors = {};
  
  if (!year) {
    errors.year = 'Year is required';
  } else if (year < 1900 || year > 2100) {
    errors.year = 'Year must be between 1900 and 2100';
  }
  
  if (!generation) {
    errors.generation = 'Generation value is required';
  } else if (isNaN(generation) || parseFloat(generation) <= 0) {
    errors.generation = 'Generation must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const generateSampleData = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    year: currentYear - 4 + i,
    generation: 1000 + Math.random() * 500 + i * 50,
    dateAdded: new Date(Date.now() - i * 86400000).toISOString()
  }));
};