import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ClassDetail = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { classId } = useParams(); // This gets the ID from the URL

  useEffect(() => {
    const fetchClassDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Could not fetch class details');
        
        const data = await response.json();
        setClassInfo(data);
      } catch (error) {
        console.error("Error fetching class details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (loading) return <div className="p-8">Loading class...</div>;
  if (!classInfo) return <div className="p-8 text-red-500">Class not found.</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800">{classInfo.title}</h2>
      <p className="text-gray-600 mt-2">{classInfo.description}</p>
      <p className="text-sm text-gray-500 mt-2 font-mono">Class Code: <strong>{classInfo.code}</strong></p>
      
      <hr className="my-8" />

      {/* This is where we will manage assignments later */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Assignments</h3>
        {/* Placeholder for Assignment List and Create Form */}
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">Assignment management will be added here soon!</p>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;