import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Slider,
} from "@mui/material";

import AmbulanceAvailabilityChart from "./charts/AmbulanceAvailabilityChart";
import InjuriesResponseLineChart from "./charts/InjuriesResponseLineChart";
import ResponseHeatmap from "./charts/ResponseHeatmap";


const regionOptions = ["Rural", "Suburban", "Urban"];
const emergencyLevels = ["Minor", "Major", "Critical"];

const ResponseDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedLevels, setSelectedLevels] = useState([...emergencyLevels]);
  const [timeRange, setTimeRange] = useState([2018, 2024]);

  const handleToggle = (setter, current, value, allOptions) => {
    const isSelected = current.includes(value);
    if (isSelected && current.length === 1) return;
    setter(isSelected ? current.filter((v) => v !== value) : [...current, value]);
  };

  return (
    <Box display="flex">
      {/* Sidebar Filters */}
      <Box
        width="260px"
        minHeight="100vh"
        p={2}
        borderRight="1px solid #e0e0e0"
        bgcolor="white"
      >
        <Typography variant="h5" gutterBottom>
          Filters
        </Typography>

        {/* Region Type */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Region Type
            </Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {regionOptions.map((region) => (
                  <FormControlLabel
                    key={region}
                    control={
                      <Checkbox
                        checked={selectedRegions.includes(region)}
                        onChange={() =>
                          handleToggle(setSelectedRegions, selectedRegions, region, regionOptions)
                        }
                      />
                    }
                    label={region}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Emergency Level */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Emergency Level
            </Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {emergencyLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={selectedLevels.includes(level)}
                        onChange={() =>
                          handleToggle(setSelectedLevels, selectedLevels, level, emergencyLevels)
                        }
                      />
                    }
                    label={level}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Time Range (non-functional for now) */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Time Range (2018 - 2024)
            </Typography>
            <Slider
              value={timeRange}
              onChange={(e, newValue) => setTimeRange(newValue)}
              valueLabelDisplay="auto"
              min={2012}
              max={2024}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Main Chart Area */}
      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          {/* Row 1: Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg. Response Time vs Ambulance Availability
                </Typography>
                <AmbulanceAvailabilityChart
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Row 1: Line Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Avg. Response Time vs Number of Injuries
                </Typography>
                <InjuriesResponseLineChart
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
                <CardContent>
                <Typography variant="h6" gutterBottom>
                    Response Time Heatmap (Distance vs Road Type)
                </Typography>
                <ResponseHeatmap
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                />
                </CardContent>
            </Card>
            </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default ResponseDashboard;
