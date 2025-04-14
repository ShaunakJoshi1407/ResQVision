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

import IncidentBarChart from "./charts/IncidentBarChart";
import SeverityBarChart from "./charts/SeverityBarChart";
import IncidentTrendsChart from "./charts/IncidentTrendsChart";

const monthYearOptions = [ "Jan 2018", "Feb 2018", "Mar 2018", "Apr 2018", "May 2018", "Jun 2018",
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
  "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024"];

const regionOptions = ["Rural", "Suburban", "Urban"];
const incidentOptions = ["Accident", "Fire", "Cardiac Arrest", "Other"];

const IncidentSeverityDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedIncidents, setSelectedIncidents] = useState([...incidentOptions]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

  const handleToggle = (setter, current, value) => {
    const isSelected = current.includes(value);
    if (isSelected && current.length === 1) return;
    setter(isSelected ? current.filter((v) => v !== value) : [...current, value]);
  };

  return (
    <Box display="flex" height="100%">
      {/* Sidebar */}
      <Box width="260px" minHeight="100vh" p={2} borderRight="1px solid #e0e0e0" bgcolor="white">
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

        {/* Incident Type Filter */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Incident Type</Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {incidentOptions.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedIncidents.includes(type)}
                        onChange={() =>
                          handleToggle(setSelectedIncidents, selectedIncidents, type)
                        }
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Time Filter */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Time Range (2018 - 2024)</Typography>
            <Box mt={3} px={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{startMonth}</Typography>
                <Typography variant="body2">{endMonth}</Typography>
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

      {/* Main Charts */}
      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Number of incidents by type</Typography>
                  <Tooltip title="Shows total number of incidents for each incident type. Apply filters to further narrow down.">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <IncidentBarChart
                  selectedRegions={selectedRegions}
                  selectedIncidents={selectedIncidents}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Number of incidents by severity</Typography>
                  <Tooltip title="Distribution of severity levels according to the number of incidents. Apply filters to further narrow down.">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <SeverityBarChart
                  selectedRegions={selectedRegions}
                  selectedIncidents={selectedIncidents}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Incident Trends over Time</Typography>
                  <Tooltip title="Shows incident type trends over time for selected filters. Click on the legend items to display specific trend lines, click again to see/unsee them">
                    <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <IncidentTrendsChart
                  selectedRegions={selectedRegions}
                  selectedIncidents={selectedIncidents}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default IncidentSeverityDashboard;
