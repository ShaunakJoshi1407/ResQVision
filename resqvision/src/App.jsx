import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Link,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

import IncidentSeverityDashboard from './components/IncidentSeverityDashboard';
import ResponseTimesDashboard from './components/ResponseDashboard';
import WeatherDashboard from './components/WeatherDashboard';
import HomePage from './components/HomePage';

function AboutPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 64px)"
      padding={2}
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" paragraph>
          ResQVision is a data visualization dashboard built to help emergency services analyze patterns in incidents, response times, and environmental factors like traffic and weather.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Team Members
        </Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><Link 
                href="https://www.linkedin.com/in/shaunakhemantjoshi/" 
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                display="flex"
              >
                Shaunak Hemant Joshi
              </Link>
          </li>

          <li><Link 
                href="https://www.linkedin.com/in/tanay-mehendale/" 
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                display="flex"
              >
                Tanay Mahesh Mehendale
              </Link>
          </li>

          <li><Link 
                href="https://www.linkedin.com/in/yapatil/" 
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                display="flex"
              >
                Yash Patil
              </Link>
          </li>

          <li><Link 
                href="https://www.linkedin.com/in/sai-nithya-makineni/" 
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                display="flex"
              >
                Sai Nithya Makineni
              </Link>
          </li>
          
        </ul>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Contact & Contributions
        </Typography>
        <Typography variant="body1" paragraph>
          You can reach us via our GitHub repository. If you have suggestions, feedback, or spot any issues, feel free to raise an issue or create a pull request:
        </Typography>
        <Link
          href="https://github.com/ShaunakJoshi1407/ResQVision"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          display="flex"
          alignItems="center"
          gap={1}
          color="primary"
          sx={{ fontWeight: 500 }}
        >
          <GitHubIcon fontSize="small" />
          github.com/ShaunakJoshi1407/ResQVision
        </Link>
      </Paper>
    </Box>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'incident':
        return <IncidentSeverityDashboard />;
      case 'response':
        return <ResponseTimesDashboard />;
      case 'weather':
        return <WeatherDashboard />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
          paddingY: 0.5,
        }}
      >
        <Toolbar>
          <Box display="flex" alignItems="center" gap={4} sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              ResQVision
            </Typography>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              textColor="inherit"
              TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
            >
              <Tab label="Home" value="home" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Incident Trends Dashboard" value="incident" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Response Analysis Dashboard" value="response" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Weather Impact Dashboard" value="weather" sx={{ color: 'white', textTransform: 'none' }} />
            </Tabs>
          </Box>

          <Tabs
            value={activeTab === 'about' ? 'about' : false}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          >
            <Tab label="About Us" value="about" sx={{ color: 'white', textTransform: 'none' }} />
          </Tabs>
        </Toolbar>
      </AppBar>

      <main className="flex-1 p-4 md:p-6" style={{ marginTop: '1rem' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
