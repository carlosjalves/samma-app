import { Box, Button, Typography } from "@mui/material";
import { conjunctionsList } from "../assets/mappers";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';


export default function Home() {

  const conjunction = conjunctionsList.items;

  const countSuggestedManoeuvres = conjunction.filter(item => item.suggested_manoeuvres > 0).length;
  const highRiskConjunctions = conjunction.filter(item => item.status === 'alarm').length;
  const mediumRiskConjunctions = conjunction.filter(item => item.status === 'warning').length;
  const lowRiskConjunctions = conjunction.filter(item => item.status === 'ok').length;

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", height: "70vh", alignItems: "center", justifyContent: "flex-end", rowGap: "100px" }}>
        <Box sx={{ display: "flex", columnGap: "100px" }}>
          <Box sx={{ width: "120px" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>Current Conjunctions</Typography>
            <Typography sx={{ fontSize: "38px", fontWeight: 500, marginTop: "20px" }}>{conjunction.length}</Typography>
          </Box>
          <Box sx={{ width: "120px" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>High risk Conjunctions</Typography>
            <Box sx={{ display: "flex", marginTop: "20px", alignItems: "center" }}>
              <Box sx={(theme) => ({ backgroundColor: theme.palette.status.alarm, borderRadius: "50%", width: "20px", height: "20px", border: `4px solid ${theme.palette.status.border.alarm}`, marginRight: "8px" })}></Box>
              <Typography sx={(theme) => ({ fontSize: "38px", fontWeight: 500, color: theme.palette.status.alarm })}>{highRiskConjunctions}</Typography>
            </Box>
          </Box>
          <Box sx={{ width: "120px" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>Concerning Conjunctions</Typography>
            <Box sx={{ display: "flex", marginTop: "20px", alignItems: "center" }}>
              <Box sx={(theme) => ({ backgroundColor: theme.palette.status.warning, borderRadius: "50%", width: "20px", height: "20px", border: `4px solid ${theme.palette.status.border.warning}`, marginRight: "8px" })}></Box>
              <Typography sx={(theme) => ({ fontSize: "38px", fontWeight: 500, color: theme.palette.status.warning })}>{mediumRiskConjunctions}</Typography>
            </Box>
          </Box>
          <Box sx={{ width: "120px" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>Low risk Conjunctions</Typography>
            <Box sx={{ display: "flex", marginTop: "20px", alignItems: "center" }}>
              <Box sx={(theme) => ({ backgroundColor: theme.palette.status.ok, borderRadius: "50%", width: "20px", height: "20px", border: `4px solid ${theme.palette.status.border.ok}`, marginRight: "8px" })}></Box>
              <Typography sx={(theme) => ({ fontSize: "38px", fontWeight: 500, color: theme.palette.status.ok })}>{lowRiskConjunctions}</Typography>
            </Box>
          </Box>
          <Box sx={{ width: "215px" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>Conjunctions with Manoeuvre Suggestions</Typography>
            <Typography sx={{ fontSize: "38px", fontWeight: 500, marginTop: "20px" }}>{countSuggestedManoeuvres}</Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          to="/sat-manoeuvres-app/conjunctions"
          variant="contained"
          endIcon={<ArrowForwardIosIcon />}
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.active,
            color: "white",
            borderRadius: "20px",
            fontSize: "16px",
            '&:hover': {
              backgroundColor: theme.palette.primary.active,
              opacity: 0.95,
            },
          })}
        >
          Conjunctions
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            position: 'absolute',
            top: "25%",
            width: '30%',
            height: '50%',
            filter: 'blur(100px)',
            backgroundImage: 'linear-gradient(hsl(185, 91%, 65%), hsl(300, 100%, 54%))',
            opacity: "0.2",
            animation: 'rotate 50s cubic-bezier(0.8, 0.2, 0.2, 0.8) alternate infinite',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            zIndex: "-1",
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
          }}
        />
      </Box>
    </>
  );
}
