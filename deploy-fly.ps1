# Fly.io Deployment Script for Windows PowerShell
# Usage: .\deploy-fly.ps1

Write-Host "=== Fly.io Backend Deployment ===" -ForegroundColor Cyan

# Check if flyctl is installed
try {
    $flyctlVersion = flyctl version
    Write-Host "✓ flyctl is installed: $flyctlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ flyctl not found. Install from: https://fly.io/docs/getting-started/installing-flyctl/" -ForegroundColor Red
    exit 1
}

# Check if authenticated
try {
    $user = flyctl auth whoami
    Write-Host "✓ Authenticated as: $user" -ForegroundColor Green
} catch {
    Write-Host "✗ Not authenticated. Run: flyctl auth login" -ForegroundColor Red
    exit 1
}

# Confirm deployment
Write-Host "`nReady to deploy backend to Fly.io?" -ForegroundColor Yellow
$response = Read-Host "Continue? (y/n)"
if ($response -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Deploy
Write-Host "`nDeploying to Fly.io..." -ForegroundColor Cyan
flyctl deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Deployment successful!" -ForegroundColor Green
    
    # Get app info
    $appName = Get-Content fly.toml | Select-String "app = " | ForEach-Object { $_ -replace 'app = "', '' -replace '"', '' }
    $appUrl = "https://$appName.fly.dev"
    
    Write-Host "`nYour API URL: $appUrl/api" -ForegroundColor Green
    Write-Host "Health check: curl $appUrl/api/health" -ForegroundColor Green
    Write-Host "`nNext step: Update VITE_API_URL on Vercel dashboard" -ForegroundColor Yellow
    Write-Host "Command: flyctl secrets list" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Deployment failed!" -ForegroundColor Red
    Write-Host "Check logs: flyctl logs" -ForegroundColor Yellow
    exit 1
}
