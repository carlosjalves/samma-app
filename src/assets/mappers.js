import conjunctions from "./data/conjunctions.json";
import manoeuvres from "./data/manoeuvres.json";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import humanizeDuration from "humanize-duration";

import i18n from "../i18n";


dayjs.extend(utc);
dayjs.extend(relativeTime);

const TimeToTcaValue = (startTime, endTime) => {
  const start = dayjs(startTime, { utc: true });
  const end = dayjs(endTime, { utc: true });
  const millisecondsLeft = end.diff(start);
  return millisecondsLeft / (1000 * 60 * 60); //millis to min;
};

const columnDateFormatter = (date) => {
  return dayjs(date).utc().format("MMM D YYYY HH:mm:ss UTC");
};

const TimeLeft = (startTime, endTime) => {
  const start = dayjs(startTime, { utc: true });
  const end = dayjs(endTime, { utc: true });
  const millisecondsLeft = end.diff(start);

  return (
    humanizeDuration(millisecondsLeft, {
      delimiter: " and ",
      units: ["d", "h", "m"],
      round: true,
      language: i18n.language,
      fallbacks: ["en-US", "en"],
    })
  );
};

const sumDuration = (manoeuvre) => {
  if (manoeuvre.type === "differential_drag") {
    return Number(manoeuvre.drag_parameters.map((i) => dayjs(i.end_epoch).diff(i.start_epoch, "seconds")));
  }

  if (manoeuvre.type === "thrust") {
    return manoeuvre.thrust_parameters.reduce((sum, v) => sum + v.duration, 0);
  }
};

const sumFuelConsumption = (manoeuvre) => {
  if (manoeuvre.type === "impulsive") {
    return manoeuvre.impulsive_parameters.reduce((sum, v) => (v.fuel_consumption ? sum + v.fuel_consumption : sum), 0);
  }

  return [...manoeuvre.impulsive_parameters, ...manoeuvre.thrust_parameters].reduce(
    (sum, v) => (v.fuel_consumption ? sum + v.fuel_consumption : sum),
    0,
  );
};

const sumTotalDeltaV = (manoeuvre) => {
  if (manoeuvre.type === "impulsive") {
    return manoeuvre.impulsive_parameters.reduce((sum, v) => sum + v.delta_v_vector.total_delta_v, 0);
  }

  if (manoeuvre.type === "thrust") {
    return manoeuvre.thrust_parameters.reduce((sum, v) => sum + v.total_delta_v, 0);
  }
};

export const isManoeuvreLatest = (manoeuvre) => {
  const dateNow = dayjs().valueOf();

  if (manoeuvre.ignition_epoch_earliest) {
    const timestamp = dayjs(manoeuvre.ignition_epoch_earliest).valueOf();

    if (dateNow <= timestamp) {
      return true;
    }
  }

  return false;
};

export const formatNumber = (value, category) => {
  if (typeof value !== "number" && typeof value !== "string") return;
  switch (category) {
    case "tca":
      return value
        .toLocaleString("fr", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
        .replace(",", ".");
    case "miss_distance":
    case "relativeSpeed":
      return value.toLocaleString("fr", { maximumFractionDigits: 0 }).replace(",", ".");
    case "covariances":
    case "rss":
    case "poc":
    case "scientific":
      return value
        .toLocaleString("fr", { maximumFractionDigits: 2, minimumFractionDigits: 2, notation: "scientific" })
        .toLowerCase()
        .replace(",", ".");
    case "distance":
      return value.toLocaleString("fr", { maximumFractionDigits: 1 }).replace(",", ".");
    case "spans":
    case "sizes":
    case "mass":
      return value.toLocaleString("fr", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).replace(",", ".");
    case "eccentricity":
      return value
        .toLocaleString("fr", {
          maximumFractionDigits: 4,
          minimumFractionDigits: 4,
          maximumSignificantDigits: 3,
          minimumSignificantDigits: 3,
        })
        .replace(",", ".");
    case "fuel_consumption":
      return (Number(value) * 1000)
        .toLocaleString("fr", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
        .replace(",", ".");
    case "delta_v":
      return (Number(value) * 100)
        .toLocaleString("fr", { maximumFractionDigits: 2, minimumFractionDigits: 2 })
        .replace(",", ".");
    default:
      return value.toLocaleString("fr").replace(",", ".");
  }
};

const manoeuvresCount = (id) => {
  let mCount = 0;

  manoeuvres.items.forEach(manoeuvre => {
    // Se o conjunction_id da manobra for igual ao id deste item em conjunctionsList, incrementa a contagem
    if (manoeuvre.conjunction_id === id) {
      mCount++;
    }
  });
  return mCount;
}

export const conjunctionsList = {
  items: conjunctions.items.map(item => ({
    id: item.id,
    satellite: {
      name: item.target.name,
      id: item.target.cospar_id,
    },
    chaser: {
      name: item.chaser.name,
      id: item.chaser.cospar_id,
    },
    tca: item.summary.tca_latest,
    tcaValue: TimeToTcaValue(dayjs(), item.summary.tca_latest),
    tcaLabel: TimeLeft(dayjs(), item.summary.tca_latest),
    status: item.summary.status,
    lifecycle: item.lifecycle,
    poc: {
      min: item.summary.poc_min,
      max: item.summary.poc_max,
      latest: item.summary.poc_latest,
      latestFormated: formatNumber(item.summary.poc_latest, "poc"),
      evolution: [item.summary.poc_evolution[1], item.summary.poc_evolution[2], item.summary.poc_evolution[3], item.summary.poc_evolution[4], item.summary.poc_evolution[5]]
    },
    miss_distance: {
      min: item.summary.miss_distance_min,
      max: item.summary.miss_distance_max,
      latest: item.summary.miss_distance_latest,
      latestFormated: formatNumber(item.summary.miss_distance_latest, "miss_distance"),
      evolution: [item.summary.miss_distance_evolution[1], item.summary.miss_distance_evolution[2], item.summary.miss_distance_evolution[3], item.summary.miss_distance_evolution[4], item.summary.miss_distance_evolution[5]]
    },
    suggested_manoeuvres: manoeuvresCount(item.id)
  })),
  page: conjunctions.page,
  size: conjunctions.size,
  total: conjunctions.total,
};

export const manoeuvresList = {
  items: manoeuvres.items.map(item => ({
    conjunction_id: item.conjunction_id,
    id: item.id,
    type: item.type,
    ignition_epoch_earliest: item.ignition_epoch_earliest,
    man_time: columnDateFormatter(item.ignition_epoch_earliest),
    manoeuvre_time: TimeToTcaValue(dayjs(), item.ignition_epoch_earliest),
    tca: TimeToTcaValue(item.ignition_epoch_earliest, item.collision_avoidance.tca),
    time_to_tca: TimeLeft(item.ignition_epoch_earliest, item.collision_avoidance.tca),
    delta_v: sumTotalDeltaV(item),
    duration: sumDuration(item),
    poc: item.collision_avoidance.poc,
    miss_distance: item.collision_avoidance.miss_distance.total,
    fuel_consumption: sumFuelConsumption(item),
    isLatest: isManoeuvreLatest(item),
  })),
  page: manoeuvres.page,
  size: manoeuvres.size,
  total: manoeuvres.total,
};
