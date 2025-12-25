#!/usr/bin/env pwsh

# Set environment variables
$env:JWT_SECRET = "d23a93f3826e78dc8eceafdebdc687a99ca90cc121d09d324612855673aa93cf"
$env:PORT = "5000"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Project Management System" -ForegroundColor Cyan
Write-Host "Dev Environment Startup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Backend Server on port 5000..." -ForegroundColor Yellow
Write-Host ""

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:JWT_SECRET = 'def5ceafdebdc687a99ca90cc121d09d324612855673aa93cf'; npm run server" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[2/2] Starting Frontend Dev Server on port 5173..." -ForegroundColor Yellow
Write-Host ""

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Services Started:" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login with:" -ForegroundColor Yellow
Write-Host "  Email:    admin@example.com" -ForegroundColor White
Write-Host "  Password: Admin@1234" -ForegroundColor White
Write-Host ""
Write-Host "Or try these accounts:" -ForegroundColor Yellow
Write-Host "  pm@example.com       (Manager) / Manager@1234" -ForegroundColor White
Write-Host "  lead@example.com     (Team Lead) / Lead@1234" -ForegroundColor White
Write-Host "  dev@example.com      (Developer) / Dev@1234" -ForegroundColor White
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Opening browser to http://localhost:5173..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
