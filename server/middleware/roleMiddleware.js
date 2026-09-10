/**
 * Role-Based Authorization Middleware
 * Ensures users only access routes permitted for their specific role
 */

export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }
  next();
}

export function isStaff(req, res, next) {
  if (!req.user || (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Staff privileges required.'
    });
  }
  next();
}

export function isClient(req, res, next) {
  if (!req.user || req.user.role !== 'CLIENT') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Client privileges required.'
    });
  }
  next();
}
