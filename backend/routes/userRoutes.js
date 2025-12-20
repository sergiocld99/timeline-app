import e from "express";
import {
  checkGuestData,
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  migrateGuestData,
  updateUser
} from "../controller/userController.js";

const router = e.Router();

router.get('/', getAllUsers);
router.get('/check-guest-data', checkGuestData);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.post('/:userId/migrate', migrateGuestData);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;

