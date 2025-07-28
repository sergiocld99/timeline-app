import e from 'express'
import { getTopVisitedLocations } from '../controller/statsController.js';

const router = e.Router();

router.get('/visits', getTopVisitedLocations)

export default router;