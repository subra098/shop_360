import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
       return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized, admin or super admin required' });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'SUPERADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized, super admin only' });
  }
};
