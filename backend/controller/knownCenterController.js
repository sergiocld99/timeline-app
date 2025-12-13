import { getNearLocations } from "../services/knownCenterService.js";

export const getNearKnownCenters = (req, res) => {
  const { latitude, longitude, radiusKm = 10, limit = 3 } = req.query;

  const numberCastings = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    radiusKm: Number(radiusKm),
    limit: Number(limit),
  };

  getNearLocations(numberCastings).then(locations => {
    res.json(locations);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching near known centers', error: err.message });
  });
}