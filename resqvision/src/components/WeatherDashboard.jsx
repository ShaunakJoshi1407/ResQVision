import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, FormControl, Radio, RadioGroup,
  FormControlLabel, Grid, Slider, IconButton, Tooltip, Menu, MenuItem,
  Snackbar, Alert, Button
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { saveAs } from "file-saver";
import Papa from "papaparse";
import WeatherHeatmap from "./charts/WeatherHeatmap";
import { useDashboardData } from "../context/DashboardDataContext";

const monthYearOptions = [...Array(84)].map((_, i) => {
  const date = new Date(2018, i);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
});

const regionOptions = ["Rural", "Suburban", "Urban"];
const trafficOptions = ["Low", "Moderate", "High"];

const convertToMonthYear = (label) => {
  // Convert month-year string to YYYY-MM format
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const [month, year] = label.split(" ");
  return `${year}-${months[month]}`;
};

const WeatherDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("Rural");
  const [selectedTraffic, setSelectedTraffic] = useState("Low");
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

  const { setWeatherHeatmapData } = useDashboardData();

  useEffect(() => {
    const name = localStorage.getItem("weather_dashboard_file_name");
    if (name) setUploadedFileName(name);
  }, []);

  // Load initial data from local storage
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    localStorage.setItem("weather_dashboard_file_name", file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const enriched = data.map((row) => {
          const ts = new Date(row.Timestamp);
          return {
            ...row,
            MonthYear: `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}`,
          };
        });

        const groups = {};

        for (const row of enriched) {
          const key = `${row.Region_Type}-${row.Traffic_Congestion}-${row.Weather_Condition}-${row.Road_Type}-${row.MonthYear}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(Number(row.Response_Time));
        }

        const processed = Object.entries(groups).map(([k, values]) => {
          const [Region_Type, Traffic_Congestion, Weather_Condition, Road_Type, MonthYear] = k.split("-");
          return {
            Region_Type,
            Traffic_Congestion,
            Weather_Condition,
            Road_Type,
            MonthYear,
            Avg_Response_Time: values.reduce((a, b) => a + b, 0) / values.length,
          };
        });

        setWeatherHeatmapData(processed);
        localStorage.setItem("weather_dashboard_file_prefix", "client-upload");
        setToastOpen(true);
      },
    });
  };

  // Reset uploaded data
  const handleResetData = () => {
    setUploadedFileName(null);
    localStorage.removeItem("weather_dashboard_file_name");
    localStorage.removeItem("weatherHeatmapData");
    localStorage.removeItem("weather_dashboard_file_prefix");
    setWeatherHeatmapData(null);
    setTimeout(() => window.location.reload(), 800);
  };

  const handleExportClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showToast = () => {
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 1500);
  };

  // Download data in selected format
  const handleDownload = async (format) => {
    const response = await fetch("/data/weather_heatmap.json");
    const data = await response.json();

    const startKey = convertToMonthYear(startMonth);
    const endKey = convertToMonthYear(endMonth);

    const filtered = data.filter(
      (d) =>
        d.Region_Type === selectedRegion &&
        d.Traffic_Congestion === selectedTraffic &&
        d.MonthYear >= startKey &&
        d.MonthYear <= endKey
    );

    if (format === "json") {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "weather_heatmap_data.json");
    } else {
      const keys = Object.keys(filtered[0] || {});
      const csv = [
        keys.join(","),
        ...filtered.map((row) => keys.map((k) => row[k]).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      saveAs(blob, "weather_heatmap_data.csv");
    }

    showToast();
    handleClose();
  };

  // Handle keyboard events for menu
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
              <RadioGroup value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                {regionOptions.map((region) => (
                  <FormControlLabel key={region} value={region} control={<Radio />} label={region} />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Traffic Congestion</Typography>
            <FormControl component="fieldset">
              <RadioGroup value={selectedTraffic} onChange={(e) => setSelectedTraffic(e.target.value)}>
                {trafficOptions.map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Time Range (2018 – 2024)</Typography>
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

        <Card variant="outlined">
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
        <Card variant="outlined">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Average Response Time by Weather Condition and Road Type
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Export Data">
                  <IconButton size="small" onClick={handleExportClick}>
                    <FileDownloadOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Displays the average response time for combinations of weather conditions and road types.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Region Type: {selectedRegion} &nbsp;&nbsp;&nbsp; Traffic: {selectedTraffic}
            </Typography>
            <WeatherHeatmap
              selectedRegions={[selectedRegion]}
              selectedTraffic={selectedTraffic}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          </CardContent>
        </Card>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload("json")}>Download JSON</MenuItem>
        <MenuItem onClick={() => handleDownload("csv")}>Download CSV</MenuItem>
      </Menu>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={toastOpen}
        autoHideDuration={1800}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity="success" sx={{ width: "100%", fontWeight: 500 }}>
          File uploaded and heatmap updated!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WeatherDashboard;