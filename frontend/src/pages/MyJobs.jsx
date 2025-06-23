import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobPostService } from '../services/jobPosts';

const MyJobs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);

    // Ambil userId yang valid (id atau _id)
    const getUserId = (user) => (user?.id !== undefined ? user.id : user?._id);

    // Ambil jobs ketika user berubah
    useEffect(() => {
        if (!user) return;
        if (user.role !== 'Employer') {
            navigate('/');
            return;
        }
        const userId = getUserId(user);
        if (userId) {
            fetchMyJobs(userId);
        }
    }, [user, navigate]);

    // Ambil jobs ulang jika ada pesan sukses (misal: setelah create job)
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            navigate(location.pathname, { replace: true });
            const userId = getUserId(user);
            if (user && user.role === 'Employer' && userId) {
                fetchMyJobs(userId);
            }
        }
    }, [location.state, navigate, user]);

    // Fetch jobs milik user
    const fetchMyJobs = async (userId) => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await jobPostService.getByUser(userId);
            let jobsArray = Array.isArray(response) ? response : null;
            if (!jobsArray && response && typeof response === 'object') {
                jobsArray = response.items || response.data || [];
            }
            setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            setError(null);
        } catch (error) {
            setError('Failed to load your jobs');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job post?')) {
            return;
        }
        try {
            await jobPostService.delete(Number(jobId));
            setJobs(jobs.filter(job => Number(job.id || job._id) !== Number(jobId)));
            setDeleteMessage('Job post deleted successfully!');
            setTimeout(() => setDeleteMessage(null), 3000);
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job post');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Not specified';
        if (min && max) return `Rp${min.toLocaleString()} - Rp${max.toLocaleString()}`;
        if (min) return `From Rp${min.toLocaleString()}`;
        if (max) return `Up to Rp${max.toLocaleString()}`;
    };

    if (!user || user.role !== 'Employer') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <span>Access denied. This page is only for employers.</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Job Posts</h1>
                <Link to="/jobs/create" className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Job
                </Link>
            </div>
            {successMessage && (
                <div className="alert alert-success mb-6">
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="alert alert-error mb-6">
                    <span>{error}</span>
                </div>
            )}
            {deleteMessage && (
                <div className="alert alert-success mb-6">
                    <span>{deleteMessage}</span>
                </div>
            )}
            {jobs.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No job posts yet</h3>
                    <p className="text-gray-600 mb-6">Start by creating your first job post</p>
                    <Link to="/jobs/create" className="btn btn-primary">
                        Create Your First Job Post
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Job Type</th>
                                <th>Salary Range</th>
                                <th>Posted Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => {
                                const jobId = Number(job.id !== undefined ? job.id : job._id);
                                return (
                                <tr key={jobId}>
                                    <td>
                                        <div className="font-semibold">{job.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            {job.description}
                                        </div>
                                    </td>
                                    <td>{job.company}</td>
                                    <td>{job.location}</td>
                                    <td>
                                        <span className="badge badge-ghost">
                                            {job.job_type}
                                        </span>
                                    </td>
                                    <td>{formatSalary(job.salary_min, job.salary_max)}</td>
                                    <td>{formatDate(job.created_at)}</td>
                                    <td>
                                        <div className="flex space-x-2">
                                            <Link 
                                                to={`/jobs/${jobId}`} 
                                                className="btn btn-sm btn-ghost"
                                                title="View Job"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <Link 
                                                to={`/jobs/${jobId}/edit`} 
                                                className="btn btn-sm btn-ghost"
                                                title="Edit Job"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button 
                                                onClick={() => handleDeleteJob(jobId)}
                                                className="btn btn-sm btn-ghost text-error"
                                                title="Delete Job"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyJobs;
