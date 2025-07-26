import e from 'express';
import { calculateVisitsController } from '../controller/visitController.js';

const router = e.Router();

router.get('/calculate/:date', calculateVisitsController);

export default router;