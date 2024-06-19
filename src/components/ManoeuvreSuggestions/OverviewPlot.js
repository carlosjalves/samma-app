import { alpha, useTheme, Tooltip, SvgIcon } from "@mui/material";
import * as d3 from "d3";
import { radial as d3FisheyeRadial } from "d3-fisheye";
//import { fisheye } from 'd3-fisheye';
import * as d3Fisheye from 'd3-fisheye';

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlotTooltip } from "../PlotTooltip";
import ManoeuvreGlyph from '../ManoeuvreGlyph'; // Importe o componente ManoeuvreGlyph
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

//const fisheye = d3Fisheye.fisheye;
//const radial = d3Fisheye.radial;

const OverviewPlot = ({
  data,
  selectedOption,
  activeAxis,
  sliderValues,
  selectedValues,
  handleSelectedChange
}) => {
  const { t } = useTranslation("labels");
  const theme = useTheme();

  const ref = useRef();

  const [widthInPixels, setWidthInPixels] = useState(0);
  const [heightInPixels, setHeightInPixels] = useState(200);
  const [tooltipData, setTooltipData] = useState([]);

  const handleDivClick = (id) => {
    handleSelectedChange(selectedValues.filter(value => value !== id));
  };

  useEffect(() => {

    d3.select(ref.current).selectAll("*").remove();

    const currentWidth = parseInt(d3.select('#chart-container').style('width'), 10);
    const currentHeight = parseInt(d3.select('#chart-container').style('height'), 10);

    if (!isNaN(currentWidth) && !isNaN(currentHeight) && currentWidth !== 0 && currentHeight !== 0 && data.length > 0) {

      setWidthInPixels(vwToPixels(currentWidth));
      setHeightInPixels(vhToPixels(currentHeight));

      if (selectedValues.length > 0) {
        setHeightInPixels(vhToPixels(53));
      } else {
        setHeightInPixels(vhToPixels(70));
      }

      // set the dimensions and margins of the graph
      var margin = { top: 30, right: 30, bottom: 30, left: 60 },
        width = widthInPixels - margin.left - margin.right,
        height = heightInPixels - margin.top - margin.bottom - margin.bottom;

      let newNum = normalizeManeuvers(data, sliderValues)

      // append the svg object to the body of the page
      var svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top + 3)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrowhead-right')
        .attr('refX', 3)
        .attr('refY', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 10)
        .append('path')
        .attr('d', 'M 0 2 L 3 5 L 0 8')
        .attr('stroke', theme.palette.primary.lightGrey)
        .attr('stroke-width', 1)
        .attr('fill', 'none');

      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrowhead-top')
        .attr('refX', 3)
        .attr('refY', 5)
        .attr('markerWidth', 15)
        .attr('markerHeight', 15)
        .append('path')
        .attr('d', 'M 0 8 L 3 5 L 6 8')
        .attr('stroke', theme.palette.primary.lightGrey)
        .attr('stroke-width', 1)
        .attr('fill', 'none');

      // Add X axis
      var x = d3.scaleLinear()
        .domain(d3.extent(newNum, function (d) { return d.total; }))
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(0).tickSize(0))
        .selectAll(".domain").attr("stroke", theme.palette.primary.lightGrey).attr("stroke-width", "2").attr("opacity", activeAxis ? 1 : 0).attr('marker-end', 'url(#arrowhead-right)');

      const labelGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top})`)
        .attr("text-anchor", "middle");

      labelGroup.append("text")
        .attr("font-weight", 500)
        .attr("font-size", "13px")
        .attr("fill", theme.palette.primary.lightGrey)
        .attr("opacity", activeAxis ? 1 : 0)
        .text("Best Manoeuvre");

      const foreignObject = labelGroup.append("foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 51)
        .attr("y", -14)
        .attr("opacity", activeAxis ? 1 : 0)

      const foreignObjectElement = foreignObject.node();

      const IconWithTooltip = () => (
        <Tooltip arrow placement="top" title="We use min-max scaling to calculate the best manoeuvres based on the multiple attributes. This ensures that all attributes are considered fairly and that the most efficient manoeuvres are calculated.">
          <SvgIcon
            sx={{
              fontSize: "16px",
              marginLeft: "3px",
              color: theme.palette.primary.lightGrey,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            <InfoOutlinedIcon />
          </SvgIcon>
        </Tooltip>
      );

      // Renderize o componente React dentro do foreignObject usando createRoot
      const root = createRoot(foreignObjectElement);
      root.render(<IconWithTooltip />);

      // Add Y axis
      var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d[selectedOption]; }))
        .range([height, 7]);
      svg.append("g")
        .call(d3.axisLeft(y).ticks(0).tickSize(0))
        .selectAll(".domain").attr("stroke", theme.palette.primary.lightGrey).attr("stroke-width", "2").attr("opacity", activeAxis ? 1 : 0).attr('marker-end', 'url(#arrowhead-top)');

      // Y axis label:
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 35)
        .attr("x", -height / 2)
        .attr("font-weight", 500)
        .attr("font-size", "13px")
        .attr("fill", theme.palette.primary.lightGrey)
        .attr("opacity", activeAxis ? 1 : 0)
        .text(t(`select.${selectedOption}`));

      var myColor = d3.scaleSequential().domain([0, 1]).range(["#FF16FF", "#30E1F1"])
      var tcaColor = d3.scaleSequential().domain(d3.extent(data, function (d) { return d.tca; })).range(["#FF16FF", "#30E1F1"])

      function toggleSelected(id) {
        if (selectedValues.includes(id)) {
          handleSelectedChange(selectedValues.filter(item => item !== id));
        } else {
          handleSelectedChange([...selectedValues, id]);
        }
      }

      const stars = svg.selectAll("path.star")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "star")

      stars.each(function (d, i) {
        const centerX = x(newNum[i].total);
        const centerY = y(d[selectedOption]);
        const innerRadius = Math.sqrt((newNum[i].miss_distance) * 2000 / Math.PI);
        const outerRadius = (1 - newNum[i].poc < 0.15) ? innerRadius : (innerRadius * 1.1511); //1.1111
        const color = myColor(newNum[i].tca);
        const manoeuvres = d;

        drawStar(svg, centerX, centerY, outerRadius, innerRadius, color, (1 - newNum[i].poc), manoeuvres, selectedValues, toggleSelected, data);
      });

      const newTooltipData = data.filter(d => selectedValues.includes(d.id)).map(d => ({
        ...d,
        tcaColor: tcaColor(d.tca)
      }));

      setTooltipData(newTooltipData);

      // Fisheye effect
      const fisheyeEffect = d3FisheyeRadial()
        .radius(200)
        .distortion(2);

      svg.on("mousemove", function (event) {
        fisheyeEffect.focus(d3.pointer(event, this));

        stars.each(function (d, i) {
          const centerX = x(newNum[i].total);
          const centerY = y(d[selectedOption]);
          const fisheyePoint = fisheyeEffect([centerX, centerY]);

          stars.attr("transform", "translate(" + 100 + "," + 100 + ")");

        })
      });

      svg.on("mouseout", function () {
        stars.attr("transform", "translate(0,0)");
      });
    }
  }, [widthInPixels, heightInPixels, theme, selectedOption, activeAxis, sliderValues, selectedValues, handleSelectedChange, data, t]);

  return (
    <div>
      <svg width={widthInPixels} height={heightInPixels} id="overview-chart" ref={ref} />
      <div className="carousel-container">
        <div className="carousel">
          {tooltipData.map((tooltipItem, index) => (
            <div key={index} className="carousel-item">
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", backgroundColor: theme.palette.primary.main, position: "relative", marginBottom: "-10px", marginLeft: "10px", zIndex: "1", border: `2.5px solid ${theme.palette.text.primary}`, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center"
              }} onClick={() => handleDivClick(tooltipItem.id)}>
                <div style={{ width: "9.5px", height: "2.5px", backgroundColor: theme.palette.text.primary }}></div>
              </div>
              <PlotTooltip
                manoeuvres={data}
                key={index}
                x={0}
                y={0}
                position={"relative"}
                tcaColor={tooltipItem.tcaColor}
                manTime={tooltipItem.man_time}
                tca={tooltipItem.time_to_tca}
                tcaValue={tooltipItem.tca}
                type={tooltipItem.type}
                delta_v={tooltipItem.delta_v}
                duration={tooltipItem.duration}
                poc={tooltipItem.poc}
                miss_distance={tooltipItem.miss_distance}
                fuel_consumption={tooltipItem.fuel_consumption}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPlot;

function drawStar(svg, centerX, centerY, outerRadius, innerRadius, color, spikes, manoeuvres, selectedValues, toggleSelected, data) {
  const points = spikes < 0.15 ? 100 : Math.trunc(spikes * 40);
  const angle = Math.PI / points * 2;
  let startAngle = -Math.PI / 2;
  let path = `M ${centerX},${centerY - outerRadius}`;

  for (let i = 0; i < points; i++) {
    const outerX = centerX + Math.cos(startAngle) * outerRadius;
    const outerY = centerY + Math.sin(startAngle) * outerRadius;
    const innerX = centerX + Math.cos(startAngle + angle / 2) * innerRadius;
    const innerY = centerY + Math.sin(startAngle + angle / 2) * innerRadius;

    path += ` L ${outerX},${outerY} L ${innerX},${innerY}`;

    startAngle += angle;
  }

  path += `Z`;

  svg.append("g").attr("class", "glyph-" + manoeuvres.id + "")
    .append("path")
    .attr("d", path)
    .attr("fill", color)
    .attr("opacity", function (d) {
      if (selectedValues.length > 0) {
        if (selectedValues.includes(manoeuvres.id)) {
          return "1";
        } else {
          return "0.3";
        }
      } else {
        return "0.8";
      }
    })
    .attr("stroke-width", function (d) {
      if (selectedValues.includes(manoeuvres.id)) {
        return "8px";
      } else {
        return "0";
      }
    })
    .attr("stroke", function (d) {
      if (selectedValues.includes(manoeuvres.id)) {
        return alpha(color, 0.7);
      } else {
        return "white";
      }
    })
    .attr("cursor", "pointer")
    .attr("class", "starboy")
    .on("mouseover", function (e, d) {
      // Lógica para mostrar o glifo no mouseover
      const hoveredStar = this;
      const { tca, miss_distance, poc, duration, fuel_consumption, type } = manoeuvres;

      // Posição da estrela (hoveredStar)
      const bbox = hoveredStar.getBoundingClientRect();

      // Calcula as coordenadas absolutas
      const centerX = bbox.left + window.scrollX + (bbox.width / 2) - 60;
      const centerY = bbox.top + window.scrollY + (bbox.height / 2) - 70;

      // Crie um nó do DOM para conter o glifo
      const container = document.createElement("div");
      container.setAttribute("class", "manoeuvre-glyph-container");
      container.setAttribute("style", `position: absolute; left: ${centerX}px; top: ${centerY}px; pointer-events: none;`);

      // Adicione o nó do DOM ao contêiner do gráfico
      document.getElementById("chart-container").appendChild(container);

      // Adicione a classe grow para a animação
      requestAnimationFrame(() => {
        container.classList.add("grow");
      });

      // Renderize o componente React dentro do nó do DOM
      const root = createRoot(container);
      const glyph = (
        <ManoeuvreGlyph
          data={data}
          tca={tca}
          miss_distance={miss_distance}
          poc={poc}
          duration={duration}
          fuel_consumption={fuel_consumption}
          type={type}
        />
      );
      root.render(glyph);

      // Se desejar, você pode adicionar transições ou ajustar o posicionamento do glifo conforme necessário
    })
    .on("mouseout", function (e, d) {
      // Remova o glifo no mouseout
      document.querySelectorAll(".manoeuvre-glyph-container").forEach(el => el.remove());
    })
    .on("click", function (e, d) {
      toggleSelected(manoeuvres.id);
    });
}

function normalizeManeuvers(manuevers, slider) {
  // Função auxiliar para normalizar uma lista de valores
  function normalizeList(list, best) {
    var minMax = list.reduce((acc, value) => {
      if (value < acc.min) {
        acc.min = value;
      }
      if (value > acc.max) {
        acc.max = value;
      }
      return acc;
    }, { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });

    return list.map(value => {
      // Verificar se não estamos prestes a dividir por zero
      if (minMax.max === minMax.min) {
        return 1 / list.length;
      }
      var diff = minMax.max - minMax.min;

      if (best === 'max') return (value - minMax.min) / diff;
      if (best === 'min') return (minMax.max - value) / diff;
    });
  }

  // Extrair todos os valores de cada variável em todas as manobras
  var tcaValues = manuevers.map(m => parseFloat(m.tca));
  var deltaVValues = manuevers.map(m => parseFloat(m.delta_v));
  var durationValues = manuevers.map(m => parseFloat(m.duration));
  var pocValues = manuevers.map(m => parseFloat(m.poc));
  var missDistanceValues = manuevers.map(m => parseFloat(m.miss_distance));
  var fuelConsumptionValues = manuevers.map(m => parseFloat(m.fuel_consumption));

  // Extrair os valores dos sliders, se estiverem definidos
  var tcaSlider = slider.tca !== undefined ? slider.tca * 0.01 : 0;
  var deltaVSlider = slider.delta_v !== undefined ? slider.delta_v * 0.01 : 0;
  var durationSlider = slider.duration !== undefined ? slider.duration * 0.01 : 0;
  var pocSlider = slider.poc !== undefined ? slider.poc * 0.01 : 0;
  var missDistanceSlider = slider.miss_distance !== undefined ? slider.miss_distance * 0.01 : 0;
  var fuelConsumptionSlider = slider.fuel_consumption !== undefined ? slider.fuel_consumption * 0.01 : 0;

  // Normalizar os valores de cada variável, se estiverem presentes
  var normalizedTCA = tcaValues.length > 0 ? normalizeList(tcaValues, 'max') : [];
  var normalizedDeltaV = deltaVValues.length > 0 ? normalizeList(deltaVValues, 'min') : [];
  var normalizedDuration = durationValues.length > 0 ? normalizeList(durationValues, 'min') : [];
  var normalizedPoc = pocValues.length > 0 ? normalizeList(pocValues, 'min') : [];
  var normalizedMissDistance = missDistanceValues.length > 0 ? normalizeList(missDistanceValues, 'max') : [];
  var normalizedFuelConsumption = fuelConsumptionValues.length > 0 ? normalizeList(fuelConsumptionValues, 'min') : [];

  // Construir o novo objeto de array com os valores normalizados
  var normalizedManeuvers = manuevers.map((m, index) => ({
    tca: normalizedTCA[index] !== undefined ? normalizedTCA[index] : null,
    delta_v: normalizedDeltaV[index] !== undefined ? normalizedDeltaV[index] : null,
    duration: normalizedDuration[index] !== undefined ? normalizedDuration[index] : null,
    poc: normalizedPoc[index] !== undefined ? normalizedPoc[index] : null,
    miss_distance: normalizedMissDistance[index] !== undefined ? normalizedMissDistance[index] + 0.2 : null,
    fuel_consumption: normalizedFuelConsumption[index] !== undefined ? normalizedFuelConsumption[index] : null,
    total: ((normalizedTCA[index] || 0) * tcaSlider) + ((normalizedDeltaV[index] || 0) * deltaVSlider) + ((normalizedDuration[index] || 0) * durationSlider) + ((normalizedPoc[index] || 0) * pocSlider) + ((normalizedMissDistance[index] || 0) * missDistanceSlider) + ((normalizedFuelConsumption[index] || 0) * fuelConsumptionSlider) / 4,
  }));

  return normalizedManeuvers;
}

const vwToPixels = vw => {
  const screenWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  return (vw * screenWidth) / 100;
};

const vhToPixels = vh => {
  const screenHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  return (vh * screenHeight) / 100;
};
