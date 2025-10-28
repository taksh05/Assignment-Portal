import React, { useState, useEffect } from 'react';
import api from '../../axios'; // ✅ use shared axios instance
import { useNavigate } from 'react-router-dom';

// --- Assignment Modal ---
const AssignmentModal = ({ isOpen, onClose, onSubmit, assignment, classes }) => {
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', classId: '' });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [removeExistingFile, setRemoveExistingFile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (assignment) {
        setFormData({
          title: assignment.title || '',
          description: assignment.description || '',
          dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
          classId: assignment.class?._id || assignment.class || '',
        });
        setFileName(assignment.filePath ? assignment.filePath.split('/').pop() : 'No file chosen');
        setFile(null);
        setRemoveExistingFile(false);
      } else {
        setFormData({ title: '', description: '', dueDate: '', classId: '' });
        setFile(null);
        setFileName('No file chosen');
        setRemoveExistingFile(false);
      }
    }
  }, [assignment, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setRemoveExistingFile(false);
    } else {
      setFile(null);
      setFileName('No file chosen');
    }
  };

  const handleRemoveFileClick = () => {
    setFile(null);
    setFileName('No file chosen');
    setRemoveExistingFile(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('dueDate', formData.dueDate);
    submissionData.append('classId', formData.classId);
    if (file) submissionData.append('file', file);
    if (assignment && removeExistingFile && !file) {
      submissionData.append('removeExistingFile', 'true');
    }
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg card my-8">
        <h2 className="text-2xl font-bold mb-4">{assignment ? 'Edit Assignment' : 'Add New Assignment'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field" required />
          <textarea placeholder="Description" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field min-h-[100px]" />
          <input type="date" value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="input-field" required />
          <select value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            className="input-field" required>
            <option value="">Select a Class</option>
            {classes?.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach File (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="flex-grow flex items-center px-4 py-2 bg-white text-blue-500 rounded-lg shadow-sm border border-blue-300 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span>{file ? 'Change File' : 'Choose File'}</span>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              {assignment?.filePath && !file && !removeExistingFile && (
                <button type="button" onClick={handleRemoveFileClick}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                  Remove Current
                </button>
              )}
            </div>
            <span className="text-gray-600 text-xs ml-1 mt-1 block truncate">
              {fileName}
              {removeExistingFile && <span className="text-red-600"> (will be removed)</span>}
            </span>
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Assignment Card ---
const AssignmentCard = ({ assignment, onEdit, onDelete, userRole, navigate }) => {
  const canModify = userRole === 'teacher' || userRole === 'admin';

  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    return `${import.meta.env.VITE_API_BASE_URL || ''}/${filePath.replace(/\\/g, '/')}`;
  };

  return (
    <div className="card relative p-5 space-y-3 transition-all hover:shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
      <p className="text-sm text-gray-500">Class: <span className="font-medium">{assignment.class?.title || 'N/A'}</span></p>
      <p className="text-sm text-gray-500">Due: <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span></p>
      {assignment.description && <p className="text-sm text-gray-600">{assignment.description}</p>}

      {assignment.filePath && (
        <div className="pt-2 mt-2 border-t border-gray-100">
          <a href={getFileUrl(assignment.filePath)} target="_blank" rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1">
            📎 View Attached File
          </a>
        </div>
      )}

      {canModify && (
        <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
          <button onClick={() => onEdit(assignment)} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200">Edit</button>
          <button onClick={() => onDelete(assignment._id)} className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">Delete</button>
        </div>
      )}
      {userRole === 'student' && (
        <div className="pt-3 border-t border-gray-100 mt-3">
          <button onClick={() => navigate(`/submissions?assignmentId=${assignment._id}`)} className="btn-primary text-sm py-1.5 px-4">View / Submit</button>
        </div>
      )}
    </div>
  );
};

// --- Main Assignments Page ---
const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [userClasses, setUserClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userRole = user?.role;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!token) throw new Error('You are not logged in.');
      const assignRes = await api.get('/assignments', { headers: { Authorization: `Bearer ${token}` } });
      setAssignments(assignRes.data);

      if (userRole === 'teacher' || userRole === 'admin') {
        const classesRes = await api.get('/classes', { headers: { Authorization: `Bearer ${token}` } });
        setUserClasses(classesRes.data.filter(c => c.teacher?._id === user?.id || c.teacher === user?.id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (assignment = null) => {
    if (userRole !== 'teacher' && userRole !== 'admin') return;
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    const method = editingAssignment ? 'put' : 'post';
    const url = editingAssignment ? `/assignments/${editingAssignment._id}` : '/assignments';
    try {
      const res = await api[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingAssignment) {
        setAssignments(prev => prev.map(a => a._id === editingAssignment._id ? res.data : a));
      } else {
        setAssignments(prev => [res.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${editingAssignment ? 'update' : 'create'} assignment.`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment.');
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading assignments...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6">
      {(userRole === 'teacher' || userRole === 'admin') && (
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          assignment={editingAssignment}
          classes={userClasses}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        {(userRole === 'teacher' || userRole === 'admin') && (
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + Add Assignment
          </button>
        )}
      </div>
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(a => (
            <AssignmentCard
              key={a._id}
              assignment={a}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              userRole={userRole}
              navigate={navigate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card">
          <p className="text-gray-500 text-lg">No assignments found.</p>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
              + Add First Assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
