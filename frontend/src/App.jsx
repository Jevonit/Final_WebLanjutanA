import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/Account/AccountSettings';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import MyJobs from './pages/MyJobs';
import Profile from './pages/Profile';
import Account from './pages/Account';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import JobPostList from './components/JobPosts/JobPostList';
import JobPostDetail from './components/JobPosts/JobPostDetail';
import JobCreateForm from './components/JobPosts/JobCreateForm';
import JobEditForm from './components/JobPosts/JobEditForm';
import ApplicationList from './components/Applications/ApplicationList';
import ApplicationForm from './components/Applications/ApplicationForm';
import EmployerApplications from './components/Applications/EmployerApplications';
import Header from './components/Layout/Header';
import JobseekerProfile from './components/Profile/JobseekerProfile';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/create" element={<JobCreateForm />} />
                <Route path="/jobs/:id" element={<JobPostDetail />} />
                <Route path="/jobs/:id/apply" element={<ApplicationForm />} />
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/my-jobs" element={<MyJobs />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/job-posts" element={<JobPostList />} />
                <Route path="/applications" element={<ApplicationList />} />
                <Route path="/jobs/:id/edit" element={<JobEditForm />} />
                <Route path="/employer-applications" element={<EmployerApplications />} />
                <Route path="/jobseeker-profile/:userId" element={<JobseekerProfile />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;