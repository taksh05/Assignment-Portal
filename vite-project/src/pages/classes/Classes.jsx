import React, { useState, useEffect } from 'react';
import api from '../../axios'; // ✅ Using shared axios instance

// --- Class Modal Component ---
const ClassModal = ({ isOpen, onClose, onSubmit, classData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (classData) {
      setTitle(classData.title || '');
      setDescription(classData.description || '');
    } else {
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
        <h2 className="text-2xl font-bold mb-4">
          {classData ? 'Edit Class' : 'Create New Class'}
        </h2>
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
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {classData ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Class Card Component ---
const ClassCard = ({ classInfo, isTeacher, onEdit, onDelete }) => (
  <div className="card p-5 space-y-3 relative group">
    <h3 className="font-bold text-xl text-gray-800">{classInfo.title}</h3>
    <p className="text-gray-600 text-sm">
      Instructor: {classInfo.teacher?.name || 'N/A'}
    </p>
    {classInfo.description && (
      <p className="text-gray-500 text-sm pt-1">{classInfo.description}</p>
    )}

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
  </div>
);

// --- Main Classes Page Component ---
const Classes = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userRole = user?.role;

  // --- Fetch Classes ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const myClassesRes = await api.get('/classes');
      setMyClasses(myClassesRes.data);

      if (userRole === 'student') {
        const allClassesRes = await api.get('/classes/all');
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
  }, []); // Runs once

  // --- Modal and CRUD Handlers ---
  const handleOpenModal = (classToEdit = null) => {
    if (userRole !== 'teacher' && userRole !== 'admin') return;
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
    const url = editingClass ? `/classes/${editingClass._id}` : '/classes';

    try {
      const res = await api[method](url, formData);
      if (editingClass) {
        setMyClasses((prev) =>
          prev.map((c) => (c._id === editingClass._id ? res.data : c))
        );
      } else {
        setMyClasses((prev) => [res.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to ${editingClass ? 'update' : 'create'} class.`
      );
    }
  };

  const handleDelete = async (classId) => {
    if (userRole !== 'teacher' && userRole !== 'admin') return;
    if (
      !window.confirm('Are you sure you want to delete this class? This cannot be undone.')
    )
      return;

    try {
      await api.delete(`/classes/${classId}`);
      setMyClasses((prev) => prev.filter((c) => c._id !== classId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class.');
    }
  };

  // --- Student Join Class Handler ---
  const handleJoinClass = async (classId) => {
    if (userRole !== 'student') return;
    try {
      const res = await api.post(`/classes/${classId}/join`);
      alert(res.data.message || 'Successfully joined class!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join the class.');
    }
  };

  // --- Render ---
  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading classes...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  const myClassIds = myClasses.map((c) => c._id);
  const availableClassesToJoin = allClasses.filter((c) => !myClassIds.includes(c._id));

  return (
    <div className="p-4 sm:p-6">
      {(userRole === 'teacher' || userRole === 'admin') && (
        <ClassModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          classData={editingClass}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        {(userRole === 'teacher' || userRole === 'admin') && (
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + Add Class
          </button>
        )}
      </div>

      {myClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClasses.map((c) => (
            <ClassCard
              key={c._id}
              classInfo={c}
              isTeacher={
                userRole === 'admin' ||
                (userRole === 'teacher' &&
                  (c.teacher?._id === user?.id || c.teacher === user?.id))
              }
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card">
          <p className="text-gray-500 text-lg">You haven't created or joined any classes yet.</p>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
              + Create Your First Class
            </button>
          )}
        </div>
      )}

      {userRole === 'student' && (
        <>
          <h2 className="text-2xl font-bold mt-10 mb-5 pt-6 border-t border-gray-200">
            Join a New Class
          </h2>
          {availableClassesToJoin.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClassesToJoin.map((c) => (
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
