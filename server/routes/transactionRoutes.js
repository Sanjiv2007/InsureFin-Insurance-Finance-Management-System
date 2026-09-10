import { Router } from 'express';
import { getTransactions, getFinancialSummary } from '../controllers/transactionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isStaff } from '../middleware/roleMiddleware.js';

const router = Router();

// Transactions list (clients get personal transactions, staff/admin get all)
router.get('/', verifyToken, getTransactions);

// Financial summary (Staff and Admin)
router.get('/summary', verifyToken, isStaff, getFinancialSummary);

export default router;
