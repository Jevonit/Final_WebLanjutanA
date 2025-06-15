import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobPostService } from '../../services/jobPosts';

const JobCreateForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        job_type: 'Full-time',
        description: '',
        requirements: '', // multiline string, will be split to array
        salary_min: '0',
        salary_max: '0'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const jobTypes = ['Full-time', 'Part-time', 'Freelance', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || user.role !== 'Employer') {
            setError('Only employers can create job posts');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const jobData = {
                title: formData.title.trim(),
                company: formData.company.trim(),
                location: formData.location.trim(),
                job_type: formData.job_type,
                description: formData.description.trim(),
                requirements: formData.requirements.split('\n').map(req => req.trim()).filter(req => req.length > 0),
                salary_min: parseInt(formData.salary_min) || 0,
                salary_max: parseInt(formData.salary_max) || 0
            };
            // Validate required fields
            if (!jobData.title || !jobData.company || !jobData.location || !jobData.description) {
                setError('Please fill in all required fields');
                return;
            }
            if (jobData.requirements.length === 0) {
                setError('Please add at least one requirement');
                return;
            }
            await jobPostService.create(jobData);
            navigate('/my-jobs', {
                state: {
                    message: 'Job post created successfully!'
                }
            });
        } catch (error) {
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    const errorMessages = detail.map(err => {
                        const field = err.loc?.join('.') || 'Unknown field';
                        return `${field}: ${err.msg}`;
                    }).join(', ');
                    setError(`Validation errors: ${errorMessages}`);
                } else if (typeof detail === 'string') {
                    setError(detail);
                } else {
                    setError('Failed to create job post');
                }
            } else {
                setError(error.message || 'Failed to create job post');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'Employer') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="alert alert-error">
                    <span>Access denied. Only employers can create job posts.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Create New Job Post</h1>
                <p className="text-gray-600">Fill in the details to post a new job opening</p>
            </div>
            {error && (
                <div className="alert alert-error mb-6">
                    <span>{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text">Job Title *</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                    minLength={5}
                                    maxLength={200}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Company *</span>
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    placeholder="e.g. Tech Corp"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Location *</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    placeholder="e.g. Jakarta, Indonesia"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Job Type *</span>
                                </label>
                                <select
                                    name="job_type"
                                    value={formData.job_type}
                                    onChange={handleChange}
                                    className="select select-bordered"
                                    required
                                >
                                    {jobTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Minimum Salary (IDR) *</span>
                                </label>
                                <input
                                    type="number"
                                    name="salary_min"
                                    value={formData.salary_min}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                    min="0"
                                    placeholder="e.g. 8000000"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Maximum Salary (IDR) *</span>
                                </label>
                                <input
                                    type="number"
                                    name="salary_max"
                                    value={formData.salary_max}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                    min="0"
                                    placeholder="e.g. 15000000"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Job Details</h2>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Job Description *</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="textarea textarea-bordered h-32"
                                required
                                minLength={10}
                                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Requirements *</span>
                                <span className="label-text-alt">One requirement per line</span>
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                className="textarea textarea-bordered h-32"
                                required
                                placeholder="Minimum 3 years of experience in React&#10;Bachelor's degree in Computer Science&#10;Strong knowledge of JavaScript and TypeScript"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/my-jobs')}
                        className="btn btn-ghost"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            'Create Job Post'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobCreateForm;
