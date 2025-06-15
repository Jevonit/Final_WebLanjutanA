import React, { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser } from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState({ email: '', name: '', password: '', role: 'Job Seeker' });
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers();
            setUsers(data.items || data.data || data || []);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        // Cegah admin menghapus dirinya sendiri
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && (id === currentUser.id || id === currentUser._id)) {
            setError("You cannot delete your own admin account.");
            return;
        }
        if (!window.confirm('Delete this user?')) return;
        try {
            await deleteUser(id);
            setSuccess('User deleted');
            fetchUsers();
        } catch {
            setError('Failed to delete user');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        setSuccess(null);
        try {
            await createUser(form);
            setSuccess('User created');
            setForm({ email: '', name: '', password: '', role: 'Job Seeker' });
            fetchUsers();
        } catch {
            setError('Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Admin Panel - User Management</h1>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {success && <div className="alert alert-success mb-4">{success}</div>}
            <form onSubmit={handleCreate} className="mb-8 card bg-base-100 shadow p-4">
                <h2 className="font-semibold mb-2">Create New User</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" className="input input-bordered flex-1" />
                    <input name="name" value={form.name} onChange={handleChange} required type="text" placeholder="Name" className="input input-bordered flex-1" />
                    <input name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Password" className="input input-bordered flex-1" />
                    <select name="role" value={form.role} onChange={handleChange} className="select select-bordered">
                        <option>Job Seeker</option>
                        <option>Employer</option>
                    </select>
                    <button type="submit" className={`btn btn-primary ${creating ? 'loading' : ''}`}>Create</button>
                </div>
            </form>
            <div className="overflow-x-auto">
                {loading ? <div>Loading users...</div> : (
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role !== 'Admin').map(u => {
                                const currentUser = JSON.parse(localStorage.getItem('user'));
                                const isCurrentAdmin = currentUser && (u.id === currentUser.id || u._id === currentUser._id);
                                return (
                                    <tr key={u.id || u._id}>
                                        <td>{u.email}</td>
                                        <td>{u.name || u.full_name || '-'}</td>
                                        <td>{u.role}</td>
                                        <td>
                                            <button className="btn btn-error btn-xs" onClick={() => handleDelete(u.id || u._id)} disabled={isCurrentAdmin}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
