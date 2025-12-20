# 🔧 Manual Start Instructions

If the batch files don't work, follow these manual steps:

## Method 1: Using PowerShell/Terminal

### Step 1: Open PowerShell or Command Prompt
- Press `Win + X` and select "Windows PowerShell" or "Terminal"
- Or search for "PowerShell" in Start menu

### Step 2: Navigate to Project Directory
```powershell
cd "C:\Users\Ahmad Syafi\OneDrive\Desktop\My portfolio\Flowboard"
```

### Step 3: Start Backend (Terminal 1)

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run migrations (first time only)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Step 4: Start Frontend (New Terminal 2)

Open a **NEW** PowerShell window:

```powershell
# Navigate to project root
cd "C:\Users\Ahmad Syafi\OneDrive\Desktop\My portfolio\Flowboard"

# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

---

## Method 2: Using VS Code

### Step 1: Open Project in VS Code
1. Open VS Code
2. File → Open Folder
3. Select: `C:\Users\Ahmad Syafi\OneDrive\Desktop\My portfolio\Flowboard`

### Step 2: Open Integrated Terminal
- Press `` Ctrl + ` `` (backtick) or View → Terminal

### Step 3: Start Backend
In the terminal:
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Step 4: Start Frontend (New Terminal)
1. Click the `+` button in terminal panel to open new terminal
2. Or press `` Ctrl + Shift + ` ``
3. In the new terminal:
```bash
cd frontend
npm run dev
```

---

## Method 3: Using Separate Command Windows

### Backend Window:
1. Open Command Prompt (Win + R, type `cmd`)
2. Run these commands:
```cmd
cd "C:\Users\Ahmad Syafi\OneDrive\Desktop\My portfolio\Flowboard\backend"
venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000
```

### Frontend Window:
1. Open another Command Prompt
2. Run these commands:
```cmd
cd "C:\Users\Ahmad Syafi\OneDrive\Desktop\My portfolio\Flowboard\frontend"
npm run dev
```

---

## Troubleshooting

### If backend doesn't start:

**Error: "venv not found"**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Error: "alembic not found"**
```bash
pip install alembic
```

**Error: "uvicorn not found"**
```bash
pip install uvicorn[standard]
```

**Error: "Database connection failed"**
- Check your `.env` file in `backend` folder
- Make sure database is running
- Verify database credentials

### If frontend doesn't start:

**Error: "npm not found"**
- Install Node.js from https://nodejs.org/
- Restart your terminal

**Error: "node_modules not found"**
```bash
cd frontend
npm install
```

**Error: "Port 5173 already in use"**
- Vite will automatically use the next available port
- Or kill the process using port 5173

---

## Quick Verification

After starting both servers, check:

1. **Backend**: Open browser → http://localhost:8000/docs
   - Should show Swagger API documentation

2. **Frontend**: Open browser → http://localhost:5173
   - Should show Flowboard login page

3. **Check Console**: 
   - Backend terminal should show: `Uvicorn running on http://127.0.0.1:8000`
   - Frontend terminal should show: `Local: http://localhost:5173/`

---

## Still Having Issues?

1. Run `test-start.bat` to check if all paths are correct
2. Check if Python and Node.js are in your PATH
3. Make sure no firewall is blocking ports 8000 and 5173
4. Check Windows Event Viewer for any errors

