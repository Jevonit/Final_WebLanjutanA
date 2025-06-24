import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobPosts } from '../services/api';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    useEffect(() => {
        fetchJobs();
    }, [pagination.page]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getJobPosts({
                skip: (pagination.page - 1) * pagination.limit,
                limit: pagination.limit
            });
            
            // Backend returns data in 'data' field, not 'items' or 'jobs'
            const jobsArray = response?.data || response?.items || response?.jobs || [];
            setJobs(Array.isArray(jobsArray) ? jobsArray : []);
            
            // Update pagination info - backend returns 'pages' not 'totalPages'
            setPagination(prev => ({
                ...prev,
                total: response?.total || 0,
                totalPages: response?.pages || Math.ceil((response?.total || 0) / prev.limit)
            }));
        } catch (err) {
            setError(err.message || 'Failed to fetch jobs');
            console.error('Error fetching jobs:', err);
            setJobs([]); // Ensure jobs is always an array
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleViewDetails = (jobId) => {
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login', {
                state: {
                    from: { pathname: `/jobs/${jobId}` },
                    message: 'Please login to view job details'
                }
            });
            return;
        }
        navigate(`/jobs/${jobId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <div className="hero bg-primary text-primary-content py-20">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold">BDCM</h1>
                        <p className="py-6">
                            Find your dream job or discover talented professionals. 
                            Your career journey starts here.
                        </p>
                        {!user && (
                            <div className="space-x-4">
                                <button className="btn btn-secondary">Get Started</button>
                                <button className="btn btn-outline">Learn More</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Listings Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Latest Job Opportunities</h2>
                    <p className="text-lg text-base-content/70">
                        Discover exciting career opportunities from top companies
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                        <div>
                            <button className="btn btn-sm btn-ghost" onClick={fetchJobs}>
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {jobs.length === 0 && !error ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💼</div>
                        <h3 className="text-xl font-semibold mb-2">No jobs available</h3>
                        <p className="text-base-content/70">Check back later for new opportunities!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.isArray(jobs) && jobs.map((job) => (
                            <div key={job.id || job._id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-lg font-bold">{job.title}</h3>
                                    <p className="text-sm text-base-content/70 mb-2">{job.company}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <div className="badge badge-primary">{job.job_type}</div>
                                        <div className="badge badge-outline">{job.location}</div>
                                    </div>
                                    
                                    <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
                                        {job.description}
                                    </p>
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-base-content/70">
                                            Rp{job.salary_min?.toLocaleString()} - Rp{job.salary_max?.toLocaleString()}
                                        </div>
                                        <div className="card-actions">
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleViewDetails(job.id || job._id)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="join">
                            <button 
                                className="join-item btn"
                                disabled={pagination.page === 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                            >
                                «
                            </button>
                            
                            {[...Array(pagination.totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`join-item btn ${pagination.page === index + 1 ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            
                            <button 
                                className="join-item btn"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;