import pandas as pd
import os

# Load dataset
df = pd.read_csv("data/emergency_service_routing_with_timestamps.csv")

# Create grouped data
grouped = (
    df.groupby(["Ambulance_Availability", "Region_Type", "Emergency_Level"])["Response_Time"]
    .mean()
    .reset_index()
)

grouped.columns = [
    "Ambulance_Availability",
    "Region_Type",
    "Emergency_Level",
    "Avg_Response_Time"
]

# Save to JSON
output_path = "public/data/ambulance_response_filtered.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
grouped.to_json(output_path, orient="records", indent=2)

print("Saved to", output_path)
