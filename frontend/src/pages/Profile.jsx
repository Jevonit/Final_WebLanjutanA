import React, { useState } from 'react';
import ProfileView from '../components/Profile/ProfileView';
import ProfileEdit from '../components/Profile/ProfileEdit';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);

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