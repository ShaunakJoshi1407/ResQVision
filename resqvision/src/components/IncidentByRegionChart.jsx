import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

const IncidentByRegionChart = () => {
  const svgRef = useRef();
  const tooltipRef = useRef(null);
  const [data, setData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [incidentTypes, setIncidentTypes] = useState([]);

  useEffect(() => {
    fetch('/data/incidents_by_region.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        const types = [...new Set(json.map(d => d.Incident_Type))];
        setIncidentTypes(types);
      });
  }, []);

  useEffect(() => {
    if (!data.length || !incidentTypes.length) return;

    const filtered = selectedRegion === 'All'
      ? data
      : data.filter(d => d.Region_Type === selectedRegion);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 100 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const grouped = d3.groups(filtered, d => d.Region_Type);

    const color = d3.scaleOrdinal()
      .domain(incidentTypes)
      .range(d3.schemeCategory10);

    const stackedData = d3.stack()
      .keys(incidentTypes)
      .value((group, key) => {
        const found = group[1].find(d => d.Incident_Type === key);
        return found ? found.Count : 0;
      })(grouped);

    const xScale = d3.scaleBand()
      .domain(grouped.map(d => d[0]))
      .range([0, width])
      .padding(0.3);

    const yMax = d3.max(stackedData, layer => d3.max(layer, d => d[1])) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height, 0]);

    const chart = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const container = chart
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    container.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    container.append('g')
      .call(d3.axisLeft(yScale));

    // X-axis Label
    container.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('text-anchor', 'middle')
      .attr('fill', '#374151')
      .style('font-size', '14px')
      .text('Region');

    // Y-axis Label
    container.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -70) // Adjusted for spacing
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('fill', '#374151')
      .style('font-size', '14px')
      .text('Total Incidents');

    const tooltip = d3.select(tooltipRef.current);

    container.selectAll('g.layer')
      .data(stackedData)
      .enter().append('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d.map(bar => ({ ...bar, key: d.key })))
      .enter().append('rect')
      .attr('x', (d, i) => xScale(grouped[i][0]))
      .attr('width', xScale.bandwidth())
      .attr('y', yScale(0))
      .attr('height', 0)
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 60}px`)
          .html(`
            <div style="min-width: 180px;"
                class="rounded-md border border-gray-300 bg-white/90 shadow-xl backdrop-blur-md px-5 py-3 text-[13px] text-gray-800 font-normal">
                <div class="mb-1">
                    <span class="text-gray-500">Incident:</span>
                    <span class="float-right font-medium text-gray-700">${d.key}</span>
                </div>
                <div>
                    <span class="text-gray-500">Number:</span>
                    <span class="float-right font-semibold text-gray-900">${d[1] - d[0]}</span>
                </div>
            </div>
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 60}px`);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      })
      .transition()
      .duration(600)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]));
  }, [data, selectedRegion, incidentTypes]);

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardContent>
        <Typography variant="h6" className="text-blue-600 mb-4">
          Incidents by Region and Type
        </Typography>

        <Box className="mb-6 max-w-xs">
          <FormControl
            fullWidth
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root:hover': {
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <InputLabel id="region-select-label">Select Region</InputLabel>
            <Select
              labelId="region-select-label"
              value={selectedRegion}
              label="Select Region"
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <MenuItem value="All">🌍 All</MenuItem>
              <MenuItem value="Urban">🏙 Urban</MenuItem>
              <MenuItem value="Suburban">🌆 Suburban</MenuItem>
              <MenuItem value="Rural">🌄 Rural</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <div className="flex justify-center mt-10 relative overflow-x-auto">
          <svg ref={svgRef}></svg>
          <div
            ref={tooltipRef}
            className="absolute z-50 pointer-events-none"
            style={{ display: 'none' }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentByRegionChart;
