import Travel from "../models/Travel.js";

const getTravelsStartedOn = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const travels = await Travel.find({
    startTime: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ startTime: 1 });

  return travels
}

export const getMinutesBetween = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / 60000);
}

export const calculateVisitsForDate = async (date) => {
  const travels = await getTravelsStartedOn(date);
  const visits = [];

  for (let i=0; i<travels.length-1; i++) {
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