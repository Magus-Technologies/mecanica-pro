const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ success: false, message: 'Token requerido' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token inválido' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token expirado o inválido' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ success: false, message: 'Sin permisos' });
  next();
};

module.exports = { authMiddleware, requireRole };
