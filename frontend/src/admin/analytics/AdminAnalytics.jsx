import React from 'react';
import { Card, Button, AppIcon } from '@shared/index';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Chip 
} from '@mui/material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useAnalytics } from './analysisHook';

export default function AdminAnalytics() {
  const {
    data,
    loading,
    filters,
    handleDateRangeChange,
    handleEnergyTypeFilter,
    handleDataUpload,
    getStatusColor
  } = useAnalytics();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <Box className="flex justify-between items-start mb-6">
        <div>
          <Typography variant="h4" className="font-semibold">
            Energy Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and analyze renewable energy performance
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AppIcon name="upload" />}
          onClick={handleDataUpload}
        >
          Upload Data
        </Button>
      </Box>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(data.statistics).map(([key, value]) => (
          <Card.Base key={key}>
            <Box className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AppIcon name={key.toLowerCase()} className="text-primary" />
                <Typography variant="body2" color="text.secondary">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
              </div>
              <Typography variant="h5" className="font-semibold">
                {value}
              </Typography>
            </Box>
          </Card.Base>
        ))}
      </div>

      {/* Chart and Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Chart */}
        <Card.Base>
          <div className="p-4">
            <Typography variant="h6" className="mb-4">
              Energy Generation Trends
            </Typography>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyGeneration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="solar" stroke="#ffc107" strokeWidth={2} />
                  <Line type="monotone" dataKey="wind" stroke="#2196f3" strokeWidth={2} />
                  <Line type="monotone" dataKey="hydro" stroke="#4caf50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card.Base>

        {/* Performance Table */}
        <Card.Base>
          <div className="p-4">
            <Typography variant="h6" className="mb-4">
              Energy Performance
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Output</TableCell>
                  <TableCell>Efficiency</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.performance.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AppIcon name={row.type} />
                        {row.type}
                      </div>
                    </TableCell>
                    <TableCell>{row.output}</TableCell>
                    <TableCell>{row.efficiency}%</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status}
                        color={getStatusColor(row.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card.Base>
      </div>
    </div>
  );
}