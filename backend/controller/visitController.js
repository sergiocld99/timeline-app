import { useCorrectUser } from "../helpers/useCorrectUser.js";
import Visit from "../models/Visit.js";
import { calculateVisitsForDate, getMinutesBetween } from "../services/visitService.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";
import { enrichVisits } from "../services/visitService.js";

export const getAllVisits = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const { userId } = req.query

  Visit.find({ ...useCorrectUser(userId), date: { $gte: dateFrom, $lte: dateTo } }).sort({ arrivalTime: -1 }).populate('location').then(visits => {
    const enrichedVisits = enrichVisits(visits);
    const weightedVisits = withWeight(enrichedVisits, 'durationMinutes');

    res.json(weightedVisits);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching visits', error: err.message });
  });
}

export const calculateVisitsController = (req, res, next) => {
  const { date } = req.params;
  const { userId } = req.query;
  const userIdNum = userId ? parseInt(userId, 10) : undefined;

  calculateVisitsForDate(date, userIdNum).then(visits => {
    res.locals.visits = visits || [];
    next();
  }).catch(error => {
    res.status(500).json({ error: error.message || "Failed to calculate visits" });
  });
}

export const persistIfNeeded = (req, res) => {
  const { persist } = req.query;
  const { visits } = res.locals;

  if (persist === 'true' && visits.length > 0) {
    const bulkOps = visits.map(v => ({
      updateOne: {
        filter: {
          userId: v.userId,
          arrivalTime: v.arrivalTime
        },
        update: { $set: v },
        upsert: true
      }
    }));

    Visit.bulkWrite(bulkOps).then(() => {
      res.status(201).json({
        visits,
        persisted: true,
        count: visits.length
      });
    }).catch(error => {
      return res.status(500).json({ error: "Failed to persist visits", details: error.message });
    });
  } else if (persist === 'true') {
    res.status(200).json({ visits: [], persisted: true, count: 0 });
  } else {
    res.status(200).json({
      visits,
      count: visits.length
    });
  }
}

export const createVisit = (req, res) => {
  const { date, arrivalTime, departureTime, location, userId } = req.body;
  const durationMinutes = getMinutesBetween(arrivalTime, departureTime);

  const visit = new Visit({
    ...useCorrectUser(userId),
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
  const { date, arrivalTime, departureTime, location, userId } = req.body;
  const durationMinutes = getMinutesBetween(arrivalTime, departureTime);
  const updateData = { date, arrivalTime, departureTime, durationMinutes, location };
  if (userId !== undefined) {
    updateData.userId = parseInt(userId, 10);
  }

  Visit.findByIdAndUpdate(id, updateData, { new: true }).then(updatedVisit => {
    res.status(200).json(updatedVisit);
  }).catch(err => {
    res.status(400).json({ message: 'Error updating visit', error: err.message });
  });
}

export const deleteVisit = (req, res) => {
  const { id } = req.params;
  Visit.findByIdAndDelete(id).then(deletedVisit => {
    if (!deletedVisit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    console.log('Visit deleted:', {
      id: deletedVisit._id.toString(),
      userId: deletedVisit.userId,
      location: deletedVisit.location.toString(),
      arrivalTime: deletedVisit.arrivalTime,
      departureTime: deletedVisit.departureTime
    });
    res.status(204).send();
  }).catch(err => {
    res.status(400).json({ message: 'Error deleting visit', error: err.message });
  });
}