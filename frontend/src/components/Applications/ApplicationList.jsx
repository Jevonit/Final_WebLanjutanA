import React, { useEffect, useState } from 'react';
import { getApplicationsByUser, getJobPost } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ApplicationList = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user || !user._id) return;
            console.log('Current user context:', user); // DEBUG
            setLoading(true);
            setError(null);
            try {
                // Pastikan userId integer
                const userId = typeof user._id === 'string' ? parseInt(user._id, 10) : user._id;
                const data = await getApplicationsByUser(userId);
                console.log('API response:', data); // DEBUG
                // Ambil detail job post untuk setiap application
                const appsWithJob = await Promise.all(
                    (data.items || data.data || []).map(async (app) => {
                        let jobTitle = '';
                        let company = '';
                        try {
                            const job = await getJobPost(app.job_post_id);
                            jobTitle = job.title;
                            company = job.company;
                        } catch {
                            jobTitle = `Job #${app.job_post_id}`;
                            company = '-';
                        }
                        return {
                            ...app,
                            job_post_title: jobTitle,
                            job_post_company: company
                        };
                    })
                );
                setApplications(appsWithJob);
            } catch (err) {
                setError(err.message || 'Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [user]);

    // Fungsi untuk download CV dari base64
    const handleDownloadCV = (filename, base64, mimeType = 'application/pdf') => {
        const link = document.createElement('a');
        link.href = `data:${mimeType};base64,${base64}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

    return (
        <div className="overflow-x-auto">
            {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No applications found.</div>
            ) : (
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>CV</th>
                            <th>Applied At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id}>
                                <td>{app.job_post_title}</td>
                                <td>{app.job_post_company}</td>
                                <td>
                                    <span
                                        className={
                                            `px-2 py-1 rounded font-semibold ` +
                                            (app.status === 'Accepted'
                                                ? 'bg-green-100 text-green-700 border border-green-400'
                                                : app.status === 'Rejected'
                                                ? 'bg-red-100 text-red-700 border border-red-400'
                                                : 'bg-gray-100 text-gray-700 border border-gray-400')
                                        }
                                    >
                                        {app.status}
                                    </span>
                                </td>
                                <td>{app.cv_filename && app.cv_data ? (
                                    <button
                                        className="text-blue-600 underline hover:text-blue-800"
                                        onClick={() => handleDownloadCV(app.cv_filename, app.cv_data, app.cv_content_type)}
                                    >
                                        {app.cv_filename}
                                    </button>
                                ) : '-'}</td>
                                <td>{app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ApplicationList;
