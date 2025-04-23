import React, { useState, useEffect } from 'react';
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
import InstructionsPage from './components/InstructionsPage';

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
          {[
            {
              name: 'Shaunak Hemant Joshi',
              url: 'https://www.linkedin.com/in/shaunakhemantjoshi/',
            },
            {
              name: 'Tanay Mahesh Mehendale',
              url: 'https://www.linkedin.com/in/tanay-mehendale/',
            },
            {
              name: 'Yash Patil',
              url: 'https://www.linkedin.com/in/yapatil/',
            },
            {
              name: 'Sai Nithya Makineni',
              url: 'https://www.linkedin.com/in/sai-nithya-makineni/',
            },
          ].map((member, idx) => (
            <li key={idx}>
              <Link
                href={member.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                display="flex"
              >
                {member.name}
              </Link>
            </li>
          ))}
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

  // Restore last selected tab from localStorage
  useEffect(() => {
    const lastTab = localStorage.getItem('resqvision_active_tab');
    if (lastTab) setActiveTab(lastTab);
  }, []);

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    localStorage.setItem('resqvision_active_tab', newValue);
  };

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
      case 'instructions':
        return <InstructionsPage />;
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
          {/* Logo and Title */}
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mr: 4 }}>
            ResQVision
          </Typography>

          {/* Left-aligned dashboard tabs */}
          <Box sx={{ flexGrow: 1 }}>
            <Tabs
              value={['home', 'incident', 'response', 'weather'].includes(activeTab) ? activeTab : false}
              onChange={handleTabChange}
              textColor="inherit"
              TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
            >
              <Tab label="Home" value="home" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Incident Trends Dashboard" value="incident" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Response Analysis Dashboard" value="response" sx={{ color: 'white', textTransform: 'none' }} />
              <Tab label="Weather Impact Dashboard" value="weather" sx={{ color: 'white', textTransform: 'none' }} />
            </Tabs>
          </Box>

          {/* Right-aligned info tabs */}
          <Tabs
            value={['instructions', 'about'].includes(activeTab) ? activeTab : false}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          >
            <Tab label="Instructions" value="instructions" sx={{ color: 'white', textTransform: 'none' }} />
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