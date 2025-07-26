import e from "express";
import { createTravel, getAllTravels, updateTravel } from "../controller/travelController.js";

const router = e.Router();

router.get('/', getAllTravels);
router.post('/', createTravel);
router.put('/:id', updateTravel);

export default router;