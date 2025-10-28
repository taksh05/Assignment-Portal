import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Using axios

// --- Class Modal Component ---
const ClassModal = ({ isOpen, onClose, onSubmit, classData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (classData) {
      setTitle(classData.title || '');
      setDescription(classData.description || '');
    } else {
      // Reset form when creating new
      setTitle('');
      setDescription('');
    }
  }, [classData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md card">
        <h2 className="text-2xl font-bold mb-4">{classData ? 'Edit Class' : 'Create New Class'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Class Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
          <textarea
             placeholder="Description (Optional)"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             className="input-field min-h-[100px]"
          />
          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{classData ? 'Save Changes' : 'Create Class'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Class Card Component ---
const ClassCard = ({ classInfo, isTeacher, onEdit, onDelete }) => (
    // Updated styling to match light theme
    <div className="card p-5 space-y-3 relative group">
        <h3 className="font-bold text-xl text-gray-800">{classInfo.title}</h3>
        <p className="text-gray-600 text-sm">Instructor: {classInfo.teacher?.name || 'N/A'}</p>
        {classInfo.description && <p className="text-gray-500 text-sm pt-1">{classInfo.description}</p>}

        {/* Edit/Delete buttons for teacher, shown on hover or always */}
        {isTeacher && (
             <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button
                    onClick={() => onEdit(classInfo)}
                    className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(classInfo._id)}
                     className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                    Delete
                </button>
            </div>
        )}
         {/* Add a link/button for students to view class details if needed */}
         {/* Example: <Link to={`/classes/${classInfo._id}`} className="...">View Details</Link> */}
    </div>
);


// --- Main Classes Page Component ---
const Classes = () => {
    const [myClasses, setMyClasses] = useState([]);
    const [allClasses, setAllClasses] = useState([]); // For students to join
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null); // Class data for editing

    // Get user info and token
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userRole = user?.role; // 'student', 'teacher', or 'admin'

    // Fetch initial data
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!token) throw new Error('Authentication token not found.');

            // Fetch classes user is part of (taught or enrolled)
            const myClassesRes = await axios.get('http://localhost:5000/api/classes', {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            setMyClasses(myClassesRes.data);

            // If user is a student, fetch all classes they can potentially join
            if (userRole === 'student') {
                const allClassesRes = await axios.get('http://localhost:5000/api/classes/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAllClasses(allClassesRes.data);
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
    }, []); // Run only once

    // --- Modal and CRUD Handlers ---
    const handleOpenModal = (classToEdit = null) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return; // Should not happen if button is hidden
        setEditingClass(classToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingClass(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;

        const method = editingClass ? 'put' : 'post';
        const url = editingClass
            ? `http://localhost:5000/api/classes/${editingClass._id}`
            : 'http://localhost:5000/api/classes';

        try {
            const res = await axios[method](url, formData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (editingClass) {
                // Update class in the list
                setMyClasses(prev => prev.map(c => c._id === editingClass._id ? res.data : c));
            } else {
                // Add new class to the list
                setMyClasses(prev => [res.data, ...prev]);
            }
            handleCloseModal();

        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${editingClass ? 'update' : 'create'} class.`);
        }
    };

    const handleDelete = async (classId) => {
         if (userRole !== 'teacher' && userRole !== 'admin') return;
        if (!window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;

        try {
            await axios.delete(`http://localhost:5000/api/classes/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            // Remove class from the list
            setMyClasses(prev => prev.filter(c => c._id !== classId));
        } catch (err) {
             alert(err.response?.data?.message || 'Failed to delete class.');
        }
    };

    // --- Student Join Class Handler ---
    const handleJoinClass = async (classId) => {
         if (userRole !== 'student') return;
        try {
            const res = await axios.post(`http://localhost:5000/api/classes/${classId}/join`, {}, { // Added empty object for POST body
                headers: { 'Authorization': `Bearer ${token}` },
            });
            alert(res.data.message || 'Successfully joined class!');
            fetchData(); // Refresh both lists
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join the class.');
        }
    };

    // --- Render Logic ---
    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading classes...</div>;
    if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

    // Filter out classes the student has already joined from the "Join" list
    const myClassIds = myClasses.map(c => c._id);
    const availableClassesToJoin = allClasses.filter(c => !myClassIds.includes(c._id));

    return (
        <div className="p-4 sm:p-6">
            {/* Render Modal only for teachers/admins */}
            {(userRole === 'teacher' || userRole === 'admin') && (
                <ClassModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    classData={editingClass}
                />
            )}

            {/* Header section with Add button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                {/* ROLE CHECK: Show Add Class button only to teachers/admins */}
                {(userRole === 'teacher' || userRole === 'admin') && (
                    <button onClick={() => handleOpenModal()} className="btn-primary">
                        + Add Class
                    </button>
                )}
            </div>

            {/* Grid for "My Classes" */}
            {myClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myClasses.map(c => (
                        <ClassCard
                            key={c._id}
                            classInfo={c}
                            // Show edit/delete only if the logged-in user is the teacher of THIS class or an admin
                            isTeacher={userRole === 'admin' || (userRole === 'teacher' && (c.teacher?._id === user?.id || c.teacher === user?.id))}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 card">
                    <p className="text-gray-500 text-lg">You haven't created or joined any classes yet.</p>
                     {/* Prompt teacher to add first class */}
                    {(userRole === 'teacher' || userRole === 'admin') && (
                        <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
                            + Create Your First Class
                        </button>
                    )}
                </div>
            )}

            {/* Section for Students to Join Classes */}
            {userRole === 'student' && (
                <>
                    <h2 className="text-2xl font-bold mt-10 mb-5 pt-6 border-t border-gray-200">
                        Join a New Class
                    </h2>
                    {availableClassesToJoin.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableClassesToJoin.map(c => (
                                <div key={c._id} className="card p-5 space-y-3">
                                    <h3 className="font-bold text-xl text-gray-800">{c.title}</h3>
                                    <p className="text-gray-600 text-sm">Instructor: {c.teacher?.name || 'N/A'}</p>
                                    <button
                                        onClick={() => handleJoinClass(c._id)}
                                        className="btn-primary w-full mt-3"
                                    >
                                        Join Class
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 card mt-6">
                            <p className="text-gray-500">There are no new classes available to join right now.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Classes;
