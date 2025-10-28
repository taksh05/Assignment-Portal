import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The 'link' is now optional, for old submissions
    link: {
      type: String,
      required: false, // No longer required
    },
    // The new 'filePath' for file uploads
    filePath: {
      type: String,
      required: false, // Set to false to allow either a link or a file
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'pending'], // Added 'pending'
      default: 'submitted',
    },
    grade: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// We remove the unique index to allow students to resubmit if needed.
// submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

