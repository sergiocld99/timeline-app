import e from "express";
import Travel from "../models/Travel.js";

const router = e.Router();

router.get('/', (req, res) => {
  // Fetch all travels with populated origin and destination (Location) fields
  Travel.find().populate('origin destination').then(travels => {
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

export default router;