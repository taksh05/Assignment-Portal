import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ============================
// ✅ FIXED: CORS — allow all
// ============================
app.use(
  cors({
    origin: "*", // allows all — for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// ============================
// 🧱 Middleware setup
// ============================
app.use(helmet());
app.use(express.json());

// ============================
// 📁 File Upload Directory
// ============================
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// ============================
// 🚏 Routes
// ============================
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ============================
// 🧭 Default Routes
// ============================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🎓 Assignment Portal Backend is running successfully 🚀",
  });
});

// ============================
// ❌ 404 + Error Handler
// ============================
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ============================
// 🌐 DB + Server Start
// ============================
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err.message));
