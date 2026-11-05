# CodeBrainzx

An online learning, coding practice, aptitude assessment, and contest platform.

---

## Project Structure

```text
CodeBrainzx/
├── backend/       # Django chREST Framework backend API
├── frontend/      # React 19 + TypeScript + Vite + Tailwind CSS frontend
├── judge0/        # Local Judge0 compiler engine (Docker-based, optional)
└── README.md
```

---

## Prerequisites

Before running the project on Windows in PowerShell, ensure you have:

1. **Node.js** (v18+ or v20+ recommended) & **npm**
2. **Python** (v3.10+)
3. *(Optional)* **Docker Desktop** (if running Judge0 locally)

---

## Running in PowerShell

To run both backend and frontend, open two separate PowerShell terminal tabs or windows.

---

### Terminal 1: Backend (Django REST Framework)

1. **Open PowerShell and navigate to the backend directory:**
   ```powershell
   cd e:\CodeBrainzx\backend
   ```

2. **Activate the Python virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

   > **Note (PowerShell Execution Policy):**
   > If you encounter an execution policy error (`running scripts is disabled on this system`), run:
   > ```powershell
   > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   > .\venv\Scripts\Activate.ps1
   > ```
   > *Alternatively, you can run directly without activating:*
   > ```powershell
   > .\venv\Scripts\python.exe manage.py runserver
   > ```

3. **Install dependencies (first-time setup only):**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```powershell
   python manage.py migrate
   ```

5. **Start the Django development server:**
   ```powershell
   python manage.py runserver
   ```

Backend will be accessible at:
👉 **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** (API endpoints under `/api/`)

---

### Terminal 2: Frontend (React + Vite)

1. **Open a second PowerShell window and navigate to the frontend directory:**
   ```powershell
   cd e:\CodeBrainzx\frontend
   ```

2. **Install dependencies (first-time setup or upon package updates):**
   ```powershell
   npm install
   ```

3. **Verify/Create `.env` file:**
   Ensure `frontend/.env` exists and points to your local backend:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```

Frontend will be accessible at:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## One-Line PowerShell Launcher (Run Both Together)

You can launch both the backend and frontend simultaneously from the root directory with a single PowerShell script:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\CodeBrainzx\backend; .\venv\Scripts\Activate.ps1; python manage.py runserver"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\CodeBrainzx\frontend; npm run dev"
```

---

## Optional: Judge0 Local Compiler (Docker)

If you are running code execution locally via Judge0:

```powershell
cd e:\CodeBrainzx\judge0
.\manage.bat start
```

To stop Judge0:
```powershell
cd e:\CodeBrainzx\judge0
.\manage.bat stop
```

---

## Common PowerShell Commands Summary

| Task | PowerShell Command |
| :--- | :--- |
| **Run Frontend Dev** | `cd frontend; npm run dev` |
| **Build Frontend** | `cd frontend; npm run build` |
| **Lint Frontend** | `cd frontend; npm run lint` |
| **Run Backend Server** | `cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver` |
| **Run Migrations** | `cd backend; .\venv\Scripts\Activate.ps1; python manage.py migrate` |
| **Create Superuser** | `cd backend; .\venv\Scripts\Activate.ps1; python manage.py createsuperuser` |
| **Start Judge0** | `cd judge0; .\manage.bat start` |

