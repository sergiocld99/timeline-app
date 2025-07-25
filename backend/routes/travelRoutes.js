import e from "express";
import Travel from "../models/Travel.js";

const router = e.Router();

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

router.get('/', (req, res) => {
  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find().populate('origin destination').sort({ startTime: -1 }).then(travels => {
    travels = travels.map(t => ({
      ...t.toObject(),
      shortDate: buildShortDate(t.startTime),
      duration: calculateDuration(t.startTime, t.endTime),
      speed: (t.distance / calculateDuration(t.startTime, t.endTime)) * 60 // speed in km/h
    }));

    res.json(travels);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching travels', error: err.message });
  });
});

router.post('/', (req, res) => {
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
});

router.put('/:id', (req, res) => {
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
});

export default router;