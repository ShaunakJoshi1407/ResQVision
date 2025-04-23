export const getDashboardFile = (chartKey, fallbackPath) => {
  // Get the active file prefix for this dashboard from localStorage
  const prefix = localStorage.getItem('incident_dashboard_file_prefix');

  // If a prefix is present, use the uploaded version
  if (prefix) {
    return `/data/${chartKey}_${prefix}.json`;
  }

  // Otherwise, use the default file
  return fallbackPath;
};
