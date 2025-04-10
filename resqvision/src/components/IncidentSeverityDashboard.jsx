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
import IncidentBarChart from "./charts/IncidentBarChart";
import SeverityBarChart from "./charts/SeverityBarChart";
import IncidentTrendsChart from "./charts/IncidentTrendsChart";

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

const regionOptions = ["Rural", "Suburban", "Urban"];
const incidentOptions = ["Accident", "Fire", "Cardiac Arrest", "Other"];

const IncidentSeverityDashboard = () => {
  // State management for selected filters. Making use of the inbuilt state management in React.
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedIncidents, setSelectedIncidents] = useState([...incidentOptions]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

  const handleToggle = (setter, currentValues, value) => {
    const isSelected = currentValues.includes(value);
    if (isSelected && currentValues.length === 1) return;
    if (isSelected) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  return (
    <Box display="flex" height="100%">
      {/* Sidebar Filter container */}
      <Box
        width="260px"
        minHeight="100vh"
        p={2}
        borderRight="1px solid #e0e0e0"
        bgcolor="white"
      >
        <Typography
          variant="h5"
          className="mb-4"
          style={{ fontWeight: 600, color: "#1E40AF", letterSpacing: "0.5px" }}
        >
          Filters
        </Typography>

        {/* Region Type: Urban, Suburban and Rural */}
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

        {/* Incident Type: Accident, Cardiac Arrest, Fire, Other. */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Incident Type
            </Typography>
            <FormControl component="fieldset">
              <FormGroup>
                {incidentOptions.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedIncidents.includes(type)}
                        onChange={() =>
                          handleToggle(setSelectedIncidents, selectedIncidents, type, incidentOptions)
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

        {/* Time Range Slider, which we found is more intuitive as compared to two separate fields for `To` and `From` months. */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Time Range (2018 - 2024)
            </Typography>
            <Box mt={3} px={1}>
              {/* Custom Range Labels Above or Below the Slider */}
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                  {monthYearOptions[timeRange[0]]}
                </Typography>
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                  {monthYearOptions[timeRange[1]]}
                </Typography>
              </Box>

              <Slider
                value={timeRange}
                onChange={(e, newVal) => setTimeRange(newVal)}
                min={0}
                max={monthYearOptions.length - 1}
                step={1}
                valueLabelDisplay="off"
              />
            </Box>

          </CardContent>
        </Card>
      </Box>

      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          {/* Top Row includes the Incident Bar Chart and the Severity Count Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incident Type vs Count
                </Typography>
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
                <Typography variant="h6" gutterBottom>
                  Severity vs Count
                </Typography>
                <SeverityBarChart
                  selectedRegions={selectedRegions}
                  selectedIncidents={selectedIncidents}
                  startMonth={startMonth}
                  endMonth={endMonth}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Bottom Row: Incident Trends chart which is varied over time using the time range filter.*/}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incident Trends Over Time
                </Typography>
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