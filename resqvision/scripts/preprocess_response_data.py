import pandas as pd
import numpy as np
import os

# File paths
input_csv = "data/emergency_data_with_complex_response.csv"
output_dir = "public/data"
os.makedirs(output_dir, exist_ok=True)

# Load dataset
df = pd.read_csv(input_csv)

# Convert Timestamp to datetime and extract Year
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df["Year"] = df["Timestamp"].dt.year

# ----------------------------------------
# 1. Ambulance Response (Filtered)
# ----------------------------------------
ambulance_grouped = (
    df.groupby(["Ambulance_Availability", "Region_Type", "Emergency_Level", "Year"])["Complex_Response_Time"]
    .mean()
    .reset_index()
)
ambulance_grouped.columns = [
    "Ambulance_Availability",
    "Region_Type",
    "Emergency_Level",
    "Year",
    "Avg_Response_Time"
]
ambulance_output = os.path.join(output_dir, "ambulance_response_filtered.json")
ambulance_grouped.to_json(ambulance_output, orient="records", indent=2)

# ----------------------------------------
# 2. Injuries vs Response (with Region)
# ----------------------------------------
injury_grouped = (
    df.groupby(["Region_Type", "Emergency_Level", "Number_of_Injuries", "Year"])["Response_Time"]
    .mean()
    .reset_index()
)
injury_grouped.columns = [
    "Region_Type",
    "Emergency_Level",
    "Number_of_Injuries",
    "Year",
    "Avg_Response_Time"
]
injury_output = os.path.join(output_dir, "injuries_response.json")
injury_grouped.to_json(injury_output, orient="records", indent=2)

# ----------------------------------------
# 3. Heatmap: Distance Bin × Road Type
# ----------------------------------------
# Create distance bins
bins = [0, 10, 20, 30, 40, 50, np.inf]
labels = ['0-10', '10-20', '20-30', '30-40', '40-50', '50+']
df["Distance_Bin"] = pd.cut(df["Distance_to_Incident"], bins=bins, labels=labels, right=False)

# Group by all filters + visual dimensions
heatmap_grouped = (
    df.groupby(["Road_Type", "Distance_Bin", "Region_Type", "Emergency_Level", "Year"])["Complex_Response_Time"]
    .mean()
    .reset_index()
    .dropna()
)

heatmap_grouped.columns = [
    "Road_Type", 
    "Distance_Bin", 
    "Region_Type", 
    "Emergency_Level",
    "Year",
    "Avg_Response_Time"
]

heatmap_output = os.path.join(output_dir, "response_heatmap.json")
heatmap_grouped.to_json(heatmap_output, orient="records", indent=2)

print("All JSON files generated in:", output_dir)
