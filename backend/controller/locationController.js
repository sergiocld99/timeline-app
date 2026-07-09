import Location from "../models/Location.js";
import Travel from "../models/Travel.js";
import Visit from "../models/Visit.js";

export const getAllLocations = (req, res) => {
  Location.find().sort({ zipcode: 1, name: 1 }).then(locations => {
    res.json(locations);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching locations', error: err.message });
  });
}

export const createLocation = (req, res) => {
  const { name, latitude, longitude, zipcode, notes, partido } = req.body;

  const location = new Location({
    name,
    latitude,
    longitude,
    zipcode,
    notes,
    partido
  });

  location.save().then(savedLocation => {
    res.status(201).json(savedLocation);
  }).catch(err => {
    res.status(400).json({ message: 'Error creating location', error: err.message });
  });
}

export const updateLocation = (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, zipcode, notes, partido } = req.body;

  Location.findByIdAndUpdate(id, { name, latitude, longitude, zipcode, notes, partido }, { new: true })
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

export const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    // Check for associated travels
    const travelsCount = await Travel.countDocuments({
      $or: [{ origin: id }, { destination: id }]
    });

    if (travelsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete location: It has associated travels.'
      });
    }

    // Check for associated visits
    const visitsCount = await Visit.countDocuments({ location: id });

    if (visitsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete location: It has associated visits.'
      });
    }

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting location', error: err.message });
  }
}