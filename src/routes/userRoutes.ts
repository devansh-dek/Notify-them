import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.put('/profile', protect, userController.updateProfile);

export default router;