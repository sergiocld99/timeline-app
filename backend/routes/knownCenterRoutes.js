import e from "express";
import { getNearKnownCenters } from "../controller/knownCenterController.js";

const router = e.Router();

router.get('/', getNearKnownCenters);

export default router;