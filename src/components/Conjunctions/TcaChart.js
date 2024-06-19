import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material";
import { conjunctionsList } from "../../assets/mappers";

const TcaPlot = ({
  tca,
  tcaLabel,
  status,
  isFirstRow,
}) => {
  const ref = useRef();
  const theme = useTheme();

  const [heightInPixels, setHeightInPixels] = useState(16);
  const [widthInPixels, setWidthInPixels] = useState(450);

  useEffect(() => {

    // Clear previous SVG content
    d3.select(ref.current).selectAll("*").remove();

    const currentWidth = parseInt(d3.select('#tca-chart-table-cell').style('width'), 10);
    const currentHeight = parseInt(d3.select('#tca-chart-table-cell').style('height'), 10);

    if (currentWidth !== 0 && currentHeight !== 0) {

      setWidthInPixels(currentWidth);
      setHeightInPixels(currentHeight);
      // set the dimensions and margins of the graph

      const width = 500,
        height = currentHeight;

      // append the svg object to the body of the page
      const svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      // Full Data
      const fullData = conjunctionsList.items;
      // Data
      const data = [{ tca: tca, tcaLabel: tcaLabel, status: status }];
      // Add X axis
      // Calcular os valores mínimos e máximos de tcaValue
      var minTcaValue = d3.min(fullData, function (d) { return Math.round(d.tcaValue); });
      var maxTcaValue = d3.max(fullData, function (d) { return Math.round(d.tcaValue); });

      var x;

      // Definir o domínio com base nos valores de minTcaValue e maxTcaValue
      if (minTcaValue > 0 && maxTcaValue > 0) {
        x = d3.scaleLinear()
          .domain([0, maxTcaValue])
          .range([2, width - 10]);
      } else if (minTcaValue < 0 && maxTcaValue < 0) {
        x = d3.scaleLinear()
          .domain([minTcaValue, 0])
          .range([10, width - 2]);
      } else {
        x = d3.scaleLinear()
          .domain([minTcaValue, maxTcaValue])
          .range([10, width - 10]);
      }

      //.ticks(5)
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisTop(x).ticks(4).tickSize(height - 23).tickPadding(10).tickFormat(function (value) { return formatarTempo(value); }))
        .selectAll(".domain").attr("opacity", 0)

      svg.selectAll(".tick line")
        .attr("stroke", theme.palette.plot.divider);

      svg.selectAll(".tick text")
        .style("fill", theme.palette.primary.lightGrey);

      svg.selectAll(".now-flag-bg")
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'now-flag-bg')
        .attr('x', x(0) - 32) // Adiciona um espaçamento adicional de 10 pixels em cada lado do texto
        .attr('y', 0) // Define a posição y do retângulo ao lado da linha (ajuste conforme necessário)
        .attr('width', 32)
        .attr('height', 18) // Altura fixa do retângulo (ajuste conforme necessário)
        .attr('fill', "#EA2155"); // Cor de fundo do retângulo

      svg.selectAll(".now-flag")
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'now-flag')
        .attr('x', x(0) - 2) // Define a posição x do texto ao lado da linha
        .attr('y', 13) // Define a posição y do texto ao lado da linha (ajuste conforme necessário)
        .text('Now') // Define o texto da etiqueta com base nos dados
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 400)
        .attr('text-anchor', 'end'); // Alinha o texto com o início do texto

      if (!isFirstRow) {
        svg.selectAll(".now-flag").remove();
        svg.selectAll(".now-flag-bg").remove();
        svg.selectAll(".tick text").remove();
        svg.selectAll(".tick line").attr("y2", -height)
      }

      // create a tooltip
      let Tooltip = d3.select("body")
        .append("div")
        .style("visibility", "visible")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("padding", "4px")
        .style("position", "absolute")
        .style("font-size", "13px")
        .style("font-weight", 500)


      // Line
      svg.selectAll(".now-line")
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'now-line')
        .attr('x', x(0))
        .attr('y', 0)
        .attr('width', 2)
        .attr('height', height)
        .attr('fill', 'rgba(234,33,85)');


      svg.selectAll(".tca-line")
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'tca-line')
        .attr('x1', x(0)) // coordenada x do ponto inicial
        .attr('y1', height / 2) // coordenada y do ponto inicial
        .attr('x2', function (d) { // coordenada x do ponto final
          return x(d.tca); // Aqui você pode definir a lógica para determinar a coordenada x do ponto final
        })
        .attr('y2', height / 2) // coordenada y do ponto final (mesma altura que o ponto inicial)
        .attr('stroke', function (d) {
          return theme.palette.status[d.status];
        })
        .attr('opacity', function (d) { // coordenada x do ponto final
          return d.tca > 0 ? 1 : 0.2; // Aqui você pode definir a lógica para determinar a coordenada x do ponto final
        })
        .attr('stroke-width', 4); // largura da linha

      // 2nd Circle
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('cy', height / 2)
        .attr('cx', function (d) {
          return x(d.tca);
        })
        .attr('r', 8)
        .style('fill', function (d) {
          return theme.palette.status[d.status];
        })
        .style('opacity', 0.5);

      // Circle
      svg.selectAll(".nd-circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class', 'nd-circle')
        .attr('cy', height / 2)
        .attr('cx', function (d) {
          return x(d.tca);
        })
        .attr('r', 5)
        .attr('fill', function (d) {
          return theme.palette.status[d.status];
        })
        .on("mouseover", function (e, d) {
          d3.select(this)
            .transition() // Adiciona uma transição suave
            .duration(100)
            .attr("r", 7);
          Tooltip.transition()
            .duration(200)
            .style("visibility", "visible");

          if (d.tca > 0) {
            Tooltip.html(d.tcaLabel + " to TCA")
          } else {
            Tooltip.html("TCA " + d.tcaLabel + " ago")
          }
          Tooltip
            .style("color", theme.palette.status[d.status])
            .style("left", (e.pageX - (Tooltip.node().offsetWidth) / 2) + "px")
            .style("top", (e.pageY - 40) + "px")
            .style("border-radius", "20px")
            .style("padding", "2px 10px")
            .style("border", "none")
            .style("box-shadow", "0 4px 14px 0 rgba(0,0,0,0.1)")
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .transition() // Adiciona uma transição suave
            .duration(100)
            .attr("r", 5);
          Tooltip.transition()
            .duration(500)
            .style("visibility", "hidden");
        })
    }
  }, [theme, isFirstRow]);

  return <svg width={500} height={heightInPixels} id="tca-chart" ref={ref} />;
};

export default TcaPlot;

function formatarTempo(valor) {
  // Convertendo valor negativo para positivo
  const valorAbs = Math.abs(valor);

  if (isNaN(valorAbs)) {
    return "Por favor, insira um número válido.";
  }

  let dias = Math.floor(valorAbs / 24);
  let horas = Math.floor(valorAbs % 24);
  let minutos = Math.floor((valorAbs % 1) * 60);

  let resultado = "";

  if (dias > 0) {
    resultado += `${dias} day${dias > 1 ? 's' : ''} `;
  }

  if (horas > 0 && dias <= 0) {
    resultado += `${horas} hour${horas > 1 ? 's' : ''} `;
  }

  if (minutos > 0 && horas <= 0 && dias <= 0) {
    resultado += `${minutos} minute${minutos > 1 ? 's' : ''}`;
  }

  if (valor > 0) return ("in " + resultado.trim());
  else if (valor === 0) return ("");
  else return (resultado.trim() + " ago");

}
