import React from 'react';
import { Paper, IconButton, Chip } from '@mui/material';
import { LocateIcon, ArrowDown, ArrowUp } from 'lucide-react';
import { ENERGY_TYPES } from './scripts/energyType';

const CityCard = ({ location, isExpanded, onToggle, isHovered }) => (
  <Paper 
    className={`p-4 transition-shadow ${
      isHovered ? 'shadow-lg' : 'hover:shadow-md'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <LocateIcon size={16} className="text-gray-500" />
          <span className="font-medium">{location.Place}</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Total Predicted Generation: {location.totalPredictedGeneration}</div>
          <div>Total Predicted Consumption: {location.totalConsumption}</div>
          {isExpanded && (
            <>
              <div>Total Renewable: {location.totalRenewable}</div>
              <div>Total Non-Renewable: {location.totalNonRenewable}</div>
              <div>Solar: {location.solar}</div>
              <div>Wind: {location.wind}</div>
              <div>Hydropower: {location.hydropower}</div>
              <div>Geothermal: {location.geothermal}</div>
              <div>Biomass: {location.biomass}</div>
            </>
          )}
        </div>
      </div>
      <IconButton size="small" onClick={onToggle}>
        {isExpanded ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
      </IconButton>
    </div>
  </Paper>
);

export default CityCard;
