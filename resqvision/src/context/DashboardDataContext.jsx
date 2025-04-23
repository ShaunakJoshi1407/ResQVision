import React, { createContext, useContext, useEffect, useState } from "react";

const DashboardDataContext = createContext();

export const DashboardDataProvider = ({ children }) => {
  const [incidentTypeCounts, setIncidentTypeCounts] = useState(null);
  const [severityCounts, setSeverityCounts] = useState(null);
  const [incidentTrends, setIncidentTrends] = useState(null);
  const [ambulanceResponseData, setAmbulanceResponseData] = useState(null);
  const [injuriesResponseData, setInjuriesResponseData] = useState(null);
  const [heatmapResponseData, setHeatmapResponseData] = useState(null);
  const [weatherHeatmapData, setWeatherHeatmapData] = useState(null);

  useEffect(() => {
    const restore = (key, setter) => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          setter(JSON.parse(val));
        } catch (err) {
          console.warn(`Failed to restore ${key}:`, err);
        }
      }
    };

    restore("incidentTypeCounts", setIncidentTypeCounts);
    restore("severityCounts", setSeverityCounts);
    restore("incidentTrends", setIncidentTrends);
    restore("ambulanceResponseData", setAmbulanceResponseData);
    restore("injuriesResponseData", setInjuriesResponseData);
    restore("heatmapResponseData", setHeatmapResponseData);
    restore("weatherHeatmapData", setWeatherHeatmapData);
  }, []);

  const persist = (key, data) => {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.removeItem(key);
    }
  };

  return (
    <DashboardDataContext.Provider
      value={{
        incidentTypeCounts,
        setIncidentTypeCounts: (data) => {
          setIncidentTypeCounts(data);
          persist("incidentTypeCounts", data);
        },
        severityCounts,
        setSeverityCounts: (data) => {
          setSeverityCounts(data);
          persist("severityCounts", data);
        },
        incidentTrends,
        setIncidentTrends: (data) => {
          setIncidentTrends(data);
          persist("incidentTrends", data);
        },
        ambulanceResponseData,
        setAmbulanceResponseData: (data) => {
          setAmbulanceResponseData(data);
          persist("ambulanceResponseData", data);
        },
        injuriesResponseData,
        setInjuriesResponseData: (data) => {
          setInjuriesResponseData(data);
          persist("injuriesResponseData", data);
        },
        heatmapResponseData,
        setHeatmapResponseData: (data) => {
          setHeatmapResponseData(data);
          persist("heatmapResponseData", data);
        },
        weatherHeatmapData,
        setWeatherHeatmapData: (data) => {
          setWeatherHeatmapData(data);
          persist("weatherHeatmapData", data);
        },
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => useContext(DashboardDataContext);