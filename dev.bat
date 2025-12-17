@echo off
setlocal enabledelayedexpansion

:: Clear screen
cls

echo ===================================
echo  Starting Development Environment
echo ===================================
echo.

:: Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
    echo [1/4] Installing dependencies...
    
    :: Skip husky install to avoid git errors
    set HUSKY=0
    
    call npm install --no-package-lock --no-fund --no-audit
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        echo Try running: npm install --no-package-lock --no-fund --no-audit
        pause
        exit /b 1
    )
) else (
    echo [1/4] Dependencies already installed
)

echo [2/4] Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im vite.exe >nul 2>&1

:: Start backend server
echo [3/4] Starting Backend Server...
start "Backend" /MIN cmd /c "node server/index.js"

:: Wait for backend to start
ping -n 3 127.0.0.1 >nul

:: Start frontend server
echo [4/4] Starting Frontend Server...
start "Frontend" cmd /k "npx vite"

:: Show server info
echo.
echo ===================================
echo  Development Servers Started
echo ===================================
echo Frontend:    http://localhost:5173
echo Backend:     http://localhost:5000
echo ===================================
echo Press any key to stop servers...
echo ===================================

:: Keep the window open and wait for key press
pause >nul

:: Cleanup
echo.
echo Stopping servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im vite.exe >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Frontend*" >nul 2>&1

echo All servers stopped.
pause
