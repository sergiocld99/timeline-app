import e from "express";
import Location from "../models/Location.js";

const router = e.Router();

router.get('/', (req, res) => {
  Location.find().then(locations => {
    res.json(locations);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching locations', error: err.message });
  });
})

router.post('/', (req, res) => {
  const { name, latitude, longitude, zipcode, notes } = req.body;

  const location = new Location({
    name,
    latitude,
    longitude,
    zipcode,
    notes
  });

  location.save().then(savedLocation => {
    res.status(201).json(savedLocation);
  }).catch(err => {
    res.status(400).json({ message: 'Error creating location', error: err.message });
  });
});

export default router;