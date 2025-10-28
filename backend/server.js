import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// ✅ Security
app.use(helmet());

// ✅ CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Try again later.",
});

app.use(express.json());

// ⚠️ Disable local uploads for Vercel (filesystem is read-only)
// If you later host on Render/Render/EC2, you can re-enable this
// app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "🎓 Assignment Portal API running successfully 🚀" });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// ✅ Export app for Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`⚡ Server running locally on port ${PORT}`));
}
