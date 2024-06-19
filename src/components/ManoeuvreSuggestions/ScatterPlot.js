import { useTheme, alpha } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../assets/mappers";
import { PlotTooltip } from "../PlotTooltip";

const ScatterPlot = ({
  data,
  selectedValueX,
  selectedValueY,
  selectedValueColor,
  selectedValues,
  handleSelectedChange
}) => {
  const { t } = useTranslation("labels");
  const theme = useTheme();

  const ref = useRef();

  const [widthInPixels, setWidthInPixels] = useState(500);
  const [heightInPixels, setHeightInPixels] = useState(200);
  const [tooltip, setTooltip] = useState(null); // Adicione o estado para a tooltip

  useEffect(() => {

    // Clear previous SVG content
    d3.select(ref.current).selectAll("*").remove();

    const currentWidth = parseInt(d3.select('#scatterplot-container').style('width'), 10);
    const currentHeight = parseInt(d3.select('#scatterplot-container').style('height'), 10);

    if (!isNaN(currentWidth) && !isNaN(currentHeight) && currentWidth !== 0 && currentHeight !== 0 && data.length > 0) {

      setWidthInPixels(currentWidth);
      setHeightInPixels(vhToPixels(currentHeight));

      // set the dimensions and margins of the graph
      var margin = { top: 50, right: 150, bottom: 90, left: 130 },
        width = widthInPixels - margin.left - margin.right,
        height = heightInPixels - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // Add X axis
      var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d[selectedValueX]; }))
        .range([0, width]);
      svg.append("g")
        .style("font-size", "13px")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height).tickPadding(15).tickFormat(function (d) { return formatNumber(d, selectedValueX); }))
        .select(".domain").remove()
      //.selectAll(".domain").attr("stroke", theme.palette.primary.lightGrey).attr("stroke-width", "2").attr("opacity", activeAxis ? 1 : 0).attr('marker-end', 'url(#arrowhead-right)');

      // X axis label:
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .attr("font-weight", 500)
        .attr("font-size", "12px")
        .attr("fill", theme.palette.primary.darkGrey)
        .text(t(`scatter.${selectedValueX}`));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d[selectedValueY]; }))
        .range([height, 0]);
      svg.append("g")
        .style("font-size", "13px")
        .call(d3.axisLeft(y).tickSize(-width).tickPadding(15).tickFormat(function (d) { return formatNumber(d, selectedValueY); }))
        .select(".domain").remove()
      //.selectAll(".domain").attr("stroke", theme.palette.primary.lightGrey).attr("stroke-width", "2").attr("opacity", activeAxis ? 1 : 0).attr('marker-end', 'url(#arrowhead-top)');

      // Customization
      svg.selectAll(".tick line").attr("stroke", theme.palette.plot.divider)

      // Y axis label:
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 45)
        .attr("x", -height / 2)
        .attr("font-weight", 500)
        .attr("font-size", "12px")
        .attr("fill", theme.palette.primary.darkGrey)
        .text(t(`scatter.${selectedValueY}`));

      // Add Color axis
      var color = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d[selectedValueColor]; }))
        .range([height, 0]);
      svg.append("g")
        .attr("transform",
          "translate(" + (width + 40) + ",0 )")
        .style("font-size", "13px")
        .call(d3.axisRight(color).tickSize(0).tickFormat(function (d) { return formatNumber(d, selectedValueColor); }))
        .select(".domain").remove()

      // Color axis label:
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(90)")
        .attr("y", -width - margin.right + 45)
        .attr("x", height / 2)
        .attr("font-weight", 500)
        .attr("font-size", "12px")
        .attr("fill", theme.palette.primary.darkGrey)
        .text(t(`scatter.${selectedValueColor}`));


      //Append a defs (for definition) element to your SVG
      var defs = svg.append("defs");

      //Append a linearGradient element to the defs and give it a unique id
      var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

      //Vertical gradient
      linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      //Set the color for the start (0%)
      linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", (selectedValueColor === 'tca') ? "#4ADAE7" : "#F9035E");

      //Set the color for the end (100%)
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", (selectedValueColor === 'tca') ? "#FF16FF" : "#74F14E"); //dark blue 

      //Draw the rectangle and fill with gradient
      svg.append("rect")
        .attr("width", 10)
        .attr("height", height)
        .attr("rx", "5px")
        .attr("x", width + margin.right - 125)
        .attr("y", 0)
        .style("fill", "url(#linear-gradient)");

      var myColor = d3.scaleSequential().domain(d3.extent(data, function (d) { return d[selectedValueColor]; })).range(["#74F14E", "#F9035E"])
      var tcaColor = d3.scaleSequential().domain(d3.extent(data, function (d) { return d.tca; })).range(["#FF16FF", "#4ADAE7"])

      svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d[selectedValueX]); })
        .attr("cy", function (d) { return y(d[selectedValueY]); })
        .attr("r", function (d) {
          if (selectedValues.includes(d.id)) {
            return 8; // Define a opacidade para 0.8 se estiver presente
          } else {
            return 5; // Define a opacidade para 0.1 se não estiver presente
          }
        })
        .attr("stroke-width", function (d) {
          if (selectedValues.includes(d.id)) {
            return "6px"; // Define a opacidade para 0.8 se estiver presente
          } else {
            return "0"; // Define a opacidade para 0.1 se não estiver presente
          }
        })
        .attr("stroke", function (d) {
          if (selectedValues.includes(d.id)) {
            if (selectedValueColor === 'tca') return alpha(tcaColor(d[selectedValueColor]), 0.6);
            else return alpha(myColor(d[selectedValueColor]), 0.6);
          } else {
            return "white"; // Define a opacidade para 0.1 se não estiver presente
          }
        })
        .style("fill", function (d) {
          if (selectedValueColor === 'tca') return tcaColor(d[selectedValueColor]);
          else return myColor(d[selectedValueColor]);
        })
        .on("mouseover", function (event, d) {
          d3.select(this)
            .transition() // Adiciona uma transição suave
            .duration(100)
            .attr("r", function (d) {
              if (selectedValues.includes(d.id)) {
                return 8; // Define a opacidade para 0.8 se estiver presente
              } else {
                return 8; // Define a opacidade para 0.1 se não estiver presente
              }
            })
            .attr("cursor", "pointer")
          setTooltip({
            x: event.pageX - 200,
            y: event.pageY - 220,
            tcaColor: tcaColor(d.tca),
            manTime: d.man_time,
            tca: d.time_to_tca,
            tcaValue: d.tca,
            type: d.type,
            delta_v: d.delta_v,
            duration: d.duration,
            poc: d.poc,
            miss_distance: d.miss_distance,
            fuel_consumption: d.fuel_consumption,
          });
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition() // Adiciona uma transição suave
            .duration(100)
            .attr("r", function (d) {
              if (selectedValues.includes(d.id)) {
                return 8; // Define a opacidade para 0.8 se estiver presente
              } else {
                return 5; // Define a opacidade para 0.1 se não estiver presente
              }
            })
          setTooltip(null);
        })
        .on("click", function (event, d) {
          toggleSelected(d.id)
        });

      function toggleSelected(id) {
        if (selectedValues.includes(id)) {
          handleSelectedChange(selectedValues.filter(item => item !== id)); // Remove o elemento do array
        } else {
          handleSelectedChange([...selectedValues, id]); // Adiciona o elemento ao array
        }
      }
    }
  }, [widthInPixels, heightInPixels, theme, selectedValueX, selectedValueY, selectedValueColor, selectedValues, handleSelectedChange]);


  return (
    <div>
      <svg width={widthInPixels} height={heightInPixels} id="scatter-plot" ref={ref} />
      {tooltip && <PlotTooltip manoeuvres={data} x={tooltip.x} y={tooltip.y} position={'absolute'} tcaColor={tooltip.tcaColor} manTime={tooltip.manTime} tca={tooltip.tca} tcaValue={tooltip.tcaValue} type={tooltip.type} delta_v={tooltip.delta_v} duration={tooltip.duration} poc={tooltip.poc} miss_distance={tooltip.miss_distance} fuel_consumption={tooltip.fuel_consumption} theme={theme} />}
    </div>
  );
};

export default ScatterPlot;

const vhToPixels = vh => {
  const screenHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  return (vh * screenHeight) / 100;
};
