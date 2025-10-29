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

// ✅ UNIVERSAL CORS FIX (Allows everything)
app.use(cors()); // 🚀 Allow ALL origins, methods, headers (no restrictions)
app.options("*", cors());

// Middleware
app.use(express.json());

// 📂 File Upload Handling
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend is LIVE and CORS is fully open!" });
});

// ❌ 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// 🧱 Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File Upload Error: ${err.message}` });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 🌐 Database + Server
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

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
