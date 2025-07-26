import Visit from "../models/Visit.js";
import { calculateVisitsForDate } from "../services/visitService.js";

export const getAllVisits = (req, res) => {
  Visit.find().sort({ arrivalTime: -1 }).populate('location').then(visits => {
    res.json(visits);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching visits', error: err.message });
  });
}

export const calculateVisitsController = (req, res) => {
  const { date } = req.params;
  const { persist } = req.query;

  calculateVisitsForDate(date).then(visits => {
    if (persist === 'true') {
      Visit.insertMany(visits).then(() => {
        res.status(201).json({
          visits,
          persisted: true,
          count: visits.length
        });
      }).catch(error => {
        console.error("Error persisting visits:", error);
        res.status(500).json({ error: "Failed to persist visits" });
      });
    } else {
      res.status(200).json({
        visits,
        persisted: false,
        count: visits.length
      });
    }
  }).catch(error => {
    console.error("Error calculating visits:", error);
    res.status(500).json({ error: "Failed to calculate visits" });
  });
}