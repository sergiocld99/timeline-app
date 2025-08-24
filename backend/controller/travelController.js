import Travel from "../models/Travel.js";
import { getDateFrom, getDateTo, withWeight } from "../utils/index.js";

const buildShortDate = (date) => {
  let dateParts = date.toISOString().split('T')[0].split('-');
  let timeParts = date.toISOString().split('T')[1].split(':');
  return `${dateParts[2]}/${dateParts[1]} ${timeParts[0]}:${timeParts[1]}`; // DD/MM HH:mm format
};

const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60); // duration in minutes
};

export const getAllTravels = (req, res) => {
  const dateFrom = getDateFrom(req)
  const dateTo = getDateTo(req)

  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find({ startTime: { $gte: dateFrom }, endTime: { $lte: dateTo } })
  .populate('origin destination').sort({ startTime: -1 }).then(travels => {
    travels = travels.map(t => {
      const duration = calculateDuration(t.startTime, t.endTime)

      t.set('shortDate', buildShortDate(t.startTime), { strict: false })
      t.set('duration', duration, { strict: false })
      t.set('speed', (t.distance / duration) * 60, { strict: false })

      return t
    })

    res.json(withWeight(travels, 'duration'));
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching travels', error: err.message });
  });
}

export const createTravel = (req, res) => {
  const { startTime, endTime, origin, destination, modeOfTransport, distance } = req.body;

  const travel = new Travel({
    startTime,
    endTime,
    origin,
    destination,
    modeOfTransport,
    distance
  });

  travel.save().then(savedTravel => {
    res.status(201).json(savedTravel);
  }).catch(err => {
    res.status(400).json({ message: 'Error creating travel', error: err.message });
  });
}

export const updateTravel = (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, origin, destination, modeOfTransport, distance } = req.body;

  Travel.findByIdAndUpdate(id, { startTime, endTime, origin, destination, modeOfTransport, distance }, { new: true })
    .populate('origin destination')
    .then(updatedTravel => {
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel not found' });
      }
      updatedTravel.shortDate = buildShortDate(updatedTravel.startTime);
      updatedTravel.duration = calculateDuration(updatedTravel.startTime, updatedTravel.endTime);
      updatedTravel.speed = (updatedTravel.distance / updatedTravel.duration) * 60; // speed in km/h
      res.json(updatedTravel);
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