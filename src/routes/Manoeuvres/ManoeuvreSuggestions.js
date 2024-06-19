import { useParams } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { CustomDropdownSelect } from '../../components/DropdownSelect';
import { useEffect, useState } from "react";
import React, { useContext } from 'react';
import Alert from '@mui/material/Alert';

import { conjunctionsList, manoeuvresList } from '../../assets/mappers';
import { Box, Tooltip, useTheme } from '@mui/material';

import axisIcon from '../../assets/icons/axis.svg'
import slidersIcon from '../../assets/icons/sliders.svg'
import legendIcon from '../../assets/icons/legend.svg'

import OverviewPlot from '../../components/ManoeuvreSuggestions/OverviewPlot';
import ScatterPlot from '../../components/ManoeuvreSuggestions/ScatterPlot';
import { AttributeWeightSlider } from '../../components/ManoeuvreSuggestions/AttributeWeightSlider';
import ManoeuvreTable from '../../components/ManoeuvreSuggestions/ManoeuvreTable';
import TableSwitch from '../../components/TableSwitch';

import { SelectedValuesContext } from '../../components/SelectedValuesContext';
import { Legend } from '../../components/ManoeuvreSuggestions/Legend';

export default function ManoeuvreSuggestions() {
  const { conjunctionId } = useParams();
  const theme = useTheme();

  const conjunction = conjunctionsList.items.find(item => item.id === conjunctionId);
  const manoeuvres = manoeuvresList.items.filter(item => item.conjunction_id === conjunctionId)

  const [activeAxis, setActiveAxis] = useState(true);
  const [activeSliders, setActiveSliders] = useState(false);
  const [activeLegend, setActiveLegend] = useState(false);

  const handleAxisClick = () => {
    setActiveAxis(!activeAxis);
  };
  const handleSlidersClick = () => {
    setActiveSliders(!activeSliders);
  };
  const handleLegendClick = () => {
    setActiveLegend(!activeLegend);
  };

  const breadcrumbs = [
    <Link underline="hover" key="1" fontSize="15px" href="/conjunctions" to="/conjunctions" sx={({ palette }) => ({ color: palette.primary.darkGrey })}>
      Conjunctions
    </Link>,
    <Box key="2" sx={{ display: "flex" }}>
      <Tooltip title={conjunction.id} placement="top" arrow>
        <Typography color="text.primary" fontWeight="600" fontSize="15px">
          {conjunction.satellite.name}  x  {conjunction.chaser.name}
        </Typography>
      </Tooltip>
      <Tooltip title={conjunction.tcaValue > 0 ? conjunction.tcaLabel + " to TCA" : "TCA " + conjunction.tcaLabel + " ago"} placement="top" arrow>
        <Box sx={({ palette }) => ({ width: "23px", height: "23px", marginLeft: "8px", backgroundColor: palette.status[conjunction.status], borderRadius: "50%", border: `5px solid ${palette.status.border[conjunction.status]}` })}></Box>
      </Tooltip>
    </Box>
  ];

  const OverviewVisualizationOption = {
    time_to_tca: "tca",
    delta_v: "delta_v",
    duration: "duration",
    poc: "poc",
    miss_distance: "miss_distance",
    fuel_consumption: "fuel_consumption",
  };

  const [overviewPlotOption, setOverviewPlotOption] = useState(OverviewVisualizationOption.fuel_consumption);

  const handleChangeOverviewPlotOption = (event) =>
    setOverviewPlotOption(event.target.value);

  const [scatterPlotXOption, setScatterPlotXOption] = useState(OverviewVisualizationOption.poc);
  const [scatterPlotYOption, setScatterPlotYOption] = useState(OverviewVisualizationOption.miss_distance);
  const [scatterPlotColorOption, setScatterPlotColorOption] = useState(OverviewVisualizationOption.time_to_tca);

  const handleChangeScatterPlotXOption = (event) =>
    setScatterPlotXOption(event.target.value);
  const handleChangeScatterPlotYOption = (event) =>
    setScatterPlotYOption(event.target.value);
  const handleChangeScatterPlotColorOption = (event) =>
    setScatterPlotColorOption(event.target.value);

  const menuItems = [
    {
      value: OverviewVisualizationOption.time_to_tca,
      label: "Time to TCA",
    },
    {
      value: OverviewVisualizationOption.delta_v,
      label: "Total Delta V",
    },
    {
      value: OverviewVisualizationOption.duration,
      label: "Duration",
    },
    {
      value: OverviewVisualizationOption.poc,
      label: "PoC",
    },
    {
      value: OverviewVisualizationOption.miss_distance,
      label: "Miss Distance",
    },
    {
      value: OverviewVisualizationOption.fuel_consumption,
      label: "Fuel Consumption",
    },
  ].filter((menuItem) => {
    return !manoeuvres.every((row) => row[menuItem.value] === undefined);
  });

  const [sliderValues, setSliderValues] = useState({});

  useEffect(() => {
    // Calcular os valores iniciais com base nos itens do slider
    const initialValue = {};
    menuItems.forEach(item => {
      initialValue[item.value] = Math.trunc(100 / menuItems.length);
    });
    // Definir os valores iniciais do slider
    setSliderValues(initialValue);
  }, []);

  const handleSliderValuesChange = (newSliderValues) => {
    setSliderValues(newSliderValues);
  };

  const { selectedValues, setSelectedValues } = useContext(SelectedValuesContext);
  const [full, setFull] = useState(false);

  const handleSelectedChange = (selected) => {
    if (selected.length <= 12) {
      setSelectedValues(selected);
      if (full) setFull(false);
    } else {
      setFull(true);
    }
  };

  const [switchState, setSwitchState] = useState(true);

  const handleSwitchChange = (newChecked) => {
    setSwitchState(newChecked);
  };

  //selected alert
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedValues.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
      setFull(false);
    }
  }, [selectedValues]);

  const handleCloseWarning = () => {
    setFull(false)
  };

  return (
    <>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>

      <h1>Manoeuvre Suggestions</h1>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Overview</h2>
        <CustomDropdownSelect
          selectedValue={overviewPlotOption}
          handleChangeValue={handleChangeOverviewPlotOption}
          menuItems={menuItems}
          label={"Y-Axis"}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "75vh", marginTop: "10px" }}>
        <div id='chart-container' style={{ width: "80vw", height: "70vh", marginLeft: "30px" }}>
          <OverviewPlot
            data={manoeuvres}
            selectedOption={overviewPlotOption}
            activeAxis={activeAxis}
            sliderValues={sliderValues}
            selectedValues={selectedValues}
            handleSelectedChange={handleSelectedChange}
          />
        </div>
        <Stack spacing={1.5} sx={{ alignItems: "flex-end" }}>
          <AttributeWeightSlider
            sliderItems={menuItems}
            active={activeSliders}
            onValuesChange={handleSliderValuesChange}
          />
          <Tooltip title="Show/Hide Sliders" placement="left" arrow>
            <Box className="sliders-button" sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "45px",
              height: "45px",
              borderRadius: "10px",
              backgroundColor: activeSliders ? theme.palette.primary.active : theme.palette.primary.disabled,
              '&:hover': {
                opacity: 0.9,
                cursor: "pointer",
              },
            })}
              onClick={handleSlidersClick}
            >
              <img src={slidersIcon} alt="" style={{ width: "max-content" }} />
            </Box>
          </Tooltip>
          <Tooltip title="Show/Hide Axis" placement="left" arrow>
            <Box sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "45px",
              height: "45px",
              borderRadius: "10px",
              backgroundColor: activeAxis ? theme.palette.primary.active : theme.palette.primary.disabled,
              '&:hover': {
                opacity: 0.9,
                cursor: "pointer",
              },
            })}
              onClick={handleAxisClick}
            >
              <img src={axisIcon} alt="" style={{ width: "max-content" }} />
            </Box>
          </Tooltip>
          <Tooltip title="Show/Hide Legend" placement="left" arrow>
            <Box className="legend-button" sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "45px",
              height: "45px",
              borderRadius: "10px",
              backgroundColor: activeLegend ? theme.palette.primary.active : theme.palette.primary.disabled,
              '&:hover': {
                opacity: 0.9,
                cursor: "pointer",
              },
            })}
              onClick={handleLegendClick}
            >
              <img src={legendIcon} alt="" style={{ width: "max-content" }} />
            </Box>
          </Tooltip>
          <Legend
            active={activeLegend}
          />
        </Stack>
      </div>
      <h2 style={{ paddingTop: selectedValues.length > 0 ? "80px" : "50px" }}>Analysis</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-10px", paddingBottom: "18px" }}>
        <h3>Heatmap Table</h3>
        <div
          style={{ visibility: selectedValues.length > 0 ? "visible" : "hidden", opacity: selectedValues.length > 0 ? "1" : "0", transition: "opacity 0.1s ease-out", }}
        >
          <TableSwitch
            onSwitchChange={handleSwitchChange}>
          </TableSwitch>
        </div>
      </div>
      <ManoeuvreTable
        conjunctionID={conjunctionId}
        selectedValues={selectedValues}
        handleSelectedChange={handleSelectedChange}
        switchState={switchState}
      />
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "60px" }}>
        <h3>Comparison Scatter Plot</h3>
        <div style={{ display: "flex", justifyContent: "space-between", width: "560px", paddingTop: "15px" }}>
          <CustomDropdownSelect
            selectedValue={scatterPlotXOption}
            handleChangeValue={handleChangeScatterPlotXOption}
            menuItems={menuItems}
            label={"X-Axis"}
          />
          <CustomDropdownSelect
            selectedValue={scatterPlotYOption}
            handleChangeValue={handleChangeScatterPlotYOption}
            menuItems={menuItems}
            label={"Y-Axis"}
          />
          <CustomDropdownSelect
            selectedValue={scatterPlotColorOption}
            handleChangeValue={handleChangeScatterPlotColorOption}
            menuItems={menuItems}
            label={"Color"}
          />
        </div>
      </div>
      <div id='scatterplot-container' style={{ height: "70vh", backgroundColor: theme.palette.primary.main, borderRadius: "4px", marginTop: "20px", marginBottom: "60px" }}>
        <ScatterPlot
          data={manoeuvres}
          selectedValueX={scatterPlotXOption}
          selectedValueY={scatterPlotYOption}
          selectedValueColor={scatterPlotColorOption}
          selectedValues={selectedValues}
          handleSelectedChange={handleSelectedChange}
        />
      </div>
      {open &&
        <Alert sx={(theme) => ({ position: "fixed", top: "75px", left: "50%", transform: "translateX(-50%)", backgroundColor: theme.palette.primary.disabled, color: theme.palette.primary.darkGrey, zIndex: "2" })} icon={false} severity="info" >
          <span style={{ fontSize: "13px" }}>
            <b>{selectedValues.length}</b>/12 manoeuvres selected
          </span>
        </Alert>
      }
      {open && full &&
        <Alert sx={{ position: "fixed", bottom: "20px", left: "20px" }} severity="warning" onClose={handleCloseWarning}>You can only select 12 manoeuvres.</Alert>
      }
    </>
  )
}
