import Travel from "../models/Travel.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";
import { enrichTravels, enrichTravel, calculateTravelStats } from "../services/travelService.js";

export const getAllTravels = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const crosses = req.body?.crossIds ?? []
  const { sortingField = 'duration' } = req.query

  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find({ 
    startTime: { $gte: dateFrom }, 
    endTime: { $lte: dateTo },
    ...(crosses.length > 0 && { crosses: { $in: crosses } })
  }).populate('origin destination crosses').sort({ startTime: -1 }).then(travels => {
    const enrichedTravels = enrichTravels(travels);
    const weightedTravels = withWeight(enrichedTravels, sortingField);
    const stats = calculateTravelStats(weightedTravels);
    
    res.json({
      travels: weightedTravels,
      stats
    });
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching travels', error: err.message });
  });
}

export const buildGraph = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const weights = {}

  Travel.find({ startTime: { $gte: dateFrom }, endTime: { $lte: dateTo } })
  .populate('origin destination').sort({ startTime: -1 }).then(travels => {
    const enrichedTravels = enrichTravels(travels);
    
    enrichedTravels.forEach(t => {
      const duration = t.get('duration');
      const A = t.origin.zipcode
      const B = t.destination.zipcode

      if (!weights[A]) { weights[A] = {} }
      if (!weights[A][B]) { weights[A][B] = { count: 0, duration } }
      weights[A][B].count++
    })

    res.json({ weights });
  }).catch(err => {
    res.status(500).json({ message: 'Error building graph', error: err.message });
  });
}

export const createTravel = (req, res) => {
  const { startTime, endTime, origin, destination, modeOfTransport, distance, price } = req.body;

  const travel = new Travel({
    startTime,
    endTime,
    origin,
    destination,
    modeOfTransport,
    distance,
    price
  });

  travel.save().then(savedTravel => {
    res.status(201).json(savedTravel);
  }).catch(err => {
    res.status(400).json({ message: 'Error creating travel', error: err.message });
  });
}

export const updateTravel = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, origin, destination, modeOfTransport, distance, crosses } = req.body;

  Travel.findByIdAndUpdate(id, { startTime, endTime, origin, destination, modeOfTransport, distance, crosses }, { new: true })
    .populate('origin destination')
    .then(updatedTravel => {
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel not found' });
      }
      const enrichedTravel = enrichTravel(updatedTravel);
      res.json(enrichedTravel);
    })
    .catch(err => {
      res.status(400).json({ message: 'Error updating travel', error: err.message });
    }
  );
}

export const deleteTravel = (req, res) => {
  const { id } = req.params;
  Travel.findByIdAndDelete(id).then(deletedTravel => {
    res.status(200).json(deletedTravel);
  }).catch(err => {
    res.status(400).json({ message: 'Error deleting travel', error: err.message });
  });
}