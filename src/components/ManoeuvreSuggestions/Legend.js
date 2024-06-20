import { Box, Typography, Tooltip, SvgIcon } from "@mui/material";
import { useEffect, useState } from 'react';
import missDistanceLegend from '../../assets/icons/legendIcons/missDistance.svg'
import pocLegend from '../../assets/icons/legendIcons/poc.svg'
import tcaLegend from '../../assets/icons/legendIcons/tca.svg'
import durationLegend from '../../assets/icons/legendIcons/duration.svg'
import fuelConsumptionLegend from '../../assets/icons/legendIcons/fuelConsumption.svg'
import thrustIcon from '../../assets/icons/legendIcons/thrustIconLegend.svg'
import impulsiveIcon from '../../assets/icons/legendIcons/impulsiveIconLegend.svg'
import differentialDragIcon from '../../assets/icons/legendIcons/differentialDragIconLegend.svg'
import * as React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


export const Legend = ({ active }) => {

  const [positionY, setPositionY] = useState(null);

  useEffect(() => {
    const legendDiv = document.querySelector('.legend-button');
    let posY = null;

    if (legendDiv) {
      posY = legendDiv.getBoundingClientRect().top;
    }

    setPositionY(posY);
  }, []);

  return (

    <Box sx={(theme) => ({
      display: active ? 'block' : 'none',
      width: "fit-content",
      padding: "20px 30px 20px 30px",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "20px",
      position: 'absolute',
      top: positionY + 46,
      zIndex: 5,
    })}>


      <Typography sx={(theme) => ({
        color: theme.palette.text.primary,
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "10px"
      })}
      >Legend
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "row", columnGap: "25px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <img src={missDistanceLegend} alt="" style={{ width: "max-content" }} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "2px", padding: "0 1px" }}>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Lower</Typography>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Higher</Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, marginTop: "-13px" })}>Miss Distance</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <img src={pocLegend} alt="" style={{ width: "max-content" }} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "1px", padding: "0 1px" }}>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Lower</Typography>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Higher</Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, marginTop: "-13px" })}>PoC</Typography>
            <Tooltip arrow placement="top" title="Probability of Collision">
              <SvgIcon
                sx={(theme) => ({
                  fontSize: "13px",
                  marginLeft: "-7px",
                  marginBottom: "14px",
                  color: theme.palette.primary.lightGrey,
                  '&:hover': {
                    color: theme.palette.text.primary,
                  },
                })}
              >
                <InfoOutlinedIcon />
              </SvgIcon>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <img src={tcaLegend} alt="" style={{ width: "max-content" }} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "1px", padding: "0 1px" }}>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Lower</Typography>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Higher</Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, marginTop: "-13px" })}>Time to TCA</Typography>
            <Tooltip arrow placement="top" title="Time of Closest Approach">
              <SvgIcon
                sx={(theme) => ({
                  fontSize: "13px",
                  marginLeft: "-7px",
                  marginBottom: "14px",
                  color: theme.palette.primary.lightGrey,
                  '&:hover': {
                    color: theme.palette.text.primary,
                  },
                })}
              >
                <InfoOutlinedIcon />
              </SvgIcon>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", rowGap: "13px", paddingTop: "3px" }}>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <img src={durationLegend} alt="" style={{ width: "max-content" }} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "1px" }}>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Lower</Typography>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Higher</Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, marginTop: "-13px" })}>Duration</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <img src={fuelConsumptionLegend} alt="" style={{ width: "max-content" }} />
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "1px" }}>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Lower</Typography>
                <Typography sx={(theme) => ({ fontSize: "8px", fontWeight: 600, color: theme.palette.text.secondary })}>Higher</Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey, marginTop: "-13px" })}>Fuel Consumption</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "row", columnGap: "7px", alignItems: "center" }}>
              <Tooltip title="Constant Thrust" arrow>
                <img src={thrustIcon} alt="" style={{ width: "max-content" }} />
              </Tooltip>
              <Tooltip title="Impulsive" arrow>
                <img src={impulsiveIcon} alt="" style={{ width: "max-content" }} />
              </Tooltip>
              <Tooltip title="Differential Drag" arrow>
                <img src={differentialDragIcon} alt="" style={{ width: "max-content" }} />
              </Tooltip>
            </Box>
            <Typography sx={(theme) => ({ fontSize: "11px", fontWeight: 500, color: theme.palette.primary.darkGrey })}>Manoeuvre Type</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
