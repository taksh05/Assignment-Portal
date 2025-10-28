import React, { useState, useEffect } from 'react';
import api from '../../axios'; // ✅ use your axios instance (instead of direct axios import)

// Modal for Students to create a new submission
const SubmissionModal = ({ isOpen, onClose, onSubmit, assignments }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('No file chosen');
    const [assignmentId, setAssignmentId] = useState('');
    
    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        } else {
            setFile(null);
            setFileName('No file chosen');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !assignmentId) {
            alert('Please select an assignment and a file.');
            return;
        }
        const formData = new FormData();
        formData.append('assignmentId', assignmentId);
        formData.append('file', file);
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        value={assignmentId}
                        onChange={(e) => setAssignmentId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select Assignment</option>
                        {assignments.map(a => (
                            <option key={a._id} value={a._id}>{a.title}</option>
                        ))}
                    </select>
                    
                    <div>
                        <label className="w-full flex items-center px-4 py-2 bg-white text-blue-500 rounded-lg shadow-sm tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                            </svg>
                            <span className="text-sm leading-normal">Choose File</span>
                            <input type='file' className="hidden" onChange={handleFileChange} required />
                        </label>
                        <span className="text-gray-600 text-sm ml-2">{fileName}</span>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Grade Modal (same as before)
const GradeModal = ({ isOpen, onClose, onSubmit, submission }) => {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
        if (submission) {
            setGrade(submission.grade || '');
            setFeedback(submission.feedback || '');
        }
    }, [submission]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Grade Submission</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit({ grade, feedback });
                    }}
                    className="space-y-4"
                >
                    <input
                        type="number"
                        placeholder="Grade (e.g., 85)"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <textarea
                        placeholder="Feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit Grade</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [userAssignments, setUserAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (!token) throw new Error('You are not logged in.');
            const [submissionsRes, assignmentsRes] = await Promise.all([
                api.get('/submissions', { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/assignments', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setSubmissions(submissionsRes.data);
            setUserAssignments(assignmentsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (formData) => {
        try {
            const res = await api.post('/submissions', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSubmissions((prev) => [res.data, ...prev]);
            setIsSubmitModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create submission.');
        }
    };

    const handleGrade = async (gradeData) => {
        try {
            const res = await api.put(
                `/submissions/${selectedSubmission._id}/grade`,
                gradeData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmissions((prev) =>
                prev.map((sub) =>
                    sub._id === selectedSubmission._id ? res.data : sub
                )
            );
            setIsGradeModalOpen(false);
            setSelectedSubmission(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to grade submission.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            await api.delete(`/submissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubmissions((prev) => prev.filter((sub) => sub._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete submission.');
        }
    };

    const openGradeModal = (submission) => {
        setSelectedSubmission(submission);
        setIsGradeModalOpen(true);
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        if (filePath.startsWith('http')) return filePath;
        return `${import.meta.env.VITE_API_BASE_URL || ''}/${filePath.replace(/\\/g, '/')}`;
    };

    if (isLoading) return <div className="p-6 text-center">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <SubmissionModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSubmit={handleSubmit}
                assignments={userAssignments}
            />
            <GradeModal
                isOpen={isGradeModalOpen}
                onClose={() => setIsGradeModalOpen(false)}
                onSubmit={handleGrade}
                submission={selectedSubmission}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Submissions</h1>
                {user?.role === 'student' && (
                    <button
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        + Add Submission
                    </button>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Assignment</th>
                            <th className="px-6 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Student</th>
                            <th className="px-6 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Status</th>
                            <th className="px-6 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Submission</th>
                            <th className="px-6 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? (
                            submissions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b text-sm">{sub.assignment?.title || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b text-sm">{sub.student?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 border-b text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${sub.status === 'graded' ? 'text-green-900' : 'text-yellow-900'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${sub.status === 'graded' ? 'bg-green-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative capitalize">{sub.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 border-b text-sm">
                                        {sub.filePath ? (
                                            <a
                                                href={getFileUrl(sub.filePath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View File
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">No file</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-b text-sm">
                                        {user?.role === 'teacher' ? (
                                            <div className="flex gap-4">
                                                <button onClick={() => openGradeModal(sub)} className="text-green-600 hover:text-green-900">Grade</button>
                                                <button onClick={() => handleDelete(sub._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleDelete(sub._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">No submissions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MySubmissions;
