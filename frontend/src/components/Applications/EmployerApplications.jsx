import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getApplicationsByJob, updateApplication, getUser } from '../../services/api';
import jobPostService from '../../services/jobPosts';
import { useAuth } from '../../context/AuthContext';

const EmployerApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(''); // State for status filter
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    const fetchEmployerData = useCallback(async () => {
        if (!user || user.role !== 'Employer') return;

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch all job posts for the current employer
            const jobsResponse = await jobPostService.getByUser(user._id);
            const employerJobs = jobsResponse.items || jobsResponse.data || [];
            setJobs(employerJobs);

            // 2. Concurrently fetch applications for all job posts
            const applicationPromises = employerJobs.map(async (job) => {
                try {
                    const appsData = await getApplicationsByJob(job._id);
                    const apps = appsData.items || appsData.data || [];
                    // Attach job context to each application
                    return apps.map(app => ({
                        ...app,
                        job_post_title: job.title,
                        job_post_id: job._id
                    }));
                } catch (error) {
                    console.error(`Failed to fetch applications for job ${job._id}`, error);
                    return []; // Return empty array on error for a specific job
                }
            });

            const applicationsByJob = await Promise.all(applicationPromises);
            const allApplications = applicationsByJob.flat();

            // 3. Concurrently fetch applicant details for all applications
            const appsWithUserDetails = await Promise.all(
                allApplications.map(async (app) => {
                    try {
                        const applicant = await getUser(app.user_id);
                        return { ...app, applicant_name: applicant?.name || 'N/A' };
                    } catch (err) {
                        console.error(`Failed to fetch user ${app.user_id}`, err);
                        return { ...app, applicant_name: 'N/A' };
                    }
                })
            );

            setApplications(appsWithUserDetails);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEmployerData();
    }, [fetchEmployerData, actionMsg]);

    const handleAction = async (appId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) return;
        try {
            await updateApplication(appId, { status });
            // By changing actionMsg, we trigger the useEffect to refetch data
            setActionMsg(`Application status updated to ${status} at ${Date.now()}`);
        } catch (err) {
            setError(err.message || 'Failed to update application');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

    // Filter applications based on the selected job and status
    const filteredApplications = applications
        .filter(app => !selectedJob || String(app.job_post_id) === String(selectedJob))
        .filter(app => !selectedStatus || app.status === selectedStatus);

    return (
        <div className="overflow-x-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                 <h2 className="text-2xl font-bold mb-4 md:mb-0">Applications for My Job Posts</h2>
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="form-control">
                        <label className="label-text mr-2" htmlFor="job-filter">Filter by Job:</label>
                        <select 
                            id="job-filter"
                            className="select select-bordered w-full md:w-auto"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">All Jobs</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label-text mr-2" htmlFor="status-filter">Filter by Status:</label>
                        <select 
                            id="status-filter"
                            className="select select-bordered w-full md:w-auto"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>
           
            {actionMsg && <div className="alert alert-success shadow-lg mb-4"><div><span>{actionMsg.split(' at ')[0]}</span></div></div>}
            
            {filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No applications found for the selected job.</div>
            ) : (
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Applicant Name</th>
                            <th>Status</th>
                            <th>CV</th>
                            <th>Applied At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.map(app => (
                            <tr key={app._id}>
                                <td>{app.job_post_title}</td>
                                <td>{app.applicant_name}</td>
                                <td>
                                    <span className={`badge ${
                                        app.status === 'Accepted' ? 'badge-success' :
                                        app.status === 'Rejected' ? 'badge-error' :
                                        'badge-warning'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td>{app.cv_filename && app.cv_data ? (
                                    <a
                                        className="text-blue-600 underline hover:text-blue-800"
                                        href={`data:${app.cv_content_type || 'application/pdf'};base64,${app.cv_data}`}
                                        download={app.cv_filename}
                                    >
                                        {app.cv_filename}
                                    </a>
                                ) : 'No CV'}</td>
                                <td>{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</td>
                                <td className="space-x-2">
                                    <Link
                                        to={`/jobseeker-profile/${app.user_id}`}
                                        className="btn btn-xs btn-info"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Profile
                                    </Link>
                                    {app.status === 'Pending' && (
                                        <>
                                            <button
                                                className="btn btn-xs btn-success"
                                                onClick={() => handleAction(app._id, 'Accepted')}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-xs btn-error"
                                                onClick={() => handleAction(app._id, 'Rejected')}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EmployerApplications;
