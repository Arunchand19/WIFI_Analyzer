@echo off
echo ========================================
echo WiFi Traffic Analyzer - Installation
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo To start the application:
echo   npm run dev
echo.
echo Or start components separately:
echo   Server: cd server && npm run dev
echo   Client: cd client && npm run dev
echo.
echo Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo.
pause