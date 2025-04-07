import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const AmbulanceAvailabilityChart = ({
    selectedRegions = ["Urban", "Suburban", "Rural"],
    selectedLevels = ["Minor", "Major", "Critical"],
}) => {
    const svgRef = useRef();

    useEffect(() => {
        d3.json("/data/ambulance_response_filtered.json").then((data) => {
            if (!data) return;

            const filtered = data.filter(
                (d) =>
                    selectedRegions.includes(d.Region_Type) &&
                    selectedLevels.includes(d.Emergency_Level)
            );

            const aggregated = d3.rollups(
                filtered,
                (v) => d3.mean(v, (d) => d.Avg_Response_Time),
                (d) => d.Ambulance_Availability
            ).map(([availability, avg]) => ({
                Ambulance_Availability: availability,
                Avg_Response_Time: avg,
            }));

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            const margin = { top: 40, right: 30, bottom: 50, left: 80 };
            const width = 400 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const container = svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const x = d3
                .scaleBand()
                .domain(aggregated.map((d) => d.Ambulance_Availability))
                .range([0, width])
                .padding(0.4);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(aggregated, (d) => d.Avg_Response_Time)])
                .nice()
                .range([height, 0]);

            container
                .append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x));

            container.append("g").call(d3.axisLeft(y));

            container
                .append("text")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .attr("text-anchor", "middle")
                .text("Ambulance Availability");

            container
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -60)
                .attr("text-anchor", "middle")
                .text("Avg. Response Time (min)");

            container
                .selectAll("rect")
                .data(aggregated)
                .enter()
                .append("rect")
                .attr("x", (d) => x(d.Ambulance_Availability))
                .attr("y", height)
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", "#1e40af")
                .transition()
                .duration(800)
                .attr("y", (d) => y(d.Avg_Response_Time))
                .attr("height", (d) => height - y(d.Avg_Response_Time));

            // Value labels above each bar
            container.selectAll("text.value")
                .data(aggregated)
                .enter()
                .append("text")
                .attr("class", "value")
                .attr("x", (d) => x(d.Ambulance_Availability) + x.bandwidth() / 2)
                .attr("y", (d) => y(d.Avg_Response_Time) - 8)
                .attr("text-anchor", "middle")
                .attr("fill", "#333")
                .attr("font-size", "12px")
                .text((d) => d.Avg_Response_Time.toFixed(5));

        });
    }, [selectedRegions, selectedLevels]);

    return (
        <div className="flex justify-center">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default AmbulanceAvailabilityChart;
