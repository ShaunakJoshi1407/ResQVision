import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, FormControl,
  FormGroup, FormControlLabel, Checkbox, Grid, Slider,
  IconButton, Tooltip, Menu, MenuItem, Snackbar,
  Alert, Button
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { saveAs } from "file-saver";
import Papa from "papaparse";

import AmbulanceAvailabilityChart from "./charts/AmbulanceAvailabilityChart";
import InjuriesResponseLineChart from "./charts/InjuriesResponseLineChart";
import ResponseHeatmap from "./charts/ResponseHeatmap";

import { useDashboardData } from "../context/DashboardDataContext";

const monthYearOptions = [...Array(84)].map((_, i) => {
  const date = new Date(2018, i);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
});

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

const binDistance = (dist) => {
  const d = parseFloat(dist);
  if (isNaN(d)) return "Unknown";
  if (d < 2) return "0-2 km";
  if (d < 5) return "2-5 km";
  if (d < 10) return "5-10 km";
  return "10+ km";
};

const ResponseDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedLevels, setSelectedLevels] = useState([...emergencyLevels]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];
  const monthRange = [convertToMonthYear(startMonth), convertToMonthYear(endMonth)];

  const {
    setAmbulanceResponseData,
    setInjuriesResponseData,
    setHeatmapResponseData,
  } = useDashboardData();

  useEffect(() => {
    const prefix = localStorage.getItem("response_dashboard_file_prefix");
    const fileName = localStorage.getItem("response_dashboard_file_name");
    if (prefix === "client-upload" && fileName) {
      setUploadedFileName(fileName);
    }
  }, []);

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
    const downloaders = {
      chart1: { json: downloadChart1JSON, csv: downloadChart1CSV },
      chart2: { json: downloadChart2JSON, csv: downloadChart2CSV },
      chart3: { json: downloadChart3JSON, csv: downloadChart3CSV },
    };
    downloaders[menuTarget][format]();
    showToast();
    handleClose();
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
  }

  const downloadChart1JSON = () =>
    exportFiltered(
      "/data/ambulance_response_filtered.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "ambulance_availability_data",
      "json"
  );

  const downloadChart1CSV = () =>
    exportFiltered(
      "/data/ambulance_response_filtered.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "ambulance_availability_data",
      "csv"
  );

  const downloadChart2JSON = () =>
    exportFiltered(
      "/data/injuries_response.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "injuries_response_data",
      "json"
  );

  const downloadChart2CSV = () =>
    exportFiltered(
      "/data/injuries_response.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "injuries_response_data",
      "csv"
  );

  const downloadChart3JSON = () =>
    exportFiltered(
      "/data/response_heatmap.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "response_heatmap_data",
      "json"
  );

  const downloadChart3CSV = () =>
    exportFiltered(
      "/data/response_heatmap.json",
      (d) =>
        selectedRegions.includes(d.Region_Type) &&
        selectedLevels.includes(d.Emergency_Level) &&
        d.MonthYear >= monthRange[0] &&
        d.MonthYear <= monthRange[1],
      "response_heatmap_data",
      "csv"
  );

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    localStorage.setItem("response_dashboard_file_name", file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const raw = results.data;

        const enriched = raw.map((row) => {
          const ts = new Date(row.Timestamp);
          return {
            ...row,
            MonthYear: `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}`,
            Distance_Bin: binDistance(row.Distance_to_Incident)
          };
        });

        const ambulance = {};
        const injuries = {};
        const heatmap = {};

        enriched.forEach((row) => {
          const responseTime = parseFloat(row.Response_Time);
          if (isNaN(responseTime)) return;

          const k1 = `${row.Region_Type}-${row.Emergency_Level}-${row.Ambulance_Availability}-${row.MonthYear}`;
          ambulance[k1] = ambulance[k1] || [];
          ambulance[k1].push(responseTime);

          const k2 = `${row.Region_Type}-${row.Emergency_Level}-${row.Number_of_Injuries}-${row.MonthYear}`;
          injuries[k2] = injuries[k2] || [];
          injuries[k2].push(responseTime);

          const k3 = `${row.Region_Type}-${row.Emergency_Level}-${row.Road_Type}-${row.Distance_Bin}-${row.MonthYear}`;
          heatmap[k3] = heatmap[k3] || [];
          heatmap[k3].push(responseTime);
        });

        const ambulanceData = Object.entries(ambulance).map(([k, arr]) => {
          const [Region_Type, Emergency_Level, Ambulance_Availability, MonthYear] = k.split("-");
          return {
            Region_Type, Emergency_Level, Ambulance_Availability, MonthYear,
            Avg_Response_Time: arr.reduce((a, b) => a + b, 0) / arr.length,
          };
        });

        const injuriesData = Object.entries(injuries).map(([k, arr]) => {
          const [Region_Type, Emergency_Level, Number_of_Injuries, MonthYear] = k.split("-");
          return {
            Region_Type, Emergency_Level, Number_of_Injuries: +Number_of_Injuries, MonthYear,
            Avg_Response_Time: arr.reduce((a, b) => a + b, 0) / arr.length,
          };
        });

        const heatmapData = Object.entries(heatmap).map(([k, arr]) => {
          const [Region_Type, Emergency_Level, Road_Type, Distance_Bin, MonthYear] = k.split("-");
          return {
            Region_Type, Emergency_Level, Road_Type, Distance_Bin, MonthYear,
            Avg_Response_Time: arr.reduce((a, b) => a + b, 0) / arr.length,
          };
        });

        setAmbulanceResponseData(ambulanceData);
        setInjuriesResponseData(injuriesData);
        setHeatmapResponseData(heatmapData);

        localStorage.setItem("response_dashboard_file_prefix", "client-upload");
        setToastOpen(true);
      },
    });
  };

  const handleResetData = () => {
    localStorage.removeItem("response_dashboard_file_prefix");
    localStorage.removeItem("response_dashboard_file_name");
    localStorage.removeItem("ambulanceResponseData");
    localStorage.removeItem("injuriesResponseData");
    localStorage.removeItem("heatmapResponseData");
    setAmbulanceResponseData(null);
    setInjuriesResponseData(null);
    setHeatmapResponseData(null);
    setUploadedFileName(null);
    setToast({ open: true, message: "Reverted to default data", severity: "info" });
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <Box display="flex">
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
                        onChange={() => handleToggle(setSelectedRegions, selectedRegions, region)}
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
                        onChange={() => handleToggle(setSelectedLevels, selectedLevels, level)}
                      />
                    }
                    label={level}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Time Range */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Time Range (2018 – 2024)</Typography>
            <Box mt={3} px={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight={500}>{startMonth}</Typography>
                <Typography variant="body2" fontWeight={500}>{endMonth}</Typography>
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

        {/* Upload or Reset */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Upload CSV</Typography>
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

      {/* Charts */}
      <Box flex={1} p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontSize="1.01rem">
                    Avg. Response Time by Ambulance Availability
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart1")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compares average response time for available and unavailable ambulances.">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontSize="1.1rem">
                    Avg. Response Time by Number of Injuries
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart2")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Shows how response time changes with injury count.">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontSize="1.1rem">
                    Response Time by Road Type and Distance
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Export Data">
                      <IconButton size="small" onClick={(e) => handleExportClick(e, "chart3")}>
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Heatmap showing response time by road and distance.">
                      <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
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

      {/* Export Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload("json")}>Download JSON</MenuItem>
        <MenuItem onClick={() => handleDownload("csv")}>Download CSV</MenuItem>
      </Menu>

      <Snackbar
        open={toastOpen}
        autoHideDuration={1800}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", fontWeight: 500 }}>
          File uploaded and charts updated!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResponseDashboard;
