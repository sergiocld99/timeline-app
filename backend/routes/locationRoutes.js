import e from "express";
import { createLocation, getAllLocations, updateLocation } from "../controller/locationController.js";

const router = e.Router();

router.get('/', getAllLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);

export default router;