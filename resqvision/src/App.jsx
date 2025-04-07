import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
// import IncidentSeverityDashboard from './components/IncidentSeverityDashboard';
import ResponseTimesDashboard from './components/ResponseDashboard';

function App() {
  const [activeView] = useState('response');

  const renderActiveContent = () => {
    switch (activeView) {
      case 'incident':
        return <div className="p-4 text-gray-600">[Incident Chart Coming Soon]</div>;
      case 'response':
        return <ResponseTimesDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
      {/* Beautified Top Navbar without hamburger */}
      <AppBar position="static" sx={{ background: 'linear-gradient(to right, #1e3a8a, #3b82f6)' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              ResQVision
            </Typography>
          </Box>
          <Box>
            <Button
              color="inherit"
              sx={{ color: 'white', ml: 2 }}
              href="/about"
            >
              ABOUT US
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6">{renderActiveContent()}</main>
    </div>
  );
}

export default App;
