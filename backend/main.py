# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Python Backend is running!"}

# Example: Get User Profile using the User ID (static data)
@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    # Return static mock data
    return {
        "id": user_id,
        "username": "demo_user",
        "full_name": "Demo User"
    }

# Example: A 'Search' endpoint that Python handles
@app.get("/api/search")
def search_songs(query: str):
    # Static search results
    results = [
        {"song": "Hotline Bling", "artist": "Drake", "relevance": 0.98},
        {"song": "One Dance", "artist": "Drake", "relevance": 0.95},
        {"song": "God's Plan", "artist": "Drake", "relevance": 0.92},
    ]
    
    # Filter based on query
    if query:
        filtered = [r for r in results if query.lower() in r['artist'].lower() or query.lower() in r['song'].lower()]
        return filtered
    return results

@app.get("/api/protected-data")
def get_secret_data():
    # Static endpoint - no authentication required
    return {"secret": "This is static data - no authentication needed"}