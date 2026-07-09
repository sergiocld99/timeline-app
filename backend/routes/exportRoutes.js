import e from 'express';
import { getQuarters, getTravelsExport } from '../controller/exportController.js';

const router = e.Router();

router.get('/quarters', getQuarters);
router.get('/travels', getTravelsExport);

export default router;
