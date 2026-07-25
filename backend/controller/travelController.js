import Travel from "../models/Travel.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";
import { enrichTravels, calculateTravelStats } from "../services/travelService.js";
import { useCorrectUser } from "../helpers/useCorrectUser.js";
import { TravelRules } from "../domain/travelRules.js";
import { Money } from "../domain/value-objects/Money.js";
import { Distance } from "../domain/value-objects/Distance.js";
import { emitTravelUpdated } from "../events/publisher.js";

const DEFAULT_SORTING_FIELD = 'duration';

export const getAllTravels = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const crosses = req.body?.crossIds ?? []
  const { sortingField = DEFAULT_SORTING_FIELD, userId, locFrom, locTo, statsOnly, skipStats, limit } = req.query

  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find({
    ...useCorrectUser(userId),
    startTime: { $gte: dateFrom },
    endTime: { $lte: dateTo },
    ...(crosses.length > 0 && { crosses: { $in: crosses } }),
    ...(locFrom && { origin: locFrom }),
    ...(locTo && { destination: locTo })
  }).populate('origin destination crosses').sort({ startTime: -1 }).then(travels => {
    const enrichedTravels = enrichTravels(travels);
    const weightedTravels = withWeight(enrichedTravels, sortingField);

    const response = {};

    if (skipStats !== 'true') {
      // Unlike statsOnly, this actually skips the calculateTravelStats pass, not just the payload
      response.stats = calculateTravelStats(weightedTravels);
    }

    if (statsOnly !== 'true') {
      // Only caps what's returned, stats above are always computed over the full range
      response.travels = limit ? weightedTravels.slice(0, Number(limit)) : weightedTravels;
    }

    res.json(response);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching travels', error: err.message });
  });
}

export const createTravel = (req, res) => {
  const { startTime, endTime, origin, destination, modeOfTransport, distance, price, userId, line, crosses } = req.body;
  let safePrice, safeDistance;

  try {
    TravelRules.validateDuration(startTime, endTime)
    safeDistance = new Distance(distance);
    safePrice = new Money(price);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      name: error.name
    })
  }

  // Check for collisions with other travels of same user
  Travel.findOne({
    ...useCorrectUser(userId),
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  }).then(collision => {
    if (collision) {
      return res.status(400).json({
        message: 'Travel collision detected. Another travel already exists in this time range.',
        name: 'CollisionError'
      });
    }

    const travel = new Travel({
      ...useCorrectUser(userId),
      startTime,
      endTime,
      origin,
      destination,
      modeOfTransport,
      distance: safeDistance.value,
      price: safePrice.amount,
      line,
      crosses: crosses || [],
    });

    travel.save().then(savedTravel => {
      res.status(201).json(savedTravel);
    }).catch(err => {
      res.status(400).json({ message: 'Error creating travel', error: err.message });
    });
  }).catch(err => {
    res.status(500).json({ message: 'Error checking for collisions', error: err.message });
  });
}

export const updateTravel = (req, res, next) => {
  const { id } = req.params;
  const { startTime, endTime, origin, destination, modeOfTransport, distance, crosses, userId, line, notes } = req.body;
  let safeDistance;

  try {
    if (startTime && endTime) {
      TravelRules.validateDuration(startTime, endTime)
    }

    if (distance) {
      safeDistance = new Distance(distance);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      name: error.name
    });
  }

  const updateData = {
    startTime,
    endTime,
    origin,
    destination,
    modeOfTransport,
    distance: safeDistance?.value,
    crosses,
    line,
    notes
  };

  if (userId !== undefined) {
    updateData.userId = parseInt(userId, 10);
  }

  Travel.findByIdAndUpdate(id, updateData, { new: true })
    .populate('origin destination')
    .then(updatedTravel => {
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel not found' });
      }

      emitTravelUpdated(origin, updatedTravel);
      res.status(200).json(updatedTravel);
    })
    .catch(err => {
      return res.status(400).json({ message: 'Error updating travel', error: err.message });
    }
    );
}

export const deleteTravel = (req, res) => {
  const { id } = req.params;
  Travel.findByIdAndDelete(id).then(deletedTravel => {
    if (!deletedTravel) {
      return res.status(404).json({ message: 'Travel not found' });
    }
    res.status(204).send();
  }).catch(err => {
    res.status(400).json({ message: 'Error deleting travel', error: err.message });
  });
}
