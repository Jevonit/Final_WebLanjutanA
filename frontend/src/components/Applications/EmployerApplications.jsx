import React, { useEffect, useState } from 'react';
import { getJobPosts, getApplicationsByJob, updateApplication, getUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EmployerApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user || user.role !== 'Employer') return;
            setLoading(true);
            setError(null);
            try {
                // Ambil semua job post milik employer
                const jobsData = await getJobPosts({ employer_id: user._id });
                const jobs = jobsData.items || jobsData.data || [];
                // Ambil semua application untuk setiap job post
                let allApps = [];
                for (const job of jobs) {
                    const appsData = await getApplicationsByJob(job._id);
                    const apps = (appsData.items || appsData.data || []).map(app => ({
                        ...app,
                        job_post_title: job.title,
                        job_post_id: job._id
                    }));
                    allApps = allApps.concat(apps);
                }
                // Ambil nama pelamar
                const appsWithUser = await Promise.all(
                    allApps.map(async (app) => {
                        let applicantName = '-';
                        try {
                            const applicant = await getUser(app.user_id);
                            applicantName = applicant.name;
                        } catch {}
                        return { ...app, applicant_name: applicantName };
                    })
                );
                setApplications(appsWithUser);
            } catch (err) {
                setError(err.message || 'Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [user, actionMsg]);

    const handleAction = async (appId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) return;
        try {
            await updateApplication(appId, { status });
            setActionMsg(`Application has been ${status.toLowerCase()}.`);
        } catch (err) {
            setError(err.message || 'Failed to update application');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

    return (
        <div className="overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Applications to My Job Posts</h2>
            {actionMsg && <div className="text-green-600 mb-2">{actionMsg}</div>}
            {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No applications found.</div>
            ) : (
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Applicant</th>
                            <th>Status</th>
                            <th>CV</th>
                            <th>Applied At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id}>
                                <td>{app.job_post_title}</td>
                                <td>{app.applicant_name}</td>
                                <td>{app.status}</td>
                                <td>{app.cv_filename && app.cv_data ? (
                                    <a
                                        className="text-blue-600 underline hover:text-blue-800"
                                        href={`data:${app.cv_content_type || 'application/pdf'};base64,${app.cv_data}`}
                                        download={app.cv_filename}
                                    >
                                        {app.cv_filename}
                                    </a>
                                ) : '-'}</td>
                                <td>{app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button
                                        className="btn btn-xs btn-info mr-2"
                                        onClick={() => window.open(`/jobseeker-profile/${app.user_id}`, '_blank')}
                                    >
                                        View Profile
                                    </button>
                                    {app.status === 'Pending' ? (
                                        <>
                                            <button
                                                className="btn btn-xs btn-success mr-2"
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
                                    ) : (
                                        <span className="text-gray-400">Already {app.status.toLowerCase()}</span>
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
