import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middleware/auth';
const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', protect, authController.logout);


export default router;
