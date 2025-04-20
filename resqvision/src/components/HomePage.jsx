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
            <MetricCardAnimated label="Avg Response Time" value={metrics.avg_response_time_min} unit="min" />
            <MetricCardAnimated label="% Delayed Responses" value={metrics.percent_response_over_15} unit="%" />
            <MetricCardStatic label="Top Incident Type (past 90 days)" value={metrics.most_common_incident} />
            <MetricCardStatic label="Slowest Region" value={metrics.slowest_region} />
            <MetricCardAnimated label="Avg Hospital Capacity" value={metrics.avg_hospital_capacity} unit="%" />
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

// ---------- Supporting Components ----------

const MetricCardAnimated = ({ label, value, unit }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start;
    const duration = 800;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = parseFloat((value * progress).toFixed(1));
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <Grid item xs={12} md={2.3}>
      <Paper style={metricStyle}>
        <Typography variant="h7">{label}</Typography>
        <div style={valueStyle}>
          {displayValue.toFixed(1)}{unit ? ` ${unit}` : ''}
        </div>
      </Paper>
    </Grid>
  );
};

const MetricCardStatic = ({ label, value }) => (
  <Grid item xs={12} md={2.3}>
    <Paper style={metricStyle}>
      <Typography variant="h7">{label}</Typography>
      <div style={valueStyle}>{value}</div>
    </Paper>
  </Grid>
);
