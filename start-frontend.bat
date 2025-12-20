@echo off
cd /d "%~dp0"
echo ========================================
echo   Flowboard Frontend Server
echo ========================================
echo.

cd frontend
if errorlevel 1 (
    echo ERROR: Cannot find frontend directory!
    pause
    exit /b 1
)

echo [1/2] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo [2/2] Starting frontend server...
echo.
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause

