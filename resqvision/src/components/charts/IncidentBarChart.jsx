import React, { useEffect, useRef, useState } from 'react';
import { saveAs } from "file-saver";
import { Box } from "@mui/material";
import * as d3 from 'd3';

const IncidentBarChart = ({ selectedRegions, selectedIncidents, startMonth, endMonth }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  const convertToMonthYear = (label) => {
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    };
    const [monthStr, year] = label.split(' ');
    return `${year}-${months[monthStr]}`;
  };

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    d3.json('/data/incident_type_counts_monthly.json').then((data) => {
      if (!data) return;

      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedIncidents.includes(d.Incident_Type) &&
          d.MonthYear >= convertToMonthYear(startMonth) &&
          d.MonthYear <= convertToMonthYear(endMonth)
      );

      setFilteredData(filtered);

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      if (filtered.length === 0) {
        svg
          .attr('width', 320)
          .attr('height', 240)
          .append('text')
          .attr('x', 200)
          .attr('y', 150)
          .attr('text-anchor', 'middle')
          .text('No data for the selected filters');
        return;
      }

      // Aggregate counts by Incident Type
      const incidentCounts = d3.rollups(
        filtered,
        (v) => d3.sum(v, (d) => d.Count),
        (d) => d.Incident_Type
      ).map(([type, count]) => ({ Incident_Type: type, Count: count }));

      const margin = { top: 40, right: 30, bottom: 50, left: 80 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const container = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3
        .scaleBand()
        .domain(incidentCounts.map((d) => d.Incident_Type))
        .range([0, width])
        .padding(0.3);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(incidentCounts, (d) => d.Count)])
        .nice()
        .range([height, 0]);

      container.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      container.append('g')
        .call(d3.axisLeft(y));

      // Axis Labels
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .text('Incident Type');

      container.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .text('Number of Incidents');

      // Custom Tooltip div for better accessibility
      const tooltip = d3.select(tooltipRef.current);

      const bars = container.selectAll('rect')
        .data(incidentCounts)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d.Incident_Type))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', '#1976d2')
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.Incident_Type}</strong>: ${d.Count.toLocaleString()} incidents`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });

      bars.transition()
        .duration(800)
        .attr('y', (d) => y(d.Count))
        .attr('height', (d) => height - y(d.Count));
    });
  }, [selectedRegions, selectedIncidents, startMonth, endMonth]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "incident_bar_chart_data.json");
  };
  
  const downloadCSV = () => {
    if (!filteredData.length) return;
  
    const keys = Object.keys(filteredData[0]);
    const csv = [
      keys.join(","),
      ...filteredData.map((row) => keys.map((k) => row[k]).join(",")),
    ].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "incident_bar_chart_data.csv");
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
          position: 'absolute',
          pointerEvents: 'none',
          background: '#333',
          color: 'white',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 10,
        }}
      ></div>
    </div>
  );
};

export default IncidentBarChart;