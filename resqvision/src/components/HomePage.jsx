import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material';

import NotificationsIcon from '@mui/icons-material/Notifications';
import TimerIcon from '@mui/icons-material/Timer';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const metricStyle = {
  padding: '20px',
  border: '1px solid #ccc',
  textAlign: 'center',
  minWidth: '150px',
  height: '70px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const valueStyle = {
  color: '#1d4ed8',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  marginTop: '10px',
};

const HomePage = ({ setActiveTab }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/data/metrics_summary.json')
      .then((res) => res.json())
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  return (
    <Box p={4}>
      {/* Top Metrics */}
      <Grid container spacing={3} justifyContent="center" mb={10}>
        {metrics ? (
          <>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h7">Avg Response Time</Typography>
                <div style={valueStyle}>{metrics.avg_response_time_min} min</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h7">% Delayed Responses</Typography>
                <div style={valueStyle}>{metrics.percent_response_over_15}%</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h7">Top Incident Type (past 90 days)</Typography>
                <div style={valueStyle}>{metrics.most_common_incident}</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h7">Slowest Region</Typography>
                <div style={valueStyle}>{metrics.slowest_region}</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h7">Avg Hospital Capacity</Typography>
                <div style={valueStyle}>{metrics.avg_hospital_capacity}%</div>
              </Paper>
            </Grid>
          </>
        ) : (
          <Typography variant="body1" color="error">Failed to load metrics.</Typography>
        )}
      </Grid>

      {/* Quick Links */}
      <Box mt={10} mb={8}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Links
        </Typography>
        <br />
        <Grid container spacing={3} justifyContent="center" mt={1}>
          {[
            { label: 'Incidents Severity', icon: <NotificationsIcon />, tab: 'incident' },
            { label: 'Response Time', icon: <TimerIcon />, tab: 'response' },
            { label: 'Weather Impact', icon: <WbSunnyIcon />, tab: 'weather' },
          ].map((item, idx) => (
            <Grid item key={idx}>
              <Button
                variant="contained"
                onClick={() => setActiveTab(item.tab)}
                startIcon={item.icon}
                sx={{
                  backgroundColor: '#3b82f6',
                  padding: '20px 30px',
                  width: '240px',
                  height: '70px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How to Use Section */}
      <Box mt={10}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mt: 3, color: '#4b5563' }}>
          <Typography variant="body1" gutterBottom>
            This dashboard platform includes three main sections:
          </Typography>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li><strong>Incidents & Severity</strong></li>
            <li><strong>Response Time</strong></li>
            <li><strong>Weather Impact</strong></li>
          </ul>
          <Typography variant="body1" gutterBottom>
            Each section includes interactive and filterable charts for analyzing emergency service performance across regions, time, and environmental factors.
          </Typography>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Incident & Response Dashboards
            </Typography>
            <Typography variant="body2" gutterBottom>
              Use the following filters:
            </Typography>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>Region Type:</strong> Urban, Suburban, Rural (multi-select)</li>
              <li><strong>Incident Type:</strong> e.g., Fire, Medical, Crash (multi-select)</li>
              <li><strong>Time Range:</strong> Jan 2018 – Dec 2024 via a month-year slider</li>
            </ul>
            <Typography variant="body2" gutterBottom>
              These filters dynamically update all charts in the view. Legends can also be used to toggle specific series within charts.
            </Typography>
          </Box>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Weather Dashboard
            </Typography>
            <Typography variant="body2" gutterBottom>
              Filters in this section include:
            </Typography>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>Region Type:</strong> (single-select)</li>
              <li><strong>Traffic Congestion:</strong> (single-select)</li>
              <li><strong>Time Range:</strong> Jan 2018 – Dec 2024</li>
            </ul>
            <Typography variant="body2" gutterBottom>
              Focuses on how weather and road conditions affect emergency response using heatmaps.
            </Typography>
          </Box>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Interaction Tips
            </Typography>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Use the info icon besides each chart to learn more about it.</li>
              <li>Hover over chart elements to see exact values.</li>
              <li>Legends can toggle specific chart lines or categories.</li>
              <li>Tooltips and color cues highlight key trends and anomalies.</li>
            </ul>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;