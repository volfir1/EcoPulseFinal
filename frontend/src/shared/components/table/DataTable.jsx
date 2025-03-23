import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Checkbox,
  TableSortLabel,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import { 
  ArrowDownUp, 
  Search, 
  Download, 
  Filter, 
  RefreshCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * A reusable data table component with sorting, filtering, pagination, and selection
 * 
 * @param {Object} props Component props
 * @param {Array} props.columns Array of column definitions with { id, label, align, format, sortable, filterable }
 * @param {Array} props.data Array of data objects
 * @param {string} props.title Table title
 * @param {boolean} props.loading Loading state
 * @param {boolean} props.selectable Whether rows are selectable
 * @param {boolean} props.pagination Whether to show pagination
 * @param {boolean} props.searchable Whether to show search field
 * @param {boolean} props.exportable Whether to show export button
 * @param {boolean} props.filterable Whether to show filter button
 * @param {boolean} props.refreshable Whether to show refresh button
 * @param {Function} props.onRowClick Callback when a row is clicked
 * @param {Function} props.onSelectionChange Callback when selection changes
 * @param {Function} props.onRefresh Callback when refresh is clicked
 * @param {Function} props.onExport Callback when export is clicked
 * @param {Object} props.tableClasses Additional classes for table elements
 * @param {string} props.emptyMessage Message to show when table is empty
 */
const DataTable = ({
  columns = [],
  data = [],
  title = 'Data Table',
  loading = false,
  selectable = false,
  pagination = true,
  searchable = true,
  exportable = false,
  filterable = false,
  refreshable = false,
  onRowClick,
  onSelectionChange,
  onRefresh,
  onExport,
  tableClasses = {},
  emptyMessage = 'No data available',
}) => {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Sort function
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((n) => n.id);
      setSelected(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
      return;
    }
    setSelected([]);
    if (onSelectionChange) onSelectionChange([]);
  };

  // Handle row click
  const handleRowClick = (event, id) => {
    if (onRowClick) onRowClick(id);

    if (!selectable) return;

    // Handle checkbox click separately to avoid triggering row click
    if (event.target.type === 'checkbox') return;

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  // Handle checkbox click
  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.id];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort and paginate data
  const processedData = useMemo(() => {
    // Apply sorting
    const sortedData = orderBy
      ? [...filteredData].sort(getComparator(order, orderBy))
      : filteredData;

    // Apply pagination
    return pagination
      ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : sortedData;
  }, [filteredData, orderBy, order, page, rowsPerPage, pagination]);

  // Check if row is selected
  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Empty rows for pagination
  const emptyRows = pagination
    ? Math.max(0, rowsPerPage - processedData.length)
    : 0;

  return (
    <Paper className={`overflow-hidden ${tableClasses.paper || ''}`}>
      {/* Table header with title, search, and action buttons */}
      <Box className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Typography variant="h6" component="h2" className="font-medium">
          {title}
        </Typography>

        <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {searchable && (
            <TextField
              className="w-full sm:w-64"
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} className="mr-2 text-gray-500" />,
              }}
            />
          )}

          <Box className="flex gap-2 ml-auto">
            {filterable && (
              <Tooltip title="Filter">
                <IconButton 
                  onClick={() => setExpandedFilters(!expandedFilters)}
                  size="small"
                  className={expandedFilters ? 'bg-blue-50' : ''}
                >
                  <Filter size={18} />
                </IconButton>
              </Tooltip>
            )}
            
            {refreshable && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} size="small">
                  <RefreshCcw size={18} />
                </IconButton>
              </Tooltip>
            )}
            
            {exportable && (
              <Tooltip title="Export">
                <IconButton onClick={onExport} size="small">
                  <Download size={18} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Filter panel */}
      {filterable && expandedFilters && (
        <Box className="px-4 pb-4 pt-0 flex flex-wrap gap-3 items-center bg-blue-50">
          {columns
            .filter(column => column.filterable)
            .map(column => (
              <TextField
                key={column.id}
                label={column.label}
                size="small"
                placeholder={`Filter ${column.label}`}
                className="w-48"
              />
            ))}
        </Box>
      )}

      {/* Loading indicator */}
      {loading && (
        <LinearProgress className="w-full" />
      )}

      {/* Table container */}
      <TableContainer className={tableClasses.container || ''}>
        <Table 
          stickyHeader 
          aria-label={title}
          size="medium"
          className={tableClasses.table || ''}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  className={`font-medium ${tableClasses.headerCell || ''}`}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      IconComponent={orderBy === column.id ? (order === 'asc' ? ChevronUp : ChevronDown) : ArrowDownUp}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {processedData.length > 0 ? (
              <>
                {processedData.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleRowClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id || index}
                      selected={isItemSelected}
                      className={`${tableClasses.row || ''} cursor-pointer`}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => handleCheckboxClick(event, row.id)}
                          />
                        </TableCell>
                      )}
                      
                      {columns.map((column) => {
                        const value = row[column.id];
                        
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align || 'left'}
                            className={tableClasses.cell || ''}
                          >
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
                
                {/* Empty rows to maintain consistent height */}
                {emptyRows > 0 && pagination && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={columns.length + (selectable ? 1 : 0)} />
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  className="py-16"
                >
                  <Typography color="textSecondary" variant="body1">
                    {searchQuery ? 'No matching records found' : emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className={tableClasses.pagination || ''}
        />
      )}
    </Paper>
  );
};

export default DataTable;