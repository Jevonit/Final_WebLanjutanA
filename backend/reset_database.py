"""
Script untuk membersihkan database dan membuat struktur baru
Gunakan dengan hati-hati karena akan menghapus data yang ada
"""

import asyncio
from database import db, get_db
from pymongo import MongoClient
from datetime import datetime

async def reset_collections():
    """Menghapus dan membuat ulang semua koleksi"""
    # Daftar koleksi yang akan di-reset
    collections = ["job_posts", "applications", "profiles", "users", "counters"]
    
    for collection in collections:
        # Hapus semua dokumen di koleksi
        result = await db[collection].delete_many({})
        print(f"Menghapus koleksi {collection}: {result.deleted_count} dokumen dihapus")
    
    # Inisialisasi counter untuk auto-increment ID
    counters = [
        {"_id": "users", "seq": 0},
        {"_id": "profiles", "seq": 0},
        {"_id": "job_posts", "seq": 0},
        {"_id": "applications", "seq": 0},
    ]
    
    # Insert counters
    for counter in counters:
        await db.counters.insert_one(counter)
    
    print("Counters diinisialisasi ulang")

async def main():
    """Fungsi utama"""
    print("PERINGATAN: Script ini akan menghapus SEMUA data dari database.")
    confirm = input("Ketik 'YES' untuk melanjutkan: ")
    
    if confirm != "YES":
        print("Operasi dibatalkan.")
        return
    
    print("Memulai reset database...")
    
    # Reset semua koleksi
    await reset_collections()
    
    print("Reset database selesai!")

if __name__ == "__main__":
    # Jalankan reset
    asyncio.run(main())
