import express from "express";
import Assignment from "../models/Assignment.js";

const router = express.Router();

// ✅ Get all assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("classId", "title");
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error: error.message });
  }
});

// ✅ Create new assignment
router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, classId } = req.body;
    const newAssignment = new Assignment({ title, description, dueDate, classId });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ message: "Error creating assignment", error: error.message });
  }
});

export default router;
