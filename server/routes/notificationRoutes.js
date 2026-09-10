import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, getNotifications);
router.put('/read', verifyToken, markAsRead);

export default router;
