import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUser, verifyPassword } from '../../services/api';

// ThemeContext for global theme state
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const AccountSettings = () => {
    const { user, updateAuthUser, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [editMode, setEditMode] = useState({
        profile: false,
        password: false
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear errors for the field being edited
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const validateForm = (formType) => {
        const newErrors = {};
        
        if (formType === 'profile') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
            
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
            
            if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required to save changes';
        }
        
        if (formType === 'password') {
            if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
            
            if (!formData.newPassword) newErrors.newPassword = 'New password is required';
            if (formData.newPassword && formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            }
            
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password';
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateForm('profile')) return;
        
        try {
            setLoading(true);
            
            // First verify the current password
            const verified = await verifyPassword({ 
                email: user.email, 
                password: formData.currentPassword 
            });
            
            if (!verified) {
                setErrors({ currentPassword: 'Current password is incorrect' });
                setLoading(false);
                return;
            }
            
            // Then update the user information
            const updatedUser = await updateUser(user.id || user._id, {
                name: formData.name,
                email: formData.email
            });
            
            // Update the user in context
            updateAuthUser(updatedUser);
            
            setMessage({
                type: 'success',
                text: 'Profile updated successfully!'
            });
            
            // Clear current password field
            setFormData(prev => ({ ...prev, currentPassword: '' }));
            
            // Exit edit mode
            setEditMode(prev => ({ ...prev, profile: false }));
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateForm('password')) return;
        
        try {
            setLoading(true);
            
            // First verify the current password
            const verified = await verifyPassword({ 
                email: user.email, 
                password: formData.currentPassword 
            });
            
            if (!verified) {
                setErrors({ currentPassword: 'Current password is incorrect' });
                setLoading(false);
                return;
            }
            
            // Then update the password
            await updateUser(user.id || user._id, {
                password: formData.newPassword
            });
            
            setMessage({
                type: 'success',
                text: 'Password updated successfully! Please log in again with your new password.'
            });
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            
            // Exit edit mode
            setEditMode(prev => ({ ...prev, password: false }));
            
            // Log the user out after 3 seconds
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update password. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please log in to access your account settings.</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-base-content/70">Manage your account information and password</p>
                {/* Theme Switcher */}
                <div className="mt-4 flex items-center gap-4">
                    <span className="font-semibold">Theme:</span>
                    <select
                        className="select select-bordered"
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                    >
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        {message.type === 'success' 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                    </svg>
                    <span>{message.text}</span>
                    {message.type === 'success' && (
                        <div>
                            <button 
                                onClick={() => setMessage({type: '', text: ''})}
                                className="btn btn-sm btn-ghost"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {/* Profile Information Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center">
                            <h2 className="card-title text-xl">Profile Information</h2>
                            {!editMode.profile ? (
                                <button 
                                    onClick={() => setEditMode(prev => ({...prev, profile: true}))}
                                    className="btn btn-sm btn-primary"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setEditMode(prev => ({...prev, profile: false}));
                                        setFormData(prev => ({
                                            ...prev,
                                            name: user.name || '',
                                            email: user.email || '',
                                            currentPassword: ''
                                        }));
                                        setErrors({});
                                    }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        
                        {editMode.profile ? (
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                                    />
                                    {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
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
                                        className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                                    />
                                    {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Current Password (to confirm changes)</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        value={formData.currentPassword} 
                                        onChange={handleChange}
                                        placeholder="Enter your current password to save changes"
                                        className={`input input-bordered ${errors.currentPassword ? 'input-error' : ''}`}
                                    />
                                    {errors.currentPassword && <span className="text-error text-sm mt-1">{errors.currentPassword}</span>}
                                </div>
                                
                                <div className="card-actions justify-end">
                                    <button 
                                        type="submit" 
                                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                        disabled={loading}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-semibold">Name</span>
                                        <p>{user.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Email</span>
                                        <p>{user.email}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Role</span>
                                        <p>{user.role}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Account Created</span>
                                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center">
                            <h2 className="card-title text-xl">Change Password</h2>
                            {!editMode.password ? (
                                <button 
                                    onClick={() => setEditMode(prev => ({...prev, password: true}))}
                                    className="btn btn-sm btn-primary"
                                >
                                    Change Password
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setEditMode(prev => ({...prev, password: false}));
                                        setFormData(prev => ({
                                            ...prev,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        }));
                                        setErrors({});
                                    }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        
                        {editMode.password && (
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Current Password</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        value={formData.currentPassword} 
                                        onChange={handleChange}
                                        className={`input input-bordered ${errors.currentPassword ? 'input-error' : ''}`}
                                    />
                                    {errors.currentPassword && <span className="text-error text-sm mt-1">{errors.currentPassword}</span>}
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">New Password</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        name="newPassword" 
                                        value={formData.newPassword} 
                                        onChange={handleChange}
                                        className={`input input-bordered ${errors.newPassword ? 'input-error' : ''}`}
                                    />
                                    {errors.newPassword && <span className="text-error text-sm mt-1">{errors.newPassword}</span>}
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Confirm New Password</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange}
                                        className={`input input-bordered ${errors.confirmPassword ? 'input-error' : ''}`}
                                    />
                                    {errors.confirmPassword && <span className="text-error text-sm mt-1">{errors.confirmPassword}</span>}
                                </div>
                                
                                <div className="card-actions justify-end">
                                    <button 
                                        type="submit" 
                                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                        disabled={loading}
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ThemeProvider for global theme management
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    useEffect(() => {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default AccountSettings;
