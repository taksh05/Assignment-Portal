// api/server.js
import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// --- Mongoose connection (with simple caching) ---
if (!global._mongo) {
  global._mongo = { conn: null, promise: null };
}

async function connectDB() {
  if (global._mongo.conn) {
    return global._mongo.conn;
  }
  if (!global._mongo.promise) {
    global._mongo.promise = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(m => m.connection);
  }
  global._mongo.conn = await global._mongo.promise;
  return global._mongo.conn;
}
connectDB().then(() => console.log("✅ MongoDB connected (api/server.js)"))
  .catch(err => console.error("❌ MongoDB connection error (api/server.js):", err));

// --- Import your existing backend routes ---
// We reference files under /backend/routes/*.js — adjust names if different
import authRoutes from "../backend/routes/authRoutes.js";
import classRoutes from "../backend/routes/classRoutes.js";
import assignmentRoutes from "../backend/routes/assignmentRoutes.js";
import submissionRoutes from "../backend/routes/submissionRoutes.js";
import adminRoutes from "../backend/routes/adminRoutes.js";

// Register routes under /api/*
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// Simple health route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// Export handler for Vercel serverless
const handler = serverless(app);
export default handler;
