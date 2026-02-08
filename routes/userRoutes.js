import express from 'express';
const router = express.Router();
import { authUser, registerUser, getUsers, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/login', authUser);
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

export default router;