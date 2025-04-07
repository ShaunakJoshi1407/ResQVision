import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SeverityBarChart = ({ selectedRegions, selectedIncidents, startMonth, endMonth }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!selectedRegions.length || !selectedIncidents.length || !startMonth || !endMonth) return;

    d3.json('/data/severity_counts_monthly.json').then((data) => {
      if (!data) return;

      const toMonthKey = (label) => {
        const [month, year] = label.split(' ');
        const monthMap = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
        };
        return `${year}-${monthMap[month]}`;
      };

      const startKey = toMonthKey(startMonth);
      const endKey = toMonthKey(endMonth);

      const filtered = data.filter(
        (d) =>
          selectedRegions.includes(d.Region_Type) &&
          selectedIncidents.includes(d.Incident_Type) &&
          d.MonthYear >= startKey &&
          d.MonthYear <= endKey
      );

      const severityLevels = ['Low', 'Medium', 'High'];
      const severityCounts = d3.rollups(
        filtered,
        (v) => d3.sum(v, (d) => d.Count),
        (d) => d.Incident_Severity
      )
        .map(([severity, count]) => ({ Severity: severity, Count: count }))
        .sort((a, b) => severityLevels.indexOf(a.Severity) - severityLevels.indexOf(b.Severity));

      const margin = { top: 40, right: 30, bottom: 40, left: 100 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      if (filtered.length === 0) {
        svg
          .attr('width', 400)
          .attr('height', 300)
          .append('text')
          .attr('x', 200)
          .attr('y', 150)
          .attr('text-anchor', 'middle')
          .style('fill', '#666')
          .style('font-size', '14px')
          .text('No data for the selected filters');
        return;
      }

      const container = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const y = d3
        .scaleBand()
        .domain(severityCounts.map((d) => d.Severity))
        .range([0, height])
        .padding(0.3);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(severityCounts, (d) => d.Count)])
        .nice()
        .range([0, width]);

      // Axes
      container.append('g').call(d3.axisLeft(y));
      container.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d3.format('.2s'))
        );

      // Labels
      container
        .append('text')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .text('Number of Incidents');

      container
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -70)
        .attr('text-anchor', 'middle')
        .text('Severity');

      // Get tooltip div
      const tooltip = d3.select(tooltipRef.current);

      const bars = container
        .selectAll('rect')
        .data(severityCounts)
        .enter()
        .append('rect')
        .attr('y', (d) => y(d.Severity))
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('width', 0)
        .attr('fill', (d) => ({
          Low: '#FFDA1F',//'#4CAF50',
          Medium: '#FF9800',
          High: '#F44336',
        }[d.Severity]))
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1)
            .html(`<strong>${d.Severity}</strong>: ${d.Count.toLocaleString()} incidents`);
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
        .attr('width', (d) => x(d.Count));
    });
  }, [selectedRegions, selectedIncidents, startMonth, endMonth]);

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

export default SeverityBarChart;
