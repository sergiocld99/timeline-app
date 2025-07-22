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

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, zipcode, notes } = req.body;

  Location.findByIdAndUpdate(id, { name, latitude, longitude, zipcode, notes }, { new: true })
    .then(updatedLocation => {
      if (!updatedLocation) {
        return res.status(404).json({ message: 'Location not found' });
      }
      res.json(updatedLocation);
    })
    .catch(err => {
      res.status(400).json({ message: 'Error updating location', error: err.message });
    }
  );
});

export default router;