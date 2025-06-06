import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as d3 from 'd3';
import { getDashboardFile } from '../../utils/getDashboardFile';
import { useDashboardData } from '../../context/DashboardDataContext';

const IncidentBarChart = ({ selectedRegions, selectedIncidents, startMonth, endMonth }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const { incidentTypeCounts } = useDashboardData();

  // Convert month label format (e.g., "Jan 2019") to "2019-01"
  const convertToMonthYear = (label) => {
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    };
    const [monthStr, year] = label.split(' ');
    return `${year}-${months[monthStr]}`;
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const render = (data) => {
      // Filter data based on region, incident type, and time range
      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedIncidents.includes(d.Incident_Type) &&
          d.MonthYear >= convertToMonthYear(startMonth) &&
          d.MonthYear <= convertToMonthYear(endMonth)
      );


      // Display fallback text if no data matches filters
      if (!filtered.length) {
        svg
          .attr('width', 320)
          .attr('height', 240)
          .append('text')
          .attr('x', 160)
          .attr('y', 120)
          .attr('text-anchor', 'middle')
          .text('No data for the selected filters');
        return;
      }

      // Aggregate incident counts per type
      const incidentCounts = d3.rollups(
        filtered,
        (v) => d3.sum(v, (d) => d.Count || 1),
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

      // X-axis: Incident types (categorical)
      const x = d3
        .scaleBand()
        .domain(incidentCounts.map((d) => d.Incident_Type))
        .range([0, width])
        .padding(0.3);

      // Y-axis: Incident counts (linear)
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
    };

    // Determine data source: uploaded CSV or fallback JSON
    const mode = localStorage.getItem('incident_dashboard_file_prefix');

    if (mode === 'client-upload' && incidentTypeCounts) {
      render(incidentTypeCounts);
    } else {
      const file = getDashboardFile('incident_type_counts', '/data/incident_type_counts_monthly.json');
      d3.json(file).then((data) => {
        if (data) render(data);
      });
    }
  }, [selectedRegions, selectedIncidents, startMonth, endMonth, incidentTypeCounts]);

  return (
    <div className="relative flex justify-center">
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
