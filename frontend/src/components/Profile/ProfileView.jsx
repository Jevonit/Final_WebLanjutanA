import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/api';

const ProfileView = ({ onEditClick }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Use _id instead of id to match the backend model
        const profileData = await getUserProfile(user._id);
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // Jika error 404 (profile tidak ditemukan), kita tidak anggap sebagai error
        // melainkan hanya set profile menjadi null agar pesan "profil belum dibuat" muncul
        if (err.message.includes('not found') || err.message.includes('Profile not found')) {
          // Tidak perlu set error, biarkan profile = null
          setProfile(null);
        } else {
          // Untuk error lainnya (server error, koneksi, dll)
          setError("Gagal memuat profil. Silakan coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="alert alert-info shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Profil belum dibuat. Silakan klik tombol "Edit Profile" untuk membuat profil Anda.</span>
        </div>
        <div className="flex-none">
          <button onClick={onEditClick} className="btn btn-sm btn-primary">Buat Profil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <div className="avatar placeholder mb-4">
              <div className="bg-neutral text-neutral-content rounded-full w-24">
                <span className="text-3xl">{profile.full_name.charAt(0)}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-center">{profile.full_name}</h2>
            <p className="text-gray-600 text-center mt-1">{profile.phone}</p>
            <div className="mt-4 w-full">
              <p className="text-sm font-semibold text-gray-700">Keahlian</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills && profile.skills.map((skill, index) => (
                  <span key={index} className="badge badge-primary badge-outline">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">          <div className="mb-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Usia</p>
                <p className="font-medium">{profile.age} tahun</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                <p className="font-medium">{profile.gender}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Tentang Saya</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {profile.description || "Tidak ada deskripsi yang diberikan."}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Pendidikan</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {profile.education || "Tidak ada informasi pendidikan yang diberikan."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Pengalaman Kerja</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {profile.experience || "Tidak ada pengalaman kerja yang diberikan."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
