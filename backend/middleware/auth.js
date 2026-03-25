const jwt = require('jsonwebtoken');

const authenticateAuthority = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    // Allow if role is official, admin, or authority
    if (['official', 'admin', 'authority'].includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied: Authorities only' });
    }
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const authenticateAdmin = (req, res, next) => {
  authenticateAuthority(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied: Admins only' });
    }
  });
};

module.exports = {
  authenticateAuthority,
  authenticateAdmin
};
