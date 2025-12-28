import Travel from "../models/Travel.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";
import { enrichTravels, enrichTravel, calculateTravelStats } from "../services/travelService.js";
import { useCorrectUser } from "../helpers/useCorrectUser.js";

export const getAllTravels = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)
  const crosses = req.body?.crossIds ?? []
  const { sortingField = 'duration', userId } = req.query

  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find({ 
    ...useCorrectUser(userId),
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

export const createTravel = (req, res) => {
  const { startTime, endTime, origin, destination, modeOfTransport, distance, price, userId } = req.body;

  // Validar que la duración del viaje no exceda 24 horas
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  if (durationMs > oneDayMs) {
    return res.status(400).json({ 
      message: 'Travel duration cannot exceed 24 hours', 
      error: 'The travel duration exceeds the maximum allowed time of 1 day' 
    });
  }

  const travel = new Travel({
    ...useCorrectUser(userId),
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

export const updateTravel = (req, res, next) => {
  const { id } = req.params;
  const { startTime, endTime, origin, destination, modeOfTransport, distance, crosses, userId } = req.body;
  
  // Validar que la duración del viaje no exceda 24 horas si se están actualizando los tiempos
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (durationMs > oneDayMs) {
      return res.status(400).json({ 
        message: 'Travel duration cannot exceed 24 hours', 
        error: 'The travel duration exceeds the maximum allowed time of 1 day' 
      });
    }
  }

  const updateData = { startTime, endTime, origin, destination, modeOfTransport, distance, crosses };
  if (userId !== undefined) {
    updateData.userId = parseInt(userId, 10);
  }

  Travel.findByIdAndUpdate(id, updateData, { new: true })
    .populate('origin destination')
    .then(updatedTravel => {
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel not found' });
      }
      
      res.locals.enrichedTravel = enrichTravel(updatedTravel);
      next()
    })
    .catch(err => {
      return res.status(400).json({ message: 'Error updating travel', error: err.message });
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
