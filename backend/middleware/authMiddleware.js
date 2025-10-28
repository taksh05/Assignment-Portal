import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Make sure the path to your user model is correct

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the token exists in the header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token's signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. ✅ Use the ID from the token to find the user in the database
      // This attaches the full user object (minus the password) to the request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 5. Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export default protect;