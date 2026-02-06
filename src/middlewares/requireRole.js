
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!userRole) {
      return res.status(400).json({ message: 'User unauthorized: Role is required.' });
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role to access this resource.' });
    }
    next();
  }
}