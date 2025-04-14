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
};

const valueStyle = {
  color: '#1d4ed8',
  fontSize: '1.8rem',
  fontWeight: 'bold',
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
                <Typography variant="h6">Unique Emergencies</Typography>
                <div style={valueStyle}>{metrics.unique_emergencies}</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h6">Avg Response Time</Typography>
                <div style={valueStyle}>{metrics.avg_response_time_min} min</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h6">Most Common Incident</Typography>
                <div style={valueStyle}>{metrics.most_common_incident}</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h6">% High Severity</Typography>
                <div style={valueStyle}>{metrics.percent_high_severity}%</div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2.3}>
              <Paper style={metricStyle}>
                <Typography variant="h6">Ambulance Avail.</Typography>
                <div style={valueStyle}>{metrics.ambulance_availability_rate}%</div>
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
        <br/>
        <Grid container spacing={3} justifyContent="center" mt={1}>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#3b82f6', padding: '20px 30px', minWidth: 200 }}
              startIcon={<NotificationsIcon />}
              onClick={() => setActiveTab('incident')}
            >
              Incidents & Severity
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#3b82f6', padding: '20px 30px', minWidth: 200 }}
              startIcon={<TimerIcon />}
              onClick={() => setActiveTab('response')}
            >
              Response Time
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#3b82f6', padding: '20px 30px', minWidth: 200 }}
              startIcon={<WbSunnyIcon />}
              onClick={() => setActiveTab('weather')}
            >
              Weather Impact
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* How to Use Section */}
      <Box mt={10}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mt: 3, color: '#4b5563' }}>
          <Typography variant="body1" gutterBottom>
            This dashboard platform consists of three main sections: <strong>Incidents & Severity</strong>,
            <strong> Response Time</strong>, and <strong>Weather Impact</strong>.
            Each section is powered by filterable and interactive charts designed to offer actionable insights
            into emergency service performance across regions, time periods, and operational conditions.
          </Typography>

          <Typography variant="body1" gutterBottom>
            In both the <strong>Incident Dashboard</strong> and the <strong>Response Dashboard</strong>,
            users can apply filters for:
            <ul>
              <li><strong>Region Type:</strong> Urban, Suburban, or Rural (multi-select)</li>
              <li><strong>Incident Type</strong> (multi-select)</li>
              <li><strong>Time Range:</strong> Select a window from Jan 2018 to Dec 2024 using a month slider</li>
            </ul>
            These filters support multiple selections and dynamically update all charts within the view.
          </Typography>

          <Typography variant="body1" gutterBottom>
            The <strong>Weather Dashboard</strong> differs slightly—it uses <strong>single-select filters</strong>
            for <strong>Region Type</strong> and <strong>Traffic Congestion</strong>, and supports a
            similar time range filter. This section focuses on how weather conditions and road infrastructure
            impact emergency response times using a heatmap.
          </Typography>

          <Typography variant="body1" gutterBottom>
            All charts are interactive. You can hover to view exact values (incident counts or average response times),
            compare patterns across incident types and severities, and track trends over time.
            Color encodings and tooltips help you quickly identify anomalies and bottlenecks.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;
