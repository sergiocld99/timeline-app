import e from "express";
import { createLocation, getAllLocations, updateLocation, deleteLocation } from "../controller/locationController.js";

const router = e.Router();

router.get('/', getAllLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;