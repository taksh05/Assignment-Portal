import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Assignment Modal (Updated for File Upload) ---
const AssignmentModal = ({ isOpen, onClose, onSubmit, assignment, classes }) => {
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', classId: '' });
  const [file, setFile] = useState(null); // State for the selected file
  const [fileName, setFileName] = useState('No file chosen'); // State for displaying file name
  const [removeExistingFile, setRemoveExistingFile] = useState(false); // State for removing file on edit

  useEffect(() => {
    if (isOpen) {
        if (assignment) {
          setFormData({
            title: assignment.title || '',
            description: assignment.description || '',
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
            classId: assignment.class?._id || assignment.class || '',
          });
          // Show existing file name if editing
          setFileName(assignment.filePath ? assignment.filePath.split('/').pop() : 'No file chosen');
          setFile(null); // Clear previous selection
          setRemoveExistingFile(false); // Reset remove flag
        } else {
          // Reset form for new assignment
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
       setRemoveExistingFile(false); // If user selects new file, don't remove existing unless they upload
    } else {
      // If user clears selection, reset (doesn't trigger removal)
      setFile(null);
      setFileName('No file chosen');
    }
  };

  const handleRemoveFileClick = () => {
      setFile(null); // Clear selected file
      setFileName('No file chosen');
      setRemoveExistingFile(true); // Set flag to remove existing on submit
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use FormData to send file and text data
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('dueDate', formData.dueDate);
    submissionData.append('classId', formData.classId);
    if (file) {
      submissionData.append('file', file); // 'file' MUST match backend upload.single('file')
    }
    // If editing and user explicitly removed file without adding a new one
    if (assignment && removeExistingFile && !file) {
        submissionData.append('removeExistingFile', 'true');
    }

    onSubmit(submissionData); // Send FormData
  };

  return (
    // Added overflow-y-auto for smaller screens
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg card my-8">
        <h2 className="text-2xl font-bold mb-4">{assignment ? 'Edit Assignment' : 'Add New Assignment'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Inputs */}
          <input
            type="text" placeholder="Title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field" required
          />
          <textarea
             placeholder="Description" value={formData.description}
             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
             className="input-field min-h-[100px]"
          />
          <input
            type="date" value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="input-field" required
          />
          <select
             value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
             className="input-field" required
          >
            <option value="">Select a Class</option>
            {classes?.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>

          {/* --- FILE INPUT SECTION (Added Back) --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach File (Optional)</label>
            <div className="flex items-center gap-2">
                 <label className="flex-grow flex items-center px-4 py-2 bg-white text-blue-500 rounded-lg shadow-sm tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                    {/* File Icon */}
                    <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" /></svg>
                    <span className="text-sm leading-normal">{file ? 'Change File' : 'Choose File'}</span>
                    {/* Actual file input is hidden */}
                    <input type='file' className="hidden" onChange={handleFileChange} />
                </label>
                {/* Show remove button only when editing AND there's an existing file path AND no new file is selected */}
                {assignment?.filePath && !file && !removeExistingFile && (
                     <button type="button" onClick={handleRemoveFileClick} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" title="Remove existing file">
                         Remove Current
                     </button>
                 )}
            </div>
             {/* Display selected/existing file name */}
            <span className="text-gray-600 text-xs ml-1 mt-1 block truncate">
                {fileName}
                 {/* Indicate if the existing file will be removed on save */}
                {removeExistingFile && <span className="text-red-600"> (will be removed)</span>}
            </span>
          </div>
          {/* --- END FILE INPUT SECTION --- */}

          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Assignment Card (Updated to show file link) ---
const AssignmentCard = ({ assignment, onEdit, onDelete, userRole, navigate }) => {
    const canModify = userRole === 'teacher' || userRole === 'admin';

    // Helper to create a viewable URL for the file
    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        // Construct full URL assuming server runs on localhost:5000 and serves 'uploads'
        return `http://localhost:5000/${filePath.replace(/\\/g, "/")}`;
    };

    return (
        <div className="card relative p-5 space-y-3 transition-all hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
            <p className="text-sm text-gray-500">
                Class: <span className="font-medium text-gray-700">{assignment.class?.title || 'N/A'}</span>
            </p>
            <p className="text-sm text-gray-500">
                Due: <span className="font-medium text-gray-700">{new Date(assignment.dueDate).toLocaleDateString()}</span>
            </p>
            {assignment.description && (
                 <p className="text-sm text-gray-600 pt-1">{assignment.description}</p>
            )}

             {/* --- Display File Link --- */}
            {assignment.filePath && (
                <div className="pt-2 mt-2 border-t border-gray-100">
                    <a
                        href={getFileUrl(assignment.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline font-medium inline-flex items-center gap-1"
                        title={assignment.filePath.split('/').pop()} // Show filename on hover
                    >
                         {/* Attachment Icon */}
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                         View Attached File
                    </a>
                </div>
            )}
            {/* --- End File Link --- */}


            {/* Edit/Delete Buttons */}
            {canModify && (
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                    <button onClick={() => onEdit(assignment)} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors">Edit</button>
                    <button onClick={() => onDelete(assignment._id)} className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors">Delete</button>
                </div>
            )}
            {/* Student View Button */}
            {userRole === 'student' && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                     <button onClick={() => navigate(`/submissions?assignmentId=${assignment._id}`)} className="btn-primary text-sm py-1.5 px-4">View / Submit</button>
                </div>
            )}
        </div>
    );
};


// --- Main Assignments Page Component ---
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

  const fetchData = async () => { /* ... (fetchData remains the same as previous) ... */
    setIsLoading(true);
    setError(null);
    try {
      if (!token) throw new Error('You are not logged in.');
      const assignRes = await axios.get('http://localhost:5000/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } });
      setAssignments(assignRes.data);
      if (userRole === 'teacher' || userRole === 'admin') {
        const classesRes = await axios.get('http://localhost:5000/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
        setUserClasses(classesRes.data.filter(c => c.teacher?._id === user?.id || c.teacher === user?.id));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (assignment = null) => { /* ... (remains the same) ... */
     if (userRole !== 'teacher' && userRole !== 'admin') return;
     setEditingAssignment(assignment);
     setIsModalOpen(true);
  };
  const handleCloseModal = () => { /* ... (remains the same) ... */
     setEditingAssignment(null);
     setIsModalOpen(false);
  };

  // --- Updated handleSubmit to send FormData ---
  const handleSubmit = async (formData) => { // formData is now FormData object
     if (userRole !== 'teacher' && userRole !== 'admin') {
         alert("Unauthorized action.");
         return;
     };

    const method = editingAssignment ? 'put' : 'post';
    const url = editingAssignment
        ? `http://localhost:5000/api/assignments/${editingAssignment._id}`
        : 'http://localhost:5000/api/assignments';

    try {
      // Send FormData, Axios handles headers
      const res = await axios[method](url, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' // Axios sets this automatically for FormData
            }
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
  // --- End Updated handleSubmit ---

  const handleDelete = async (id) => { /* ... (remains the same) ... */
    if (userRole !== 'teacher' && userRole !== 'admin') {
        alert("Unauthorized action.");
        return;
    };
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
        await axios.delete(`http://localhost:5000/api/assignments/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete assignment.');
    }
  };

  // --- Render Logic (remains mostly the same) ---
  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading assignments...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6">
        {(userRole === 'teacher' || userRole === 'admin') && (
            <AssignmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit} // Passes the updated handler
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
                {assignments.map((assignment) => (
                    <AssignmentCard // This component now shows the file link
                        key={assignment._id}
                        assignment={assignment}
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

