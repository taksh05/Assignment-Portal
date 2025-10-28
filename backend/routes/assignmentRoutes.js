import express from 'express';
import multer from 'multer'; // <-- Make sure multer is installed (npm install multer)
import path from 'path';   // <-- Node.js path module
import fs from 'fs';     // <-- Node.js file system module
import Assignment from '../models/Assignment.js'; // <-- Correct model import
import Class from '../models/Class.js'; // <-- Correct model import
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/assignments/'; // Assignments files go here
    fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Unique filename: userId-fieldname-timestamp-random-ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});
// --- End Multer Config ---


// GET all assignments for the logged-in user's classes
router.get('/', protect, async (req, res, next) => {
    try {
        const userClasses = await Class.find({ $or: [{ teacher: req.user.id }, { members: req.user.id }]}).select('_id');
        const classIds = userClasses.map(c => c._id);
        const assignments = await Assignment.find({ class: { $in: classIds } })
            .populate('class', 'title') // Populate class title
            .sort({ dueDate: 1 });
        res.json(assignments);
    } catch (error) {
       next(error); // Pass errors to global handler
    }
});

// POST (CREATE) a new assignment with optional file upload
// Apply multer middleware: upload.single('file')
router.post('/', protect, upload.single('file'), async (req, res, next) => {
    const { title, description, dueDate, classId } = req.body;
    // Role check
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting unauthorized file:", err);});
        return res.status(403).json({ message: 'User not authorized' });
    }
    try {
        // Validation
        if (!title || !dueDate || !classId) {
             if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting file due to missing fields:", err);});
            return res.status(400).json({ message: 'Missing required fields (title, dueDate, classId).' });
        }
        const parentClass = await Class.findById(classId);
        if (!parentClass) {
             if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting file for non-existent class:", err);});
            return res.status(404).json({ message: 'Class not found' });
        }
        if (parentClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting unauthorized file:", err);});
            return res.status(403).json({ message: 'User not authorized for this class' });
        }

        // Create assignment data, including filePath from multer
        const newAssignmentData = {
            title, description, dueDate, class: classId, createdBy: req.user.id,
            filePath: req.file ? req.file.path.replace(/\\/g, "/") : undefined // Get path from req.file
        };

        const newAssignment = new Assignment(newAssignmentData);
        const savedAssignment = await newAssignment.save();
        await savedAssignment.populate('class', 'title'); // Populate before sending
        res.status(201).json(savedAssignment);
    } catch (error) {
        // Cleanup uploaded file if DB save fails
        if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting file after DB error:", err);});
        next(error); // Pass error to global handler
    }
});


// PUT (UPDATE) an assignment with optional file upload
// Apply multer middleware: upload.single('file')
router.put('/:id', protect, upload.single('file'), async (req, res, next) => {
    const { title, description, dueDate, removeExistingFile } = req.body;
    const assignmentId = req.params.id;
     // Role check
     if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting unauthorized file:", err);});
        return res.status(403).json({ message: 'User not authorized' });
    }
    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
             if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting file for non-existent assignment:", err);});
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const parentClass = await Class.findById(assignment.class);
         // Authorization check
        if (!parentClass || (parentClass.teacher.toString() !== req.user.id && req.user.role !== 'admin')) {
            if (req.file) fs.unlink(req.file.path, (err) => { if(err) console.error("Error deleting unauthorized file:", err);});
            return res.status(403).json({ message: 'User not authorized for this class' });
        }

        // --- File Handling Logic ---
        let oldFilePath = assignment.filePath;
        let newFilePath = oldFilePath;

        if (req.file) { // New file uploaded?
            newFilePath = req.file.path.replace(/\\/g, "/");
            if (oldFilePath && oldFilePath !== newFilePath) { // Delete old if different
                fs.unlink(oldFilePath, (err) => { if (err) console.error("Error deleting old assignment file:", err); });
            }
        } else if (removeExistingFile === 'true' && oldFilePath) { // Remove existing checked?
            newFilePath = undefined;
             fs.unlink(oldFilePath, (err) => { if (err) console.error("Error removing existing assignment file:", err); });
        }
        // --- End File Handling ---

        // Update assignment fields
        assignment.title = title || assignment.title;
        assignment.description = description !== undefined ? description : assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.filePath = newFilePath; // Update filePath

        const updatedAssignment = await assignment.save();
        await updatedAssignment.populate('class', 'title'); // Populate before sending
        res.json(updatedAssignment);
    } catch (err) {
        // Cleanup newly uploaded file if DB error occurs
        if (req.file && (!assignment || assignment.filePath !== req.file.path.replace(/\\/g, "/"))) {
             fs.unlink(req.file.path, (unlinkErr) => { if(unlinkErr) console.error("Error deleting new file after DB error:", unlinkErr);});
        }
        next(err); // Pass error to global handler
    }
});


// DELETE an assignment (and its associated file)
router.delete('/:id', protect, async (req, res, next) => {
     // Role check
     if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'User not authorized' });
    }
    try {
        // Find first to get file path
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // Authorization check
        const parentClass = await Class.findById(assignment.class);
        if (!parentClass || (parentClass.teacher.toString() !== req.user.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'User not authorized for this class' });
        }

        // --- Delete Associated File ---
        const filePathToDelete = assignment.filePath;
        if (filePathToDelete) {
            fs.unlink(filePathToDelete, (err) => {
                if (err) console.error("Error deleting assignment file:", err); // Log error but continue
                else console.log("Assignment file deleted:", filePathToDelete);
            });
        }
        // --- End File Deletion ---

        // Delete DB record
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        next(err); // Pass error to global handler
    }
});

// GET assignments for a specific class
router.get('/class/:classId', protect, async (req, res, next) => {
    try {
        const { classId } = req.params;
        // Optional: Check if user is member/teacher of classId
        const assignments = await Assignment.find({ class: classId })
                                            .sort({ dueDate: -1 })
                                            .populate('createdBy', 'name'); // Populate creator name
        res.json(assignments);
    } catch(err) {
        next(err);
    }
});


export default router;

