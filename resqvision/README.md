# ResQVision

This project is built using React (Vite) for the frontend, D3.js for rendering charts, and Python for data preprocessing. The application follows a modular structure and is organized into reusable components.

## Main Frontend Components

### App.jsx
Handles routing and tab navigation between:
- Home
- Incident Dashboard
- Response Dashboard
- About Us

### HomePage.jsx
Provides an overview of the ResQVision platform with:
- Top-level summary metrics fetched from preprocessed data
- Quick access links to:
  - Incident Trends
  - Response Analysis
  - Weather Impact

### InstructionsPage.jsx
Contains information on how to use the three dashboards with the given filters. This also gives the user an idea about the insights they can gain from each dashboard.

### IncidentSeverityDashboard.jsx
Main dashboard for incident analysis. It includes:

**IncidentBarChart**
- Vertical bar chart of Incident Type vs Count
- Filters: Region, Time, Incident Type
- Includes tooltips

**SeverityBarChart**
- Horizontal bar chart of Severity vs Count
- Lazy loads relevant slices of data
- Filters: Region, Incident Type, Time

**IncidentTrendsChart**
- Line chart of Incident Count over Time, grouped by type
- Includes a floating legend

### ResponseDashboard.jsx
Main dashboard for response time analysis. It includes:

**AmbulanceAvailabilityChart**
- Bar chart comparing response times with and without ambulance availability
- Filters: Region, Time, Emergency Level

**InjuriesResponseLineChart**
- Line chart showing average response time vs number of injuries
- Filters: Region, Time, Emergency Level

**ResponseHeatmap**
- Heatmap of average response time based on Road Type and Distance to Incident
- Filters: Region, Time, Emergency Level

### WeatherDashboard.jsx
Main dashboard for weather impact analysis. It includes:

**WeatherHeatmap.jsx**
- Heatmap showing average response times based on Weather Condition and Road Type
- Filters: Region, Traffic Congestion, Time

## Data Preprocessing

The `data_preprocessing` directory contains:

- `Data Preprocessing.ipynb`:  
  Preprocesses `emergency_service_routing_with_timestamps.csv` to generate data used in both dashboards.

- `Home_Page_Metrics.ipynb`:  
  Generates `metrics_summary.json`, used to display summary metrics on the homepage.

## Sample Data

- Sample csv files are present in the `data/Sample_data` folder, which could be used for testing the "CSV Upload" feature in all of the dashboards.
- Sample data can also be created from the main dataset located in the `data` folder, by using the last cell of the notebook `Data Preprocessing.ipynb`.
