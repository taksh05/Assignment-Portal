import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignment.js";
import submissionRoutes from "./routes/submission.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

// Fix __dirname for ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(helmet());

// ✅ Enable CORS for your frontend domain
app.use(
  cors({
    origin: [
      "https://assignment-portal-xi.vercel.app", // Frontend deployed URL
      "http://localhost:5173", // Local dev (optional)
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Rate limiter for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
});
app.use(limiter);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Vercel-safe uploads folder (read-only fix)
const uploadsDir = path.resolve("uploads");
app.use("/uploads", express.static(uploadsDir));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🎓 Assignment Portal API working fine 🚀");
});

// ✅ MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
