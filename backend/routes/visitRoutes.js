import e from 'express';
import { calculateVisitsForDate } from '../services/visitService.js';

const router = e.Router();

router.get('/calculate/:date', async (req, res) => {
  const visits = await calculateVisitsForDate(req.params.date);
  res.json(visits);
})

export default router;