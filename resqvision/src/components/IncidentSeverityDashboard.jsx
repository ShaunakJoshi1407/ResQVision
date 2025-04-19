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
  Menu,
  MenuItem,
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import IncidentBarChart from "./charts/IncidentBarChart";
import SeverityBarChart from "./charts/SeverityBarChart";
import IncidentTrendsChart from "./charts/IncidentTrendsChart";
import { saveAs } from "file-saver";

const monthYearOptions = [...Array(84)].map((_, i) => {
  const date = new Date(2018, i);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
});

const regionOptions = ["Rural", "Suburban", "Urban"];
const incidentOptions = ["Accident", "Fire", "Cardiac Arrest", "Other"];

const IncidentSeverityDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedIncidents, setSelectedIncidents] = useState([...incidentOptions]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

  const handleToggle = (setter, current, value) => {
    const isSelected = current.includes(value);
    if (isSelected && current.length === 1) return;
    setter(isSelected ? current.filter((v) => v !== value) : [...current, value]);
  };

  const handleExportClick = (e, chartId) => {
    setAnchorEl(e.currentTarget);
    setMenuTarget(chartId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuTarget(null);
  };

  const handleDownload = (format) => {
    if (menuTarget === "chart1") {
      format === "json" ? downloadChart1JSON() : downloadChart1CSV();
    } else if (menuTarget === "chart2") {
      format === "json" ? downloadChart2JSON() : downloadChart2CSV();
    } else if (menuTarget === "chart3") {
      format === "json" ? downloadChart3JSON() : downloadChart3CSV();
    }
    handleClose();
  };

  // ----------------- Export Functions -----------------
  const convertToMonthYear = (label) => {
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const [monthStr, year] = label.split(" ");
    return `${year}-${months[monthStr]}`;
  };

  const exportFiltered = async (filePath, filterFn, fileName, format = "json") => {
    const res = await fetch(filePath);
    const data = await res.json();
    const filtered = data.filter(filterFn);

    if (format === "json") {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `${fileName}.json`);
    } else {
      const keys = Object.keys(filtered[0] || {});
      const csv = [
        keys.join(","),
        ...filtered.map((row) => keys.map((k) => row[k]).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      saveAs(blob, `${fileName}.csv`);
    }
  };

  const downloadChart1JSON = () =>
    exportFiltered(
      "/data/incident_type_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "incident_bar_chart_data",
      "json"
    );

  const downloadChart1CSV = () =>
    exportFiltered(
      "/data/incident_type_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "incident_bar_chart_data",
      "csv"
    );

  const downloadChart2JSON = () =>
    exportFiltered(
      "/data/severity_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "severity_bar_chart_data",
      "json"
    );

  const downloadChart2CSV = () =>
    exportFiltered(
      "/data/severity_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "severity_bar_chart_data",
      "csv"
    );

  const downloadChart3JSON = () =>
    exportFiltered(
      "/data/incident_type_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "incident_trend_data",
      "json"
    );

  const downloadChart3CSV = () =>
    exportFiltered(
      "/data/incident_type_counts_monthly.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedIncidents.includes(d.Incident_Type) &&
        d.MonthYear >= convertToMonthYear(startMonth) &&
        d.MonthYear <= convertToMonthYear(endMonth),
      "incident_trend_data",
      "csv"
    );

  // ----------------- JSX -----------------
  return (
    <Box display="flex" height="100%">
      {/* Sidebar */}
      <Box width="260px" minHeight="100vh" p={2} borderRight="1px solid #e0e0e0" bgcolor="white">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1E40AF" }}>
          Filters
        </Typography>

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
          {/* Chart 1 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Number of incidents by type</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart1")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Shows total number of incidents for each incident type. Apply filters to further narrow down.">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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

          {/* Chart 2 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Number of incidents by severity</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart2")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Distribution of severity levels according to the number of incidents. Apply filters to further narrow down.">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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

          {/* Chart 3 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Incident Trends over Time</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart3")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Shows incident type trends over time for selected filters. Click on the legend items to display specific trend lines, click again to see/unsee them">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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

      {/* Shared Download Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload("json")}>Download JSON</MenuItem>
        <MenuItem onClick={() => handleDownload("csv")}>Download CSV</MenuItem>
      </Menu>
    </Box>
  );
};

export default IncidentSeverityDashboard;