import e from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser
} from "../controller/userController.js";

const router = e.Router();

router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;

