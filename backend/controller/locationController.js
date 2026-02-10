import Location from "../models/Location.js";

export const getAllLocations = (req, res) => {
  Location.find().sort({ zipcode: 1, name: 1 }).then(locations => {
    res.json(locations);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching locations', error: err.message });
  });
}

export const createLocation = (req, res) => {
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
}

export const updateLocation = (req, res) => {
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
}

export const deleteLocation = (req, res) => {
  const { id } = req.params;

  Location.findByIdAndDelete(id)
    .then(deletedLocation => {
      if (!deletedLocation) {
        return res.status(404).json({ message: 'Location not found' });
      }
      res.status(204).send();
    })
    .catch(err => {
      res.status(400).json({ message: 'Error deleting location', error: err.message });
    }
    );
}