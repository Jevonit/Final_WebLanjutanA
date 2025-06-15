import React from 'react';
import JobPostList from '../components/JobPosts/JobPostList';

const Jobs = () => {
    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
                <p className="text-lg text-base-content/70">
                    Discover your next career opportunity from our latest job postings
                </p>
            </div>
            <JobPostList />
        </div>
    );
};

export default Jobs;