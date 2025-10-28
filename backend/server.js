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

dotenv.config(); // Load environment variables
const app = express();

// ============================
// 🔒 SECURITY + BASIC SETUP
// ============================
app.use(helmet());
app.use(express.json());

// ✅ Dynamic CORS Setup (allow frontend + localhost)
const allowedOrigins = [
  "https://assignment-portal-xi.vercel.app", // frontend (Vercel)
  "https://assignment-portal-ten.vercel.app", // backend (Vercel)
  "http://localhost:5173", // local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Rate Limiting (for login and auth routes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});

// ============================
// 📁 FILE UPLOADS DIRECTORY
// ============================
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, "uploads");

// 🧠 Important: disable folder creation on Vercel (read-only file system)
if (process.env.NODE_ENV !== "production") {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
}

app.use("/uploads", express.static(uploadsDir));

// ============================
// 🚏 API ROUTES
// ============================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ============================
// 🧭 DEFAULT + ERROR HANDLERS
// ============================
app.get("/", (req, res) => {
  res.json({
    message: "🎓 Assignment Portal API is running successfully 🚀",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ============================
// 🌐 MONGODB CONNECTION
// ============================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
