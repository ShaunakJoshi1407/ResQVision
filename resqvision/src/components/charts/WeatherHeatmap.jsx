import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const WeatherHeatmap = ({ selectedRegions, selectedTraffic, startMonth, endMonth }) => {
  const svgRef = useRef();

  const convertToMonthYear = (label) => {
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    };
    const [monthStr, year] = label.split(' ');
    return `${year}-${months[monthStr]}`;
  };

  useEffect(() => {
    d3.json("/data/weather_heatmap.json").then((data) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 50, right: 20, bottom: 50, left: 100 };
      const width = 700 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const start = convertToMonthYear(startMonth);
      const end = convertToMonthYear(endMonth);

      const filteredData = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          d.Traffic_Congestion === selectedTraffic &&
          d.MonthYear >= start &&
          d.MonthYear <= end
      );

      const grouped = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d.Avg_Response_Time),
        d => d.Weather_Condition,
        d => d.Road_Type
      );

      const weatherConditions = Array.from(grouped.keys());
      const roadTypes = Array.from(new Set(filteredData.map(d => d.Road_Type)));

      const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([
          d3.min(filteredData, d => d.Avg_Response_Time),
          d3.max(filteredData, d => d.Avg_Response_Time)
        ]);

      const xScale = d3.scaleBand().domain(roadTypes).range([0, width]).padding(0.05);
      const yScale = d3.scaleBand().domain(weatherConditions).range([0, height]).padding(0.05);

      // Draw cells
      weatherConditions.forEach((w) => {
        roadTypes.forEach((r) => {
          const val = grouped.get(w)?.get(r);
          if (val !== undefined) {
            g.append("rect")
              .attr("x", xScale(r))
              .attr("y", yScale(w))
              .attr("width", xScale.bandwidth())
              .attr("height", yScale.bandwidth())
              .attr("fill", colorScale(val));

            g.append("text")
              .attr("x", xScale(r) + xScale.bandwidth() / 2)
              .attr("y", yScale(w) + yScale.bandwidth() / 2 + 5)
              .attr("text-anchor", "middle")
              .attr("font-size", "12px")
              .attr("fill", "#000")
              .text(val.toFixed(1));
          }
        });
      });

      // Axes
      g.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(yScale));

      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      // Color legend
      const legendHeight = 150;
      const legendWidth = 15;
      const legendSvg = svg.append("g").attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

      const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([legendHeight, 0]);

      const legendAxis = d3.axisRight(legendScale).ticks(5);

      const gradientId = "heatmap-gradient";
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");

      const numStops = 10;
      const colorRange = d3.range(numStops).map(d => d / (numStops - 1));
      colorRange.forEach(t => {
        linearGradient.append("stop")
          .attr("offset", `${t * 100}%`)
          .attr("stop-color", colorScale(colorScale.domain()[0] + t * (colorScale.domain()[1] - colorScale.domain()[0])));
      });

      legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${gradientId})`);

      legendSvg.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);
    });
  }, [selectedRegions, selectedTraffic, startMonth, endMonth]);

  return <svg ref={svgRef}></svg>;
};

export default WeatherHeatmap;