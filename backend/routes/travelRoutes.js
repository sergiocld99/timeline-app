import e from "express";
import { buildGraph, createTravel, deleteTravel, getAllTravels, updateTravel } from "../controller/travelController.js";

const router = e.Router();

router.get('/', getAllTravels);
router.post('/', createTravel);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);

router.get('/graph', buildGraph);

export default router;