import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Job Seeker' // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { 
                    state: { message: 'Registration successful! Please sign in.' }
                });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-full max-w-md shadow-2xl bg-base-100">
                    <div className="card-body text-center">
                        <div className="text-success text-6xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-success mb-2">Registration Successful!</h2>
                        <p className="text-base-content/70 mb-4">
                            Your account has been created successfully. Redirecting to login...
                        </p>
                        <div className="loading loading-spinner loading-md"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-2xl bg-base-100">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold">Create Account</h2>
                        <p className="text-base-content/70">Join JobSeeker today</p>
                    </div>
                    
                    {error && (
                        <div className="alert alert-error mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">User Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Enter your UserName"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">I want to join as</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                                required
                                disabled={loading}
                            >
                                <option value="Job Seeker">Job Seeker</option>
                                <option value="Employer">Employer</option>
                            </select>
                            <label className="label">
                                <span className="label-text-alt">
                                    {formData.role === 'Job Seeker' 
                                        ? 'Looking for job opportunities' 
                                        : 'Looking to hire talented candidates'}
                                </span>
                            </label>
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Create a password"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <label className="label">
                                <span className="label-text-alt">Minimum 6 characters</span>
                            </label>
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="divider">OR</div>
                    
                    <div className="text-center">
                        <p className="text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="link link-primary font-semibold">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
