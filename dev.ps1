# Simple Development Server Starter
# Starts both frontend and backend servers

# Set error action preference
$ErrorActionPreference = 'Stop'

# Function to stop all servers
function Stop-Servers {
    Write-Host "`nStopping all servers..." -ForegroundColor Yellow
    
    try {
        # Stop Node.js processes
        Get-Process -Name "node" -ErrorAction SilentlyContinue | 
            Where-Object { $_.Id -ne $PID } | 
            Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Stop Vite process
        Get-Process -Name "vite" -ErrorAction SilentlyContinue | 
            Stop-Process -Force -ErrorAction SilentlyContinue
            
        Write-Host "✓ Servers stopped" -ForegroundColor Green
    } catch {
        Write-Host "! Error stopping servers: $_" -ForegroundColor Red
    }
}

# Register cleanup on script exit
$script:originalTitle = $host.UI.RawUI.WindowTitle
$host.UI.RawUI.WindowTitle = "Project Management System - Dev Server"

# Set up cleanup on Ctrl+C
[Console]::CancelKeyPress.Add({
    Stop-Servers
    $host.UI.RawUI.WindowTitle = $script:originalTitle
    [Environment]::Exit(0)
})

# Stop any existing servers
Stop-Servers

# Start backend server
Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
$backendProcess = Start-Process -PassThru -NoNewWindow -FilePath "node" -ArgumentList "server/index.js"

# Wait for backend to start
Start-Sleep -Seconds 2

# Start frontend server
Write-Host "`nStarting Frontend Server..." -ForegroundColor Cyan
$frontendProcess = Start-Process -PassThru -NoNewWindow -FilePath "npm" -ArgumentList "run dev"

# Show server information
Write-Host "`n=== Development Servers ===" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend:     http://localhost:5000" -ForegroundColor White
Write-Host "==========================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow
Write-Host "`nServer logs:" -ForegroundColor Cyan

# Keep script running
while ($true) {
    # Check if processes are still running
    if ($backendProcess.HasExited -or $frontendProcess.HasExited) {
        Write-Host "One of the servers has stopped. Exiting..." -ForegroundColor Red
        Stop-Servers
        exit 1
    }
    Start-Sleep -Seconds 5
}
