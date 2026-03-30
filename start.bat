@echo off
echo ========================================
echo WiFi Traffic Analyzer - Starting...
echo ========================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Dependencies not found. Running installation...
    call install.bat
    if %errorlevel% neq 0 (
        echo Installation failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

echo.
echo Starting WiFi Traffic Analyzer...
echo.
echo Server will start on: http://localhost:3001
echo Client will start on: http://localhost:5173
echo.
echo Press Ctrl+C to stop the application
echo.

start "WiFi Analyzer Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "WiFi Analyzer Client" cmd /k "cd client && npm run dev"

echo.
echo Both server and client are starting...
echo Check the opened terminal windows for status.
echo.
echo The application will be available at:
echo http://localhost:5173
echo.
pause