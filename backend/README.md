# Final Web Lanjutan A - Backend

Backend API untuk proyek Final Web Lanjutan A menggunakan FastAPI dan MongoDB Atlas.

## Setup

1. Pastikan Python 3.7+ terinstall
2. Aktifkan virtual environment:
   ```
   venv\Scripts\activate
   ```
3. Install dependensi:
   ```
   pip install -r requirements.txt
   ```
4. Atur konfigurasi di file `.env`:
   ```
   APP_NAME=Final_WebLanjutanA
   APP_PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret
   ```
5. Jalankan server:
   ```
   python run.py
   ```

## API Endpoints

### Autentikasi
- `POST /auth/register` - Registrasi pengguna baru
- `POST /auth/token` - Login dan dapatkan token JWT
- `GET /auth/me` - Dapatkan info pengguna saat ini

### Users
- `GET /users` - Mendapatkan daftar pengguna
- `POST /users` - Membuat pengguna baru
- `GET /users/{user_id}` - Mendapatkan pengguna berdasarkan ID
- `PUT /users/{user_id}` - Memperbarui pengguna
- `DELETE /users/{user_id}` - Menghapus pengguna

### Profiles
- `GET /profiles` - Mendapatkan daftar profil
- `POST /profiles` - Membuat profil baru
- `GET /profiles/{profile_id}` - Mendapatkan profil berdasarkan ID
- `GET /profiles/user/{user_id}` - Mendapatkan profil berdasarkan ID pengguna
- `PUT /profiles/{profile_id}` - Memperbarui profil
- `DELETE /profiles/{profile_id}` - Menghapus profil

### Job Posts
- `GET /job-posts` - Mendapatkan daftar lowongan kerja
- `POST /job-posts` - Membuat lowongan kerja baru
- `GET /job-posts/{job_post_id}` - Mendapatkan lowongan kerja berdasarkan ID
- `GET /job-posts/user/{user_id}` - Mendapatkan lowongan kerja berdasarkan ID pengguna
- `PUT /job-posts/{job_post_id}` - Memperbarui lowongan kerja
- `DELETE /job-posts/{job_post_id}` - Menghapus lowongan kerja

### Applications
- `GET /applications` - Mendapatkan daftar lamaran
- `POST /applications` - Membuat lamaran baru
- `GET /applications/{application_id}` - Mendapatkan lamaran berdasarkan ID
- `GET /applications/user/{user_id}` - Mendapatkan lamaran berdasarkan ID pengguna
- `GET /applications/job-post/{job_post_id}` - Mendapatkan lamaran berdasarkan ID lowongan
- `PUT /applications/{application_id}` - Memperbarui status lamaran
- `DELETE /applications/{application_id}` - Menghapus lamaran

### Dokumentasi API
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc
