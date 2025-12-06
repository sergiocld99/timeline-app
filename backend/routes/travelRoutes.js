import e from "express";
import {
  buildGraph,
  createTravel,
  deleteTravel,
  exportTravelsCsv,
  getAllTravels,
  updateTravel
} from "../controller/travelController.js";

const router = e.Router();

router.get('/', getAllTravels);
router.post('/', createTravel);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);

router.get('/graph', buildGraph);
router.post('/v2', getAllTravels)
router.get('/export/csv', exportTravelsCsv);

export default router;