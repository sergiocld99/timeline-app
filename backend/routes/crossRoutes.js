import e from "express";
import { create, getAll, update, remove } from "../controller/crossController.js";

const router = e.Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;