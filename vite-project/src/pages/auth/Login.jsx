import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure you have axios: npm install axios

// Inline SVGs for social icons (Keep them in case you need them later)
const GoogleIcon = () => (
  // SVG code...
);

const GitHubIcon = () => (
  // SVG code...
);


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ GET THE API URL FROM ENVIRONMENT VARIABLES
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // ✅ USE THE API_URL VARIABLE IN THE AXIOS REQUEST
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard'); // Redirect to dashboard on success

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    // This class applies the bluish-to-purple gradient background
    <div className="login-background">
      {/* These classes apply the card style, animation, and scale-on-hover effect */}
      <div className="login-card login-card-hover">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Hola 👋
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Login to continue to your dashboard
        </p>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" // Uses the animated input style
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" // Uses the animated input style
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
              <label htmlFor="remember" className="text-gray-600">Remember me</label>
            </div>
            <a href="#" className="font-medium text-purple-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn-primary w-full"> {/* Uses the animated button style */}
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-purple-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;