@echo off
REM Environment Setup Script for Windows
REM Automates creation of .env files for frontend and backend

setlocal enabledelayedexpansion

echo ==========================================
echo   Environment Variables Setup Script
echo ==========================================
echo.

set FRONTEND_DIR=%cd%
set BACKEND_DIR=..\ticket-apw-backend

:menu
echo Select setup option:
echo 1) Setup Frontend (.env.local)
echo 2) Setup Backend (.env)
echo 3) Setup Both
echo 4) View Frontend Settings
echo 5) View Backend Settings
echo 6) Exit
echo.
set /p choice="Enter choice (1-6): "

if "%choice%"=="1" goto setup_frontend
if "%choice%"=="2" goto setup_backend
if "%choice%"=="3" goto setup_both
if "%choice%"=="4" goto view_frontend
if "%choice%"=="5" goto view_backend
if "%choice%"=="6" goto exit_script
echo Invalid option
goto menu

:setup_frontend
echo.
echo Setting up Frontend (.env.local)
echo.

if exist "%FRONTEND_DIR%\.env.local" (
    echo .env.local already exists
    set /p overwrite="Overwrite? (y/n): "
    if /i not "!overwrite!"=="y" (
        echo Skipped frontend setup
        echo.
        goto menu
    )
)

set /p API_URL="Enter Backend API URL (default: http://localhost:5000): "
if "!API_URL!"=="" set API_URL=http://localhost:5000

set /p ANALYTICS="Enable Analytics? (y/n, default: n): "
if /i "!ANALYTICS!"=="y" (
    set ANALYTICS_ENABLED=true
) else (
    set ANALYTICS_ENABLED=false
)

set /p DEBUG="Enable Debug? (y/n, default: y): "
if /i "!DEBUG!"=="n" (
    set DEBUG_ENABLED=false
) else (
    set DEBUG_ENABLED=true
)

(
    echo # Frontend Environment Variables
    echo VITE_API_URL=!API_URL!
    echo VITE_ENABLE_ANALYTICS=!ANALYTICS_ENABLED!
    echo VITE_ENABLE_DEBUG=!DEBUG_ENABLED!
    echo NODE_ENV=development
) > "%FRONTEND_DIR%\.env.local"

echo.
echo Created .env.local
echo   API URL: !API_URL!
echo   Analytics: !ANALYTICS_ENABLED!
echo   Debug: !DEBUG_ENABLED!
echo.
goto menu

:setup_backend
echo.
echo Setting up Backend (.env)
echo.

if exist "%FRONTEND_DIR%\.env" (
    echo .env already exists
    set /p overwrite="Overwrite? (y/n): "
    if /i not "!overwrite!"=="y" (
        echo Skipped backend setup
        echo.
        goto menu
    )
)

echo Database Configuration:
set /p DB_HOST="  Database Host (default: localhost): "
if "!DB_HOST!"=="" set DB_HOST=localhost

set /p DB_PORT="  Database Port (default: 5432): "
if "!DB_PORT!"=="" set DB_PORT=5432

set /p DB_NAME="  Database Name (default: ticket_apw): "
if "!DB_NAME!"=="" set DB_NAME=ticket_apw

set /p DB_USER="  Database User (default: postgres): "
if "!DB_USER!"=="" set DB_USER=postgres

set /p DB_PASSWORD="  Database Password: "

echo.
echo NOTE: For JWT and Session secrets, use:
echo   openssl rand -base64 32
echo Or use your own 32+ character random strings
echo.

set /p JWT_SECRET="Enter JWT_SECRET (or press Enter for random): "
if "!JWT_SECRET!"=="" (
    echo Generating random JWT_SECRET...
    REM Note: This is a placeholder - Windows doesn't have openssl by default
    set JWT_SECRET=dev_jwt_secret_change_in_production_minimum_32_chars
    echo Using default development secret
)

set /p SESSION_SECRET="Enter SESSION_SECRET (or press Enter for random): "
if "!SESSION_SECRET!"=="" (
    set SESSION_SECRET=dev_session_secret_change_in_production_min_32_ch
    echo Using default development secret
)

echo.
set /p CORS_ORIGIN="Frontend URL for CORS (default: http://localhost:5173): "
if "!CORS_ORIGIN!"=="" set CORS_ORIGIN=http://localhost:5173

echo.
set /p ADMIN_EMAIL="Admin Email (default: admin@example.com): "
if "!ADMIN_EMAIL!"=="" set ADMIN_EMAIL=admin@example.com

set /p ADMIN_PASSWORD="Admin Password: "

set /p ADMIN_NAME="Admin Name (default: System Administrator): "
if "!ADMIN_NAME!"=="" set ADMIN_NAME=System Administrator

(
    echo # Backend Environment Variables
    echo.
    echo # Environment
    echo NODE_ENV=development
    echo PORT=5000
    echo.
    echo # Database (REQUIRED)
    echo DATABASE_URL=postgresql://!DB_USER!:!DB_PASSWORD!@!DB_HOST!:!DB_PORT!/!DB_NAME!
    echo DB_HOST=!DB_HOST!
    echo DB_PORT=!DB_PORT!
    echo DB_NAME=!DB_NAME!
    echo DB_USER=!DB_USER!
    echo DB_PASSWORD=!DB_PASSWORD!
    echo.
    echo # JWT and Security (REQUIRED)
    echo JWT_SECRET=!JWT_SECRET!
    echo JWT_EXPIRY=7d
    echo SESSION_SECRET=!SESSION_SECRET!
    echo BCRYPT_ROUNDS=10
    echo.
    echo # CORS (REQUIRED)
    echo CORS_ORIGIN=!CORS_ORIGIN!
    echo.
    echo # Admin User Setup (REQUIRED)
    echo ADMIN_EMAIL=!ADMIN_EMAIL!
    echo ADMIN_PASSWORD=!ADMIN_PASSWORD!
    echo ADMIN_NAME=!ADMIN_NAME!
    echo.
    echo # Optional Services
    echo REDIS_URL=redis://localhost:6379
    echo ENABLE_ANALYTICS=false
    echo ENABLE_NOTIFICATIONS=true
    echo ENABLE_API_DOCS=true
    echo ENABLE_RATE_LIMITING=true
    echo.
    echo # Logging
    echo LOG_LEVEL=info
    echo LOG_FILE=./logs/app.log
) > "%FRONTEND_DIR%\.env"

echo.
echo Created .env
echo   Database: !DB_NAME! @ !DB_HOST!:!DB_PORT!
echo   CORS Origin: !CORS_ORIGIN!
echo   Admin Email: !ADMIN_EMAIL!
echo.
goto menu

:setup_both
call :setup_frontend
call :setup_backend
goto menu

:view_frontend
echo.
if exist "%FRONTEND_DIR%\.env.local" (
    echo Frontend (.env.local):
    type "%FRONTEND_DIR%\.env.local"
    echo.
) else (
    echo Frontend .env.local not found
    echo.
)
goto menu

:view_backend
echo.
if exist "%FRONTEND_DIR%\.env" (
    echo Backend (.env): [Sensitive values hidden]
    type "%FRONTEND_DIR%\.env" | findstr /v "PASSWORD SECRET"
    echo PASSWORD: [hidden]
    echo JWT_SECRET: [hidden]
    echo SESSION_SECRET: [hidden]
    echo.
) else (
    echo Backend .env not found
    echo.
)
goto menu

:exit_script
echo Done!
exit /b 0
