import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createApplication, getUserProfile, getApplicationsByUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ApplicationForm = () => {
    const { id: jobPostId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const jobPost = location.state?.jobPost;
    
    const [formData, setFormData] = useState({
        job_post_id: jobPostId || '',
        cv_file: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [canApply, setCanApply] = useState(null); // null = loading, true/false = result
    const [applyMessage, setApplyMessage] = useState('');

    useEffect(() => {
        // Redirect if user is not a jobseeker
        if (!user) {
            navigate('/login', { 
                state: { 
                    from: { pathname: `/jobs/${jobPostId}/apply` },
                    message: 'Please login to apply for this job'
                }
            });
            return;
        }
        
        if (user.role !== 'Job Seeker') {
            navigate(`/jobs/${jobPostId}`, {
                state: { message: 'Only job seekers can apply for positions' }
            });
            return;
        }

        // Fetch user profile
        const fetchUserProfile = async () => {
            setLoadingProfile(true);
            try {
                const profileData = await getUserProfile(user._id);
                setProfile(profileData);
            } catch (err) {
                console.error('Error fetching profile:', err);
                // If profile not found, redirect to profile page
                if (err.message.includes('not found') || err.message.includes('Profile not found')) {
                    navigate('/profile', { 
                        state: { 
                            message: 'Please complete your profile before applying for jobs',
                            returnPath: `/jobs/${jobPostId}/apply`
                        } 
                    });
                }
            } finally {
                setLoadingProfile(false);
            }
        };

        // Check if user can apply to this job
        const checkExistingApplication = async () => {
            if (!user || !jobPostId) return;
            try {
                const data = await getApplicationsByUser(user._id);
                // data.items or data.data
                const items = data.items || data.data || [];
                const existing = items.find(app => String(app.job_post_id) === String(jobPostId));
                if (existing) {
                    if (existing.status === 'Pending') {
                        setCanApply(false);
                        setApplyMessage('You already have a pending application for this job.');
                    } else if (existing.status === 'Accepted') {
                        setCanApply(false);
                        setApplyMessage('You have already been accepted for this job.');
                    } else if (existing.status === 'Rejected') {
                        setCanApply(true);
                        setApplyMessage('Your previous application was rejected. You may re-apply.');
                    } else {
                        setCanApply(false);
                        setApplyMessage('You have already applied for this job.');
                    }
                } else {
                    setCanApply(true);
                    setApplyMessage('');
                }
            } catch (err) {
                setCanApply(true); // fallback: allow
                setApplyMessage('');
            }
        };

        fetchUserProfile();
        checkExistingApplication();
    }, [user, jobPostId, navigate]);

    const handleBack = () => {
        navigate(`/jobs/${jobPostId}`);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF, DOC, or DOCX file');
                return;
            }
            
            setError('');
            setFormData({ ...formData, cv_file: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!profile) {
            setError('Profile not found. Please complete your profile first.');
            setLoading(false);
            return;
        }

        try {
            // Convert CV file to base64
            const cvFileBase64 = await fileToBase64(formData.cv_file);
            
            // Prepare application data
            const applicationData = {
                user_id: user._id,
                job_post_id: parseInt(formData.job_post_id),
                cv_data: cvFileBase64,
                cv_filename: formData.cv_file.name,
                cv_content_type: formData.cv_file.type
            };

            await createApplication(applicationData);
            
            // Navigate back to job detail with success message
            navigate(`/jobs/${jobPostId}`, {
                state: { 
                    message: 'Application submitted successfully!',
                    messageType: 'success'
                }
            });
        } catch (err) {
            console.error('Application submission error:', err);
            setError(err.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Don't render if user is not authenticated or not a jobseeker
    if (!user || user.role !== 'Job Seeker') {
        return null;
    }

    // Show loading state while fetching profile or checking application
    if (loadingProfile || canApply === null) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Don't render if profile doesn't exist
    if (!profile) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <button 
                    onClick={handleBack}
                    className="btn btn-ghost btn-sm mb-4"
                >
                    ← Back to Job Details
                </button>
            </div>

            {jobPost && (
                <div className="card bg-base-100 shadow-lg mb-6">
                    <div className="card-body">
                        <h2 className="card-title text-xl">Applying for:</h2>
                        <h3 className="font-bold text-lg">{jobPost.title}</h3>
                        <p className="text-base-content/70">{jobPost.company} • {jobPost.location}</p>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="card bg-base-100 shadow-lg mb-6">
                <div className="card-body">
                    <h2 className="card-title text-xl">Your Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <p className="font-medium text-gray-700">Full Name</p>
                            <p className="font-bold">{profile.full_name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Phone Number</p>
                            <p>{profile.phone}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Usia</p>
                            <p>{profile.age} tahun</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Jenis Kelamin</p>
                            <p>{profile.gender}</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="font-medium text-gray-700">Keahlian</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {profile.skills && profile.skills.map((skill, index) => (
                                <span key={index} className="badge badge-primary badge-outline">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-6">Submit Your Application</h2>
                    {applyMessage && (
                        <div className={`alert ${canApply ? 'alert-info' : 'alert-warning'} mb-4`}>
                            <span>{applyMessage}</span>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* CV Upload */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Upload CV/Resume *</span>
                            </label>
                            <input
                                type="file"
                                className="file-input file-input-bordered w-full"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                required
                                disabled={!canApply}
                            />
                            <label className="label">
                                <span className="label-text-alt">Accepted formats: PDF, DOC, DOCX (max 5MB)</span>
                            </label>
                        </div>
                        {/* Submit Button */}
                        <div className="form-control mt-8">
                            <button
                                type="submit"
                                className={`btn btn-primary btn-lg w-full ${loading ? 'loading' : ''}`}
                                disabled={loading || !canApply}
                            >
                                {loading ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationForm;