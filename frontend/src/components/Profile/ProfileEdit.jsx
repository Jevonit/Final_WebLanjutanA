import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, createUserProfile, updateUserProfile } from '../../services/api';

const ProfileEdit = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    user_id: '',
    full_name: '',
    phone: '',
    age: '',
    gender: '',
    description: '',
    skills: [],
    experience: '',
    education: ''
  });

  // For handling skills input as a comma-separated string
  const [skillsInput, setSkillsInput] = useState('');  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Use _id instead of id to match the backend model
        const profileData = await getUserProfile(user._id);
        setFormData({
          ...profileData,
          user_id: user._id
        });
        setSkillsInput(profileData.skills.join(', '));
      } catch (err) {
        if (err.message.includes('not found') || err.message.includes('Profile not found')) {
          // Profile doesn't exist yet, initialize with user ID
          setFormData({
            ...formData,
            user_id: user._id
          });
        } else {
          console.error("Error fetching profile:", err);
          setError("Gagal memuat profil. Silakan coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
    // Convert comma-separated string to array and trim whitespace
    const skillsArray = e.target.value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    
    setFormData({
      ...formData,
      skills: skillsArray
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      let response;

      // Check if profile has an ID (exists and needs update) or not (needs creation)
      if (formData._id) {
        response = await updateUserProfile(formData._id, formData);
      } else {
        response = await createUserProfile(formData);
      }      setSuccessMessage('Profil berhasil disimpan!');
      
      // Wait a bit before redirecting
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Gagal menyimpan profil. Silakan periksa informasi Anda dan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success shadow-lg mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              minLength="2"
              maxLength="100"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Phone Number*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              minLength="10"
              maxLength="20"
              placeholder="e.g., 081234567890"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Age*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              min="18"
              max="100"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Gender*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Skills (comma-separated)</span>
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={handleSkillsChange}
              className="input input-bordered w-full"
              placeholder="e.g., JavaScript, React, Node.js"
            />
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="badge badge-primary badge-outline">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">About Me / Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              maxLength="1000"
              placeholder="Tell us about yourself, your interests, and career goals..."
            ></textarea>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Education Background</span>
            </label>
            <textarea
              name="education"
              value={formData.education || ''}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              maxLength="1000"
              placeholder="List your educational qualifications, degrees, certifications..."
            ></textarea>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Work Experience</span>
            </label>
            <textarea
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              maxLength="2000"
              placeholder="Detail your work experience, roles, responsibilities, achievements..."
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              </>
            ) : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
