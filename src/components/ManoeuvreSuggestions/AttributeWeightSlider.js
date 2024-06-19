import { alpha, Slider, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, IconButton, Tooltip, SvgIcon } from "@mui/material";
import { useContext, useEffect, useState, useRef, useLayoutEffect } from "react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import * as React from 'react';

export const AttributeWeightSlider = ({ sliderItems, active, onValuesChange }) => {

  const [positionY, setPositionY] = useState(null);
  const boxRef = useRef(null);
  const [boxHeight, setBoxHeight] = useState(0);

  const [sliderValues, setSliderValues] = useState(() => {
    const initialValue = {};
    sliderItems.forEach(item => {
      initialValue[item.value] = Math.trunc(100 / sliderItems.length);
    });
    return initialValue;
  });

  const handleChange = (value) => (event, newValue) => {
    const newSliderValues = {
      ...sliderValues,
      [value]: newValue
    };

    // Verifique se a soma dos valores dos sliders é maior do que 100
    const sum = Object.values(newSliderValues).reduce((acc, curr) => acc + curr, 0);
    if (sum > 100) {
      // Calcule o fator de escala para ajustar os valores dos sliders
      const scale = 100 / sum;
      // Ajuste os valores dos sliders para garantir que a soma seja igual a 100
      for (const key in newSliderValues) {
        newSliderValues[key] = Math.trunc(newSliderValues[key] * scale);
      }
    }

    setSliderValues(newSliderValues);
    // Chame a função de retorno de chamada para notificar o componente pai sobre a mudança nos valores dos sliders
    onValuesChange(newSliderValues);
  };

  useEffect(() => {
    const slidersDiv = document.querySelector('.sliders-button');
    let posY = null;

    if (slidersDiv) {
      posY = slidersDiv.getBoundingClientRect().top;
    }

    setPositionY(posY);
  }, []);

  useLayoutEffect(() => {
    if (boxRef.current && active) {
      setBoxHeight(boxRef.current.getBoundingClientRect().height);
    }
  }, [active]);

  return (

    <Box
      ref={boxRef}
      sx={(theme) => ({
        display: active ? 'block' : 'none',
        width: "260px",
        padding: "20px 30px 10px 30px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "20px",
        position: 'absolute',
        top: positionY - boxHeight - 12
      })}>

      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <Typography sx={(theme) => ({
          color: theme.palette.text.primary,
          fontSize: "13px",
          fontWeight: 700,

        })}
        >Attribute Weights
        </Typography>

        <Tooltip arrow placement="top" title="Use these sliders to adjust the weights of different attributes in the calculation of the best manoeuvre. Higher weights will give more importance to that attribute in the overall score.">
          <SvgIcon
            sx={(theme) => ({
              fontSize: "16px",
              marginLeft: "3px",
              color: theme.palette.primary.lightGrey,
              '&:hover': {
                color: theme.palette.text.primary, // Change to your desired hover color
              },
            })}
          >
            <InfoOutlinedIcon />
          </SvgIcon>
        </Tooltip>
      </Box>

      {sliderItems.map((item, index) => (
        <div key={index}>
          <Typography sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: "11px",
            fontWeight: 500,
            marginBottom: "-5px",
          })}
          >{item.label}
          </Typography>
          <Slider sx={(theme) => ({
            color: theme.palette.text.primary,
            ".MuiSlider-rail ": {
              backgroundColor: theme.palette.mode === 'light' ? '#E1E2E7' : '#6F71AA',
              opacity: 1,
            },
            '& .MuiSlider-thumb': {
              '&:hover': {
                boxShadow: theme.palette.mode === 'light' ? '0 0 0 5px rgba(0, 0, 0, 0.10)' : '0 0 0 5px rgba(255, 255, 255, 0.10)',
              },
            },
          })}
            aria-label="Default"
            valueLabelDisplay="auto"
            size="small"
            value={sliderValues[item.value]}
            onChange={handleChange(item.value)}
          />
        </div>
      ))}
    </Box>
  );
};
