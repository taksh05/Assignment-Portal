import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../axios'; // ✅ use shared axios instance

const ClassDetail = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { classId } = useParams(); // Get classId from the URL

  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        const response = await api.get(`/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassInfo(response.data);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setError(err.response?.data?.message || 'Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (loading) return <div className="p-8 text-gray-600">Loading class...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!classInfo) return <div className="p-8 text-red-500">Class not found.</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800">{classInfo.title}</h2>
      <p className="text-gray-600 mt-2">{classInfo.description}</p>
      <p className="text-sm text-gray-500 mt-2 font-mono">
        Class Code: <strong>{classInfo.code}</strong>
      </p>

      <hr className="my-8" />

      {/* Assignments Section Placeholder */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Assignments</h3>
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">Assignment management will be added here soon!</p>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
