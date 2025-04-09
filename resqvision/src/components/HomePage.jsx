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
  color: '#1d4ed8', // prominent blue
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
      <Box mt={12} mb={12}>
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

      {/* How to Use */}
      <Box mt={12}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>
        <Paper elevation={1} sx={{ padding: 4, textAlign: 'center', color: '#6b7280' }}>
          &lt;Instructions&gt;
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;
