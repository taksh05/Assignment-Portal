const adminProtect = (req, res, next) => {
  // ✅ No database call needed! Just check the role on the user object.
  if (req.user && req.user.role === 'admin') {
    next(); // If the user is an admin, continue.
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export default adminProtect; 