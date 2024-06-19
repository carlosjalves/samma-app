export const palette = (mode) => {

  return {
    mode: mode,
    background: mode === "light" ? "#F5F5F8" : "#040015",
    primary: {
      // app main color
      main: mode === "light" ? "#FFFFFF" : "#1B1B40",
      lightGrey: mode === "light" ? "#BDBDBD" : "#6F71AA",
      darkGrey: mode === "light" ? "#767689" : "#6F71AA",
      active: "#405CFF",
      disabled: mode === "light" ? "#E1E2E7" : "#1E203F",
    },
    text: {
      primary: mode === "light" ? "#292929" : "#F5F5F5",
      secondary: mode === "light" ? "#BCBCBC" : "#6F71AA",
      //disabled: mode === "light" ? "#979FAC" : "#43435F",
    },
    secondary: {
      main: "rgba(12, 181, 250, 1)",
      light: "rgba(196, 250, 254, 1)",
      dark: "rgba(0, 184, 192, 1)",
    },
    plot: {
      background: mode === "light" ? "#F7F8FF" : "#222248",
      hover: mode === "light" ? "#EFF0F7" : "#2D2D52",
      divider: mode === "light" ? "#EBEBF0" : "#26274C",
      tooltip: mode === "light" ? "#FFFFFF" : "#222248"
    },
    type: {
      impulsive: "rgb(251, 86, 7)",
      thrust: "rgb(255, 190, 11)",
      differential_drag: "rgb(131, 56, 236)",
    },
    status: {
      ok: "#25DB61",
      warning: "#FFB300",
      alarm: "#EA2155",
      border: {
        ok: mode === "light" ? "#8EE9B0" : "#146D3B",
        warning: mode === "light" ? "#FBD580" : "#81590B",
        alarm: mode === "light" ? "#F08BA6" : "#771035"
      }
    },
    heatmap: {
      first: "#405CFF",
      second: mode === "light" ? "#7286FF" : "#364BCD",
      third: mode === "light" ? "#98A7FF" : "#2F3EA7",
      forth: mode === "light" ? "#C2CBFF" : "#27307D",
      fifth: mode === "light" ? "#E0E5FF" : "#21255F",
      default: mode === "light" ? "#F7F8FF" : "#1C1E48",
      text: {
        first: "#F5F5F5",
        second: "#F5F5F5",
        third: "#F5F5F5",
        forth: mode === "light" ? "#292929" : "#F5F5F5",
        fifth: mode === "light" ? "#292929" : "#F5F5F5",
        default: mode === "light" ? "#292929" : "#F5F5F5",
      }
    },
    relative_heatmap: {
      first: mode === "light" ? "#1B263B" : "#B3B3BA",
      second: mode === "light" ? "#565E6E" : "#7A7A8C",
      third: mode === "light" ? "#848A95" : "#5C5C74",
      forth: mode === "light" ? "#B6BAC0" : "#474763",
      fifth: mode === "light" ? "#DBDCE0" : "#383857",
      default: mode === "light" ? "#F6F6F7" : "#252548",
      text: {
        first: mode === "light" ? "#F5F5F5" : "#292929",
        second: "#F5F5F5",
        third: "#F5F5F5",
        forth: "#F5F5F5",
        fifth: mode === "light" ? "#292929" : "#F5F5F5",
        default: mode === "light" ? "#292929" : "#F5F5F5",
      }
    }
  };
};
