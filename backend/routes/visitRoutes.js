import e from 'express';
import { calculateVisitsController, getAllVisits, persistIfNeeded } from '../controller/visitController.js';

const router = e.Router();

router.get('/', getAllVisits);
router.get('/calculate/:date', calculateVisitsController, persistIfNeeded);

export default router;