import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useDashboardData } from "../../context/DashboardDataContext";

const WeatherHeatmap = ({
  selectedRegions,
  selectedTraffic,
  startMonth,
  endMonth,
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const { weatherHeatmapData } = useDashboardData();

  const convertToMonthYear = (label) => {
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const [monthStr, year] = label.split(" ");
    return `${year}-${months[monthStr]}`;
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear entire SVG content

    const margin = { top: 110, right: 20, bottom: 60, left: 120 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const region = selectedRegions[0];
    const startKey = convertToMonthYear(startMonth);
    const endKey = convertToMonthYear(endMonth);

    const processData = (data) => {
      const filtered = data.filter(
        (d) =>
          d.Region_Type === region &&
          d.Traffic_Congestion === selectedTraffic &&
          d.MonthYear >= startKey &&
          d.MonthYear <= endKey
      );

      const grouped = d3.rollups(
        filtered,
        (v) => d3.mean(v, (d) => +d.Response_Time || +d.Avg_Response_Time || 0),
        (d) => d.Weather_Condition,
        (d) => d.Road_Type
      ).flatMap(([weather, roadMap]) =>
        roadMap.map(([road, avg]) => ({
          Weather_Condition: weather,
          Road_Type: road,
          Avg_Response_Time: avg,
        }))
      );

      if (!grouped.length) return;

      const svgContainer = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const weatherConditions = Array.from(new Set(grouped.map((d) => d.Weather_Condition)));
      const roadTypes = Array.from(new Set(grouped.map((d) => d.Road_Type)));

      const x = d3.scaleBand().domain(roadTypes).range([0, width]).padding(0.05);
      const y = d3.scaleBand().domain(weatherConditions).range([0, height]).padding(0.05);

      const color = d3
        .scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain(d3.extent(grouped, (d) => d.Avg_Response_Time));

      // Axes
      svgContainer.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "11px");

      svgContainer.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "11px");

      // Axis labels
      svgContainer.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .style("font-weight", "500")
        .text("Road Type");

      svgContainer.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -90)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .style("font-weight", "500")
        .text("Weather Condition");

      const tooltip = d3.select(tooltipRef.current);

      // Heatmap cells
      svgContainer.selectAll("rect.cell")
        .data(grouped)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d) => x(d.Road_Type))
        .attr("y", (d) => y(d.Weather_Condition))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", (d) => color(d.Avg_Response_Time))
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.Weather_Condition}</strong> | ${d.Road_Type}<br/><strong>${d.Avg_Response_Time.toFixed(2)} min</strong>`
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

      // Value labels
      svgContainer.selectAll("text.cell-label")
        .data(grouped)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.Road_Type) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.Weather_Condition) + y.bandwidth() / 2)
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

      // ✅ Legend cleanup and redraw
      svg.selectAll("defs").remove(); // remove previous gradients
      svg.selectAll(".legend-elements").remove(); // remove all elements from previous legend

      const defs = svg.append("defs");
      const legendWidth = 200;
      const legendHeight = 10;

      const linearGradient = defs.append("linearGradient").attr("id", "heatmap-gradient");
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
        .attr("font-size", "13px")
        .style("font-weight", "500")
        .attr("class", "legend-elements")
        .text("Response time (min.)");

      svg.append("rect")
        .attr("x", width / 2 - legendWidth / 2 + margin.left)
        .attr("y", 40)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("class", "legend-elements")
        .style("fill", "url(#heatmap-gradient)");

      const legendScale = d3.scaleLinear().domain(color.domain()).range([0, legendWidth]);

      svg.append("g")
        .attr("transform", `translate(${width / 2 - legendWidth / 2 + margin.left}, ${40 + legendHeight})`)
        .attr("class", "legend-elements")
        .call(d3.axisBottom(legendScale).ticks(5))
        .select(".domain")
        .remove();
    };

    if (weatherHeatmapData && weatherHeatmapData.length) {
      processData(weatherHeatmapData);
    } else {
      d3.json("/data/weather_heatmap.json").then(processData);
    }
  }, [selectedRegions, selectedTraffic, startMonth, endMonth, weatherHeatmapData]);

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

export default WeatherHeatmap;