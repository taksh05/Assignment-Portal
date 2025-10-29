import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import multer from "multer";
import cors from "cors";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ============================
// 🔒 SECURITY + BASIC SETUP
// ============================
app.use(helmet());
app.use(express.json());

// ✅ FIXED: Proper CORS middleware for Vercel + Render + Localhost
app.use(
  cors({
    origin: [
      "https://assignment-portal-xi.vercel.app", // Frontend (Vercel)
      "https://assignment-portal-tx7l.onrender.com", // Backend (Render)
      "http://localhost:5173", // Local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());

// ============================
// 📁 FILE UPLOADS DIRECTORY
// ============================
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// ============================
// 🚏 ROUTES
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ============================
// 🧭 DEFAULT + ERROR HANDLERS
// ============================
app.get("/", (req, res) => {
  res.json({ message: "🎓 Assignment Portal Backend running successfully 🚀" });
});

app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ============================
// 🌐 DATABASE + SERVER START
// ============================
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
