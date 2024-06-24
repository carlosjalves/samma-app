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

const OrbitVisualization = ({ data, sliderValue, overlapped, selectedValues }) => {
  const ref = useRef();
  const theme = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [heightInPixels, setHeightInPixels] = useState(90);
  const [widthInPixels, setWidthInPixels] = useState(450);
  const [overlappedElements, setOverlappedElements] = useState({});
  const [positionY, setPositionY] = useState(null);

  const maxManTime = d3.max(data, d => new Date(d.ignition_epoch_earliest));
  const maxTime = new Date(maxManTime);
  maxTime.setDate(maxTime.getDate() + 1);

  useEffect(() => {

    setTimeout(() => {
      d3.select(ref.current).selectAll("*").remove();
      const svg = d3.select(ref.current);
      const currentWidth = parseInt(d3.select('#orbit-bg').style('width'), 10);
      const currentHeight = parseInt(d3.select('#orbit-bg').style('height'), 10);

      const orbitDiv = document.querySelector('#orbit-bg');
      let posY = null;

      if (orbitDiv) {
        posY = orbitDiv.getBoundingClientRect().top;
      }

      setPositionY(posY);

      if (currentWidth !== 0 && currentHeight !== 0) {
        setWidthInPixels(currentWidth);
        setHeightInPixels(currentHeight);

        const width = currentWidth;
        const height = currentHeight;

        svg.attr('width', width)
          .attr('height', height);

        svg.append('rect')
          .attr('class', 'background')
          .attr('x', 0)
          .attr('y', 0)
          .attr('height', height)
          .attr('width', width)
          .attr('opacity', 0);

        const xScale = d3.scaleTime()
          .domain([new Date(sliderValue[0]), new Date(sliderValue[1])])
          .range([0, width]);

        // Calculate intermediate dates
        const startDate = new Date();
        const endDate = maxTime;
        const dateDiff = endDate.getTime() - startDate.getTime();

        const halfDate = new Date(startDate.getTime() + dateDiff / 2);

        // Define initial, intermediate, and final points
        let points = [
          { x: xScale(startDate), y: height / 2 + 100, id: '' }, // Start point
          { x: xScale(halfDate), y: (height / 4), id: '' }, // Intermediate point 2 (can be adjusted)
          { x: xScale(endDate), y: height / 2 + 100, id: '' } // End point
        ];

        // Adiciona pontos dinâmicos com base em overlapped e selectedValues
        Object.keys(overlapped).forEach(key => {
          const overlapIds = overlapped[key];
          // Contar quantos ids de selectedValues estão presentes em overlapIds
          const matchingIds = selectedValues.filter(id => overlapIds.includes(id));
          if (matchingIds.length === 1) {
            const id = matchingIds[0];
            points.push({ x: xScale(new Date(key)), y: height / 2, id: id });
          }
        });

        // Sort points by x value to ensure correct path drawing
        points = points.sort((a, b) => a.x - b.x);

        // Create the orbit path with curveBasis
        const orbitPath = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveBumpX); // Smooth the path

        svg.append('path')
          .datum(points)
          .attr('d', orbitPath)
          .attr('class', 'orbit-path')
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-width', 3);

        // Optionally, add triangles to represent the points that match selectedValues
        svg.selectAll('.triangle-marker')
          .data(points.filter(point => {
            return point.id !== '';
          }))
          .enter()
          .append('path')
          .attr('class', 'triangle-marker')
          .attr('d', d3.symbol().type(d3.symbolTriangle).size(250))
          .attr('transform', d => `translate(${d.x},${d.y})`)
          .attr('fill', theme.palette.type.impulsive);
      }
    }, 100);
  }, [theme, data, sliderValue]);

  return <svg width={widthInPixels} height={heightInPixels} id="orbit-viz-curve" ref={ref} style={{ position: 'fixed', top: `${positionY}` }} />;
};

export default OrbitVisualization;
