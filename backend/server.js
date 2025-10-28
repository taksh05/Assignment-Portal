import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import multer from "multer";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ---------------- SECURITY ----------------
app.use(helmet());
app.use(express.json());

// ✅ FIXED CORS (explicitly allow frontend + localhost)
app.use(
  cors({
    origin: [
      "https://assignment-portal-xi.vercel.app", // your deployed frontend
      "https://assignment-portal-ten.vercel.app", // your deployed backend (vercel)
      "http://localhost:5173", // local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ---------------- RATE LIMIT ----------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});
app.use("/api/auth", authLimiter, authRoutes);

// ---------------- FILE UPLOADS ----------------
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// ---------------- ROUTES ----------------
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🎓 Assignment Portal API working fine 🚀" });
});

// ---------------- ERROR HANDLING ----------------
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  if (err instanceof multer.MulterError)
    return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ---------------- DATABASE CONNECTION ----------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
