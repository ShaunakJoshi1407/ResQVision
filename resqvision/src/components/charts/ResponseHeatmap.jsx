import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { Box } from "@mui/material";
import * as d3 from "d3";

const ResponseHeatmap = ({
  selectedRegions = ["Urban", "Suburban", "Rural"],
  selectedLevels = ["Minor", "Major", "Critical"],
  timeRange = ["2018-01", "2024-12"],
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    d3.json("/data/response_heatmap.json").then((data) => {
      if (!data) return;

      const [startMonth, endMonth] = timeRange;

      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedLevels.includes(d.Emergency_Level) &&
          d.MonthYear >= startMonth &&
          d.MonthYear <= endMonth
      );

      const grouped = d3.rollups(
        filtered,
        (v) => d3.mean(v, (d) => d.Avg_Response_Time),
        (d) => d.Road_Type,
        (d) => d.Distance_Bin
      ).flatMap(([road, distMap]) =>
        distMap.map(([dist, avg]) => ({
          Road_Type: road,
          Distance_Bin: dist,
          Avg_Response_Time: avg,
        }))
      );
      setFilteredData(grouped);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 60, right: 20, bottom: 50, left: 100 };
      const width = 900 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const container = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const roadTypes = Array.from(new Set(grouped.map((d) => d.Road_Type)));
      const distanceBins = Array.from(new Set(grouped.map((d) => d.Distance_Bin)));

      const x = d3.scaleBand().domain(distanceBins).range([0, width]).padding(0.05);
      const y = d3.scaleBand().domain(roadTypes).range([0, height]).padding(0.05);

      const color = d3
        .scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain(d3.extent(grouped, (d) => d.Avg_Response_Time));

      // Axes
      container.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      container.append("g").call(d3.axisLeft(y));

      // Labels
      container.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Distance to Incident (km)");

      container.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Road Type");

      const tooltip = d3.select(tooltipRef.current);

      // Heatmap Cells + Tooltip Events
      container.selectAll("rect.cell")
        .data(grouped)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d) => x(d.Distance_Bin))
        .attr("y", (d) => y(d.Road_Type))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", (d) => color(d.Avg_Response_Time))
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.Road_Type}</strong> | ${d.Distance_Bin}<br/><strong>${d.Avg_Response_Time.toFixed(
                2
              )} min</strong>`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Display text inside each cell of the heatmap so more information can be gained from the heatmap.
      container.selectAll("text.cell-label")
        .data(grouped)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.Distance_Bin) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.Road_Type) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "10px")
        .attr("fill", "#000")
        .text((d) => d.Avg_Response_Time.toFixed(1));

      // Color legend for the heatmap.
      const defs = svg.append("defs");
      const legendWidth = 200,
        legendHeight = 10;

      const linearGradient = defs.append("linearGradient")
        .attr("id", "heatmap-gradient");

      linearGradient.selectAll("stop")
        .data(d3.range(0, 1.01, 0.1))
        .enter()
        .append("stop")
        .attr("offset", (d) => d)
        .attr("stop-color", (d) =>
          color(color.domain()[0] + d * (color.domain()[1] - color.domain()[0]))
        );

      svg.append("rect")
        .attr("x", width / 2 - legendWidth / 2 + margin.left)
        .attr("y", 10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#heatmap-gradient)");

      const legendScale = d3.scaleLinear()
        .domain(color.domain())
        .range([0, legendWidth]);

      svg.append("g")
        .attr("transform", `translate(${width / 2 - legendWidth / 2 + margin.left}, ${10 + legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5))
        .select(".domain")
        .remove();
    });
  }, [selectedRegions, selectedLevels, timeRange]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "response_heatmap_data.json");
  };
  
  const downloadCSV = () => {
    if (!filteredData.length) return;
  
    const keys = Object.keys(filteredData[0]);
    const csv = [
      keys.join(","),
      ...filteredData.map((row) => keys.map((k) => row[k]).join(",")),
    ].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "response_heatmap_data.csv");
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

export default ResponseHeatmap;