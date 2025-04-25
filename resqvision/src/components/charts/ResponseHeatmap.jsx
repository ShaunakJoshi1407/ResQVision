import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useDashboardData } from "../../context/DashboardDataContext";

const ResponseHeatmap = ({
  selectedRegions = ["Urban", "Suburban", "Rural"],
  selectedLevels = ["Minor", "Major", "Critical"],
  timeRange = ["2018-01", "2024-12"],
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const { heatmapResponseData } = useDashboardData();

  useEffect(() => {
    const [startMonth, endMonth] = timeRange;

    const process = (data) => {
      if (!data) return;
      // Filter by region, emergency level, and time range
      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedLevels.includes(d.Emergency_Level) &&
          d.MonthYear >= startMonth &&
          d.MonthYear <= endMonth
      );

      // Aggregate average response time by road type and distance bin
      const grouped = d3.rollups(
        filtered,
        (v) => d3.mean(v, (d) => +d.Avg_Response_Time),
        (d) => d.Road_Type,
        (d) => d.Distance_Bin
      ).flatMap(([road, distMap]) =>
        distMap.map(([dist, avg]) => ({
          Road_Type: road,
          Distance_Bin: dist,
          Avg_Response_Time: avg,
        }))
      );

      drawChart(grouped);
    };

    const drawChart = (data) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 110, right: 20, bottom: 50, left: 100 };
      const width = 900 - margin.left - margin.right;
      const height = 420 - margin.top - margin.bottom;

      const container = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const roadTypes = Array.from(new Set(data.map((d) => d.Road_Type)));
      const distanceBins = Array.from(new Set(data.map((d) => d.Distance_Bin)));

      const x = d3.scaleBand().domain(distanceBins).range([0, width]).padding(0.05);
      const y = d3.scaleBand().domain(roadTypes).range([0, height]).padding(0.05);

      const color = d3
        .scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain(d3.extent(data, (d) => d.Avg_Response_Time));

      container.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "11px");

      container.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "11px");

      // Axis labels
      container.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", 500)
        .text("Distance to Incident (km)");

      container.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", 500)
        .text("Road Type");

      const tooltip = d3.select(tooltipRef.current);

      // Draw heatmap cells
      container.selectAll("rect.cell")
        .data(data)
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
              `<strong>${d.Road_Type}</strong> | ${d.Distance_Bin}<br/><strong>${d.Avg_Response_Time.toFixed(2)} min</strong>`
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
      
      // Add value labels in cells
      container.selectAll("text.cell-label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.Distance_Bin) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.Road_Type) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .attr("fill", (d) => {
          const rgb = d3.rgb(color(d.Avg_Response_Time));
          const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
          return luminance < 140 ? "white" : "black";
        })
        .text((d) => d.Avg_Response_Time.toFixed(1));
      
      // Gradient legend setup
      const defs = svg.append("defs");
      const legendWidth = 200;
      const legendHeight = 10;

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

      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", 500)
        .text("Response time (min.)");

      svg.append("rect")
        .attr("x", width / 2 - legendWidth / 2 + margin.left)
        .attr("y", 40)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#heatmap-gradient)");

      const legendScale = d3.scaleLinear()
        .domain(color.domain())
        .range([0, legendWidth]);

      svg.append("g")
        .attr("transform", `translate(${width / 2 - legendWidth / 2 + margin.left}, ${40 + legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5))
        .select(".domain")
        .remove();
    };

    // Determine data source: uploaded CSV or fallback JSON
    if (heatmapResponseData) {
      process(heatmapResponseData);
    } else {
      d3.json("/data/response_heatmap.json").then(process);
    }
  }, [selectedRegions, selectedLevels, timeRange, heatmapResponseData]);

  return (
    <div className="relative flex justify-center">
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