import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage data table state and operations
 * 
 * @param {Object} options Configuration options
 * @param {Array} options.data Initial data array
 * @param {Array} options.columns Column definitions
 * @param {Function} options.onExport Export function
 * @param {Function} options.onRefresh Refresh function
 * @param {Function} options.onSelectionChange Selection change callback
 * @param {Function} options.onRowClick Row click callback
 * @param {string} options.defaultSortColumn Default sort column id
 * @param {string} options.defaultSortDirection Default sort direction ('asc' or 'desc')
 * @returns {Object} Data table state and handlers
 */
const useDataTable = ({
  data = [],
  columns = [],
  onExport,
  onRefresh,
  onSelectionChange,
  onRowClick,
  defaultSortColumn = '',
  defaultSortDirection = 'asc'
}) => {
  // State
  const [tableData, setTableData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Sort, filter states can be managed here if we want to take control from the DataTable component
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [filterValues, setFilterValues] = useState({});

  // Callbacks
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setLoading(true);
    try {
      const refreshedData = await onRefresh();
      if (refreshedData) {
        setTableData(refreshedData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(tableData, selectedRows);
    } else {
      // Default export to CSV if no export function provided
      const selectedData = selectedRows.length > 0
        ? tableData.filter(row => selectedRows.includes(row.id))
        : tableData;

      const headers = columns.map(col => col.label).join(',');
      const csvRows = selectedData.map(row => 
        columns.map(col => {
          let value = row[col.id];
          // Handle values with commas by quoting
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      );
      
      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'table-data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [tableData, selectedRows, columns, onExport]);

  const handleSelectionChange = useCallback((selectedIds) => {
    setSelectedRows(selectedIds);
    if (onSelectionChange) {
      onSelectionChange(selectedIds);
    }
  }, [onSelectionChange]);

  const handleRowClick = useCallback((id) => {
    if (onRowClick) {
      const row = tableData.find(row => row.id === id);
      onRowClick(row, id);
    }
  }, [tableData, onRowClick]);

  // Update data when external data changes
  useMemo(() => {
    setTableData(data);
  }, [data]);

  // Filter function
  const applyFilter = useCallback((data, filters) => {
    if (Object.keys(filters).length === 0) return data;
    
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = String(row[key]).toLowerCase();
        return rowValue.includes(String(value).toLowerCase());
      });
    });
  }, []);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return applyFilter(tableData, filterValues);
  }, [tableData, filterValues, applyFilter]);

  // Method to update filters
  const updateFilter = useCallback((columnId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, []);

  // Method to clear all filters
  const clearFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  // Method to update data
  const updateData = useCallback((newData) => {
    setTableData(newData);
  }, []);

  // Method to add row
  const addRow = useCallback((row) => {
    setTableData(prev => [...prev, row]);
  }, []);

  // Method to update row
  const updateRow = useCallback((id, updatedRow) => {
    setTableData(prev => 
      prev.map(row => row.id === id ? { ...row, ...updatedRow } : row)
    );
  }, []);

  // Method to delete row
  const deleteRow = useCallback((id) => {
    setTableData(prev => prev.filter(row => row.id !== id));
  }, []);

  return {
    data: filteredData,
    loading,
    selectedRows,
    sortColumn,
    sortDirection,
    filterValues,
    updateFilter,
    clearFilters,
    setLoading,
    updateData,
    addRow,
    updateRow,
    deleteRow,
    handleRefresh,
    handleExport,
    handleSelectionChange,
    handleRowClick
  };
};

export default useDataTable;