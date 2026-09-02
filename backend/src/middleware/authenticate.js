const { verifyToken } = require('../utils/token');
const AppError = require('../utils/AppError');
const userStore = require('../models/userStore');


function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const decoded = verifyToken(token);

    const user = userStore.findById(decoded.id);
    if (!user) {
      return next(new AppError('Authentication required.', 401));
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return next(new AppError('Invalid or expired token.', 401));
  }
}

module.exports = authenticate;
