import { GlobalStyles } from "@mui/material";

const styles = (theme) => ({
  "*": {
    padding: 0,
    margin: 0,
    boxSizing: "border-box",
  },

  "body": {
    backgroundColor: theme.palette.background,
    margin: "85px 60px 0 60px",
  },

  ".active": {
    height: "4px",
    backgroundColor: theme.palette.primary.active,
  },

  "h1, h2, h3, h4, h5, h6": {
    fontFamily: theme.typography.h1.fontFamily,
  },

  h1: {
    fontWeight: 700,
    fontSize: "28px",
    marginBlockStart: "15px",
  },

  h2: {
    fontWeight: 400,
    fontSize: "24px",
  },

  h3: {
    fontWeight: 400,
    fontSize: "20px",
    color: theme.palette.primary.darkGrey,
  },

  h4: {
    fontWeight: 600,
    fontSize: "1rem",
    marginBlockStart: "1.33em",
    marginBlockEnd: "1.33em",
  },
  h5: {
    marginBlockStart: "1.67em",
    marginBlockEnd: "1.67em",
  },

  h6: {
    fontWeight: 400,
    fontSize: "13px",
    lineHeight: 0,
    marginBlockStart: "2.33em",
    marginBlockEnd: "2.33em",
  },

  p: {
    marginBlockStart: "1em",
    marginBlockEnd: "1em",
  },

  ".carousel-container": {
    position: "absolute",
    left: 0,
    padding: "0 60px",
    width: "100%",
    height: "230px",
    overflowX: "auto",
    overflowY: "hidden",
    display: "flex",
    paddingTop: "10px",
    marginTop: "-10px",
  },

  ".carousel": {
    display: "flex",
    flexDirection: "row",
    columnGap: "15px",
    /* White-space is added to prevent wrapping */
    whiteSpace: "nowrap",
    //width: "100%",
    margin: "0 auto",
  },

  ".carousel-item": {
    display: "inline-block",
    whiteSpace: "normal", /* Ensure children items behave normally inside */
    marginTop: "-10px",
  },

  ".MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.MuiMenu-paper.MuiMenu-paper": {
    backgroundColor: theme.palette.primary.main,
  },

  ".MuiButtonBase-root.MuiMenuItem-root.MuiMenuItem-gutters.Mui-selected": {
    backgroundColor: theme.palette.primary.active,
    "&:hover": {
      backgroundColor: "#677DFF",
    },
  },

  ".manoeuvre-glyph-container": {
    transform: "scale(0)",
    transition: "transform 0.22s ease-out",
  },

  ".manoeuvre-glyph-container.grow": {
    transform: "scale(1)",
  },
});

function CustomGlobalStyles() {
  const customGlobalStyles = <GlobalStyles styles={styles} />;

  return customGlobalStyles;
}
export default CustomGlobalStyles;
