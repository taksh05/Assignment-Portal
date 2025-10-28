import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ClassDetail = () => {
  const { classId } = useParams();

  // State for all our data
  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the new assignment form
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');

  // Function to fetch all class and assignment data from the backend
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      // Fetch the main class details
      const classRes = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classData = await classRes.json();
      setClassInfo(classData);

      // Fetch all assignments for this specific class
      const assignmentRes = await fetch(`http://localhost:5000/api/assignments/class/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assignmentData = await assignmentRes.json();
      setAssignments(assignmentData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Run fetchData once when the page loads
  useEffect(() => {
    fetchData();
  }, [classId]);

  // Function to handle the "Create Assignment" form submission
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: assignmentTitle,
          description: assignmentDesc,
          classId: classId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      // Clear form inputs and refresh the assignment list
      setAssignmentTitle('');
      setAssignmentDesc('');
      fetchData(); 
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Error: Could not create the assignment.');
    }
  };

  if (loading) return <div className="p-8">Loading class and assignments...</div>;
  if (!classInfo) return <div className="p-8 text-red-500">Error: Class not found.</div>;

  return (
    <div className="p-8">
      {/* Page Header */}
      <h2 className="text-3xl font-bold text-gray-800">{classInfo.title}</h2>
      <p className="text-gray-600 mt-1">{classInfo.description}</p>
      
      <hr className="my-8" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side (2/3 width): List of Assignments */}
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-semibold mb-4">📚 Assignments</h3>
          {assignments.length > 0 ? (
            <ul className="space-y-4">
              {assignments.map(asm => (
                <li key={asm._id} className="p-4 bg-white rounded-lg border shadow-sm">
                  <h4 className="font-semibold text-lg text-gray-800">{asm.title}</h4>
                  <p className="text-gray-600 mt-1">{asm.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 text-center p-6 rounded-lg">
              <p className="text-gray-500">No assignments created yet. Add one!</p>
            </div>
          )}
        </div>

        {/* Right Side (1/3 width): Create Assignment Form */}
        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
          <h3 className="text-xl font-semibold mb-4">➕ Create New Assignment</h3>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <input
              type="text"
              placeholder="Assignment Title"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Description or instructions"
              value={assignmentDesc}
              onChange={(e) => setAssignmentDesc(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="4"
            ></textarea>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
              Add Assignment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;