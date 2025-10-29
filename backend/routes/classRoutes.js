import express from "express";
import Class from "../models/Class.js";
import User from "../models/user.js";

const router = express.Router();

// ✅ Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find().populate("teacher", "name email");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes", error: error.message });
  }
});

// ✅ Create a new class
router.post("/", async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;
    const newClass = new Class({ title, description, teacher: teacherId });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Error creating class", error: error.message });
  }
});

// ✅ Get single class details
router.get("/:id", async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate("teacher", "name email");
    if (!classData) return res.status(404).json({ message: "Class not found" });
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching class details", error: error.message });
  }
});

export default router;
