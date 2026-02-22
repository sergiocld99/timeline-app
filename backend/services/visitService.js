import { useCorrectUser } from "../helpers/useCorrectUser.js";
import Travel from "../models/Travel.js";
import Visit from "../models/Visit.js";
import { getCompleteHourParts } from "./timeService.js";

export const enrichVisits = (visits) => {
  return visits.map(v => {
    v.set('hourParts', getCompleteHourParts(v.arrivalTime, v.departureTime), { strict: false });
    return v;
  })
}

const getTravelsStartedOn = async (date, userId) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const travels = await Travel.find({
    ...useCorrectUser(userId),
    startTime: { $gte: startOfDay, $lte: endOfDay }
  }).populate('origin destination').sort({ startTime: 1 });

  return travels
}

export const getMinutesBetween = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / 60000);
}

/** 
 * @param userId undefined or an already parsed number
 * */
export const calculateVisitsForDate = async (date, userId) => {
  const travels = await getTravelsStartedOn(date, userId);
  const visits = [];

  for (let i = 0; i < travels.length - 1; i++) {
    const currentTravel = travels[i];
    const nextTravel = travels[i + 1];

    const isSameLocation = currentTravel.destination._id.equals(nextTravel.origin._id);
    const isSameDay = currentTravel.endTime.toDateString() === nextTravel.startTime.toDateString();
    const isCorrectOrder = currentTravel.endTime < nextTravel.startTime;  // strict "less" for visits >= 1 minute

    if (!isSameLocation || !isSameDay || !isCorrectOrder) {
      continue;
    }

    const arrivalTime = currentTravel.endTime;
    const departureTime = nextTravel.startTime;

    visits.push({
      userId,
      date: currentTravel.endTime.toDateString(),
      location: currentTravel.destination._id,
      arrivalTime,
      departureTime,
      durationMinutes: getMinutesBetween(arrivalTime, departureTime)
    })
  }

  // reverse order (most recent first)
  return visits.reverse();
}

export const updateVisitFromTravel = async (travel) => {
  const { origin, startTime, userId } = travel
  const filter = { departureTime: startTime, userId }
  const update = { location: origin }

  try {
    // Find just by User and End Time of visit -> Update location
    const v = await Visit.findOneAndUpdate(filter, update, { new: true })

    if (!v) {
      console.log('No visits found for ', filter)
    }
  } catch (err) {
    console.error('Error when updating visit after travel update: ', err.message)
  }
}