import e from 'express';
import { calculateVisitsController, createVisit, getAllVisits, persistIfNeeded } from '../controller/visitController.js';

const router = e.Router();

router.get('/', getAllVisits);
router.get('/calculate/:date', calculateVisitsController, persistIfNeeded);
router.post('/', createVisit);

export default router;