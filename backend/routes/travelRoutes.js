import e from "express";
import {
  createTravel,
  deleteTravel,
  getAllTravels,
  updateTravel
} from "../controller/travelController.js";
import {
  buildGraph,
  exportTravelsCsv,
  findTravels,
  findAnyTravelsToCPs
} from "../controller/travelExtras.js";

const router = e.Router();

router.get('/', getAllTravels);
router.get('/graph', buildGraph);
router.get('/export/csv', exportTravelsCsv);
router.get('/find', findTravels)

router.post('/v2', getAllTravels)
router.post('/find-any', findAnyTravelsToCPs)

router.post('/', createTravel);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);


export default router;