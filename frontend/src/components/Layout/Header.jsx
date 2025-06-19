import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="navbar bg-base-100 shadow-lg">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/jobs">Jobs</Link></li>
                        {user && (
                            <>
                                {user.role === 'Job Seeker' && (
                                    <li><Link to="/my-applications">My Applications</Link></li>
                                )}
                                {user.role === 'Employer' && (
                                    <>
                                        <li><Link to="/my-jobs">My Jobs</Link></li>
                                        <li><Link to="/employer-applications">Applications</Link></li>
                                    </>
                                )}
                                {/* Profile hanya untuk Job Seeker */}
                                {user.role === 'Job Seeker' && (
                                    <li><Link to="/profile">Profile</Link></li>
                                )}
                                {user.role === 'Admin' && (
                                    <li><Link to="/admin/users">Admin Panel</Link></li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    <span className="text-primary">BDCM</span>
                </Link>
            </div>
            
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/" className="btn btn-ghost">Home</Link></li>
                    <li><Link to="/jobs" className="btn btn-ghost">Jobs</Link></li>
                    {user && (
                        <>
                            {user.role === 'Job Seeker' && (
                                <li><Link to="/my-applications" className="btn btn-ghost">My Applications</Link></li>
                            )}
                            {user.role === 'Employer' && (
                                <>
                                    <li><Link to="/my-jobs" className="btn btn-ghost">My Jobs</Link></li>
                                    <li><Link to="/employer-applications" className="btn btn-ghost">Applications</Link></li>
                                </>
                            )}
                            {/* Profile hanya untuk Job Seeker */}
                            {user.role === 'Job Seeker' && (
                                <li><Link to="/profile" className="btn btn-ghost">Profile</Link></li>
                            )}
                            {/* Admin Panel di navbar utama */}
                            {user.role === 'Admin' && (
                                <li><Link to="/admin/users" className="btn btn-ghost">Admin Panel</Link></li>
                            )}
                        </>
                    )}
                </ul>
            </div>
            
            <div className="navbar-end">
                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li className="menu-title">
                                <span className="text-xs">{user.email}</span>
                            </li>
                            {/* Profile hanya untuk Job Seeker */}
                            {user.role === 'Job Seeker' && <li><Link to="/profile">Profile</Link></li>}
                            <li><Link to="/account">Account Settings</Link></li>
                            {user.role === 'Employer' && (
                                <>
                                    <li><Link to="/my-jobs">My Jobs</Link></li>
                                    <li><Link to="/employer-applications">Applications</Link></li>
                                </>
                            )}
                            {user.role === 'Job Seeker' && (
                                <li><Link to="/my-applications">My Applications</Link></li>
                            )}
                            {user.role === 'Admin' && (
                                <li><Link to="/admin/users">Admin Panel</Link></li>
                            )}
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <div className="space-x-2">
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;