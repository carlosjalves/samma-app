import { Link, useMatch, useResolvedPath, useLocation } from "react-router-dom"
import { Box, IconButton, Tooltip, Typography } from "@mui/material"
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useContext } from "react";
import { ColorModeContext } from "../styles/theme/colorModeContext";
import { SelectedValuesContext } from './SelectedValuesContext';

export default function Navbar() {

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { selectedValues } = useContext(SelectedValuesContext);

  const location = useLocation();
  const pathname = location.pathname;

  const id = pathname.split("/")[3];

  return (
    <nav style={{ display: "flex", position: "fixed", top: "0", left: "0", right: "0", backgroundColor: theme.palette.primary.main, color: "black", justifyContent: "space-between", alignItems: "stretch", gap: "2rem", padding: "0 4rem", height: "60px", boxShadow: "0 0 8.7px 0 rgba(0,0,0,0.25)", zIndex: "2" }}>
      <Link to="/samma-app/" style={{ textDecoration: "none", color: theme.palette.text.primary }}>
        <Tooltip placement="right" title="Satellite Manoeuvre Monitoring and Analysis Application" PopperProps={{ sx: { '& .MuiTooltip-tooltip': { maxWidth: '325px' } } }}>
          <Box sx={{ height: "60px", display: "flex", alignItems: "center" }}>
            <Typography sx={{ fontSize: "20px", fontWeight: 900, color: theme.palette.text.primary, transition: "color 0.3s ease-in-out", '&:hover': { color: theme.palette.primary.active } }}>SAMMA</Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, marginBottom: "9px" }}>app</Typography>
          </Box>
        </Tooltip>
      </Link>

      <ul style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0", margin: "0", listStyle: "none" }}>
        {(location.pathname === "/samma-app/" || location.pathname === "/samma-app/conjunctions") ? (
          <CustomLink to="/samma-app/conjunctions"><h4 style={{ color: theme.palette.text.primary }}>Conjunctions</h4></CustomLink>
        ) : (
          <>
            <CustomLink to={`/samma-app/conjunctions/${id}/manoeuvres`}><h4 style={{ color: theme.palette.text.primary }}>Manoeuvre Suggestions</h4></CustomLink>
            <CustomLink to={`/samma-app/conjunctions/${id}/simulation`}>
              <h4 style={{ color: theme.palette.text.primary }}>Manoeuvre Simulation</h4>
            </CustomLink>
            <Tooltip title={selectedValues.length + " manoeuvres selected for simulation"} placement="bottom" arrow>
              <div style={{ backgroundColor: theme.palette.primary.active, width: "22px", height: "22px", borderRadius: "50%", marginLeft: "-28px", marginTop: "-1px", display: "flex", alignItems: "center", justifyContent: "center", opacity: selectedValues.length === 0 ? "0" : "1", transition: "opacity 0.2s ease-in-out 0.0000001s" }}>
                <p style={{ marginBlockEnd: "0", marginBlockStart: "0", fontWeight: "700", fontSize: "12px", color: selectedValues.length === 0 ? theme.palette.primary.active : "#FFFFFF" }}>{selectedValues.length}</p>
              </div>
            </Tooltip>
          </>
        )}

        <IconButton sx={(theme) => ({ ml: 1, color: theme.palette.text.primary, height: "fit-content", marginLeft: "3rem" })} onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </ul>
    </nav>
  )
}
function CustomLink({ to, children }) {

  const path = useResolvedPath(to)
  const isActive = useMatch({ path: path.pathname }) //end: true

  return (
    <li>
      <Link to={to} style={{ textDecoration: "none", height: "56px", display: "flex", alignItems: "center", padding: "0 20px" }}>{children}</Link>
      <div className={isActive ? "active" : ""} style={{ height: "4px" }}></div>
    </li>
  )
}
