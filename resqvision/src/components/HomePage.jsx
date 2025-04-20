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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Optional, if you want to re-add later

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
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Instructions Section */}
      <Box mt={10} mb={4}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
            How to Use ResQVision
          </Typography>
        </Box>
        <br />
        <Grid container spacing={3} justifyContent="center" mt={1}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setActiveTab('instructions')}
              endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
              sx={{
                backgroundColor: 'white',
                border: '2px solid #3b82f6',
                padding: '20px 30px',
                width: '240px',
                height: '70px',
                textAlign: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                color: '#1e3a8a',
                '&:hover': {
                  backgroundColor: '#e0f2fe',
                  borderColor: '#2563eb',
                },
              }}
            >
              Instructions
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
