import * as d3 from "d3";
import { useEffect, useRef } from "react";

const OverlappingChart = ({
  fullData,
  data,
  label,
  theme,
  isHovered,
  isSelected
}) => {
  const ref = useRef();

  useEffect(() => {

    d3.select(ref.current).selectAll("*").remove();

    const width = 38,
      height = 40;

    // append the svg object to the body of the page
    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
    // .attr("background-color", "white")

    var x = d3.scaleBand()
      .range([0, width])
      .domain([label]);

    // Add Y axis
    var y = d3.scaleLinear()
      .domain(d3.extent(fullData.map(function (d) { return d[label]; })))
      .range([height - 4, 4]);

    if (data !== undefined) {
      // Adicione um círculo para representar o último ponto
      svg.append("circle")
        .attr("cx", x(label) + x.bandwidth() / 2)
        .attr("cy", y(data))
        .attr("r", 4)
        .attr("fill", !isSelected ? theme.palette.text.primary : theme.palette.primary.main);

      // Adicione um círculo para representar o último ponto
      svg.append("line")
        .attr("x1", x(label) + x.bandwidth() / 2)
        .attr("x2", x(label) + x.bandwidth() / 2)
        .attr("y1", y(data))
        .attr("y2", y(d3.min(fullData, d => d[label])) + 4)
        .attr("stroke", !isSelected ? theme.palette.text.primary : theme.palette.primary.main)
        .attr("stroke-width", "2.5")
    } else {
      svg.append('rect')
        .attr('x', x(label) + (x.bandwidth() / 2) - 6)
        .attr('y', height - 2)
        .attr('width', 12)
        .attr('height', 2)
        .attr('fill', !isSelected ? theme.palette.text.primary : theme.palette.primary.main);
    }
  }, [theme, isSelected, data, fullData, label]);

  return <svg width={38} height={40} className="overlapping-chart" ref={ref} style={{ backgroundColor: !isSelected ? theme.palette.primary.main : theme.palette.primary.active, opacity: !isHovered ? 1 : 0.9 }} />;
};

export default OverlappingChart;
