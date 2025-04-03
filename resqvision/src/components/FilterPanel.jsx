import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FilterPanel = ({ selectedRegion, setSelectedRegion }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-700">Filters</h2>
      <FormControl fullWidth>
        <InputLabel id="region-select-label">Region</InputLabel>
        <Select
          labelId="region-select-label"
          value={selectedRegion}
          label="Region"
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Urban">Urban</MenuItem>
          <MenuItem value="Suburban">Suburban</MenuItem>
          <MenuItem value="Rural">Rural</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default FilterPanel;
