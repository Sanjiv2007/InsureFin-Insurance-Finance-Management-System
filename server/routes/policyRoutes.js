import { Router } from 'express';
import {
  getCatalog,
  applyPolicy,
  getClientPolicies,
  getAllPolicies,
  reviewPolicy,
  createPolicyAdmin,
  deletePolicy
} from '../controllers/policyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { isAdmin, isStaff, isClient } from '../middleware/roleMiddleware.js';

const router = Router();

// Public / Authenticated catalog
router.get('/catalog', getCatalog);

// Client policy routes
router.post('/apply', verifyToken, isClient, applyPolicy);
router.get('/my-policies', verifyToken, isClient, getClientPolicies);

// Staff and Admin routes
router.get('/', verifyToken, isStaff, getAllPolicies);
router.put('/:id/review', verifyToken, isStaff, reviewPolicy);

// Admin-only creation and deletion
router.post('/', verifyToken, isAdmin, createPolicyAdmin);
router.delete('/:id', verifyToken, isAdmin, deletePolicy);

export default router;
