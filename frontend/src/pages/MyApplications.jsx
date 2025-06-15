import React from 'react';
import ApplicationList from '../components/Applications/ApplicationList';
import ErrorBoundary from '../components/ErrorBoundary';

const MyApplications = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Applications</h1>
            <ErrorBoundary fallback="There was an error loading your applications. Please try again later.">
                <ApplicationList />
            </ErrorBoundary>
        </div>
    );
};

export default MyApplications;