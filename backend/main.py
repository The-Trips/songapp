# backend/main.py
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
# from supabase import create_client, Client (Removed)
from typing import Optional

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data (Replaces DB)
MOCK_PROFILES = {
    "1": {"id": "1", "username": "MusicLover99", "full_name": "Test User"}
}

@app.get("/")
def read_root():
    return {"message": "Python Backend is running (No Database Mode)"}

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    profile = MOCK_PROFILES.get(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.get("/api/search")
def search_songs(query: str):
    results = [
        {"song": "Hotline Bling", "artist": "Drake", "relevance": 0.98},
        {"song": "One Dance", "artist": "Drake", "relevance": 0.95},
    ]
    
    filtered = [r for r in results if query.lower() in r['artist'].lower()]
    return filtered