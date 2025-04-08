import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const InjuriesResponseLineChart = ({
  selectedRegions = ["Urban", "Suburban", "Rural"],
  selectedLevels = ["Minor", "Major", "Critical"],
  timeRange = ["2018-01", "2024-12"],
}) => {
  const svgRef = useRef();

  useEffect(() => {
    d3.json("/data/injuries_response.json").then((data) => {
      if (!data) return;

      const [startMonth, endMonth] = timeRange;

      // Filter
      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedLevels.includes(d.Emergency_Level) &&
          d.MonthYear >= startMonth &&
          d.MonthYear <= endMonth
      );

      // Aggregate: get avg across same (level, injury count)
      const aggregated = d3.rollups(
        filtered,
        (v) => d3.mean(v, (d) => d.Avg_Response_Time),
        (d) => d.Emergency_Level,
        (d) => d.Number_of_Injuries
      ).flatMap(([level, injuryArr]) =>
        injuryArr.map(([injuries, avg]) => ({
          Emergency_Level: level,
          Number_of_Injuries: injuries,
          Avg_Response_Time: avg,
        }))
      );

      // Group by Emergency Level for D3 line()
      const grouped = d3.groups(aggregated, (d) => d.Emergency_Level);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 40, right: 30, bottom: 50, left: 80 };
      const width = 500 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const container = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Scales
      const x = d3
        .scaleLinear()
        .domain(d3.extent(aggregated, (d) => d.Number_of_Injuries))
        .nice()
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(aggregated, (d) => d.Avg_Response_Time)])
        .nice()
        .range([height, 0]);

      const color = d3.scaleOrdinal()
        .domain(["Minor", "Major", "Critical"])
        .range(["#60a5fa", "#facc15", "#f87171"]);

      // Axes
      container.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3.axisBottom(x)
            .ticks(aggregated.length)
            .tickFormat((d) => Number.isInteger(d) ? d : "")
        );

      container.append("g").call(d3.axisLeft(y));

      // Axis Labels
      container.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Number of Injuries");

      container.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Avg. Response Time (min)");

      // Lines + dots + labels
      grouped.forEach(([level, values]) => {
        const sorted = values.sort((a, b) => a.Number_of_Injuries - b.Number_of_Injuries);

        const line = d3.line()
          .x((d) => x(d.Number_of_Injuries))
          .y((d) => y(d.Avg_Response_Time));

        container.append("path")
          .datum(sorted)
          .attr("fill", "none")
          .attr("stroke", color(level))
          .attr("stroke-width", 2.5)
          .attr("d", line);

        container.selectAll(`circle-${level}`)
          .data(sorted)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.Number_of_Injuries))
          .attr("cy", (d) => y(d.Avg_Response_Time))
          .attr("r", 3)
          .attr("fill", color(level));

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

      // Legend
      const legend = container.selectAll(".legend")
        .data(color.domain().filter((lvl) => selectedLevels.includes(lvl)))
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${width - 100}, ${i * 20})`);

      legend.append("rect")
        .attr("x", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", (d) => color(d));

      legend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text((d) => d)
        .attr("font-size", "0.8rem")
        .attr("fill", "#333");
    });
  }, [selectedRegions, selectedLevels, timeRange]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default InjuriesResponseLineChart;
