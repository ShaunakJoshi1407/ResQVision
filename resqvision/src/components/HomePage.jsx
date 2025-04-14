import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
      <Box mt={10}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>

        <Box mt={4}>
          {/* Incident Dashboard */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} /> Incident Dashboard
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom>
                Visualize historical incident patterns and their severity breakdowns over time and across regions.
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li><strong>Incident Type vs Count:</strong> Distribution of emergency types.</li>
                <li><strong>Severity vs Count:</strong> Severity-level analysis.</li>
                <li><strong>Incident Trends:</strong> Monthly trends over time.</li>
                <li>Filters:
                  <ul>
                    <li><strong>Region Type</strong></li>
                    <li><strong>Incident Type</strong></li>
                    <li><strong>Time Range</strong></li>
                  </ul>
                </li>
                <li>Hover over charts to view exact counts and insights.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          {/* Response Dashboard */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <TimerIcon sx={{ mr: 1 }} /> Response Dashboard
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom>
                Analyze how response time varies based on availability and infrastructure.
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li><strong>Ambulance Availability:</strong> Response delays comparison.</li>
                <li><strong>Injuries Chart:</strong> Injuries vs time relationship.</li>
                <li><strong>Heatmap:</strong> Road Type vs Distance impact.</li>
                <li>Filters:
                  <ul>
                    <li><strong>Region Type</strong></li>
                    <li><strong>Emergency Level</strong></li>
                    <li><strong>Time Range</strong></li>
                  </ul>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          {/* Weather Dashboard */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <WbSunnyIcon sx={{ mr: 1 }} /> Weather Dashboard
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom>
                Examine how weather conditions and road types influence response times.
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li><strong>Weather × Road Type Heatmap:</strong> Compare average response time.</li>
                <li><strong>Color scale:</strong> Represents average delay intensity.</li>
                <li>Filters:
                  <ul>
                    <li><strong>Region Type</strong> (Single Select)</li>
                    <li><strong>Traffic Congestion</strong> (Single Select)</li>
                    <li><strong>Time Range</strong> (Month-Year slider)</li>
                  </ul>
                </li>
                <li>Use hover to get exact minute-wise delay between combinations.</li>
              </ul>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
