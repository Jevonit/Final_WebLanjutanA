import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobPostService } from '../../services/jobPosts';
import { useAuth } from '../../context/AuthContext';

const JobEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        job_type: 'Full-time',
        description: '',
        requirements: '', // multiline string
        salary_min: '',
        salary_max: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const job = await jobPostService.getById(Number(id));
                setFormData({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    job_type: job.job_type || 'Full-time',
                    description: job.description || '',
                    requirements: (job.requirements || []).join('\n'),
                    salary_min: job.salary_min?.toString() || '',
                    salary_max: job.salary_max?.toString() || ''
                });
            } catch (err) {
                setError('Failed to load job post');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
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
            if (!jobData.title || !jobData.company || !jobData.location || !jobData.description) {
                setError('Please fill in all required fields');
                setSaving(false);
                return;
            }
            if (jobData.requirements.length === 0) {
                setError('Please add at least one requirement');
                setSaving(false);
                return;
            }
            if (jobData.salary_min > jobData.salary_max) {
                setError('Minimum salary cannot be greater than maximum salary');
                setSaving(false);
                return;
            }
            await jobPostService.update(Number(id), jobData);
            navigate('/my-jobs', { state: { message: 'Job post updated successfully!' } });
        } catch (err) {
            setError(err.message || 'Failed to update job post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>;
    }
    if (!user || user.role !== 'Employer') {
        return <div className="alert alert-error mt-8">Access denied.</div>;
    }
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Edit Job Post</h1>
            {error && <div className="alert alert-error mb-6">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control md:col-span-2">
                                <label className="label"><span className="label-text">Job Title *</span></label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" required minLength={5} maxLength={200} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Company *</span></label>
                                <input type="text" name="company" value={formData.company} onChange={handleChange} className="input input-bordered" required minLength={2} maxLength={100} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Location *</span></label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="input input-bordered" required minLength={2} maxLength={100} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Job Type *</span></label>
                                <select name="job_type" value={formData.job_type} onChange={handleChange} className="select select-bordered" required>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Minimum Salary (IDR) *</span></label>
                                <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className="input input-bordered" required min="0" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Maximum Salary (IDR) *</span></label>
                                <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className="input input-bordered" required min="0" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Job Details</h2>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Job Description *</span></label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-32" required minLength={10} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Requirements *</span><span className="label-text-alt">One requirement per line</span></label>
                            <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="textarea textarea-bordered h-32" required />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-end">
                    <button type="button" onClick={() => navigate('/my-jobs')} className="btn btn-ghost" disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? (<><span className="loading loading-spinner loading-sm"></span> Saving...</>) : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
};

export default JobEditForm;
