import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { Box } from "@mui/material";
import * as d3 from "d3";

const AmbulanceAvailabilityChart = ({
  selectedRegions = ["Urban", "Suburban", "Rural"],
  selectedLevels = ["Minor", "Major", "Critical"],
  timeRange = ["2018-01", "2024-12"],
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    d3.json("/data/ambulance_response_filtered.json").then((data) => {
      if (!data) return;

      const [startMonth, endMonth] = timeRange;

      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedLevels.includes(d.Emergency_Level) &&
          d.MonthYear >= startMonth &&
          d.MonthYear <= endMonth
      );

      const aggregated = d3.rollups(
        filtered,
        (v) => d3.mean(v, (d) => d.Avg_Response_Time),
        (d) => d.Ambulance_Availability
      ).map(([availability, avg]) => ({
        Ambulance_Availability: availability,
        Avg_Response_Time: avg,
      }));
      setFilteredData(aggregated);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 40, right: 30, bottom: 50, left: 80 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const container = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const x = d3
        .scaleBand()
        .domain(aggregated.map((d) => d.Ambulance_Availability))
        .range([0, width])
        .padding(0.4);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(aggregated, (d) => d.Avg_Response_Time)])
        .nice()
        .range([height, 0]);

      // Axes
      container.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      container.append("g").call(d3.axisLeft(y));

      // Labels
      container.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Ambulance Availability");

      container.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Avg. Response Time (min)");

      const tooltip = d3.select(tooltipRef.current);

      // Bars with custom tooltip
      const bars = container.selectAll("rect")
        .data(aggregated)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.Ambulance_Availability))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "#1e40af")
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.Ambulance_Availability}</strong>: ${d.Avg_Response_Time.toFixed(2)} min`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      bars.transition()
        .duration(800)
        .attr("y", (d) => y(d.Avg_Response_Time))
        .attr("height", (d) => height - y(d.Avg_Response_Time));

      // Labels on top of bars
      container.selectAll("text.value")
        .data(aggregated)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", (d) => x(d.Ambulance_Availability) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.Avg_Response_Time) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text((d) => d.Avg_Response_Time.toFixed(2));
    });
  }, [selectedRegions, selectedLevels, timeRange]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "ambulance_availability_data.json");
  };
    
  const downloadCSV = () => {
    if (!filteredData.length) return;
  
    const keys = Object.keys(filteredData[0]);
    const csv = [
      keys.join(","),
      ...filteredData.map((row) => keys.map((k) => row[k]).join(",")),
    ].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "ambulance_availability_data.csv");
  };

  return (
    <div className="relative flex justify-center">
      <div className="flex justify-end gap-2 mb-2">
        {/* Styled Download Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          <button
            onClick={downloadJSON}
            style={{
              backgroundColor: "#1E40AF",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Download JSON
          </button>
          <button
            onClick={downloadCSV}
            style={{
              backgroundColor: "#059669",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Download CSV
          </button>
        </Box>
      </div>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          background: "#333",
          color: "white",
          padding: "6px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          opacity: 0,
          transition: "opacity 0.2s ease-in-out",
          zIndex: 10,
        }}
      ></div>
    </div>
  );
};

export default AmbulanceAvailabilityChart;