import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  // Function to handle the creation of a new class
  const handleCreateClass = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create a class.');
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create class.');
      }

      alert('Class created successfully! ✅');
      // Navigate to the classes page to see the new class
      navigate('/classes');

    } catch (error) {
      alert(error.message);
    }
  };
  
  // Get user info from localStorage to greet them
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to your Dashboard, {user?.name || 'User'}! 👋
      </h1>
      
      {/* Show the "Create Class" form only if the user is a teacher */}
      {user?.role === 'teacher' && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create a New Class</h2>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Class Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to React"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the class"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Create Class
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Your Classes</h2>
        <p className="text-gray-600">
          You can view all the classes you have created or joined on the "Classes" page.
        </p>
        <button 
          onClick={() => navigate('/classes')} 
          className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
        >
          Go to Classes
        </button>
      </div>
    </div>
  );
};

export default Dashboard;