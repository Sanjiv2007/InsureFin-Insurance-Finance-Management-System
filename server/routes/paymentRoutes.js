import { Router } from 'express';
import { payPremium, getClientPayments, getAllPayments } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isStaff, isClient } from '../middleware/roleMiddleware.js';

const router = Router();

// Client payment execution and personal payment history
router.post('/pay', verifyToken, isClient, payPremium);
router.get('/my-payments', verifyToken, isClient, getClientPayments);

// Staff and Admin can view all payments
router.get('/', verifyToken, isStaff, getAllPayments);

export default router;
