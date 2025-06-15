import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';

const JobseekerProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const profileData = await getUserProfile(userId);
                setProfile(profileData);
            } catch (err) {
                setError(err.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="alert alert-error shadow-lg">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="alert alert-info shadow-lg">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Profile not found.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Jobseeker Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                <div className="avatar placeholder mb-4">
                                    <div className="bg-neutral text-neutral-content rounded-full w-24">
                                        <span className="text-3xl">{profile.full_name?.charAt(0) || '-'}</span>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-center">{profile.full_name}</h2>
                                <p className="text-gray-600 text-center mt-1">{profile.phone}</p>
                                <div className="mt-4 w-full">
                                    <p className="text-sm font-semibold text-gray-700">Skills</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, idx) => (
                                            <span key={idx} className="badge badge-primary badge-outline">{skill}</span>
                                        )) : <span className="text-gray-400">No skills listed.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Personal Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Age</p>
                                        <p className="font-medium">{profile.age ? `${profile.age} years` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Gender</p>
                                        <p className="font-medium">{profile.gender || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold border-b pb-2 mb-3">About Me</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {profile.description || "No description provided."}
                                </p>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Education</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {profile.education || "No education information provided."}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Work Experience</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {profile.experience || "No work experience provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobseekerProfile;
