import { useTheme } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

const ManoeuvreGlyph = ({
  data,
  tca,
  miss_distance,
  poc,
  duration,
  fuel_consumption,
  type
}) => {
  const theme = useTheme();

  const ref = useRef();

  useEffect(() => {

    d3.select(ref.current).selectAll("*").remove();

    //const data = manoeuvresList.items;

    // set the dimensions and margins of the graph
    const width = 120;
    const height = 140;

    // append the svg object to the body of the page
    var svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    // Obter os valores mínimo e máximo de miss_distance do dataset
    const minMissDistance = d3.min(data, d => d.miss_distance);
    const maxMissDistance = d3.max(data, d => d.miss_distance);
    const minPoc = d3.min(data, d => d.poc);
    const maxPoc = d3.max(data, d => d.poc);
    const minDuration = d3.min(data, d => d.duration);
    const maxDuration = d3.max(data, d => d.duration);
    const minFuelConsumption = d3.min(data, d => d.fuel_consumption);
    const maxFuelConsumption = d3.max(data, d => d.fuel_consumption);

    var tcaColor = d3.scaleSequential().domain(d3.extent(data, function (d) { return d.tca; })).range(["#FF1760", "#30E1F1"])

    // Criar uma escala linear para mapear miss_distance para o intervalo [10, 120]
    const radiusScale = d3.scaleLinear()
      .domain([minMissDistance, maxMissDistance])
      .range([37.5, 55]);

    const pocScale = d3.scaleLinear()
      .domain([maxPoc, minPoc])
      .range([0, 1]);

    const durationScale = d3.scaleLinear()
      .domain([minDuration, maxDuration])
      .range([0, 2 * Math.PI]);

    const fuelConsumptionScale = d3.scaleLinear()
      .domain([minFuelConsumption, maxFuelConsumption])
      .range([1, 7]);

    const innerRadius = radiusScale(miss_distance);
    const outerRadius = (1 - pocScale(poc) < 0.15) ? innerRadius : (innerRadius * 1.1111); //1.1111
    const spikes = (1 - pocScale(poc));
    const points = spikes < 0.15 ? 100 : Math.trunc(spikes * 40);
    const angle = Math.PI / points * 2;
    let startAngle = -Math.PI / 2;
    let path = `M ${width / 2},${height / 2 - outerRadius}`;

    for (let i = 0; i < points; i++) {
      const outerX = width / 2 + Math.cos(startAngle) * outerRadius;
      const outerY = height / 2 + Math.sin(startAngle) * outerRadius;
      const innerX = width / 2 + Math.cos(startAngle + angle / 2) * innerRadius;
      const innerY = height / 2 + Math.sin(startAngle + angle / 2) * innerRadius;

      path += ` L ${outerX},${outerY} L ${innerX},${innerY}`;

      startAngle += angle;
    }

    path += `Z`;

    //Time to TCA + Miss Distance + PoC Path
    svg.append("path")
      .attr("d", path)
      .attr("fill", tcaColor(tca));

    //Duration arc
    const fullDurationArc = d3.arc()
      .innerRadius(25)
      .outerRadius(37.5)
      .startAngle(0)
      .endAngle(7);

    svg.append("path")
      .attr("transform", "translate(60,70)")
      .attr("d", fullDurationArc)
      .attr("fill", "#F5F5F5")
      .attr("opacity", "0.2");

    //Duration arc
    const durationArc = d3.arc()
      .innerRadius(25)
      .outerRadius(37.5)
      .startAngle(0)
      .endAngle((duration === undefined || duration === 0) ? 0 : durationScale(duration));
    //.endAngle(4.3);

    svg.append("path")
      .attr("transform", "translate(60,70)")
      .attr("d", durationArc)
      .attr("fill", "#F5F5F5");

    //Middle Circle
    svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 26)
      .attr("fill", "black");

    // Definir os arcos
    const fullFuelArc = d3.arc()
      .innerRadius((d, i) => 1.5 + (i * 3.5))
      .outerRadius((d, i) => 3.5 + (i * 3.5))
      .startAngle(0)
      .endAngle(2 * Math.PI);

    // Adicionar os arcos ao SVG
    for (let i = 0; i < 7; i++) {
      svg.append("path")
        .attr("transform", "translate(60,70)")
        .attr("d", fullFuelArc(null, i))
        .attr("fill", "#F5F5F5")
        .attr("opacity", "0.25");
    }

    // Definir o número de arcos baseado no fuel_consumption
    const numArcs = (fuel_consumption === 0 || fuel_consumption === undefined) ? 0 : Math.round(fuelConsumptionScale(fuel_consumption));

    // Definir os arcos
    const fuelArc = d3.arc()
      .innerRadius((d, i) => 1.5 + (i * 3.5))
      .outerRadius((d, i) => 3.5 + (i * 3.5))
      .startAngle(0)
      .endAngle(2 * Math.PI);

    // Adicionar os arcos ao SVG
    for (let i = 0; i < numArcs; i++) {
      svg.append("path")
        .attr("transform", "translate(60,70)")
        .attr("d", fuelArc(null, i))
        .attr("fill", "#F5F5F5");
    }

    //Type Circle
    svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2 + 37.5)
      .attr("r", 8)
      .attr("fill", "black");

    const iconAttributes = typePath(type, theme);
    svg.append("path")
      .attr("transform", iconAttributes.transform)
      .attr("d", iconAttributes.d)
      .attr("fill", iconAttributes.fill);

  }, [theme, data, tca, miss_distance, poc, duration, fuel_consumption, type]);

  return (
    <div>
      <svg width={120} height={140} id="glyph" ref={ref} />
    </div>
  );
};

export default ManoeuvreGlyph;

const typePath = (type, theme) => {
  if (type === 'impulsive') {
    return {
      d: "M 0 8.5 h 10 L 5 0 z",
      fill: "rgb(251, 86, 7)",
      transform: "translate(55,102.5)"
    };
  } else if (type === 'thrust') {
    return {
      d: "M 0 0 H 8 V 8 H 0 L 0 0",
      fill: "rgb(255, 190, 11)",
      transform: "translate(56,103.5)"
    };
  } else if (type === 'differential_drag') {
    return {
      d: "M 0 5.5 L 5.5 11 L 11 5.5 L 5.5 0 L 0 5.5",
      fill: "rgb(131, 56, 236)",
      transform: "translate(54.5,102)"
    };
  } else {
    return {
      d: "",
      fill: "none",
      transform: ""
    };
  }
};
