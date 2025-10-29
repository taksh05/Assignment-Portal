import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "https://assignment-portal-xi.vercel.app",  // Your Vercel frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// =====================================
// 🌍 CORS CONFIGURATION
// =====================================
// Allow only your frontend hosted on Vercel
app.use(
  cors({
    origin: "https://assignment-portal-xi.vercel.app", // your deployed frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if you use tokens/cookies
  })
);

// Handle preflight requests (OPTIONS)
app.options("*", cors());

// =====================================
// 🧩 BASIC MIDDLEWARE
// =====================================
app.use(express.json());

// =====================================
// 📁 FILE UPLOAD DIRECTORY SETUP
// =====================================
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// =====================================
// 🚏 ROUTES
// =====================================
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// =====================================
// 🏠 DEFAULT ROUTE
// =====================================
app.get("/", (req, res) => {
  res.json({
    message: "✅ Assignment Portal Backend is live and CORS enabled!",
  });
});

// =====================================
// ❌ ERROR HANDLING
// =====================================
// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File Upload Error: ${err.message}` });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// =====================================
// 🌐 DATABASE + SERVER STARTUP
// =====================================
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env file!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
