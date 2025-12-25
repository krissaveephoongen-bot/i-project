@echo off
REM Development startup script - runs backend + frontend

echo.
echo ====================================
echo Project Management System
echo Dev Environment Startup
echo ====================================
echo.

REM Set JWT_SECRET
set JWT_SECRET=d23a93f3826e78dc8eceafdebdc687a99ca90cc121d09d324612855673aa93cf
set PORT=5000

echo [1/2] Starting Backend Server on port 5000...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "npm run server"

REM Wait for backend to start
timeout /t 3 /nobreak

echo.
echo [2/2] Starting Frontend Dev Server on port 5173...
echo.

REM Start frontend in new window
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ====================================
echo Services Started:
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Login with:
echo   Email:    admin@example.com
echo   Password: Admin@1234
echo.
echo Or try these accounts:
echo   pm@example.com       (Manager) / Manager@1234
echo   lead@example.com     (Team Lead) / Lead@1234
echo   dev@example.com      (Developer) / Dev@1234
echo.
echo ====================================
echo.

pause
