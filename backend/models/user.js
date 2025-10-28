import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // A user must have a name
    },
    email: {
      type: String,
      unique: true,
      required: true, // Email is essential for login
    },
    password: {
      type: String,
      required: true, // Can't have a user without a password
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);
export default mongoose.models.User || mongoose.model("User", userSchema);