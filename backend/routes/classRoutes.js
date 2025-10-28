import express from "express";
import Class from "../models/Class.js";
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/classes - Create a new class
router.post("/", protect, async (req, res) => {
  // Only teachers can create classes
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') { // Allow admin too
    return res.status(403).json({ message: "Access denied. Only teachers or admins can create classes." });
  }

  try {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Please provide a class title." });
    }

    const newClass = new Class({
      title,
      description,
      teacher: req.user.id, // Set the teacher as the logged-in user
      members: [req.user.id], // The teacher is also a member
    });

    const savedClass = await newClass.save();
    // Populate teacher info before sending back
    await savedClass.populate('teacher', 'name'); 
    res.status(201).json(savedClass);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// --- ADD THIS ROUTE ---
// PUT /api/classes/:id - Update an existing class
router.put("/:id", protect, async (req, res) => {
  // Only the teacher who owns the class (or admin) can update it
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
     return res.status(403).json({ message: "Access denied." });
  }

  try {
    const { title, description } = req.body;
    const classId = req.params.id;

    if (!title) {
        return res.status(400).json({ message: "Class title cannot be empty." });
    }

    const existingClass = await Class.findById(classId);

    if (!existingClass) {
        return res.status(404).json({ message: "Class not found." });
    }

    // Check if the user is the teacher of this class or an admin
    if (existingClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
         return res.status(403).json({ message: "You are not authorized to edit this class." });
    }

    // Update the class fields
    existingClass.title = title;
    existingClass.description = description;

    const updatedClass = await existingClass.save();
    // Populate teacher info before sending back
    await updatedClass.populate('teacher', 'name'); 
    res.status(200).json(updatedClass);

  } catch (err) {
    console.error("Error updating class:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
// --- END OF ADDED ROUTE ---


// GET /api/classes/all - Get all existing classes (for students to browse/join)
router.get('/all', protect, async (req, res) => {
    try {
        const classes = await Class.find({}).populate('teacher', 'name');
        res.json(classes);
    } catch (err) {
        console.error("Error fetching all classes:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/classes - Get all classes the user is enrolled in or teaches
router.get("/", protect, async (req, res) => {
  try {
    const classes = await Class.find({
      $or: [{ teacher: req.user.id }, { members: req.user.id }],
    }).populate('teacher', 'name'); // Populate teacher name
    res.json(classes);
  } catch (err) {
    console.error("Error fetching user's classes:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/classes/:id/join - Student joins a class
router.post('/:id/join', protect, async (req, res) => {
    // Only students can join
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Only students can join classes."});
    }
    try {
        const aClass = await Class.findById(req.params.id);
        if (!aClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        // Check if user is the teacher (teachers can't join their own class as a student)
        if (aClass.teacher.toString() === req.user.id) {
             return res.status(400).json({ message: 'Teachers cannot join their own class.' });
        }
        if (aClass.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already a member of this class.' });
        }
        aClass.members.push(req.user.id);
        await aClass.save();
        res.json({ message: 'Successfully joined class' });
    } catch (err) {
        console.error("Error joining class:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/classes/:id - Delete a class
router.delete('/:id', protect, async (req, res) => {
    // Only the teacher who owns the class (or admin) can delete it
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        const aClass = await Class.findById(req.params.id);
        if (!aClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        // Check if the user is the teacher or an admin
        if (aClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this class.' });
        }
        // Use findByIdAndDelete for cleaner code
        await Class.findByIdAndDelete(req.params.id); 
        // TODO: Optionally delete related assignments and submissions
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        console.error("Error deleting class:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;

