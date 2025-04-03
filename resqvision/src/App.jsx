import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import IncidentByRegionChart from './components/IncidentByRegionChart';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('incident');

  const toggleDrawer = (open) => () => {
    setSidebarOpen(open);
  };

  const renderActiveContent = () => {
    switch (activeView) {
      case 'incident':
        return <IncidentByRegionChart />;
      case 'response':
        return <div className="p-4 text-gray-600">[Response Chart Coming Soon]</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-100 min-h-screen">
      {/* Muted Navbar */}
      <AppBar position="static" className="bg-slate-800 shadow-md">
        <Toolbar>
          <IconButton edge="start" onClick={toggleDrawer(true)}>
            <MenuIcon className="text-white" />
          </IconButton>
          <Typography variant="h6" className="text-white font-semibold ml-3">
            ResQVision
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer anchor="left" open={sidebarOpen} onClose={toggleDrawer(false)}>
        <div className="w-60 bg-white h-full">
          <List>
            <ListItem button onClick={() => { setActiveView('incident'); setSidebarOpen(false); }}>
              <ListItemText primary="Incidents Overview" />
            </ListItem>
            <ListItem button onClick={() => { setActiveView('response'); setSidebarOpen(false); }}>
              <ListItemText primary="Response Performance" />
            </ListItem>
          </List>
        </div>
      </Drawer>

      {/* Content with Sidebar Width Reserved */}
      <main className="flex">
        <div className="w-60 hidden md:block"></div> {/* Reserve space for sidebar on wide screens */}
        <div className="flex-1 p-6">{renderActiveContent()}</div>
      </main>
    </div>
  );
}

export default App;
