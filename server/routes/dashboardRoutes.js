import { Router } from 'express';
import { getAdminDashboard, getStaffDashboard, getClientDashboard } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isAdmin, isStaff, isClient } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/admin', verifyToken, isAdmin, getAdminDashboard);
router.get('/staff', verifyToken, isStaff, getStaffDashboard);
router.get('/client', verifyToken, isClient, getClientDashboard);

export default router;
