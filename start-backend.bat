@echo off
cd /d "%~dp0"
echo ========================================
echo   Flowboard Backend Server
echo ========================================
echo.

cd backend
if errorlevel 1 (
    echo ERROR: Cannot find backend directory!
    pause
    exit /b 1
)

echo [1/3] Activating virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please create it first: python -m venv venv
    pause
    exit /b 1
)
call venv\Scripts\activate.bat

echo [2/3] Checking database migrations...
alembic upgrade head
if errorlevel 1 (
    echo WARNING: Migration failed. Continuing anyway...
)

echo [3/3] Starting backend server...
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --port 8000

pause

