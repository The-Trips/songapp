# Song App Setup Guide

This guide outlines the steps to set up and run the Song App on a local machine after cloning the repository. This project uses a React frontend and a FastAPI (Python) backend.

## Prerequisites

Before starting, ensure you have the following installed:
* **Node.js & npm** (Download from [nodejs.org](https://nodejs.org/))
* **Python 3.8+** (Download from [python.org](https://www.python.org/))

---

## 1. Setup the Frontend (React)

The frontend dependencies are managed via `npm`.

1.  Open your terminal/command prompt.
2.  Navigate to the project root directory.
3.  Install the JavaScript dependencies:
    ```bash
    npm install
    ```
    *(Note: This command will automatically regenerate the `package-lock.json` file to match the clean configuration, removing any stale database references.)*

---

## 2. Setup the Backend (Python/FastAPI)

The backend code resides in the `backend/` directory. You need to set up a virtual environment and install FastAPI.

1.  **Navigate to the backend folder:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    * **Mac/Linux:**
        ```bash
        python3 -m venv venv
        ```
    * **Windows:**
        ```bash
        python -m venv venv
        ```

3.  **Activate the virtual environment:**
    * **Mac/Linux:**
        ```bash
        source venv/bin/activate
        ```
    * **Windows (Command Prompt):**
        ```bash
        venv\Scripts\activate
        ```
    * **Windows (PowerShell):**
        ```bash
        .\venv\Scripts\Activate.ps1
        ```

4.  **Install the required Python packages:**
    Since `fastapi` and `uvicorn` are required for the server:
    ```bash
    pip install fastapi uvicorn
    ```

---

## 3. Running the Application

There are two ways to run the app.

### Option A: Run Everything Together (Recommended)
We have a script configured to run both the frontend and backend simultaneously.

1.  Ensure you are in the **root** directory of the project.
2.  Run:
    ```bash
    npm run dev:full
    ```
3.  The app should now be accessible at `http://localhost:5173`.

### Option B: Run Manually (Two Terminals)

If Option A fails, you can run the services separately in two different terminal windows.

**Terminal 1 (Frontend):**
# In the root directory
npm run dev
# songapp

**Terminal 2 (Backend):**
```bash
cd backend
# Make sure your venv is activated!
uvicorn main:app --reload


