import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import multer from "multer"; // <-- THIS LINE IS ADDED

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// ====== Security Middlewares ======
app.use(helmet());
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5174",
  credentials: true,
};
app.use(cors(corsOptions));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// ====== General Middlewares ======
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created 'uploads' directory.");
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// ====== API Routes ======
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ====== Default Route for Health Check ======
app.get("/", (req, res) => {
  res.json({ message: "🎓 Classroom Portal API is running successfully 🚀" });
});

// ====== 404 Not Found Fallback ======
app.use((req, res) => {
  res.status(404).json({ message: "❌ The requested route does not exist" });
});

// ====== Global Error Handler ======
app.use((err, req, res, next) => {
  console.error("🔥 An unexpected error occurred:", err);
  // Multer error handling (now safe to use)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ====== Connect to MongoDB & Start Server ======
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    app.listen(PORT, () => console.log(`⚡ Server is listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

