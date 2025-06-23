import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobPosts } from '../../services/api';

const jobTypes = ["Full-time", "Part-time", "Freelance", "Other"];

const JobPostList = () => {
    const navigate = useNavigate();
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1
    });
    const [filters, setFilters] = useState({
        title: '',
        job_type: '',
        min_salary: '',
        max_salary: ''
    });

    useEffect(() => {
        fetchJobPosts();
    }, [pagination.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (pagination.page === 1) {
            fetchJobPosts();
        } else {
            setPagination(prev => ({ ...prev, page: 1 }));
        }
    };

    const fetchJobPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                skip: (pagination.page - 1) * pagination.limit,
                limit: pagination.limit,
                title: filters.title,
                job_type: filters.job_type,
                min_salary: filters.min_salary,
                max_salary: filters.max_salary,
            };

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await getJobPosts(params);
            
            // Backend returns data in 'data' field, not 'items' or 'jobs'
            const jobsArray = response?.data || response?.items || response?.jobs || [];
            setJobPosts(Array.isArray(jobsArray) ? jobsArray : []);
            
            // Update pagination info - backend returns 'pages' not 'totalPages'
            setPagination(prev => ({
                ...prev,
                total: response?.total || 0,
                totalPages: response?.pages || Math.ceil((response?.total || 0) / prev.limit)
            }));
        } catch (err) {
            setError(err.message || 'Failed to fetch job posts');
            console.error('Error fetching job posts:', err);
            setJobPosts([]); // Ensure jobPosts is always an array
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleViewDetails = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error: {error}</span>
                <div>
                    <button className="btn btn-sm btn-ghost" onClick={fetchJobPosts}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Available Jobs</h1>
                <div className="text-sm text-base-content/70">
                    Total: {pagination.total} jobs
                </div>
            </div>

            <div className="card bg-base-100 shadow-md p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="form-control lg:col-span-2">
                        <label className="label"><span className="label-text">Job Title</span></label>
                        <input 
                            type="text" 
                            name="title"
                            value={filters.title}
                            onChange={handleFilterChange}
                            placeholder="Search by job title..."
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Job Type</span></label>
                        <select 
                            name="job_type" 
                            value={filters.job_type}
                            onChange={handleFilterChange}
                            className="select select-bordered"
                        >
                            <option value="">All</option>
                            {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Min Salary</span></label>
                        <input 
                            type="number" 
                            name="min_salary"
                            value={filters.min_salary}
                            onChange={handleFilterChange}
                            placeholder="e.g. 5000000"
                            className="input input-bordered"
                        />
                    </div>
                    <div className="form-control">
                        <button type="submit" className="btn btn-primary w-full">Search</button>
                    </div>
                </form>
            </div>

            {jobPosts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-xl font-semibold mb-2">No job posts available</h3>
                    <p className="text-base-content/70">Check back later for new opportunities!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.isArray(jobPosts) && jobPosts.map((post) => (
                        <div key={post.id || post._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                            <div className="card-body">
                                <h2 className="card-title text-lg font-bold">
                                    {post.title}
                                    <div className="badge badge-secondary">{post.job_type}</div>
                                </h2>
                                
                                <div className="text-sm text-base-content/70 mb-2">
                                    <span className="font-semibold">{post.company}</span> • {post.location}
                                </div>
                                
                                <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
                                    {post.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.requirements && post.requirements.slice(0, 3).map((req, index) => (
                                        <div key={index} className="badge badge-outline badge-sm">
                                            {req}
                                        </div>
                                    ))}
                                    {post.requirements && post.requirements.length > 3 && (
                                        <div className="badge badge-outline badge-sm">
                                            +{post.requirements.length - 3} more
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm font-semibold text-primary">
                                        Rp{post.salary_min?.toLocaleString()} - Rp{post.salary_max?.toLocaleString()}
                                    </div>
                                </div>
                                
                                <div className="card-actions justify-end">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleViewDetails(post._id)}
                                    >
                                        View Details
                                    </button>
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
                            Previous
                        </button>
                        
                        {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = index + 1;
                            } else {
                                const start = Math.max(1, pagination.page - 2);
                                pageNum = start + index;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    className={`join-item btn ${pagination.page === pageNum ? 'btn-active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button 
                            className="join-item btn"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobPostList;