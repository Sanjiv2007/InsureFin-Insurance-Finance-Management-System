import { Router } from 'express';
import { fileClaim, getClientClaims, getAllClaims, reviewClaim } from '../controllers/claimController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isStaff, isClient } from '../middleware/roleMiddleware.js';

const router = Router();

// Client claim operations
router.post('/file', verifyToken, isClient, fileClaim);
router.get('/my-claims', verifyToken, isClient, getClientClaims);

// Staff and Admin claim processing
router.get('/', verifyToken, isStaff, getAllClaims);
router.put('/:id/review', verifyToken, isStaff, reviewClaim);

export default router;
