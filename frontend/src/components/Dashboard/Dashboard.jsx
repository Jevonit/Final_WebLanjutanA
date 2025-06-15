import React from 'react';

const Dashboard = () => {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                    <p className="text-gray-700">This is your dashboard. Here you can see a summary of your activity, quick links, and more features coming soon.</p>
                </div>
                {/* Add more dashboard widgets or stats here as needed */}
            </div>
        </div>
    );
};

export default Dashboard;
