import express from 'express';
import User from '../models/User.js';
import Class from '../models/Class.js';
import protect from '../middleware/authMiddleware.js';
import adminProtect from '../middleware/adminMiddleware.js';

const router = express.Router();

// GET all users (Admin Only)
router.get('/users', protect, adminProtect, async (req, res) => {
  try {
    // ✅ Fixed: select '-password' to hide the hashed password
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET all classes (Admin Only)
router.get('/classes', protect, adminProtect, async (req, res) => {
  try {
    // ✅ Fixed: populate 'teacher' field
    const classes = await Class.find({}).populate('teacher', 'name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;