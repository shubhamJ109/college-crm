const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token (supports short-lived "hold" tokens)
exports.protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ success:false, message:'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only these endpoints accept a hold-scope token
    const fullPath = req.originalUrl || `${req.baseUrl || ''}${req.path || ''}`;
    const holdAllowed =
      fullPath.startsWith('/api/auth/me') ||
      fullPath.startsWith('/api/users/access/verify-employee-id');
    if (decoded.scope === 'hold' && !holdAllowed) {
      return res.status(403).json({ success:false, message:'Hold token not allowed here' });
    }

    // Attach minimal user info from token; controllers/middleware can fetch full user if needed
    req.user = { id: decoded.id, _id: decoded.id, role: decoded.role, scope: decoded.scope || 'full' };
    next();
  } catch (e) {
    return res.status(401).json({ success:false, message:'Not authorized' });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
