import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import path from "path";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import classRoutes from "./routes/classRoutes.js";

dotenv.config();
const app = express();

// ============================
// 🌐 Middleware
// ============================
app.use(express.json());
app.use(helmet());

// ✅ CORS Configuration (Vercel + Local + Render-safe)
const allowedOrigins = [
  "https://assignment-portal-xi.vercel.app", // your frontend
  "https://assignment-portal-86z6.vercel.app", // your backend on Vercel
  "http://localhost:5173", // local dev
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Rate Limiter for safety
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ============================
// 📦 Routes
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classes", classRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "🎓 Assignment Portal API is running successfully 🚀" });
});

// ============================
// ⚙️ MongoDB Connection
// ============================
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing from environment variables");
  process.exit(1);
}

// ✅ Important for Render: bind to 0.0.0.0
const PORT = process.env.PORT || 6000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚡ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
