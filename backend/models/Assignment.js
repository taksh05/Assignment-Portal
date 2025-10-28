import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // The teacher who created the assignment
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW FIELD for attached file path
    filePath: {
        type: String,
        required: false, // Optional
    },
  },
  { timestamps: true }
);

// Use mongoose.model directly for simpler export
const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;

