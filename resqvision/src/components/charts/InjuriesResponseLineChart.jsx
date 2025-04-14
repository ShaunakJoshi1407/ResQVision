import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const COLORS = {
  Minor: "#60a5fa",
  Major: "#facc15",
  Critical: "#f87171",
};

const InjuriesResponseLineChart = ({
  selectedRegions = ["Urban", "Suburban", "Rural"],
  selectedLevels = ["Minor", "Major", "Critical"],
  timeRange = ["2018-01", "2024-12"],
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [hiddenLevels, setHiddenLevels] = useState([]);

  useEffect(() => {
    d3.json("/data/injuries_response.json").then((data) => {
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
        (d) => d.Emergency_Level,
        (d) => d.Number_of_Injuries
      ).flatMap(([level, arr]) =>
        arr.map(([injuries, avg]) => ({
          Emergency_Level: level,
          Number_of_Injuries: injuries,
          Avg_Response_Time: avg,
        }))
      );

      const grouped = d3.groups(aggregated, (d) => d.Emergency_Level);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 80, right: 30, bottom: 50, left: 80 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const container = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const x = d3
        .scaleLinear()
        .domain([1, 4])
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(aggregated, (d) => d.Avg_Response_Time)])
        .nice()
        .range([height, 0]);

      container.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3.axisBottom(x)
            .tickValues([1, 2, 3, 4])
            .tickFormat((d) => (d === 4 ? "4+" : d.toString()))
        );

      container.append("g").call(d3.axisLeft(y));

      container.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Number of Injuries (1 - 4+)");

      container.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Avg. Response Time (min)");

      const tooltip = d3.select(tooltipRef.current);

      grouped.forEach(([level, values]) => {
        if (hiddenLevels.includes(level)) return;

        const sorted = values.sort((a, b) => a.Number_of_Injuries - b.Number_of_Injuries);

        const line = d3.line()
          .x((d) => x(d.Number_of_Injuries))
          .y((d) => y(d.Avg_Response_Time));

        container.append("path")
          .datum(sorted)
          .attr("fill", "none")
          .attr("stroke", COLORS[level])
          .attr("stroke-width", 2.5)
          .attr("d", line);

        // Dots with tooltip
        container.selectAll(`circle-${level}`)
          .data(sorted)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.Number_of_Injuries))
          .attr("cy", (d) => y(d.Avg_Response_Time))
          .attr("r", 3.5)
          .attr("fill", COLORS[level])
          .on("mouseover", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(
                `<strong>${d.Emergency_Level}</strong> (${d.Number_of_Injuries} injuries):<br/><strong>${d.Avg_Response_Time.toFixed(2)} min</strong>`
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

        // Optional value labels
        container.selectAll(`text-${level}`)
          .data(sorted)
          .enter()
          .append("text")
          .attr("x", (d) => x(d.Number_of_Injuries))
          .attr("y", (d) => y(d.Avg_Response_Time) - 8)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", "#333")
          .text((d) => d.Avg_Response_Time.toFixed(2));
      });

      // Legend (inside svg, horizontal row)
      const legend = svg
        .append("g")
        .attr("transform", `translate(${margin.left + 10}, ${margin.top - 50})`);

      selectedLevels.forEach((level, i) => {
        const isHidden = hiddenLevels.includes(level);

        const group = legend
          .append("g")
          .attr("transform", `translate(${i * 100}, 0)`)
          .style("cursor", "pointer")
          .on("click", () => {
            setHiddenLevels((prev) =>
              prev.includes(level)
                ? prev.filter((l) => l !== level)
                : [...prev, level]
            );
          });

        group.append("rect")
          .attr("x", 0)
          .attr("y", -10)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", isHidden ? "#ccc" : COLORS[level])
          .attr("stroke", "#333");

        group.append("text")
          .attr("x", 18)
          .attr("y", 0)
          .text(level)
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
      });
    });
  }, [selectedRegions, selectedLevels, timeRange, hiddenLevels]);

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

export default InjuriesResponseLineChart;