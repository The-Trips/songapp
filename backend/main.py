# backend/main.py
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# 1. Allow React (localhost:5173) to talk to this Python server
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

# 2. Connect to Supabase
url = "https://iptncodjrbbmhpnjjbty.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdG5jb2RqcmJibWhwbmpqYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTA1MzcsImV4cCI6MjA4MTM4NjUzN30.kE76TY0J13k7IGil7iMPp6lnv2lYUCcCxv7fpveHkzU"
supabase: Client = create_client(url, key)

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Python Backend is running!"}

# Example: Get User Profile using the User ID
@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    # Query the 'profiles' table we created earlier
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    
    # Check if data exists
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
            
    return response.data[0]

# Example: A 'Search' endpoint that Python handles
@app.get("/api/search")
def search_songs(query: str):
    # This is where you would put complex Python logic (Pandas, AI, etc.)
    # For now, let's just return dummy data
    results = [
        {"song": "Hotline Bling", "artist": "Drake", "relevance": 0.98},
        {"song": "One Dance", "artist": "Drake", "relevance": 0.95},
    ]
    
    # Filter simply (in real life, you'd use a DB query or Pandas)
    filtered = [r for r in results if query.lower() in r['artist'].lower()]
    return filtered


@app.get("/api/protected-data")
def get_secret_data(authorization: str = Header(None)):
    token = authorization.split(" ")[1] # Remove "Bearer "
    user = supabase.auth.get_user(token) # Verify with Supabase
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Token")
        
    return {"secret": "This data is only for logged in users"}