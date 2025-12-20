@echo off
cd /d "%~dp0"
echo ========================================
echo   Flowboard - Test Startup
echo ========================================
echo.
echo Testing paths...
echo.

if exist "backend\venv\Scripts\activate.bat" (
    echo [OK] Backend virtual environment found
) else (
    echo [ERROR] Backend virtual environment NOT found
    echo         Location: backend\venv\Scripts\activate.bat
)

if exist "frontend\package.json" (
    echo [OK] Frontend package.json found
) else (
    echo [ERROR] Frontend package.json NOT found
)

if exist "frontend\node_modules" (
    echo [OK] Frontend node_modules found
) else (
    echo [WARNING] Frontend node_modules NOT found - will install on first run
)

echo.
echo Current directory: %CD%
echo.
echo If all checks passed, try running start-all.bat again
echo.
pause

