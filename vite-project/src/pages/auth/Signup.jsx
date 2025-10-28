import React, { useState } from "react";
// Import both useNavigate and Link
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful ✅");
        localStorage.setItem("token", data.token);
        // Also save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.user)); 
        navigate("/dashboard"); // redirect to main page
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-blue-300">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
            Create Account 🎉
          </h1>
          <p className="text-gray-600 mt-2">Sign up to start your journey</p>
        </div>

        <form className="space-y-5" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="input-field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="btn-primary w-full py-3 font-semibold text-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          {/* ✅ FIXED: Changed <a> tag to Link component for consistency */}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;