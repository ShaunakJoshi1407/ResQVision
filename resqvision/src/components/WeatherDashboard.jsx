import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
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
import { saveAs } from "file-saver";

import WeatherHeatmap from "./charts/WeatherHeatmap";

const monthYearOptions = [...Array(84)].map((_, i) => {
  const date = new Date(2018, i);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
});

const regionOptions = ["Rural", "Suburban", "Urban"];
const trafficOptions = ["Low", "Moderate", "High"];

const convertToMonthYear = (label) => {
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

  const startMonth = monthYearOptions[timeRange[0]];
  const endMonth = monthYearOptions[timeRange[1]];

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

  return (
    <Box display="flex" height="100%">
      {/* Sidebar Filters */}
      <Box width="260px" minHeight="100vh" p={2} borderRight="1px solid #e0e0e0" bgcolor="white">
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1E40AF" }}>
          Filters
        </Typography>

        {/* Region Type - Single Select */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Region Type</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regionOptions.map((region) => (
                  <FormControlLabel
                    key={region}
                    value={region}
                    control={<Radio />}
                    label={region}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Traffic Congestion - Single Select */}
        <Card variant="outlined" className="mb-4">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Traffic Congestion</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedTraffic}
                onChange={(e) => setSelectedTraffic(e.target.value)}
              >
                {trafficOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Time Range Filter */}
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

      {/* Chart Area */}
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

      {/* Export Dropdown */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload("json")}>Download JSON</MenuItem>
        <MenuItem onClick={() => handleDownload("csv")}>Download CSV</MenuItem>
      </Menu>

      {/* Toast Alert */}
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

export default WeatherDashboard;