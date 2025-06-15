import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobPostService } from '../services/jobPosts';
import { getApplications } from '../services/api';

const JobApplications = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect if not employer
        if (user && user.role !== 'Employer') {
            navigate('/');
            return;
        }

        fetchJobAndApplications();
    }, [user, navigate, jobId]);

    const fetchJobAndApplications = async () => {
        try {
            setLoading(true);
            
            // Fetch job details
            const jobResponse = await jobPostService.getById(jobId);
              // Check if current user is the employer of this job
            if (jobResponse.user_id !== user.id) {
                setError('You are not authorized to view applications for this job');
                return;
            }
            
            setJob(jobResponse);
            
            // Fetch applications for this job
            const applicationsResponse = await getApplications({ job_post_id: jobId });
            setApplications(applicationsResponse.data || []);
            
        } catch (error) {
            console.error('Error fetching job applications:', error);
            setError('Failed to load job applications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            // This would call the API to update application status
            // await updateApplication(applicationId, { status: newStatus });
            
            // Update local state
            setApplications(prev => 
                prev.map(app => 
                    app.id === applicationId 
                        ? { ...app, status: newStatus }
                        : app
                )
            );
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Failed to update application status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
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

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button 
                    onClick={() => navigate('/my-jobs')}
                    className="btn btn-ghost mb-4"
                >
                    ← Back to My Jobs
                </button>
                
                <h1 className="text-3xl font-bold mb-2">Applications for {job?.title}</h1>
                <p className="text-gray-600">
                    {applications.length} application{applications.length !== 1 ? 's' : ''} received
                </p>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                    <p className="text-gray-600">Applications will appear here once candidates apply for this position.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((application) => (
                        <div key={application.id} className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <h3 className="card-title mb-2">
                                            {application.user?.full_name || application.user?.email}
                                        </h3>
                                        <div className="text-sm text-gray-600 mb-3">
                                            Applied on {formatDate(application.created_at)}
                                        </div>
                                        
                                        {application.cover_letter && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold mb-2">Cover Letter:</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                                                    {application.cover_letter}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {application.cv_file && (
                                            <div className="mb-4">
                                                <a 
                                                    href={application.cv_file} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    📄 View CV
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className="dropdown dropdown-end">
                                            <label tabIndex={0} className={`btn btn-sm ${
                                                application.status === 'pending' ? 'btn-warning' :
                                                application.status === 'accepted' ? 'btn-success' :
                                                application.status === 'rejected' ? 'btn-error' :
                                                'btn-ghost'
                                            }`}>
                                                {application.status || 'pending'}
                                            </label>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                                                <li>
                                                    <button onClick={() => handleStatusUpdate(application.id, 'pending')}>
                                                        Pending
                                                    </button>
                                                </li>
                                                <li>
                                                    <button onClick={() => handleStatusUpdate(application.id, 'accepted')}>
                                                        Accept
                                                    </button>
                                                </li>
                                                <li>
                                                    <button onClick={() => handleStatusUpdate(application.id, 'rejected')}>
                                                        Reject
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobApplications;
