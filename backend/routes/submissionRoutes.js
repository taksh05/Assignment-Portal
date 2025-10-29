import express from "express";
import Submission from "../models/Submission.js";

const router = express.Router();

// ✅ Get all submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("assignmentId", "title")
      .populate("studentId", "name email");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error: error.message });
  }
});

// ✅ Create new submission
router.post("/", async (req, res) => {
  try {
    const { assignmentId, studentId, content } = req.body;
    const submission = new Submission({
      assignmentId,
      studentId,
      content,
      submittedAt: new Date(),
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error submitting assignment", error: error.message });
  }
});

export default router;
