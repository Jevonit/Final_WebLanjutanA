import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, createUser, deleteUser } from '../services/api';
import jobPostService from '../services/jobPosts';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // User Management State
    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [userError, setUserError] = useState(null);
    const [userSuccess, setUserSuccess] = useState(null);
    const [form, setForm] = useState({ email: '', name: '', password: '', role: 'Job Seeker' });
    const [creating, setCreating] = useState(false);

    // Job Post Management State
    const [jobs, setJobs] = useState([]);
    const [jobLoading, setJobLoading] = useState(true);
    const [jobError, setJobError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch Users
    const fetchUsers = async () => {
        setUserLoading(true);
        setUserError(null);
        try {
            const data = await getUsers();
            setUsers(data.items || data.data || data || []);
        } catch (err) {
            setUserError('Failed to fetch users');
        } finally {
            setUserLoading(false);
        }
    };

    // Fetch Job Posts
    const fetchAllJobs = async (currentPage) => {
        setJobLoading(true);
        setJobError(null);
        try {
            const data = await jobPostService.getAll(currentPage, 5); // 5 jobs per page for admin view
            setJobs(data.items || []);
            setTotalPages(Math.ceil(data.total / data.limit));
        } catch (err) {
            setJobError('Failed to fetch job posts.');
            setJobs([]);
        } finally {
            setJobLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/');
            return;
        }
        fetchUsers();
        fetchAllJobs(page);
    }, [user, navigate, page]);

    // User Handlers
    const handleDeleteUser = async (id) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && (id === currentUser.id || id === currentUser._id)) {
            setUserError("You cannot delete your own admin account.");
            return;
        }
        if (!window.confirm('Delete this user?')) return;
        try {
            await deleteUser(id);
            setUserSuccess('User deleted');
            fetchUsers(); // Refresh user list
        } catch {
            setUserError('Failed to delete user');
        }
    };

    const handleUserFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setUserError(null);
        setUserSuccess(null);
        try {
            await createUser(form);
            setUserSuccess('User created');
            setForm({ email: '', name: '', password: '', role: 'Job Seeker' });
            fetchUsers(); // Refresh user list
        } catch {
            setUserError('Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    // Job Post Handlers
    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job post?')) {
            return;
        }
        try {
            await jobPostService.delete(jobId);
            setDeleteMessage('Job post deleted successfully!');
            fetchAllJobs(page); // Refresh job list
            setTimeout(() => setDeleteMessage(null), 3000);
        } catch (error) {
            console.error('Error deleting job:', error);
            setJobError('Failed to delete job post.');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Helper Functions
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : 'N/A';
    const formatSalary = (min, max) => {
        const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
        if (!min && !max) return 'Not specified';
        if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
        if (min) return `From ${formatter.format(min)}`;
        if (max) return `Up to ${formatter.format(max)}`;
        return 'N/A';
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

            {/* User Management Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                {userError && <div className="alert alert-error mb-4">{userError}</div>}
                {userSuccess && <div className="alert alert-success mb-4">{userSuccess}</div>}
                <form onSubmit={handleCreateUser} className="mb-8 card bg-base-100 shadow p-4">
                    <h3 className="font-semibold mb-2">Create New User</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input name="email" value={form.email} onChange={handleUserFormChange} required type="email" placeholder="Email" className="input input-bordered" />
                        <input name="name" value={form.name} onChange={handleUserFormChange} required type="text" placeholder="Name" className="input input-bordered" />
                        <input name="password" value={form.password} onChange={handleUserFormChange} required type="password" placeholder="Password" className="input input-bordered" />
                        <select name="role" value={form.role} onChange={handleUserFormChange} className="select select-bordered">
                            <option>Job Seeker</option>
                            <option>Employer</option>
                        </select>
                        <button type="submit" className={`btn btn-primary ${creating ? 'loading' : ''}`}>Create User</button>
                    </div>
                </form>
                <div className="overflow-x-auto">
                    {userLoading ? <div>Loading users...</div> : (
                        <table className="table w-full table-zebra">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.role !== 'Admin').map(u => (
                                    <tr key={u.id || u._id}>
                                        <td>{u.email}</td>
                                        <td>{u.name || u.full_name || '-'}</td>
                                        <td>{u.role}</td>
                                        <td>
                                            <button className="btn btn-error btn-xs" onClick={() => handleDeleteUser(u.id || u._id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Job Post Management Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Job Post Management</h2>
                {jobError && <div className="alert alert-error mb-4">{jobError}</div>}
                {deleteMessage && <div className="alert alert-success mb-4">{deleteMessage}</div>}
                <div className="overflow-x-auto">
                    {jobLoading ? <div>Loading jobs...</div> : (
                        <table className="table w-full table-zebra">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Employer</th>
                                    <th>Location</th>
                                    <th>Salary</th>
                                    <th>Posted On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => {
                                    const jobId = job.id !== undefined ? job.id : job._id;
                                    return (
                                        <tr key={jobId}>
                                            <td>
                                                <div className="font-bold">{job.title}</div>
                                                <div className="text-sm opacity-50">{job.company}</div>
                                            </td>
                                            <td>{job.user_name || 'N/A'}</td>
                                            <td>{job.location}</td>
                                            <td>{formatSalary(job.salary_min, job.salary_max)}</td>
                                            <td>{formatDate(job.created_at)}</td>
                                            <td className="flex space-x-1">
                                                <Link to={`/jobs/${jobId}`} className="btn btn-ghost btn-xs" title="View">View</Link>
                                                <Link to={`/jobs/${jobId}/edit`} className="btn btn-ghost btn-xs" title="Edit">Edit</Link>
                                                <button onClick={() => handleDeleteJob(jobId)} className="btn btn-ghost btn-xs text-error" title="Delete">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Pagination */}
                <div className="flex justify-center mt-6">
                    <div className="btn-group">
                        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="btn">«</button>
                        <button className="btn">Page {page}</button>
                        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="btn">»</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
