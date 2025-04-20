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
import { saveAs } from "file-saver";

import AmbulanceAvailabilityChart from "./charts/AmbulanceAvailabilityChart";
import InjuriesResponseLineChart from "./charts/InjuriesResponseLineChart";
import ResponseHeatmap from "./charts/ResponseHeatmap";

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

const ResponseDashboard = () => {
  const [selectedRegions, setSelectedRegions] = useState([...regionOptions]);
  const [selectedLevels, setSelectedLevels] = useState([...emergencyLevels]);
  const [timeRange, setTimeRange] = useState([0, monthYearOptions.length - 1]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

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
  };

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

  return (
    <Box display="flex">
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

        <Card variant="outlined">
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
      </Box>

      {/* Main Charts */}
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

      {/* Toast Message */}
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

export default ResponseDashboard;