import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/Profile/ProfileView';
import ProfileEdit from '../components/Profile/ProfileEdit';

const Profile = () => {
    const { user, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'Job Seeker') {
                setShowWarning(true);
                // Optional: redirect after a delay
                // setTimeout(() => navigate('/'), 2000);
            }
        }
    }, [user, loading, navigate]);

    if (loading) return null;
    if (showWarning) {
        return (
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="alert alert-warning shadow-lg mb-6">
                    <span>Hanya Job Seeker yang dapat mengakses halaman ini.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            
            {isEditing ? (
                <ProfileEdit onSuccess={() => setIsEditing(false)} />
            ) : (
                <ProfileView onEditClick={() => setIsEditing(true)} />
            )}
        </div>
    );
};

export default Profile;