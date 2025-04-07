import pandas as pd
import os

# Paths
input_csv = "data/emergency_service_routing_with_timestamps.csv"
output_dir = "public/data"
os.makedirs(output_dir, exist_ok=True)

# Load dataset
df = pd.read_csv(input_csv)

# ------------------------------
#1. Ambulance Response Data
# ------------------------------
ambulance_grouped = (
    df.groupby(["Ambulance_Availability", "Region_Type", "Emergency_Level"])["Response_Time"]
    .mean()
    .reset_index()
)

ambulance_grouped.columns = [
    "Ambulance_Availability",
    "Region_Type",
    "Emergency_Level",
    "Avg_Response_Time"
]

ambulance_output = os.path.join(output_dir, "ambulance_response_filtered.json")
ambulance_grouped.to_json(ambulance_output, orient="records", indent=2)

# ------------------------------
# 2. Injuries vs Response Time
# ------------------------------
injury_grouped = (
    df.groupby(["Region_Type", "Emergency_Level", "Number_of_Injuries"])["Response_Time"]
    .mean()
    .reset_index()
)

injury_grouped.columns = [
    "Region_Type",
    "Emergency_Level",
    "Number_of_Injuries",
    "Avg_Response_Time"
]

injury_output = os.path.join(output_dir, "injuries_response.json")
injury_grouped.to_json(injury_output, orient="records", indent=2)

print("All JSON files saved to:", output_dir)
