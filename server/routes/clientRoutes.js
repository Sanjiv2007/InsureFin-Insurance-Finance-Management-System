import { Router } from 'express';
import { getAllClients, getClientById, updateKYCStatus, getAllStaff } from '../controllers/clientController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isStaff } from '../middleware/roleMiddleware.js';

const router = Router();

// Staff and Admin can view clients and staff lists
router.use(verifyToken, isStaff);

router.get('/', getAllClients);
router.get('/staff-list', getAllStaff);
router.get('/:id', getClientById);
router.put('/:id/kyc', updateKYCStatus);

export default router;
