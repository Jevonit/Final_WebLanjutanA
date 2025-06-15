"""
Migrasi database untuk mengubah struktur dokumen sesuai model baru
- Menghapus field yang tidak diperlukan
- Menyesuaikan format data
"""

import asyncio
from database import db, get_db
from pymongo import MongoClient
from pymongo.errors import BulkWriteError
from datetime import datetime

async def migrate_job_posts():
    """Migrasi koleksi job_posts sesuai struktur baru"""
    print("Migrasi job_posts...")
    
    # Dapatkan semua job posts
    job_posts = await db.job_posts.find({}).to_list(length=None)
    
    for job_post in job_posts:
        # Fields yang akan dihapus
        fields_to_remove = [
            "image_data", 
            "image_filename", 
            "image_content_type",
            "is_active",
            "contact_email"
        ]
        
        # Hapus fields yang tidak diperlukan
        update_data = {f"$unset": {field: "" for field in fields_to_remove}}
        
        # Update dokumen
        result = await db.job_posts.update_one(
            {"_id": job_post["_id"]},
            update_data
        )
        
        print(f"  Job post {job_post['_id']} diupdate: {result.modified_count} perubahan")
    
    print(f"Total {len(job_posts)} job posts dimigrasi")

async def migrate_applications():
    """Migrasi koleksi applications sesuai struktur baru"""
    print("Migrasi applications...")
    
    # Dapatkan semua applications
    applications = await db.applications.find({}).to_list(length=None)
    
    for application in applications:
        # Fields yang akan dihapus
        fields_to_remove = ["cover_letter"]
        
        # Hapus fields yang tidak diperlukan
        update_data = {f"$unset": {field: "" for field in fields_to_remove}}
        
        # Tetapkan content type ke PDF
        if "cv_content_type" in application:
            update_data["$set"] = {"cv_content_type": "application/pdf"}
        
        # Update dokumen
        result = await db.applications.update_one(
            {"_id": application["_id"]},
            update_data
        )
        
        print(f"  Application {application['_id']} diupdate: {result.modified_count} perubahan")
    
    print(f"Total {len(applications)} applications dimigrasi")

async def migrate_profiles():
    """Migrasi koleksi profiles sesuai struktur baru"""
    print("Migrasi profiles...")
    
    # Dapatkan semua profiles
    profiles = await db.profiles.find({}).to_list(length=None)
    
    for profile in profiles:
        # Fields yang akan dihapus
        fields_to_remove = ["address", "certifications"]
        
        # Hapus fields yang tidak diperlukan
        update_data = {f"$unset": {field: "" for field in fields_to_remove}}
        
        # Update dokumen
        result = await db.profiles.update_one(
            {"_id": profile["_id"]},
            update_data
        )
        
        print(f"  Profile {profile['_id']} diupdate: {result.modified_count} perubahan")
    
    print(f"Total {len(profiles)} profiles dimigrasi")

async def main():
    """Fungsi utama untuk menjalankan semua migrasi"""
    print("Memulai migrasi database...")
    
    # Jalankan migrasi untuk semua koleksi
    await migrate_job_posts()
    await migrate_applications()
    await migrate_profiles()
    
    print("Migrasi selesai!")

if __name__ == "__main__":
    # Jalankan migrasi
    asyncio.run(main())
