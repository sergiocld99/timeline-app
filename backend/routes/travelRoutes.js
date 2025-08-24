import e from "express";
import { createTravel, deleteTravel, getAllTravels, updateTravel } from "../controller/travelController.js";

const router = e.Router();

router.get('/', getAllTravels);
router.post('/', createTravel);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);

export default router;