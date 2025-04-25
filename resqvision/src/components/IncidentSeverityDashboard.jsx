import React, { useState, useEffect } from "react";
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
  Button,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import IncidentBarChart from "./charts/IncidentBarChart";
import SeverityBarChart from "./charts/SeverityBarChart";
import IncidentTrendsChart from "./charts/IncidentTrendsChart";
import Papa from "papaparse";

import { useDashboardData } from "../context/DashboardDataContext";

// Generate month-year labels from Jan 2018 to Dec 2024
const monthYearOptions = [...Array(84)].map((_, i) => {
  const date = new Date(2018, i);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
});

const regionOptions = ["Rural", "Suburban", "Urban"];
const incidentOptions = ["Accident", "Fire", "Cardiac Arrest", "Other"];

const IncidentSeverityDashboard = () => {
  // Global filter states
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedIncidents, setSelectedIncidents] = useState([...incidentOptions]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);
  
  // Upload/download and toast UI states
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const {
    setIncidentTypeCounts,
    setSeverityCounts,
    setIncidentTrends,
  } = useDashboardData();

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

  // Load uploaded file state on first render
  useEffect(() => {
    const prefix = localStorage.getItem("incident_dashboard_file_prefix");
    const filename = localStorage.getItem("incident_dashboard_file_name");
    if (prefix === "client-upload" && filename) {
      setUploadedFileName(filename);
    }
  }, []);

  // Utility: toggle checkbox value in a filter
  const handleToggle = (setter, current, value) => {
    const isSelected = current.includes(value);
    if (isSelected && current.length === 1) return;
    setter(isSelected ? current.filter((v) => v !== value) : [...current, value]);
  };

  // Export menu actions
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

  // Converts "Apr 2019" → "2019-04"
  const convertToMonthYear = (label) => {
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const [monthStr, year] = label.split(" ");
    return `${year}-${months[monthStr]}`;
  };

  // CSV upload and preprocessing
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    localStorage.setItem("incident_dashboard_file_name", file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rawData = results.data;

        const enriched = rawData.map((row) => {
          const ts = new Date(row.Timestamp);
          return {
            ...row,
            MonthYear: `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}`,
          };
        });

        const incidentTypeCounts = {};
        const severityCounts = {};
        const incidentTrends = {};

        enriched.forEach((row) => {
          const key1 = `${row.Incident_Type}-${row.Region_Type}-${row.MonthYear}`;
          incidentTypeCounts[key1] = (incidentTypeCounts[key1] || 0) + 1;

          const key2 = `${row.Incident_Severity}-${row.Incident_Type}-${row.Region_Type}-${row.MonthYear}`;
          severityCounts[key2] = (severityCounts[key2] || 0) + 1;

          const key3 = `${row.Incident_Type}-${row.Region_Type}-${row.MonthYear}`;
          incidentTrends[key3] = (incidentTrends[key3] || 0) + 1;
        });

        // Update context state
        setIncidentTypeCounts(
          Object.entries(incidentTypeCounts).map(([k, count]) => {
            const [Incident_Type, Region_Type, MonthYear] = k.split("-");
            return { Incident_Type, Region_Type, MonthYear, Count: count };
          })
        );

        setSeverityCounts(
          Object.entries(severityCounts).map(([k, count]) => {
            const [Incident_Severity, Incident_Type, Region_Type, MonthYear] = k.split("-");
            return { Incident_Severity, Incident_Type, Region_Type, MonthYear, Count: count };
          })
        );

        setIncidentTrends(
          Object.entries(incidentTrends).map(([k, count]) => {
            const [Incident_Type, Region_Type, MonthYear] = k.split("-");
            return { Incident_Type, Region_Type, MonthYear, Count: count };
          })
        );

        localStorage.setItem("incident_dashboard_file_prefix", "client-upload");
        setToast({ open: true, message: "File uploaded and charts updated", severity: "success" });
      },
    });
  };

  // Resets to default static data
  const handleResetData = () => {
    localStorage.removeItem("incident_dashboard_file_prefix");
    localStorage.removeItem("incident_dashboard_file_name");
    localStorage.removeItem("incidentTypeCounts");
    localStorage.removeItem("severityCounts");
    localStorage.removeItem("incidentTrends");
    setIncidentTypeCounts(null);
    setSeverityCounts(null);
    setIncidentTrends(null);
    setUploadedFileName(null);
    setToast({ open: true, message: "Reverted to default data", severity: "info" });
    setTimeout(() => window.location.reload(), 1000);
  };

  // Export filtered data to JSON or CSV
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

  // Render the dashboard
  return (
    <Box display="flex" height="100%">
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

        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Time Range (2018 - 2024)</Typography>
            <Box mt={3} px={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{monthYearOptions[timeRange[0]]}</Typography>
                <Typography variant="body2">{monthYearOptions[timeRange[1]]}</Typography>
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

        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Upload CSV (Experimental)</Typography>
            <Box display="flex" gap={1}>
              {!uploadedFileName ? (
                <Button
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ textTransform: "none", flexGrow: 1 }}
                >
                  Upload File
                  <input type="file" hidden accept=".csv" onChange={handleCSVUpload} />
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetData}
                  sx={{
                    textTransform: "none",
                    color: "#ef4444",
                    borderColor: "#ef4444",
                    '&:hover': {
                      backgroundColor: "#fee2e2",
                      borderColor: "#dc2626"
                    }
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>
            {uploadedFileName && (
              <Typography variant="caption" sx={{ mt: 1, display: "block", color: "gray" }}>
                File: {uploadedFileName}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

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

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          sx={{ width: "100%", fontWeight: 500 }}
          onClose={() => setToast({ ...toast, open: false })}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IncidentSeverityDashboard;