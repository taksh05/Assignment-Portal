import express from 'express';
import multer from 'multer'; // Import multer
import path from 'path'; // Import path
import fs from 'fs'; // Import fs for file deletion
import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Multer Configuration ---
// Configure where to store files and how to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    // Create 'uploads' directory if it doesn't exist (sync for simplicity here)
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Optional: Limit file size (e.g., 10MB)
});
// --- End of Multer Configuration ---


// GET all submissions relevant to the user
router.get('/', protect, async (req, res) => {
    try {
        let submissions;
        if (req.user.role === 'student') {
            submissions = await Submission.find({ student: req.user.id })
                .populate('assignment', 'title')
                .populate('student', 'name');
        }
        else if (req.user.role === 'teacher') {
            const userClasses = await Class.find({ teacher: req.user.id }).select('_id');
            const classIds = userClasses.map(c => c._id);
            const assignmentsInUserClasses = await Assignment.find({ class: { $in: classIds } }).select('_id');
            const assignmentIds = assignmentsInUserClasses.map(a => a._id);
            submissions = await Submission.find({ assignment: { $in: assignmentIds } })
                .populate('assignment', 'title')
                .populate('student', 'name');
        } else {
            submissions = await Submission.find({}).populate('assignment', 'title').populate('student', 'name');
        }
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST (CREATE) a new submission
// Use 'upload.single('file')' middleware to catch the file
router.post('/', protect, upload.single('file'), async (req, res) => {
    const { assignmentId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }
    
    // Check if assignmentId is provided
    if (!assignmentId) {
       // If no assignmentId, delete the orphaned file
       fs.unlink(req.file.path, (err) => {
         if (err) console.error("Error deleting orphaned file:", err);
       });
       return res.status(400).json({ message: 'No assignment was selected.' });
    }

    try {
        const newSubmission = new Submission({
            // Save the file path, relative to the server
            // e.g., "uploads/file-123456.png"
            filePath: req.file.path.replace(/\\/g, "/"), // Standardize path separators
            assignment: assignmentId,
            student: req.user.id,
            status: 'submitted', // Default status
        });
        await newSubmission.save();
        
        // Populate and send back the new submission
        const populatedSubmission = await Submission.findById(newSubmission._id)
                                          .populate('assignment', 'title')
                                          .populate('student', 'name');
                                          
        res.status(201).json(populatedSubmission);
    } catch (error) {
        console.error("Error creating submission:", error);
        // If database save fails, delete the uploaded file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file after db fail:", err);
        });
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT (UPDATE/GRADE) a submission
router.put('/:id/grade', protect, async (req, res) => {
    const { grade, feedback } = req.body;
    try {
        const submission = await Submission.findById(req.params.id).populate('assignment');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const parentClass = await Class.findById(submission.assignment.class);
        if (parentClass.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE a submission
router.delete('/:id', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('assignment');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const parentClass = await Class.findById(submission.assignment.class);
        const isTeacher = parentClass.teacher.toString() === req.user.id;
        const isOwner = submission.student.toString() === req.user.id;

        if (!isTeacher && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Delete the file from the 'uploads' folder
        if (submission.filePath) {
          fs.unlink(submission.filePath, (err) => {
            if (err) {
              console.error("Error deleting submission file:", err);
              // Don't stop the request, just log the error
            }
          });
        }
        
        await Submission.deleteOne({ _id: req.params.id }); // Use deleteOne
        res.json({ message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
