import express from "express";
import User from "../models/user.js";
import Class from "../models/Class.js";

const router = express.Router();

// ✅ Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// ✅ Fetch all classes
router.get("/classes", async (req, res) => {
  try {
    const classes = await Class.find().populate("teacher", "name email");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes", error: error.message });
  }
});

export default router;
