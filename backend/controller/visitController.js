import Visit from "../models/Visit.js";
import { calculateVisitsForDate } from "../services/visitService.js";
import { getDateFrom, withWeight } from "../utils/index.js";

export const getAllVisits = (req, res) => {
  const dateFrom = getDateFrom(req)

  Visit.find({ date: { $gte: dateFrom } }).sort({ arrivalTime: -1 }).populate('location').then(visits => {
    res.json(withWeight(visits, 'durationMinutes'));
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching visits', error: err.message });
  });
}

export const calculateVisitsController = (req, res) => {
  const { date } = req.params;
  const { persist } = req.query;

  calculateVisitsForDate(date).then(visits => {
    if (!visits || visits.length === 0) {
      return res.status(404).json({ message: 'No visits found for the specified date' });
    }

    if (persist === 'true') {
      Visit.insertMany(visits).then(() => {
        res.status(201).json({
          visits,
          persisted: true,
          count: visits.length
        });
      }).catch(error => {
        console.error("Error persisting visits:", error);
        if (error.code === 11000) {
          return res.status(409).json({ visits, persisted: false, error: error.message });
        }

        return res.status(500).json({ error: "Failed to persist visits" });
      });
    } else {
      res.status(200).json({
        visits,
        count: visits.length
      });
    }
  }).catch(error => {
    console.error("Error calculating visits:", error);
    res.status(500).json({ error: "Failed to calculate visits" });
  });
}