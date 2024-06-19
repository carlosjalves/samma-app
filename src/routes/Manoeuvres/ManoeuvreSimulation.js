import { useParams } from 'react-router-dom';
import { Box, Tooltip, Link, Typography, Breadcrumbs, Alert } from '@mui/material';
import { useEffect, useState, useContext } from "react";
import { conjunctionsList, manoeuvresList } from '../../assets/mappers';
import manoeuvreSimulation from '../../assets/images/manoeuvreSimulation2.png';
import SimulationTimeline from '../../components/ManoeuvreSimulation/SimulationTimeline';
import { SelectedValuesContext } from '../../components/SelectedValuesContext';


export default function ManoeuvreSequence() {
  const { conjunctionId } = useParams();

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

  const conjunction = conjunctionsList.items.find(item => item.id === conjunctionId);
  const manoeuvres = manoeuvresList.items.filter(item => item.conjunction_id === conjunctionId)

  const breadcrumbs = [
    <Link underline="hover" key="1" fontSize="15px" href="/sat-manoeuvres-app/conjunctions" to="sat-manoeuvres-app/conjunctions" sx={({ palette }) => ({ color: palette.primary.darkGrey })}>
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

  return (
    <>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>

      <h1>Manoeuvre Simulation</h1>

      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", marginTop: "20px" }}>
        <div>
          <img src={manoeuvreSimulation} alt="Manoeuvre Simulation Orbit Visualization sketch - José Antunes" width="100%" height="auto"></img>
        </div>
        <div style={{ width: "100%" }}>
          <div id='timeline-div' style={{ height: "75px" }}>
            <SimulationTimeline
              data={manoeuvres}
              selectedValues={selectedValues}
              handleSelectedChange={handleSelectedChange}
            />
          </div>
        </div>
      </div>
      {open &&
        <Alert sx={(theme) => ({ position: "fixed", top: "75px", left: "50%", transform: "translateX(-50%)", backgroundColor: theme.palette.primary.disabled, color: theme.palette.primary.darkGrey })} icon={false} severity="info" >
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
