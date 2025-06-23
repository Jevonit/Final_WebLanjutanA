import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getJobPost, getUserProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [jobPost, setJobPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJobPost();
    }, [id]);

    const fetchJobPost = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getJobPost(Number(id));
            setJobPost(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch job details');
            console.error('Error fetching job post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login', { 
                state: { 
                    from: { pathname: `/jobs/${id}` },
                    message: 'Silakan login untuk melamar pekerjaan ini'
                }
            });
            return;
        }
        
        // Only jobseekers can apply
        if (user.role !== 'Job Seeker') {
            return;
        }

        try {
            // Check if user has a profile
            await getUserProfile(user._id);
            
            // If profile exists, navigate to application form
            navigate(`/jobs/${id}/apply`, { state: { jobPost } });
        } catch (err) {
            // If profile doesn't exist, redirect to profile page
            if (err.message.includes('not found') || err.message.includes('Profile not found')) {
                navigate('/profile', { 
                    state: { 
                        message: 'Silakan lengkapi profil Anda terlebih dahulu sebelum melamar pekerjaan',
                        returnPath: `/jobs/${id}/apply`
                    } 
                });
            } else {
                // Handle other errors
                console.error('Error checking profile:', err);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-center items-center h-64">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Error: {error}</span>
                    <div>
                        <button className="btn btn-sm btn-ghost" onClick={fetchJobPost}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!jobPost) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold mb-2">Job Not Found</h3>
                    <p className="text-base-content/70">The job post you're looking for doesn't exist.</p>
                    <button className="btn btn-primary mt-4" onClick={handleBack}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <button 
                    onClick={handleBack}
                    className="btn btn-ghost btn-sm mb-4"
                >
                    ← Back to Jobs
                </button>
                
                {/* Success message from application submission */}
                {location.state?.message && (
                    <div className="alert alert-success mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{location.state.message}</span>
                    </div>
                )}
                
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{jobPost.title}</h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <div className="badge badge-secondary">{jobPost.job_type}</div>
                                </div>
                                <div className="text-lg text-base-content/70 mb-2">
                                    <span className="font-semibold">{jobPost.company}</span> • {jobPost.location}
                                </div>
                                <div className="text-xl font-bold text-primary">
                                    Rp{jobPost.salary_min?.toLocaleString()} - Rp{jobPost.salary_max?.toLocaleString()}
                                </div>
                                <div className="text-sm text-base-content/60 mt-2">
                                    Posted by: {jobPost.user_name || jobPost.user_fullname || jobPost.user_email || 'Unknown'}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {user && user.role === 'Job Seeker' ? (
                                    // Jobseeker: Show apply button
                                    <button 
                                        onClick={handleApply}
                                        className="btn btn-primary btn-lg"
                                    >
                                        Apply Now
                                    </button>
                                ) : user && user.role === 'Employer' ? (
                                    // Employer: No button, just info message
                                    <div className="alert alert-info">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span className="text-sm">Only job seekers can apply for positions</span>
                                    </div>
                                ) : (
                                    // Guest: Show login button
                                    <button 
                                        onClick={handleApply}
                                        className="btn btn-primary btn-lg"
                                    >
                                        Login to Apply
                                    </button>
                                )}
                                <div className="text-sm text-base-content/60 text-center">
                                    Posted on {new Date(jobPost.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Details */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title">Job Description</h2>
                            <div className="prose max-w-none">
                                <p className="text-base-content/80 whitespace-pre-line">
                                    {jobPost.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    {jobPost.requirements && jobPost.requirements.length > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Requirements</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {jobPost.requirements.map((req, index) => (
                                        <li key={index} className="text-base-content/80">
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {jobPost.responsibilities && jobPost.responsibilities.length > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Responsibilities</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {jobPost.responsibilities.map((resp, index) => (
                                        <li key={index} className="text-base-content/80">
                                            {resp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Benefits */}
                    {jobPost.benefits && jobPost.benefits.length > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Benefits</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {jobPost.benefits.map((benefit, index) => (
                                        <li key={index} className="text-base-content/80">
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Job Summary */}
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title">Job Summary</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="font-semibold">Company</div>
                                    <div className="text-base-content/70">{jobPost.company}</div>
                                </div>
                                <div>
                                    <div className="font-semibold">Location</div>
                                    <div className="text-base-content/70">{jobPost.location}</div>
                                </div>
                                <div>
                                    <div className="font-semibold">Job Type</div>
                                    <div className="text-base-content/70">{jobPost.job_type}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobPostDetail;