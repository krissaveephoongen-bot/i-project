# PowerShell Script to Test All Pages
# This will systematically test all pages in the Next.js application

$baseUrl = "http://localhost:3002"
$pages = @(
    @{ Path = "/"; Name = "Home/Dashboard" },
    @{ Path = "/projects/"; Name = "Projects List" },
    @{ Path = "/projects/weekly-activities/"; Name = "Weekly Activities" },
    @{ Path = "/reports/"; Name = "Reports" },
    @{ Path = "/reports/financial/"; Name = "Financial Reports" },
    @{ Path = "/reports/projects/"; Name = "Project Reports" },
    @{ Path = "/reports/resources/"; Name = "Resource Reports" },
    @{ Path = "/resources/"; Name = "Resources" },
    @{ Path = "/settings/"; Name = "Settings" },
    @{ Path = "/tasks/"; Name = "Tasks" },
    @{ Path = "/timesheet/"; Name = "Timesheet" },
    @{ Path = "/users/"; Name = "Users" },
    @{ Path = "/users/profile/"; Name = "User Profile" },
    @{ Path = "/login/"; Name = "Login" },
    @{ Path = "/approval/"; Name = "Approval" },
    @{ Path = "/approvals/expenses/"; Name = "Expense Approvals" },
    @{ Path = "/approvals/timesheets/"; Name = "Timesheet Approvals" },
    @{ Path = "/profile/"; Name = "Profile" },
    @{ Path = "/stakeholders/"; Name = "Stakeholders" }
)

Write-Host "Testing all pages..." -ForegroundColor Cyan
Write-Host ""

$results = @()

foreach ($page in $pages) {
    $url = $baseUrl + $page.Path
    Write-Host "Testing: $($page.Name) ($($page.Path))" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 10
        $result = @{
            Page = $page.Name
            Path = $page.Path
            Status = $response.StatusCode
            Success = ($response.StatusCode -eq 200)
            Error = $null
        }
        
        if ($result.Success) {
            Write-Host "SUCCESS: $($page.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "WARNING: $($page.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        $result = @{
            Page = $page.Name
            Path = $page.Path
            Status = "ERROR"
            Success = $false
            Error = $_.Exception.Message
        }
        Write-Host "FAILED: $($page.Name) - Error: $($result.Error)" -ForegroundColor Red
    }
    
    $results += $result
    
    # Small delay between requests
    Start-Sleep -Milliseconds 200
}

# Summary
$successful = ($results | Where-Object { $_.Success }).Count
$failed = ($results | Where-Object { -not $_.Success }).Count

Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "Successful: $successful/$($results.Count)" -ForegroundColor Green
Write-Host "Failed: $failed/$($results.Count)" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Failed Pages:" -ForegroundColor Red
    $results | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "   - $($_.Page): $($_.Error)" -ForegroundColor Red
    }
}

# Export results to JSON
$results | ConvertTo-Json | Out-File -FilePath "test-results.json" -Encoding UTF8
Write-Host ""
Write-Host "Results saved to test-results.json" -ForegroundColor Cyan
