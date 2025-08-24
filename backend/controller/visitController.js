import Visit from "../models/Visit.js";
import { calculateVisitsForDate, getMinutesBetween } from "../services/visitService.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";

export const getAllVisits = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)

  Visit.find({ date: { $gte: dateFrom, $lte: dateTo } }).sort({ arrivalTime: -1 }).populate('location').then(visits => {
    res.json(withWeight(visits, 'durationMinutes'));
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching visits', error: err.message });
  });
}

export const calculateVisitsController = (req, res, next) => {
  const { date } = req.params;

  calculateVisitsForDate(date).then(visits => {
    if (!visits || visits.length === 0) {
      res.locals.visits = [];
      return res.status(404).json({ message: 'No visits found for the specified date' });
    }

    res.locals.visits = visits;
    next();
  }).catch(error => {
    res.status(500).json({ error: error.message || "Failed to calculate visits"});
  });
}

export const persistIfNeeded = (req, res) => {
  const { persist } = req.query;
  const { visits } = res.locals;

  if (persist === 'true') {
    Visit.insertMany(visits).then(() => {
      res.status(201).json({
        visits,
        persisted: true,
        count: visits.length
      });
    }).catch(error => {
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
}

export const createVisit = (req, res) => {
  const { date, arrivalTime, departureTime, location } = req.body;
  const durationMinutes = getMinutesBetween(arrivalTime, departureTime);

  const visit = new Visit({
    date,
    location,
    arrivalTime,
    departureTime,
    durationMinutes
  });

  visit.save().then(savedVisit => {
    res.status(201).json(savedVisit);
  }).catch(err => {
    res.status(400).json({ message: 'Error creating visit', error: err.message });
  });
}

export const updateVisit = (req, res) => {
  const { id } = req.params;
  const { date, arrivalTime, departureTime, location } = req.body;
  const durationMinutes = getMinutesBetween(arrivalTime, departureTime);

  Visit.findByIdAndUpdate(id, { date, arrivalTime, departureTime, durationMinutes, location }, { new: true }).then(updatedVisit => {
    res.status(200).json(updatedVisit);
  }).catch(err => {
    res.status(400).json({ message: 'Error updating visit', error: err.message });
  });
}

export const deleteVisit = (req, res) => {
  const { id } = req.params;
  Visit.findByIdAndDelete(id).then(deletedVisit => {
    res.status(200).json(deletedVisit);
  }).catch(err => {
    res.status(400).json({ message: 'Error deleting visit', error: err.message });
  });
}