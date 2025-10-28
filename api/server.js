// api/server.js

import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow your frontend or all
    credentials: true,
  })
);

// ---------------------------------------------------------
// 🔗 MongoDB Connection (optimized for Vercel serverless)
// ---------------------------------------------------------
if (!global._mongo) global._mongo = { conn: null, promise: null };

async function connectDB() {
  if (global._mongo.conn) return global._mongo.conn;
  if (!global._mongo.promise) {
    global._mongo.promise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((m) => m.connection);
  }
  global._mongo.conn = await global._mongo.promise;
  return global._mongo.conn;
}

connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------------------------------------------------
// 🧩 Import Routes (from your /backend/routes folder)
// ---------------------------------------------------------
import authRoutes from "../backend/routes/authRoutes.js";
import classRoutes from "../backend/routes/classRoutes.js";
import assignmentRoutes from "../backend/routes/assignmentRoutes.js";
import submissionRoutes from "../backend/routes/submissionRoutes.js";
import adminRoutes from "../backend/routes/adminRoutes.js";

// ---------------------------------------------------------
// 🚏 Mount Routes
// ---------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ---------------------------------------------------------
// 🧠 Health Check Route
// ---------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// ---------------------------------------------------------
// 🚀 Export for Vercel serverless function
// ---------------------------------------------------------
export default serverless(app);
