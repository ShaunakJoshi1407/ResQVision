// components/InstructionsPage.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const InstructionsPage = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
        How to Use ResQVision
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
        </Box>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Interaction Tips
          </Typography>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Use the info icon beside each chart to learn more about it.</li>
            <li>Hover over chart elements to see exact values.</li>
            <li>Legends can toggle specific chart lines or categories.</li>
            <li>Tooltips and color cues highlight key trends and anomalies.</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};

export default InstructionsPage;