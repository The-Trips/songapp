# Song App

A full-stack music application built with React (Vite), Python FastAPI backend, and Supabase for authentication and database.

## Project Structure

- **Frontend**: React + Vite application (`src/`)
- **Backend**: Python FastAPI API (`backend/`)
- **Supabase**: Database, authentication, and edge functions (`supabase/`)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher, v20+ recommended)
  - Download from [nodejs.org](https://nodejs.org)
- **Python** (v3.10 or higher)
  - Check your version: `python3 --version`
- **Git** (optional, for cloning the repository)

### For Fully Local Development (No Website Required)

- **Docker Desktop**
  - Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Supabase CLI**
  - macOS: `brew install supabase/tap/supabase`
  - Windows/Linux: See [Supabase CLI Installation](https://supabase.com/docs/guides/cli/getting-started)

### For Hosted Supabase (Alternative)

- **Supabase Account** (only if you prefer hosted over local)
  - Sign up at [supabase.com](https://supabase.com)

## Setup Instructions

> **💡 Quick Start**: Choose **Option A** if you want to run everything locally without creating a Supabase account or visiting any website. You'll only need Docker Desktop and the Supabase CLI installed.

### Option A: Fully Local Setup (Recommended - No Website Required)

This option runs everything locally on your machine. **No Supabase account, website, or cloud services needed** - everything runs on your computer using Docker.

#### Step 1: Clone or Download the Repository

```bash
git clone <your-repo-url> song-app
cd song-app
```

Or download the ZIP file, extract it, and navigate to the `song-app` directory.

#### Step 2: Start Local Supabase

1. **Ensure Docker Desktop is Running**
   - Make sure Docker Desktop is installed and running before proceeding

2. **Start Supabase Locally**

```bash
supabase start
```

This command will:
- Download and start all Supabase services (Postgres, Auth, Storage, etc.)
- Use the configuration in `supabase/config.toml`
- **Print local credentials to your terminal** - you'll need these in the next step

3. **Copy Local Credentials**

After `supabase start` completes, you'll see output like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

4. **Update Frontend Configuration**

Open `src/supabaseClient.js` and replace with your local credentials:

```javascript
const supabaseUrl = 'http://127.0.0.1:54321'  // Your local API URL
const supabaseKey = 'YOUR_LOCAL_ANON_KEY_HERE'  // Your local anon key
```

5. **Update Backend Configuration**

Open `backend/main.py` and update lines 25-26:

```python
url = "http://127.0.0.1:54321"  # Your local API URL
key = "YOUR_LOCAL_ANON_KEY_HERE"  # Your local anon key (or service_role key)
```

6. **Access Local Supabase Studio** (Optional)

Open `http://localhost:54323` in your browser to manage your local database, create tables, and view data.

#### Step 3: Set Up the Frontend

1. **Install Dependencies**

```bash
npm install
```

2. **Start the Development Server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

#### Step 4: Set Up the Python Backend

1. **Navigate to the Backend Directory**

```bash
cd backend
```

2. **Create a Virtual Environment**

```bash
python3 -m venv venv
```

3. **Activate the Virtual Environment**

   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```

4. **Install Python Dependencies**

```bash
pip install fastapi uvicorn supabase-py
```

5. **Start the Backend Server**

```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

> **Note**: The backend is configured with CORS to allow requests from `http://localhost:5173` and `http://localhost:3000`

#### Step 5: (Optional) Run Edge Functions Locally

If you need to run the `spotify-search` edge function:

```bash
supabase functions serve spotify-search
```

---

### Option B: Hosted Supabase Setup (Alternative)

If you prefer to use a hosted Supabase project instead of running locally:

#### Step 1: Clone or Download the Repository

```bash
git clone <your-repo-url> song-app
cd song-app
```

Or download the ZIP file, extract it, and navigate to the `song-app` directory.

#### Step 2: Create Supabase Project

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to finish initializing

2. **Get Your Supabase Credentials**
   - In the Supabase dashboard, go to **Project Settings → API**
   - Copy your **Project URL** and **anon public key**

3. **Update Frontend Configuration**
   - Open `src/supabaseClient.js`
   - Replace the values with your Supabase credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE'
```

4. **Update Backend Configuration**
   - Open `backend/main.py`
   - Replace the Supabase URL and key (lines 25-26):

```python
url = "YOUR_SUPABASE_URL_HERE"
key = "YOUR_SUPABASE_ANON_KEY_HERE"
```

   > **Note**: For production, use a **service role key** instead of the anon key for backend operations. Never commit service keys to version control.

5. **Set Up Database Tables**
   - In the Supabase dashboard, go to **SQL Editor**
   - Create any required tables (e.g., a `profiles` table with an `id` column matching user IDs)
   - This ensures endpoints like `/api/profile/{user_id}` work correctly

#### Step 3: Set Up the Frontend

1. **Install Dependencies**

```bash
npm install
```

2. **Start the Development Server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

#### Step 4: Set Up the Python Backend

1. **Navigate to the Backend Directory**

```bash
cd backend
```

2. **Create a Virtual Environment**

```bash
python3 -m venv venv
```

3. **Activate the Virtual Environment**

   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```

4. **Install Python Dependencies**

```bash
pip install fastapi uvicorn supabase-py
```

5. **Start the Backend Server**

```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

> **Note**: The backend is configured with CORS to allow requests from `http://localhost:5173` and `http://localhost:3000`

## Running the Application

### For Local Development (Option A)

1. **Start Local Supabase** (if not already running)
   ```bash
   supabase start
   ```

2. **Start the Python Backend** (in one terminal)
   ```bash
   cd backend
   source venv/bin/activate  # or activate on Windows
   uvicorn main:app --reload --port 8000
   ```

3. **Start the Frontend** (in another terminal)
   ```bash
   npm run dev
   ```

4. **Open Your Browser**

Navigate to `http://localhost:5173` (or the URL shown in your terminal)

The frontend will communicate with:
- **Local Supabase** (`http://127.0.0.1:54321`): For authentication and database operations
- **Python Backend** (`http://localhost:8000`): For API endpoints like `/api/profile/{user_id}`, `/api/search`, `/api/protected-data`

### For Hosted Supabase (Option B)

Follow the same steps as above, but skip Step 1 (Supabase is already running in the cloud).

## Available Scripts

### Frontend

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

### Backend

- `uvicorn main:app --reload` - Start the FastAPI server with auto-reload
- `uvicorn main:app --reload --port 8000` - Start on a specific port

## API Endpoints

The Python backend provides the following endpoints:

- `GET /` - Health check
- `GET /api/profile/{user_id}` - Get user profile by ID
- `GET /api/search?query={query}` - Search songs
- `GET /api/protected-data` - Protected endpoint (requires authentication header)

## Troubleshooting

### Port Already in Use

If port 5173 (frontend) or 8000 (backend) is already in use:
- Frontend: Vite will automatically use the next available port
- Backend: Change the port: `uvicorn main:app --reload --port 8001`

### Python Virtual Environment Issues

If you encounter issues with the virtual environment:
- Make sure you're using Python 3.10+
- Delete the `venv` folder and recreate it
- Ensure you've activated the virtual environment before installing packages

### Supabase Connection Issues

**For Local Supabase:**
- Ensure Docker Desktop is running
- Verify `supabase start` completed successfully
- Check that the local API URL is `http://127.0.0.1:54321`
- Try restarting: `supabase stop` then `supabase start`

**For Hosted Supabase:**
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active (not paused)
- Ensure your network allows connections to Supabase

### CORS Errors

The backend is configured to allow requests from `localhost:5173` and `localhost:3000`. If you're using a different port, update the `origins` list in `backend/main.py`.

## Additional Resources

- [Vite Documentation](https://vite.dev)
- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Supabase Documentation](https://supabase.com/docs)
