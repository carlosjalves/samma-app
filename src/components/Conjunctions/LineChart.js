import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material";

const LineChart = ({
  evolution
}) => {
  const ref = useRef();
  const theme = useTheme();

  const [heightInPixels, setHeightInPixels] = useState(16);

  useEffect(() => {

    // Clear previous SVG content
    d3.select(ref.current).selectAll("*").remove();

    const currentHeight = parseInt(d3.select('#line-chart-table-cell').style('height'), 10);

    if (currentHeight !== 0) {

      setHeightInPixels(currentHeight);
      // set the dimensions and margins of the graph

      const width = 85,
        height = currentHeight - 16;

      // append the svg object to the body of the page
      const svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      //Read the data
      const data = evolution;

      var x = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([0, width - 5]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll(".domain").attr("opacity", 0);

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([height - 5, 5]);
      svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll(".domain").attr("opacity", 0);

      var gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "areaGradient")
        .attr("gradientTransform", "rotate(90)");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", theme.palette.primary.lightGrey)
        .attr("stop-opacity", (theme.palette.mode !== 'dark') ? 0.5 : 0.25); //0.25

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", theme.palette.primary.lightGrey)
        .attr("stop-opacity", 0);

      var gradientHover = svg.append("defs")
        .append("linearGradient")
        .attr("id", "areaGradientHover")
        .attr("gradientTransform", "rotate(90)");

      gradientHover.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#263799")
        .attr("stop-opacity", 0.38);

      gradientHover.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#405CFF")
        .attr("stop-opacity", 0);

      var areaPath = svg.append("path")
        .datum(data)
        .attr("fill", "url(#areaGradient)")
        .attr("d", d3.area()
          .x(function (d, i) { return x(i) })
          .y0(y(0))
          .y1(function (d) { return y(d) })
        );

      var linePath = svg.append("path")
        .datum(data)
        .attr("fill", "none") // Define para nenhum preenchimento
        .attr("stroke", theme.palette.primary.darkGrey)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line() // Usa d3.line para desenhar apenas a linha
          .x(function (d, i) { return x(i) })
          .y(function (d) { return y(d) })
        );


      areaPath.on("mouseover", function () {
        d3.select(this)
          .attr("fill", "url(#areaGradientHover)");
        d3.select(linePath.node())
          .attr("stroke", "#405CFF")// Altere para a cor desejada
          .attr("stroke-width", 2);
      })
        .on("mouseout", function () {
          d3.select(this)
            .attr("fill", "url(#areaGradient)");
          d3.select(linePath.node())
            .attr("stroke", theme.palette.primary.darkGrey) // Altere para a cor original
            .attr("stroke-width", 1.5);
        });


      const lastDataIndex = data.length - 1;
      const lastDataValue = data[lastDataIndex];

      // Adicione um círculo para representar o último ponto
      svg.append("circle")
        .attr("cx", x(lastDataIndex))
        .attr("cy", y(lastDataValue))
        .attr("r", 3)
        .attr("fill", theme.palette.primary.active)
        .on("mouseover", function (e, d) {
          d3.select(this)
            .attr("r", 3.5)
            .attr("stroke-width", 2.5)
          d3.select(areaPath.node())
            .attr("fill", "url(#areaGradientHover)");
          d3.select(linePath.node())
            .attr("stroke", "#405CFF")// Altere para a cor desejada
            .attr("stroke-width", 2);
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .attr("r", 2.5)
            .attr("stroke-width", 1.5)
          d3.select(areaPath.node())
            .attr("fill", "url(#areaGradient)");
          d3.select(linePath.node())
            .attr("stroke", "#767689") // Altere para a cor original
            .attr("stroke-width", 1.5);
        })
    }
  }, [theme, evolution]);

  return <svg width={85} height={heightInPixels - 16} id="line-chart" ref={ref} />;
};

export default LineChart;
