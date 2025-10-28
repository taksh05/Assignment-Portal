import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper function to get the correct badge class
const getRoleClass = (role) => {
  switch (role) {
    case 'Admin':
      return 'badge-active'; // Green
    case 'Teacher':
      return 'badge-teacher'; // Blue
    case 'Student':
    default:
      return 'badge-inactive'; // Red (or another color)
  }
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [usersRes, classesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/classes', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUsers(usersRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      
      {/* --- User Management Table --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management ({users.length})</h2>
        <div className="table-container">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
              </tr>
            </thead>
            <tbody className="table-tbody">
              {users.map((user) => (
                <tr key={user._id} className="table-tr">
                  <td className="table-td font-medium">{user.name}</td>
                  <td className="table-td">{user.email}</td>
                  <td className="table-td">
                    <span className={getRoleClass(user.role)}>{user.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Class Overview Table --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Overview ({classes.length})</h2>
        <div className="table-container">
          <table className="table">
            <thead className="table-head">
              <tr>
                <th className="table-th">Class Title</th>
                <th className="table-th">Teacher</th>
                <th className="table-th">Class Code</th>
              </tr>
            </thead>
            <tbody className="table-tbody">
              {classes.map((cls) => (
                <tr key={cls._id} className="table-tr">
                  <td className="table-td font-medium">{cls.title}</td>
                  <td className="table-td">{cls.teacher?.name || 'N/A'}</td>
                  <td className="table-td font-mono text-sm">{cls._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;
