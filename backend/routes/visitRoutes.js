import e from 'express';
import {
  calculateVisitsController,
  createVisit,
  deleteVisit,
  getAllVisits,
  persistIfNeeded,
  updateVisit
} from '../controller/visitController.js';

const router = e.Router();

router.get('/', getAllVisits);
router.get('/calculate/:date', calculateVisitsController, persistIfNeeded);
router.post('/', createVisit);
router.put('/:id', updateVisit);
router.delete('/:id', deleteVisit);

export default router;