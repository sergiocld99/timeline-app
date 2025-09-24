import e from 'express'
import { getTopVisitedLocations, getTravelStatsByMode } from '../controller/statsController.js';

const router = e.Router();

router.get('/visits', getTopVisitedLocations)
router.get('/travels/by-mode', getTravelStatsByMode);

export default router;