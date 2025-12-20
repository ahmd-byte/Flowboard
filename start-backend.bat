@echo off
echo ========================================
echo   Flowboard Backend Server
echo ========================================
echo.

cd backend

echo [1/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo [2/3] Checking database migrations...
alembic upgrade head

echo [3/3] Starting backend server...
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --port 8000

pause

