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
  Snackbar,
  Alert,
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
  const [toastOpen, setToastOpen] = useState(false);

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

  const showToast = () => {
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 1500);
  };

  const handleDownload = (format) => {
    if (menuTarget === "chart1") {
      format === "json" ? downloadChart1JSON() : downloadChart1CSV();
    } else if (menuTarget === "chart2") {
      format === "json" ? downloadChart2JSON() : downloadChart2CSV();
    } else if (menuTarget === "chart3") {
      format === "json" ? downloadChart3JSON() : downloadChart3CSV();
    }
    showToast();
    handleClose();
  };

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

  return (
    <Box display="flex" height="100%">
      <Box width="260px" minHeight="100vh" p={2} borderRight="1px solid #e0e0e0" bgcolor="white">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1E40AF" }}>
          Filters
        </Typography>

        {/* Filters */}
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

      {/* Charts */}
      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((chartId) => (
            <Grid key={chartId} item xs={12} md={chartId === 3 ? 12 : 6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontSize="1.1rem">
                      {{
                        1: "Number of incidents by type",
                        2: "Number of incidents by severity",
                        3: "Incident Trends over Time",
                      }[chartId]}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Tooltip title="Export Data">
                        <IconButton size="small" onClick={(e) => handleExportClick(e, `chart${chartId}`)}>
                          <FileDownloadOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={{
                        1: "Shows total number of incidents for each incident type.",
                        2: "Distribution of severity levels by number of incidents.",
                        3: "Incident type trends over time. Click legend to filter.",
                      }[chartId]}>
                        <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {{
                    1: <IncidentBarChart selectedRegions={selectedRegions} selectedIncidents={selectedIncidents} startMonth={startMonth} endMonth={endMonth} />,
                    2: <SeverityBarChart selectedRegions={selectedRegions} selectedIncidents={selectedIncidents} startMonth={startMonth} endMonth={endMonth} />,
                    3: <IncidentTrendsChart selectedRegions={selectedRegions} selectedIncidents={selectedIncidents} startMonth={startMonth} endMonth={endMonth} />,
                  }[chartId]}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Export Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload("json")}>Download JSON</MenuItem>
        <MenuItem onClick={() => handleDownload("csv")}>Download CSV</MenuItem>
      </Menu>

      {/* Toast */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={toastOpen}
        autoHideDuration={1500}
        onClose={() => setToastOpen(false)}
      >
        <Alert
          severity="success"
          sx={{
            width: "300px",
            fontSize: "1rem",
            fontWeight: 500,
            p: 2,
            border: "1px solid #4ade80",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#ecfdf5",
            color: "#166534",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          iconMapping={{
            success: <span style={{ fontSize: "1.4rem", marginRight: "0.5rem" }}>✅</span>,
          }}
        >
          Exported successfully!
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default IncidentSeverityDashboard;