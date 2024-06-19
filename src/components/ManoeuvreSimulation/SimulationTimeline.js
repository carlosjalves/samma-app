import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';
import { Slider, Typography, Stack, Button, Tooltip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import OverlappingTable from './OverlappingTable';
import legendIcon from '../../assets/icons/legend.svg'
import { TimelineLegend } from './TimelineLegend';

const SimulationTimeline = ({ data, selectedValues, handleSelectedChange }) => {
  const ref = useRef();
  const theme = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [heightInPixels, setHeightInPixels] = useState(16);
  const [widthInPixels, setWidthInPixels] = useState(450);
  const [overlappedElements, setOverlappedElements] = useState({});

  const [activeLegend, setActiveLegend] = useState(false);

  const handleLegendClick = () => {
    setActiveLegend(!activeLegend);
  };

  const maxManTime = d3.max(data, d => new Date(d.ignition_epoch_earliest));
  const maxTime = new Date(maxManTime);
  maxTime.setDate(maxTime.getDate() + 1);

  const [sliderValue, setSliderValue] = useState([new Date().getTime(), maxTime.getTime()]);

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    // Setup SVG only once
    const svg = d3.select(ref.current);
    const currentWidth = parseInt(d3.select('#timeline-div').style('width'), 10);
    const currentHeight = parseInt(d3.select('#timeline-div').style('height'), 10);

    if (currentWidth !== 0 && currentHeight !== 0) {
      setWidthInPixels(currentWidth);
      setHeightInPixels(currentHeight);

      const width = currentWidth;
      const height = currentHeight;

      svg.attr('width', width)
        .attr('height', height);

      if (svg.select('.background-rect').empty()) {

        svg.append('rect')
          .attr('class', 'background-rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('height', height)
          .attr('width', width)
          .style('fill', theme.palette.plot.background);

        const xScale = d3.scaleTime()
          .domain([new Date(sliderValue[0]), new Date(sliderValue[1])])
          .range([100, width - 100]);

        const ticks = xScale.ticks(6); // Gera 6 ticks automaticamente

        svg.append("g")
          .attr("transform", "translate(0," + 0 + ")")
          .attr("class", "domain-g")
          .call(d3.axisBottom(xScale).tickValues(ticks).tickSize(height - 18).tickPadding(5).tickFormat(function (value) { return formatarTempo(value); }))
          .selectAll(".domain").attr("opacity", 0)

        svg.selectAll(".tick line")
          .attr("stroke", theme.palette.plot.divider);

        svg.selectAll(".tick text")
          .style("fill", theme.palette.primary.lightGrey);

        svg.append('rect')
          .attr('class', 'now-flag-bg')
          .attr('x', xScale(new Date())) // Adiciona um espaçamento adicional de 10 pixels em cada lado do texto
          .attr('y', height - 18) // Define a posição y do retângulo ao lado da linha (ajuste conforme necessário)
          .attr('width', 32)
          .attr('height', 18) // Altura fixa do retângulo (ajuste conforme necessário)
          .attr('fill', "#EA2155"); // Cor de fundo do retângulo

        svg.append('text')
          .attr('class', 'now-flag')
          .attr('x', xScale(new Date()) + 5) // Define a posição x do texto ao lado da linha
          .attr('y', height - 5.5) // Define a posição y do texto ao lado da linha (ajuste conforme necessário)
          .text('Now') // Define o texto da etiqueta com base nos dados
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('font-weight', 400)
          .attr('text-anchor', 'start'); // Alinha o texto com o início do texto

        // Line
        svg.append('rect')
          .attr('class', 'now-line')
          .attr('x', xScale(new Date()))
          .attr('y', 0)
          .attr('width', 2)
          .attr('height', height)
          .attr('fill', 'rgba(234,33,85)');

        // Adiciona a linha vertical
        svg.append('line')
          .attr('class', 'marker-line')
          .attr('stroke', theme.palette.primary.active)
          .attr('x1', xScale(currentTime))
          .attr('y1', 0)
          .attr('x2', xScale(currentTime))
          .attr('y2', height - 20)
          .attr('stroke-width', 2);

        // Adiciona o triângulo no topo da linha
        svg.append('polygon')
          .attr('class', 'marker-triangle')
          .attr('fill', theme.palette.primary.active)
          .attr('points', function () {
            var x = xScale(currentTime);
            var y = height - 38;
            return `${x - 10},${y + 5} ${x + 10},${y + 5} ${x},${y + 20}`;
          });

        var dragHandler = d3.drag()
          .on("drag", function (event) {
            const newTime = xScale.invert(event.x);
            setCurrentTime(newTime);
            setIsPlaying(false);
            setIsLive(false);
            setIsPaused(true)
          });

        dragHandler(svg.selectAll(".marker-line, .marker-triangle"));

        data.forEach((d, i) => {
          const x = xScale(new Date(d.ignition_epoch_earliest));
          //const fillColor = selectedValues.includes(d.id) ? theme.palette.type.impulsive : "#BDBDBD";

          if (d.type === 'impulsive') {

            svg.append('polygon')
              .attr('class', `type-glyph-impulsive-${d.id}`)
              .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.impulsive : "#BDBDBD")
              .attr('cursor', 'pointer')
              .attr('points', `${x - 12},${height / 2} ${x + 12},${height / 2} ${x},${height / 2 - 20}`);

          } else if (d.type === 'thrust') {
            const xEnd = new Date(d.ignition_epoch_earliest);
            xEnd.setUTCMilliseconds(xEnd.getUTCMilliseconds() + (d.duration * 1000));

            const dataId = `glyph-${i}`;

            svg.append('line')
              .attr('class', `type-glyph-line-vertical-thrust-${d.id}`)
              .attr('data-id', dataId)
              .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")
              .attr('x1', d.duration > 0 ? xScale(xEnd) : x)
              .attr('y1', height / 2 - 25)
              .attr('x2', d.duration > 0 ? xScale(xEnd) : x)
              .attr('y2', height / 2 - 5)
              .attr('stroke-width', 3);

            svg.append('line')
              .attr('class', `type-glyph-line-horizontal-thrust-${d.id}`)
              .attr('data-id', dataId)
              .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")
              .attr('x1', x)
              .attr('y1', height / 2 - 15)
              .attr('x2', xScale(xEnd))
              .attr('y2', height / 2 - 15)
              .attr('stroke-width', 3);

            svg.append('rect')
              .attr('class', `type-glyph-thrust-${d.id}`)
              .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")
              .attr('cursor', 'pointer')
              .attr('x', x - 10)
              .attr('y', height / 2 - 25)
              .attr('width', 20)
              .attr('height', 20);

          } else if (d.type === 'differential_drag') {
            const xEnd = new Date(d.ignition_epoch_earliest);
            xEnd.setUTCMilliseconds(xEnd.getUTCMilliseconds() + (d.duration * 1000));

            const dataId = `glyph-${i}`;

            svg.append('line')
              .attr('class', `type-glyph-line-vertical-diffdrag-${d.id}`)
              .attr('data-id', dataId)
              .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")
              .attr('x1', d.duration > 0 ? xScale(xEnd) : x)
              .attr('y1', height / 2 - 25)
              .attr('x2', d.duration > 0 ? xScale(xEnd) : x)
              .attr('y2', height / 2 - 5)
              .attr('stroke-width', 3);

            svg.append('line')
              .attr('class', `type-glyph-line-horizontal-diffdrag-${d.id}`)
              .attr('data-id', dataId)
              .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")
              .attr('x1', x)
              .attr('y1', height / 2 - 15)
              .attr('x2', xScale(xEnd))
              .attr('y2', height / 2 - 15)
              .attr('stroke-width', 3);

            svg.append('polygon')
              .attr('class', `type-glyph-diffdrag-${d.id}`)
              .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")
              .attr('cursor', 'pointer')
              .attr('points', `${x},${height / 2 - 28} ${x - 13},${height / 2 - 15} ${x},${height / 2 - 2} ${x + 13},${height / 2 - 15}`);
          }
        });
      }
    }
  }, [theme, data]);

  useEffect(() => {

    let interval;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    const svg = d3.select(ref.current);
    const width = widthInPixels;
    const height = heightInPixels;

    svg.select('.background-rect')
      .style('fill', theme.palette.plot.background);

    const xScale = d3.scaleTime()
      .domain([new Date(sliderValue[0]), new Date(sliderValue[1])])
      .range([100, width - 100]);

    const ticks = xScale.ticks(6);

    svg.selectAll(".domain-g").attr("transform", "translate(0," + 0 + ")")
      .call(d3.axisBottom(xScale).tickValues(ticks).tickSize(height - 18).tickPadding(5).tickFormat(function (value) { return formatarTempo(value); }))
      .selectAll(".domain").attr("opacity", 0);

    svg.selectAll(".tick line")
      .attr("stroke", theme.palette.plot.divider);

    svg.selectAll(".tick text")
      .style("fill", theme.palette.primary.lightGrey);

    svg.select('.now-flag-bg')
      .attr('x', xScale(new Date()));

    svg.select('.now-flag')
      .attr('x', xScale(new Date()) + 5);

    svg.select('.now-line')
      .attr('x', xScale(new Date()));

    svg.select('.marker-line')
      .attr('x1', xScale(currentTime))
      .attr('x2', xScale(currentTime));

    svg.select('.marker-triangle')
      .attr('points', function () {
        var x = xScale(currentTime);
        var y = height - 38;
        return `${x - 10},${y + 5} ${x + 10},${y + 5} ${x},${y + 20}`;
      });

    var dragHandler = d3.drag()
      .on("drag", function (event) {
        const newTime = xScale.invert(event.x);
        setCurrentTime(newTime);
        setIsPlaying(false);
        setIsLive(false);
        setIsPaused(true)
      });

    dragHandler(svg.selectAll(".marker-line, .marker-triangle"));

    function toggleSelected(id) {
      const clickedItem = data.find(item => item.id === id);

      if (!clickedItem) return;

      const manoeuvringTime = clickedItem.manoeuvre_time;

      const idsToRemove = data
        .filter(item => item.manoeuvre_time === manoeuvringTime)
        .map(item => item.id);
      if (selectedValues.includes(id)) {
        handleSelectedChange(selectedValues.filter(item => !idsToRemove.includes(item)));
      } else {
        handleSelectedChange([...selectedValues, id]);
      }
    }

    data.forEach((d) => {
      const x = xScale(new Date(d.ignition_epoch_earliest));

      if (d.type === 'impulsive') {

        svg.selectAll(`.type-glyph-impulsive-${d.id}`)
          .attr('points', `${x - 12},${height / 2} ${x + 12},${height / 2} ${x},${height / 2 - 20}`)
          .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.impulsive : "#BDBDBD")
          .on('click', function () {
            toggleSelected(d.id);
            // Toggle fill color based on selection
            const newFillColor = selectedValues.includes(d.id) ? "#BDBDBD" : theme.palette.type.impulsive;
            d3.select(this).transition()
              .duration(300)
              .attr('fill', newFillColor);
          });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-impulsive-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

      } else if (d.type === 'thrust') {
        const xEnd = new Date(d.ignition_epoch_earliest);
        xEnd.setUTCMilliseconds(xEnd.getUTCMilliseconds() + (d.duration * 1000));

        svg.selectAll(`.type-glyph-line-vertical-thrust-${d.id}`)
          .attr('x1', d.duration > 0 ? xScale(xEnd) : x)
          .attr('x2', d.duration > 0 ? xScale(xEnd) : x)
          .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")

        svg.selectAll(`.type-glyph-line-horizontal-thrust-${d.id}`)
          .attr('x1', x)
          .attr('x2', xScale(xEnd))
          .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")

        svg.selectAll(`.type-glyph-thrust-${d.id}`)
          .attr('x', x - 10)
          .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.thrust : "#BDBDBD")
          .on('click', function () {
            toggleSelected(d.id);

            // Toggle fill color based on selection
            const newFillColor = selectedValues.includes(d.id) ? "#BDBDBD" : theme.palette.type.thrust;
            d3.select(this).transition()
              .duration(300)
              .attr('fill', newFillColor);
          });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-line-vertical-thrust-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-line-horizontal-thrust-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-thrust-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

      } else if (d.type === 'differential_drag') {
        const xEnd = new Date(d.ignition_epoch_earliest);
        xEnd.setUTCMilliseconds(xEnd.getUTCMilliseconds() + (d.duration * 1000));

        svg.selectAll(`.type-glyph-line-vertical-diffdrag-${d.id}`)
          .attr('x1', d.duration > 0 ? xScale(xEnd) : x)
          .attr('x2', d.duration > 0 ? xScale(xEnd) : x)
          .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")

        svg.selectAll(`.type-glyph-line-horizontal-diffdrag-${d.id}`)
          .attr('x1', x)
          .attr('x2', xScale(xEnd))
          .attr('stroke', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")

        svg.selectAll(`.type-glyph-diffdrag-${d.id}`)
          .attr('points', `${x},${height / 2 - 28} ${x - 13},${height / 2 - 15} ${x},${height / 2 - 2} ${x + 13},${height / 2 - 15}`)
          .attr('fill', selectedValues.includes(d.id) ? theme.palette.type.differential_drag : "#BDBDBD")
          .on('click', function () {
            toggleSelected(d.id);

            // Toggle fill color based on selection
            const newFillColor = selectedValues.includes(d.id) ? "#BDBDBD" : theme.palette.type.differential_drag;
            d3.select(this).transition()
              .duration(300)
              .attr('fill', newFillColor);
          });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-line-vertical-diffdrag-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-line-horizontal-diffdrag-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });

        // Para cada ID em selectedValues, mova o elemento correspondente para o topo
        selectedValues.forEach(id => {
          // Selecionar o elemento correspondente
          const element = d3.select(`.type-glyph-diffdrag-${id}`);

          // Verificar se o elemento existe
          if (element.node()) {
            // Mover o elemento para o topo
            element.raise();
          }
        });
      }
    });
  }, [theme, currentTime, data, widthInPixels, heightInPixels, sliderValue, selectedValues, handleSelectedChange]);

  // Efeito para calcular os elementos sobrepostos
  useEffect(() => {
    const xScale = d3.scaleTime()
      .domain([new Date(sliderValue[0]), new Date(sliderValue[1])])
      .range([100, widthInPixels - 100]);

    const overlapped = {};

    data.sort((a, b) => new Date(a.manoeuvre_time) - new Date(b.manoeuvre_time));

    for (let i = 0; i < data.length; i++) {
      const d1 = data[i];
      const start1 = d1.manoeuvre_time;
      const ignition1 = d1.ignition_epoch_earliest;

      for (let j = i + 1; j < data.length; j++) {
        const d2 = data[j];
        const start2 = d2.manoeuvre_time;

        if (start2 === start1) {
          if (!overlapped[ignition1]) {
            overlapped[ignition1] = [];
          }
          overlapped[ignition1].push(d1.id);
          overlapped[ignition1].push(d2.id);
        } else {
          break;
        }
      }
    }

    // Removendo duplicatas dentro de cada lista e ordenando os arrays de IDs
    for (let key in overlapped) {
      overlapped[key] = [...new Set(overlapped[key])].sort();
    }

    setOverlappedElements(overlapped);

    //console.log('Overlapped Elements IDs:', overlappedElements);
  }, [data, sliderValue, widthInPixels]);

  // Efeito para renderizar os componentes OverlappingTable
  useEffect(() => {
    const height = heightInPixels;

    const xScale = d3.scaleTime()
      .domain([new Date(sliderValue[0]), new Date(sliderValue[1])])
      .range([100, widthInPixels - 100]);

    // Limpar os nós existentes de OverlappingTable
    document.querySelectorAll('.overlapping-table-container').forEach(node => node.remove());

    // Função para verificar interseção entre dois arrays
    const hasIntersection = (array1, array2) => {
      return array1.some(item => array2.includes(item));
    };

    // Renderizar um OverlappingTable para cada chave em overlappedElements
    for (let key in overlappedElements) {
      const overlappingIDs = overlappedElements[key];

      // Verificar se há interseção entre overlappingIDs e selectedValues
      if (!hasIntersection(overlappingIDs, selectedValues)) {
        continue;
      }

      const x = xScale(new Date(key)) - 95;

      // Crie um nó do DOM para conter o glifo
      const container = document.createElement("div");
      container.setAttribute("class", `overlapping-table-container overlapping-table-${key}`);
      container.setAttribute("style", `position: absolute; left: ${x}px; top: ${height - 350}px; z-index: 1;`);

      document.getElementById("timeline-div").style.position = "relative";

      document.getElementById("timeline-div").appendChild(container);
      // Renderize o componente React dentro do nó do DOM
      const root = createRoot(container);
      const overlapping = (
        <OverlappingTable
          manoeuvres={data}
          overlappingIDs={overlappingIDs}
          theme={theme}
          selectedValues={selectedValues}
          handleSelectedChange={handleSelectedChange}
        />
      );
      root.render(overlapping);
    }

    // Chama a função para renderizar os componentes OverlappingTable
  }, [overlappedElements, heightInPixels]);

  const handlePause = () => {
    setIsPaused(true);
    setIsPlaying(false);
    setIsLive(false);
  };

  const handlePlay = () => {
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPaused(false);
    setIsPlaying(true);
    setIsLive(true);
    setCurrentTime(new Date());
    setSliderValue([new Date().getTime(), sliderValue[1]]);
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short'
  }).format(currentTime).replace(/,/g, '');

  const handleSliderChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    setSliderValue([newValue[0], newValue[1]]);
  };

  const formatSliderLabel = (value) => {
    const date = new Date(value);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
  };

  return (
    <div id="timeline-div" style={{ height: "75px" }}>
      <svg width={widthInPixels} height={heightInPixels} ref={ref} style={{ borderBottom: `2px solid ${theme.palette.plot.divider}` }}>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", top: "-128px", padding: "0 10px" }}>
        <p style={{ color: "white", fontWeight: 500, fontSize: "15px", marginBlockStart: "0", marginBlockEnd: "0" }}>{formattedTime}</p>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            endIcon={<FileDownloadOutlinedIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.active,
              color: "white",
              borderRadius: '20px',
              fontWeight: 500,
              padding: "3px 11px",
              fontSize: "14px",
              "& .MuiButton-endIcon": {
                marginLeft: "2px"
              },
              '&:hover': {
                backgroundColor: theme.palette.primary.active,
                opacity: '0.95',
              },
            })}
          >
            OEM
          </Button>
          <Button
            variant="contained"
            endIcon={<FileDownloadOutlinedIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.active,
              color: "white",
              borderRadius: '20px',
              fontWeight: 500,
              padding: "3px 11px",
              fontSize: "14px",
              "& .MuiButton-endIcon": {
                marginLeft: "2px"
              },
              '&:hover': {
                backgroundColor: theme.palette.primary.active,
                opacity: '0.95',
              },
            })}
          >
            OPM
          </Button>
        </Stack>
      </div>
      <div className="time-controler" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100px", height: "75px", position: "relative", top: "-112px", backgroundColor: theme.palette.primary.main, borderBottom: `2px solid ${theme.palette.plot.divider}` }}>

        <svg width="44" height="20" viewBox="0 0 44 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ paddingLeft: "8px", cursor: "pointer" }} onClick={handleReset}>
          <rect x="1" y="1" width="42" height="21" rx="4" stroke={isLive ? theme.palette.primary.active : theme.palette.primary.lightGrey} strokeWidth="2" style={{ transition: 'stroke 0.5s ease' }} />
          <path d="M13.946 6.81818V17H12.5341L7.35866 9.53267H7.2642V17H5.72798V6.81818H7.14986L12.3303 14.2955H12.4247V6.81818H13.946ZM25.0314 11.9091C25.0314 12.9962 24.8326 13.9309 24.4348 14.7131C24.0371 15.492 23.4919 16.0919 22.7992 16.5128C22.1098 16.9304 21.3259 17.1392 20.4476 17.1392C19.566 17.1392 18.7788 16.9304 18.0861 16.5128C17.3967 16.0919 16.8532 15.4903 16.4554 14.7081C16.0577 13.9259 15.8588 12.9929 15.8588 11.9091C15.8588 10.822 16.0577 9.88897 16.4554 9.11008C16.8532 8.32789 17.3967 7.72798 18.0861 7.31037C18.7788 6.88944 19.566 6.67898 20.4476 6.67898C21.3259 6.67898 22.1098 6.88944 22.7992 7.31037C23.4919 7.72798 24.0371 8.32789 24.4348 9.11008C24.8326 9.88897 25.0314 10.822 25.0314 11.9091ZM23.5101 11.9091C23.5101 11.0805 23.3759 10.3828 23.1074 9.81605C22.8423 9.24598 22.4777 8.8151 22.0137 8.52344C21.553 8.22846 21.031 8.08097 20.4476 8.08097C19.861 8.08097 19.3373 8.22846 18.8766 8.52344C18.4159 8.8151 18.0513 9.24598 17.7828 9.81605C17.5177 10.3828 17.3851 11.0805 17.3851 11.9091C17.3851 12.7377 17.5177 13.437 17.7828 14.0071C18.0513 14.5739 18.4159 15.0047 18.8766 15.2997C19.3373 15.5914 19.861 15.7372 20.4476 15.7372C21.031 15.7372 21.553 15.5914 22.0137 15.2997C22.4777 15.0047 22.8423 14.5739 23.1074 14.0071C23.3759 13.437 23.5101 12.7377 23.5101 11.9091ZM28.8173 17L25.9934 6.81818H27.6092L29.5929 14.7031H29.6873L31.7505 6.81818H33.3514L35.4146 14.7081H35.5091L37.4877 6.81818H39.1085L36.2797 17H34.7335L32.5907 9.37358H32.5112L30.3684 17H28.8173Z" fill={isLive ? theme.palette.primary.active : theme.palette.primary.lightGrey} style={{ transition: 'fill 0.5s ease' }} />
          <style>
            {`
          .time-controler svg:hover rect {
            opacity: 0.9;
          }
          .time-controler svg:hover path {
            opacity: 0.9;
          }
        `}
          </style>
        </svg>

        {!isPlaying ? (
          <PlayArrowIcon
            sx={{
              fontSize: 32,
              color: theme.palette.primary.active,
              cursor: "pointer",
            }}
            onClick={handlePlay}
          />
        ) : (
          <PauseIcon
            sx={{
              fontSize: 32,
              color: theme.palette.primary.active,
              cursor: "pointer",
            }}
            onClick={handlePause}
          />
        )}
      </div>
      <div style={{ width: "100px", height: "75px", position: "relative", top: "-187px", left: widthInPixels - 100, backgroundColor: theme.palette.primary.main, borderBottom: `2px solid ${theme.palette.plot.divider}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box className="legend-button" sx={{ position: "relative" }}>
          <Tooltip title="Show/Hide Legend" placement="left" arrow>
            <Box sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              backgroundColor: activeLegend ? theme.palette.primary.active : theme.palette.primary.disabled,
              '&:hover': {
                opacity: 0.9,
                cursor: "pointer",
              },
            })}
              onClick={handleLegendClick}
            >
              <img src={legendIcon} alt="" style={{ width: "17px" }} />
            </Box>
          </Tooltip>
          <TimelineLegend
            active={activeLegend}
          />
        </Box>
      </div>

      <div style={{ position: "fixed", top: "120px", right: "70px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <Typography sx={(theme) => ({
          color: theme.palette.text.primary,
          fontSize: "13px",
          fontWeight: 500,
          width: "500px",
          marginBottom: "-4px",
        })}
        >Time Range
        </Typography>
        <Slider sx={(theme) => ({
          width: "500px",
          color: theme.palette.primary.active,
          ".MuiSlider-rail ": {
            backgroundColor: theme.palette.primary.lightGrey,
            opacity: 1,
          },
          '& .MuiSlider-thumb': {
            width: "17px",
            height: "17px",
            '&::after': {
              width: "17px",
              height: "17px",
            },
            '&:hover': {
              boxShadow: '0 0 0 5px rgba(0, 0, 0, 0.10)',
            },
          },
        })}
          value={sliderValue}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={formatSliderLabel}
          min={new Date().getTime()}
          max={maxTime.getTime()}
          disableSwap
          aria-labelledby="range-slider"
        />
        <div style={{ display: "flex", justifyContent: "space-between", width: "500px", marginTop: "-5px" }}>
          <Typography sx={(theme) => ({
            color: theme.palette.primary.darkGrey,
            fontSize: "10px",
            fontWeight: 400,
            marginBottom: "-5px",
          })}
          >Now
          </Typography>
          <Typography sx={(theme) => ({
            color: theme.palette.primary.darkGrey,
            fontSize: "10px",
            fontWeight: 400,
            marginBottom: "-5px",
          })}
          >{formatarTempo(maxTime)}
          </Typography>
        </div>
      </div>

    </div>
  );
};

export default SimulationTimeline;

function formatarTempo(dataAlvo) {
  const agora = new Date();
  const diff = dataAlvo - agora;

  // Convertendo diferença de milissegundos para horas
  const valorHoras = diff / (1000 * 60 * 60);

  // Convertendo valor negativo para positivo
  const valorAbs = Math.abs(valorHoras);

  if (isNaN(valorAbs)) {
    return "Por favor, insira uma data válida.";
  }

  let dias = Math.floor(valorAbs / 24);
  let horas = Math.floor(valorAbs % 24);
  let minutos = Math.floor((valorAbs % 1) * 60);

  let resultado = [];

  if (dias > 0) {
    resultado.push(`${dias} day${dias > 1 ? 's' : ''}`);
  }

  if (horas > 0) {
    resultado.push(`${horas} hour${horas > 1 ? 's' : ''}`);
  }

  if (minutos > 0) {
    resultado.push(`${minutos} minute${minutos > 1 ? 's' : ''}`);
  }

  // Limitar a saída a no máximo duas partes
  resultado = resultado.slice(0, 2);

  if (valorHoras > 0) {
    return "in " + resultado.join(' and ');
  } else if (valorHoras === 0) {
    return "";
  } else {
    return resultado.join(' and ') + " ago";
  }
}
