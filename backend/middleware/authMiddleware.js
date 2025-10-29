import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Ensure this path is correct

const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check for Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ❌ No token case
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // ✅ Verify token and attach user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default protect;
