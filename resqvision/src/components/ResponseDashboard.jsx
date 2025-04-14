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
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import AmbulanceAvailabilityChart from "./charts/AmbulanceAvailabilityChart";
import InjuriesResponseLineChart from "./charts/InjuriesResponseLineChart";
import ResponseHeatmap from "./charts/ResponseHeatmap";

const monthYearOptions = [
  "Jan 2018", "Feb 2018", "Mar 2018", "Apr 2018", "May 2018", "Jun 2018",
  "Jul 2018", "Aug 2018", "Sep 2018", "Oct 2018", "Nov 2018", "Dec 2018",
  "Jan 2019", "Feb 2019", "Mar 2019", "Apr 2019", "May 2019", "Jun 2019",
  "Jul 2019", "Aug 2019", "Sep 2019", "Oct 2019", "Nov 2019", "Dec 2019",
  "Jan 2020", "Feb 2020", "Mar 2020", "Apr 2020", "May 2020", "Jun 2020",
  "Jul 2020", "Aug 2020", "Sep 2020", "Oct 2020", "Nov 2020", "Dec 2020",
  "Jan 2021", "Feb 2021", "Mar 2021", "Apr 2021", "May 2021", "Jun 2021",
  "Jul 2021", "Aug 2021", "Sep 2021", "Oct 2021", "Nov 2021", "Dec 2021",
  "Jan 2022", "Feb 2022", "Mar 2022", "Apr 2022", "May 2022", "Jun 2022",
  "Jul 2022", "Aug 2022", "Sep 2022", "Oct 2022", "Nov 2022", "Dec 2022",
  "Jan 2023", "Feb 2023", "Mar 2023", "Apr 2023", "May 2023", "Jun 2023",
  "Jul 2023", "Aug 2023", "Sep 2023", "Oct 2023", "Nov 2023", "Dec 2023",
  "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024",
  "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024",
];

const convertToMonthYear = (label) => {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const [month, year] = label.split(" ");
  return `${year}-${months[month]}`;
};

const regionOptions = ["Rural", "Suburban", "Urban"];
const emergencyLevels = ["Minor", "Major", "Critical"];

const ResponseDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedLevels, setSelectedLevels] = useState([...emergencyLevels]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];
  const monthRange = [
    convertToMonthYear(startMonth),
    convertToMonthYear(endMonth),
  ];

  const handleToggle = (setter, current, value) => {
    const isSelected = current.includes(value);
    if (isSelected && current.length === 1) return;
    setter(isSelected ? current.filter((v) => v !== value) : [...current, value]);
  };

  return (
    <Box display="flex">
      {/* Sidebar */}
      <Box
        width="260px"
        minHeight="100vh"
        p={2}
        borderRight="1px solid #e0e0e0"
        bgcolor="white"
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1E40AF" }}>
          Filters
        </Typography>

        {/* Region Filter */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Region Type</Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {regionOptions.map((region) => (
                  <FormControlLabel
                    key={region}
                    control={
                      <Checkbox
                        checked={selectedRegions.includes(region)}
                        onChange={() =>
                          handleToggle(setSelectedRegions, selectedRegions, region)
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

        {/* Emergency Level Filter */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Emergency Level</Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {emergencyLevels.map((level) => (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={selectedLevels.includes(level)}
                        onChange={() =>
                          handleToggle(setSelectedLevels, selectedLevels, level)
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

        {/* Time Range Slider */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Time Range (2018 – 2024)</Typography>
            <Box mt={3} px={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  {monthYearOptions[timeRange[0]]}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {monthYearOptions[timeRange[1]]}
                </Typography>
              </Box>
              <Slider
                value={timeRange}
                onChange={(e, newVal) => setTimeRange(newVal)}
                min={0}
                max={monthYearOptions.length - 1}
                step={1}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontSize="1rem">
                    Avg. Response Time by Ambulance Availability
                  </Typography>
                  <Tooltip title="Compares average response time for available and unavailable ambulances across filters. When ambulance is not available, usually police or fire fighters respond.">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <AmbulanceAvailabilityChart
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                  timeRange={monthRange}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontSize="1rem">
                    Avg. Response Time by Number of Injuries
                  </Typography>
                  <Tooltip title="Shows how average response time changes with number of injuries (1 - 4+), across all emergency levels and regions.">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <InjuriesResponseLineChart
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                  timeRange={monthRange}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontSize="1rem">
                    Response Time by Road Type and Distance
                  </Typography>
                  <Tooltip title="Heatmap showing how road type and distance affect average response time.">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <ResponseHeatmap
                  selectedRegions={selectedRegions}
                  selectedLevels={selectedLevels}
                  timeRange={monthRange}
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
