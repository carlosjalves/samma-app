import { alpha, Slider, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, IconButton, Tooltip, SvgIcon } from "@mui/material";
import { useEffect, useState } from 'react';
import * as React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import impulsiveIcon from '../../assets/icons/legendIcons/SimulationLegend/impulsive.svg'
import differentialDragIcon from '../../assets/icons/legendIcons/SimulationLegend/differentialDrag.svg'
import thrustIcon from '../../assets/icons/legendIcons/SimulationLegend/thrust.svg'

import glyph from '../../assets/icons/legendIcons/SimulationLegend/glyph.svg'



export const TimelineLegend = ({ active }) => {

  const [positionY, setPositionY] = useState(null);

  useEffect(() => {
    const legendDiv = document.querySelector('.legend-button');
    let posY = null;

    if (legendDiv) {
      posY = legendDiv.getBoundingClientRect().bottom;
    }

    setPositionY(posY - 215);
  }, []);

  return (

    <Box sx={(theme) => ({
      display: active ? 'block' : 'none',
      width: "fit-content",
      padding: "20px 30px 20px 30px",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "20px",
      position: 'absolute',
      bottom: positionY,
      right: 0
    })}>
      <Typography sx={(theme) => ({
        color: theme.palette.text.primary,
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "15px"
      })}
      >Legend
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", columnGap: "25px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", rowGap: "6px" }}>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ width: "23px", display: "flex", justifyContent: "center" }}>
              <img src={impulsiveIcon} alt="" style={{ width: "max-content" }} />
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, whiteSpace: "nowrap" })}>Impulsive manoeuvre</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ width: "23px", display: "flex", justifyContent: "center" }}>
              <img src={differentialDragIcon} alt="" style={{ width: "max-content" }} />
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, whiteSpace: "nowrap" })}>Differential Drag manoeuvre</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ width: "23px", display: "flex", justifyContent: "center" }}>
              <img src={thrustIcon} alt="" style={{ width: "max-content" }} />
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, whiteSpace: "nowrap" })}>Constant Thrust manoeuvre</Typography>
          </Box>
          <Box sx={{ alignSelf: "center", marginTop: "15px" }}>
            <img src={glyph} alt="" style={{ width: "max-content" }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "15px", alignItems: "center", marginTop: "-8px" }}>
            <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.primary.darkGrey, textAlign: "end" })}>Manoeuvre starting time</Typography>
            <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.primary.darkGrey })}>Duration</Typography>
            <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.primary.darkGrey })}>Manoeuvre ending time</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
