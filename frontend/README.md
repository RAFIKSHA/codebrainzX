# CodeBrainzx - Frontend

This is the frontend client for **CodeBrainzx**, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## Prerequisites

Before running the frontend in PowerShell, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher recommended, e.g. v20 LTS)
- **npm** (comes bundled with Node.js)

Verify your installation in PowerShell:
```powershell
node -v
npm -v
```

---

## PowerShell Run Instructions

### 1. Navigate to the Frontend Directory

Open PowerShell and change directory to `frontend`:

```powershell
cd e:\CodeBrainzx\frontend
```

*(Or from the repository root: `cd frontend`)*

### 2. Configure Environment Variables

Make sure you have a `.env` file in the `frontend` folder. If not present, create it or copy from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Ensure `.env` contains the API backend URL:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Install Dependencies

Install all required npm packages:

```powershell
npm install
```

### 4. Start the Development Server

Run the development server using Vite:

```powershell
npm run dev
```

Once running, PowerShell will display:
```text
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## Available npm Scripts

Run these commands inside the `frontend` directory in PowerShell:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles TypeScript (`tsc -b`) and generates production bundle into `dist/`. |
| `npm run preview` | Locally previews the production build created by `npm run build`. |
| `npm run lint` | Runs the Oxlint linter to detect code issues and stylistic warnings. |

---

## Quick Start (Frontend + Backend Together)

To run the complete CodeBrainzx project, open **two separate PowerShell tabs/windows**:

### Terminal 1: Backend (Django)
```powershell
cd e:\CodeBrainzx\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
*(Runs on `http://127.0.0.1:8000`)*

### Terminal 2: Frontend (Vite)
```powershell
cd e:\CodeBrainzx\frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## Troubleshooting PowerShell Common Issues

### 1. `npm : The term 'npm' is not recognized...`
- Restart PowerShell after installing Node.js.
- Ensure Node.js installation directory is in your system `PATH`.

### 2. Port `5173` Already in Use
Vite will automatically try port `5174` or the next available port. To specify a custom port manually:
```powershell
npm run dev -- --port 3000
```

### 3. API Connection / CORS Errors
- Ensure the Django backend is actively running on `http://localhost:8000`.
- Verify `VITE_API_URL=http://localhost:8000/api` in your `.env`.
