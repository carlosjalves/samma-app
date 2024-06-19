import React from 'react';
import { useTranslation } from "react-i18next";
import { useTheme, Tooltip } from "@mui/material";
import { formatNumber } from '../assets/mappers';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import ManoeuvreGlyph from './ManoeuvreGlyph';

export const PlotTooltip = ({
  manoeuvres,
  x,
  y,
  position,
  tcaColor,
  manTime,
  tca,
  tcaValue,
  type,
  delta_v,
  duration,
  poc,
  miss_distance,
  fuel_consumption,
  theme
}) => {
  const { t } = useTranslation("labels");
  //const theme = useTheme();

  const bestValues = {
    duration: [],
    poc: [],
    miss_distance: [],
    fuel_consumption: [],
    delta_v: [],
  };

  const uniqueValues = {};

  for (const key in bestValues) {
    if (key in bestValues) {
      uniqueValues[key] = new Set(manoeuvres.map(row => row[key]))
    }
  }

  bestValues.miss_distance = Array.from(uniqueValues.miss_distance)
    .sort(
      (a, b) => (b ?? Number.NEGATIVE_INFINITY) - (a ?? Number.NEGATIVE_INFINITY)
    )
    .slice(0, 1)

  for (const key of ["poc", "duration", "delta_v", "fuel_consumption"]) {
    bestValues[key] = Array.from(uniqueValues[key])
      .sort(
        (a, b) =>
          (a ?? Number.POSITIVE_INFINITY) - (b ?? Number.POSITIVE_INFINITY)
      )
      .slice(0, 1)
  }

  const InfoPair = ({ label, value, textColor, isBestValue, typeIcon }) => (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "222px" }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "200px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: theme.palette.text.primary,
            lineHeight: 1.3
          }}
        >
          {label}
        </div>
        <div>
          <p
            style={{
              color: textColor,
              fontSize: 12,
              fontWeight: 700,
              margin: 0,
              textAlign: "end",
              lineHeight: 1.3
            }}
          >
            {value}
          </p>
        </div>
      </div>
      {isBestValue &&
        <Tooltip title="Best Value" placement="top" arrow>
          <StarIcon sx={{ fontSize: 16, color: "#FFCC55" }} />
        </Tooltip>}
      {typeIcon && (
        <div style={{ width: "16px", height: "16px" }}>
          {typeIcon !== 'unknown' ? (
            <>
              <svg viewBox="0 0 24 24" width="16" height="16" fill={theme.palette.type[typeIcon]} /*style={{ position: "relative", left: "1px", bottom: "1px" }}*/>
                <path style={{ transform: "translate(3px, 1px)" }} d={typePath(typeIcon)} />
              </svg>
            </>
          ) : (
            <>
              <WarningIcon sx={{ fontSize: 14, color: '#FFB300', transform: "translate(1px, -2px)" }} />
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", position: position, left: x, top: y, width: "fit-content", backgroundColor: theme.palette.plot.tooltip, padding: '12px', borderRadius: '8px', boxShadow: "0px 4px 14px 0px rgb(0 0 0 / 10%)" }}>
      <div
        style={{
          width: "120px",
          height: "140px",
          marginRight: "15px",
          alignSelf: "center"
        }}
      >
        <ManoeuvreGlyph
          data={manoeuvres}
          tca={tcaValue}
          miss_distance={miss_distance}
          poc={poc}
          duration={duration}
          fuel_consumption={fuel_consumption}
          type={type}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px 0" }}>
        <InfoPair
          label={"Manoeuvring Time"}
          value={manTime}
          textColor={theme.palette.text.primary}
        />
        <InfoPair
          label={"Time to TCA"}
          value={formatTime(tca)}
          textColor={tcaColor}
        />
        <InfoPair
          label={"Manoeuvre Type"}
          value={t(`type.${type}`)}
          textColor={theme.palette.text.primary}
          typeIcon={type}
        />
        <InfoPair
          label={"Total Delta V"}
          value={(delta_v !== undefined ? formatNumber(delta_v, "delta_v") + " cm/s" : "-")}
          textColor={theme.palette.text.primary}
          isBestValue={delta_v && bestValues.delta_v.includes(delta_v)} // Verifique se delta_v é um dos melhores valores
        />
        <InfoPair
          label={"Duration"}
          value={(duration !== undefined ? formatNumber(duration, "duration") + " s" : "-")}
          textColor={theme.palette.text.primary}
          isBestValue={duration && bestValues.duration.includes(duration)} // Verifique se duration é um dos melhores valores
        />
        <InfoPair
          label={"PoC"}
          value={formatNumber(poc, "poc") ?? "-"}
          textColor={theme.palette.text.primary}
          isBestValue={poc && bestValues.poc.includes(poc)} // Verifique se poc é um dos melhores valores
        />
        <InfoPair
          label={"Miss Distance"}
          value={(miss_distance !== undefined ? formatNumber(miss_distance, "miss_distance") + " m" : "-")}
          textColor={theme.palette.text.primary}
          isBestValue={miss_distance && bestValues.miss_distance.includes(miss_distance)} // Verifique se miss_distance é um dos melhores valores
        />
        <InfoPair
          label={"Fuel Consumption"}
          value={(fuel_consumption !== undefined ? formatNumber(fuel_consumption, "fuel_consumption") + " g" : "-")}
          textColor={theme.palette.text.primary}
          isBestValue={bestValues.fuel_consumption.includes(fuel_consumption)} // Verifique se fuel_consumption é um dos melhores valores
        />
      </div>
    </div>
  );
};

const formatTime = (timeString) => {
  const formattedTime = timeString
    .replace("hours", "h")
    .replace("hour", "h")
    .replace("minutes", "min")
    .replace("minute", "min")
    .replace("seconds", "s")
    .replace("second", "s")
    .replace("and", "");

  return formattedTime;
};

const typePath = (type) => {

  if (type === "impulsive") {
    return "M 0 16 h 18 L 9 0 z z z";
  }
  if (type === "thrust") {
    return "M 0 0 H 16 V 16 H 0 L 0 0"; //14
  }
  if (type === "differential_drag") {
    return "M 0 9.5 L 9.5 19 L 19 9.5 L 9.5 0 L 0 9.5";
  }
}
