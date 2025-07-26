import e from 'express';
import { calculateVisitsController, getAllVisits } from '../controller/visitController.js';

const router = e.Router();

router.get('/', getAllVisits);
router.get('/calculate/:date', calculateVisitsController);

export default router;