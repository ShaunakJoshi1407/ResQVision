import React, { useEffect, useRef, useState } from 'react';
import { Box } from "@mui/material";
import * as d3 from 'd3';

const monthMap = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

function formatMonthYear(value) {
  const [month, year] = value.split(' ');
  return `${year}-${monthMap[month]}`;
}

const IncidentTrendsChart = ({ selectedRegions, selectedIncidents, startMonth, endMonth }) => {
  const svgRef = useRef();
  const [hiddenTypes, setHiddenTypes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    d3.json('/data/incident_trends.json').then((data) => {
      if (!data) return;

      const start = formatMonthYear(startMonth);
      const end = formatMonthYear(endMonth);

      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedIncidents.includes(d.Incident_Type) &&
          d.MonthYear >= start &&
          d.MonthYear <= end
      );

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      if (!filtered.length) {
        svg
          .attr('width', 600)
          .attr('height', 350)
          .append('text')
          .attr('x', 20)
          .attr('y', 40)
          .text('No data available for selected filters.')
          .attr('fill', 'gray');
        return;
      }

      const margin = { top: 90, right: 30, bottom: 50, left: 60 };
      const width = 900 - margin.left - margin.right;
      const height = 350 - margin.top - margin.bottom;

      const container = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const aggregated = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.Count),
        d => d.MonthYear,
        d => d.Incident_Type
      );

      setFilteredData(aggregated);

      const flatData = [];
      aggregated.forEach(([month, byType]) => {
        byType.forEach(([incident, count]) => {
          flatData.push({ MonthYear: month, Incident_Type: incident, Count: count });
        });
      });

      const trendsByType = d3.group(flatData, d => d.Incident_Type);
      const allMonths = Array.from(new Set(filtered.map((d) => d.MonthYear))).sort();
      const x = d3.scalePoint().domain(allMonths).range([0, width]);
      const y = d3.scaleLinear()
        .domain([0, d3.max(flatData, d => d.Count)])
        .nice()
        .range([height, 0]);

      const tickInterval = allMonths.length <= 6 ? 1 : allMonths.length <= 12 ? 2 : 3;

      container.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickValues(allMonths.filter((_, i) => i % tickInterval === 0)))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      container.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')));

      const color = d3.scaleOrdinal()
        .domain(selectedIncidents)
        .range(d3.schemeTableau10);

      trendsByType.forEach((entries, type) => {
        if (hiddenTypes.includes(type)) return;

        const line = d3.line()
          .x(d => x(d.MonthYear))
          .y(d => y(d.Count))
          .defined(d => d.Count !== null);

        container.append('path')
          .datum(entries.sort((a, b) => a.MonthYear.localeCompare(b.MonthYear)))
          .attr('fill', 'none')
          .attr('stroke', color(type))
          .attr('stroke-width', 2)
          .attr('d', line)
          .attr('class', `line-${type.replace(/\s/g, '')}`);
      });

      container.append('text')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Month');

      container.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Incident Count');

      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left + width - selectedIncidents.length * 100}, ${margin.top - 50})`);

      selectedIncidents.forEach((incident, i) => {
        const isHidden = hiddenTypes.includes(incident);

        const group = legend.append('g')
          .attr('transform', `translate(${i * 100}, 0)`)
          .style('cursor', 'pointer')
          .on('click', () => {
            setHiddenTypes((prev) =>
              prev.includes(incident)
                ? prev.filter((type) => type !== incident)
                : [...prev, incident]
            );
          });

        group.append('rect')
          .attr('x', 0)
          .attr('y', -10)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', isHidden ? '#ccc' : color(incident))
          .attr('stroke', '#000');

        group.append('text')
          .attr('x', 18)
          .attr('y', 0)
          .text(incident)
          .style('font-size', '12px')
          .attr('alignment-baseline', 'middle');
      });
    });
  }, [selectedRegions, selectedIncidents, startMonth, endMonth, hiddenTypes]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default IncidentTrendsChart;