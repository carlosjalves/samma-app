import useLocalStorage from "../../hooks/useLocalStorage";
import { useMemo } from "react";
import { useLocation } from 'react-router-dom';

import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";

import { ColorModeContext } from "./colorModeContext";
import CustomGlobalStyles from "./CustomGlobalStyles";
import { palette } from "./palette";
import typography from "./typography";

export const getDesignTokens = (mode) => ({
  typography,
  palette: palette(mode),
});

export function ThemeSetup({ children }) {
  const [mode, setMode] = useLocalStorage("mode", "dark");
  const location = useLocation();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [setMode],
  );

  // Verifique a rota atual e defina o modo para "dark" se estiver na homepage
  const effectiveMode = useMemo(() => {
    return location.pathname === '/' ? 'dark' : mode;
  }, [location.pathname, mode]);

  const theme = useMemo(() => responsiveFontSizes(createTheme(getDesignTokens(effectiveMode))), [effectiveMode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <CustomGlobalStyles />
          {children}
        </StyledEngineProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
