import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
} from '@mui/material';

import IncidentSeverityDashboard from './components/IncidentSeverityDashboard';
import ResponseTimesDashboard from './components/ResponseDashboard';
import WeatherDashboard from './components/WeatherDashboard';
import HomePage from './components/HomePage';

function AboutPage() {
  return (
    <div className="p-4 text-gray-600">
      <Typography variant="h4">About Us</Typography>
      <p>Details about the team, vision, and project.</p>
    </div>
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
          {/* Left logo and tabs */}
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
              <Tab
                label="Home"
                value="home"
                sx={{ color: 'white', textTransform: 'none' }}
              />
              <Tab
                label="Incident Trends Dashboard"
                value="incident"
                sx={{ color: 'white', textTransform: 'none' }}
              />
              <Tab
                label="Response Analysis Dashboard"
                value="response"
                sx={{ color: 'white', textTransform: 'none' }}
              />
              <Tab
                label="Weather Impact"
                value="weather"
                sx={{ color: 'white', textTransform: 'none' }}
              />
            </Tabs>
          </Box>

          {/* About Us on the far right */}
          <Tabs
            value={activeTab === 'about' ? 'about' : false}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          >
            <Tab
              label="About Us"
              value="about"
              sx={{ color: 'white', textTransform: 'none' }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Main Page Content */}
      <main className="flex-1 p-4 md:p-6">{renderContent()}</main>
    </div>
  );
}

export default App;
