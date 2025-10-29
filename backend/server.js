import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer"; // Keep multer for file uploads
import path from "path";
import fs from "fs";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// =============================
// 🔓 OPEN ACCESS MIDDLEWARE
// =============================
// Middleware to parse JSON bodies - MUST come before routes
app.use(express.json());

// Allow absolutely everything (fixes CORS & preflight)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH" // Allow all common methods
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization" // Allow common headers
  );
  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Respond OK to OPTIONS requests
  }
  next(); // Pass control to the next middleware or route
});

// =============================
// 📂 FILE UPLOAD SUPPORT
// =============================
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// =============================
// 🚏 ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// =============================
// 🏠 DEFAULT ROUTE
// =============================
app.get("/", (req, res) => {
  res.json({ message: "✅ Assignment Portal Backend is running (OPEN CORS)" });
});

// =============================
// ❌ ERROR HANDLING
// =============================
// 404 Handler (if no routes matched)
app.use((req, res, next) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Backend Error:", err);
  // Handle Multer errors specifically if needed
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File Upload Error: ${err.message}` });
  }
  // Generic server error
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// =============================
// 🌐 DATABASE + SERVER
// =============================
const PORT = process.env.PORT || 10000; // Render uses PORT env var
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ FATAL ERROR: Missing MONGO_URI in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    // Listen on all network interfaces, required by Render
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });