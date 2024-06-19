import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";

export const CustomDropdownSelect = ({
  selectedValue,
  handleChangeValue,
  menuItems,
  label,
}) => {

  return (
    <FormControl sx={{ marginTop: "-12px" }}>
      <InputLabel id="demo-select-small-label"
        sx={(theme) => ({
          top: "-10px",
          color: theme.palette.text.primary,
          left: "4px",
          fontWeight: 500,
          zIndex: "-1",

          "&.Mui-focused ": {
            color: theme.palette.text.primary,
          },
        })}
      >
        {label}
      </InputLabel>
      <Select
        value={selectedValue}
        onChange={handleChangeValue}
        renderValue={(value) => {
          return (
            <Box sx={{ display: "flex" }}>
              <Typography variant="body2" sx={{ paddingY: 1, fontWeight: 400, fontSize: "14px", paddingLeft: "2px" }}>
                {menuItems.find((x) => x.value === value)?.label}
              </Typography>
            </Box>
          );
        }}
        sx={(theme) => ({
          ".MuiOutlinedInput-notchedOutline": {
            borderRadius: "25px",
            border: "2px solid",
            borderColor: theme.palette.primary.darkGrey,
            backgroundColor: theme.palette.primary.main,
            zIndex: "-1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "2px solid",
            borderColor: theme.palette.primary.darkGrey,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.darkGrey,
          },
          ".MuiSvgIcon-root ": {
            color: theme.palette.text.primary,
            right: "10px",
          },

          width: "175px",
          height: "40px",
          color: theme.palette.text.primary,
          "& .MuiOutlinedInput-input": {
            paddingX: 2,
            paddingY: 0,
          },
        })}
      >
        {menuItems.map((item) => (
          <MenuItem disableRipple key={item.value} value={item.value}
            sx={(theme) => ({
              fontSize: "13px",
              height: "35px",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: theme.palette.primary.disabled,
              },
              "&.Mui-selected": {
                height: "35px",
                backgroundColor: theme.palette.primary.active,
                color: "white",
                "&:hover": {
                  backgroundColor: "#677DFF",
                },
              },
            })}
          >
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
