import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useState } from "react";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 185,
  height: 40,
  padding: 5,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(90px)',
      '& .MuiSwitch-thumb::before': {
        content: '"Absolute"',
        textAlign: "center",
        fontSize: "14px",
        fontWeight: 600,
        transform: "translateY(8px)"
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.disabled,
        '&::before': {
          content: "'Relative'",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 600,
          color: theme.palette.text.primary,
          position: "absolute",
          transform: "translate(19px, 4.5px)"
        },
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.primary.active,
    width: 90,
    height: 38,
    borderRadius: "20px",
    '&::before': {
      content: "'Relative'",
      textAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
      transform: "translateY(8px)",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.primary.disabled,
    borderRadius: 20,
    '&::before': {
      content: "'Absolute'",
      textAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
      position: "absolute",
      transform: "translate(101px, 4.5px)"
    },
  },
}));

export default function TableSwitch({ onSwitchChange }) {

  const [checked, setChecked] = useState(true);

  const handleChange = (event) => {
    const newChecked = event.target.checked;
    setChecked(newChecked);
    onSwitchChange(newChecked); // Chama a função recebida via props
  };

  return (
    <FormGroup>
      <FormControlLabel
        sx={(theme) => ({
          margin: "0",
          "& .MuiTypography-root": {
            color: theme.palette.text.primary,
            fontSize: "12px",
            fontWeight: 500,
            marginBottom: "3px",
            position: "relative",
            left: "-27px"
          },
          "& .MuiSwitch-root": {
            margin: 0,
          }
        })}
        control={
          <MaterialUISwitch
            sx={{ m: 1 }}
            checked={checked}
            onChange={handleChange}
          />
        }
        label="Color Mapping"
        labelPlacement="top"
      />
    </FormGroup>
  );
}
