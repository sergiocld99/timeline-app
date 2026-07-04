import Travel from "../models/Travel.js";
import Visit from "../models/Visit.js";
import Location from "../models/Location.js";
import Cross from "../models/Cross.js";
import { useCorrectUser } from "../helpers/useCorrectUser.js";
import { parseQuarter } from "../domain/quarter.js";

export const EXPORT_SCHEMA_VERSION = 1;

export const getAvailableQuarters = async (userId) => {
  const results = await Travel.aggregate([
    { $match: useCorrectUser(userId) },
    {
      $group: {
        _id: {
          year: { $year: "$startTime" },
          quarter: { $ceil: { $divide: [{ $month: "$startTime" }, 3] } }
        },
        travelCount: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.quarter": -1 } }
  ]);

  return results.map(({ _id, travelCount }) => ({
    quarter: `${_id.year}-Q${_id.quarter}`,
    travelCount
  }));
};

export const getExportForQuarter = async (quarterStr, userId) => {
  const { dateFrom, dateTo } = parseQuarter(quarterStr);

  const [travels, visits] = await Promise.all([
    Travel.find({
      ...useCorrectUser(userId),
      startTime: { $gte: dateFrom, $lte: dateTo }
    }).sort({ startTime: 1 }),
    Visit.find({
      ...useCorrectUser(userId),
      date: { $gte: dateFrom, $lte: dateTo }
    }).sort({ date: 1 })
  ]);

  const locationIds = new Set();
  const crossIds = new Set();

  travels.forEach(travel => {
    locationIds.add(travel.origin.toString());
    locationIds.add(travel.destination.toString());
    travel.crosses.forEach(crossId => crossIds.add(crossId.toString()));
  });

  visits.forEach(visit => {
    locationIds.add(visit.location.toString());
  });

  const [locations, crosses] = await Promise.all([
    Location.find({ _id: { $in: [...locationIds] } }),
    Cross.find({ _id: { $in: [...crossIds] } })
  ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    quarter: quarterStr,
    locations,
    crosses,
    travels,
    visits
  };
};
