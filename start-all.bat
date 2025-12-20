@echo off
cd /d "%~dp0"
echo ========================================
echo   Flowboard - Starting All Services
echo ========================================
echo.

echo Starting Backend and Frontend servers...
echo.
echo IMPORTANT: This will open 2 command windows:
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:5173
echo.
echo Close both windows to stop all services.
echo.

start "Flowboard Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "Flowboard Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close this window when done.
pause

