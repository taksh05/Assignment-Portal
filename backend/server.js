import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url"; // ✅ ES Module fix

// ✅ Resolve __dirname in ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();

// ✅ Security middleware
app.use(helmet());

// ✅ CORS setup (for frontend & localhost)
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || [
    "https://assignment-portal-nine.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Rate limiter (mainly for auth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});

// ✅ Body parser
app.use(express.json());

// ❌ Remove local uploads folder creation (Vercel is read-only)
// Vercel does not allow writing to the file system (use Cloudinary or S3 for uploads)
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }
// app.use("/uploads", express.static(uploadsDir));

// ✅ Import routes (must all use ES module syntax)
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ✅ Use routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Base route
app.get("/", (req, res) => {
  res.json({ message: "🎓 Assignment Portal API is running successfully 🚀" });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Connect MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
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
