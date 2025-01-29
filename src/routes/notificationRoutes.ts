import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

router.post('/', protect, notificationController.createNotification);
router.get('/', protect, notificationController.getUserNotifications);

export default router;