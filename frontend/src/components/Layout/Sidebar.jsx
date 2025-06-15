import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-64 h-full bg-gray-800 text-white">
            <h2 className="text-2xl font-bold p-4">Sidebar</h2>
            <ul className="space-y-2">
                <li>
                    <a href="/dashboard" className="block p-4 hover:bg-gray-700">Dashboard</a>
                </li>
                <li>
                    <a href="/jobs" className="block p-4 hover:bg-gray-700">Jobs</a>
                </li>
                <li>
                    <a href="/applications" className="block p-4 hover:bg-gray-700">My Applications</a>
                </li>
                <li>
                    <a href="/profile" className="block p-4 hover:bg-gray-700">Profile</a>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;