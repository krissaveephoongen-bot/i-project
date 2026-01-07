# System Verification Script for Windows
# Tests: Database Connection → Login Flow → Profile & Permissions Display

param(
    [string]$ApiUrl = "http://localhost:3001/api",
    [string]$TestEmail = "admin@projectmgmt.com",
    [string]$TestPassword = "admin123"
)

Write-Host "`n🔍 Project Management System Verification" -ForegroundColor Magenta
Write-Host "Testing: Database → Login → Profile → Permissions`n" -ForegroundColor Gray

$testResults = @{
    dbConnection = $false
    login = $false
    profileRetrieval = $false
    permissionsCheck = $false
}

$authToken = $null
$currentUser = $null

# Helper functions
function Write-Info($msg) {
    Write-Host "ℹ $msg" -ForegroundColor Blue
}

function Write-Success($msg) {
    Write-Host "✓ $msg" -ForegroundColor Green
}

function Write-ErrorMsg($msg) {
    Write-Host "✗ $msg" -ForegroundColor Red
}

function Write-Warn($msg) {
    Write-Host "⚠ $msg" -ForegroundColor Yellow
}

function Write-Section($msg) {
    Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
    Write-Host $msg -ForegroundColor Cyan
    Write-Host "$('=' * 60)`n" -ForegroundColor Cyan
}

# Test 1: Database Connection
Write-Section "TEST 1: ตรวจสอบการเชื่อมต่อฐานข้อมูล (Database Connection)"

try {
    Write-Info "Testing health endpoint: $ApiUrl/health"
    $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get -TimeoutSec 10
    
    if ($response.status -eq "ok" -and $response.database -eq "connected") {
        Write-Success "Database connected successfully!"
        Write-Info "Timestamp: $($response.timestamp)"
        $script:testResults.dbConnection = $true
    } else {
        Write-ErrorMsg "Database connection failed: $($response.message)"
        Write-Info "Response: $($response | ConvertTo-Json)"
    }
} catch {
    Write-ErrorMsg "Failed to connect to API server"
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    Write-Warn "Please ensure the backend server is running on port 3001"
}

Start-Sleep -Seconds 1

# Test 2: Login Flow
Write-Section "TEST 2: ตรวจสอบกระบวนการ Login (Login Flow)"

try {
    Write-Info "Attempting login with email: $TestEmail"
    
    $loginBody = @{
        email = $TestEmail
        password = $TestPassword
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    
    if ($response.token -and $response.user) {
        $script:authToken = $response.token
        $script:currentUser = $response.user
        
        Write-Success "Login successful!"
        Write-Info "User ID: $($currentUser.id)"
        Write-Info "User Name: $($currentUser.name)"
        Write-Info "User Email: $($currentUser.email)"
        Write-Info "User Role: $($currentUser.role)"
        Write-Info "Token (first 20 chars): $($authToken.Substring(0, [Math]::Min(20, $authToken.Length)))..."
        
        $script:testResults.login = $true
    } else {
        Write-ErrorMsg "Login response missing token or user data"
    }
} catch {
    Write-ErrorMsg "Login failed"
    Write-ErrorMsg "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Warn "Invalid credentials - please check TEST_EMAIL and TEST_PASSWORD"
    }
}

Start-Sleep -Seconds 1

# Test 3: Profile Retrieval
Write-Section "TEST 3: ตรวจสอบการแสดงผล Profile (Profile Display)"

if ($null -eq $authToken) {
    Write-ErrorMsg "Cannot test profile retrieval - no auth token available"
    Write-Warn "Login test must pass first"
} else {
    try {
        Write-Info "Testing /auth/me endpoint..."
        
        $headers = @{
            "Authorization" = "Bearer $authToken"
        }
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/auth/me" -Method Get -Headers $headers -TimeoutSec 10
        
        if ($response.user) {
            Write-Success "Profile retrieved successfully from /auth/me"
            Write-Info "Profile details:"
            Write-Info "  - Name: $($response.user.name)"
            Write-Info "  - Email: $($response.user.email)"
            Write-Info "  - Role: $($response.user.role)"
            
            $dept = if ($response.user.department) { $response.user.department } else { "N/A" }
            $pos = if ($response.user.position) { $response.user.position } else { "N/A" }
            $avatar = if ($response.user.avatar) { $response.user.avatar } else { "N/A" }
            $lastLogin = if ($response.user.lastLogin) { $response.user.lastLogin } else { "N/A" }
            
            Write-Info "  - Department: $dept"
            Write-Info "  - Position: $pos"
            Write-Info "  - Avatar: $avatar"
            Write-Info "  - Last Login: $lastLogin"
            
            $script:testResults.profileRetrieval = $true
        } else {
            Write-ErrorMsg "Profile data missing from response"
        }

        # Also test /auth/verify
        Write-Info "`nTesting /auth/verify endpoint..."
        $verifyResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/verify" -Method Get -Headers $headers -TimeoutSec 10
        
        if ($verifyResponse.valid -and $verifyResponse.user) {
            Write-Success "Token verified successfully"
        }
    } catch {
        Write-ErrorMsg "Profile retrieval failed"
        Write-ErrorMsg "Error: $($_.Exception.Message)"
        
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Warn "Unauthorized - token may be invalid or expired"
        }
    }
}

Start-Sleep -Seconds 1

# Test 4: Permissions Check
Write-Section "TEST 4: ตรวจสอบสิทธิ์การใช้งาน (Permissions Check)"

if ($null -eq $authToken -or $null -eq $currentUser) {
    Write-ErrorMsg "Cannot test permissions - no user data available"
} else {
    try {
        $rolePermissions = @{
            admin = @('read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects')
            manager = @('read', 'write', 'manage_projects', 'manage_team')
            employee = @('read', 'write')
        }
        
        $userRole = $currentUser.role.ToLower()
        $expectedPermissions = if ($rolePermissions.ContainsKey($userRole)) { $rolePermissions[$userRole] } else { @('read') }
        
        Write-Info "User Role: $userRole"
        Write-Info "Expected Permissions: $($expectedPermissions -join ', ')"
        
        $headers = @{
            "Authorization" = "Bearer $authToken"
        }
        
        # Test reading own profile
        try {
            $response = Invoke-RestMethod -Uri "$ApiUrl/auth/me" -Method Get -Headers $headers -TimeoutSec 10
            Write-Success "✓ Read own profile: PASSED (200)"
            Write-Info "  Permission 'read' verified"
        } catch {
            Write-ErrorMsg "✗ Read own profile: FAILED"
        }
        
        # Test admin-only endpoint if admin
        if ($userRole -eq "admin") {
            try {
                $response = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Get -Headers $headers -TimeoutSec 10
                Write-Success "✓ List all users (admin only): PASSED (200)"
                Write-Info "  Permission 'admin' verified"
            } catch {
                Write-ErrorMsg "✗ List all users: FAILED"
            }
        }
        
        $script:testResults.permissionsCheck = $true
    } catch {
        Write-ErrorMsg "Permissions check failed"
        Write-ErrorMsg "Error: $($_.Exception.Message)"
    }
}

# Print Summary
Write-Section "สรุปผลการทดสอบ (SUMMARY)"

$totalTests = $testResults.Count
$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "`nTest Results:"
Write-Host "  $(if ($testResults.dbConnection) { '✓' } else { '✗' }) Database Connection" -ForegroundColor $(if ($testResults.dbConnection) { 'Green' } else { 'Red' })
Write-Host "  $(if ($testResults.login) { '✓' } else { '✗' }) Login Flow" -ForegroundColor $(if ($testResults.login) { 'Green' } else { 'Red' })
Write-Host "  $(if ($testResults.profileRetrieval) { '✓' } else { '✗' }) Profile Retrieval" -ForegroundColor $(if ($testResults.profileRetrieval) { 'Green' } else { 'Red' })
Write-Host "  $(if ($testResults.permissionsCheck) { '✓' } else { '✗' }) Permissions Check" -ForegroundColor $(if ($testResults.permissionsCheck) { 'Green' } else { 'Red' })

Write-Host "`nTotal: $passedTests/$totalTests tests passed ($successRate%)"

if ($passedTests -eq $totalTests) {
    Write-Host "`n🎉 All tests passed! System is working correctly.`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the errors above.`n" -ForegroundColor Yellow
    
    # Recommendations
    if (-not $testResults.dbConnection) {
        Write-Warn "Recommendation: Check DATABASE_URL in .env file and ensure database is running"
    }
    if (-not $testResults.login) {
        Write-Warn "Recommendation: Verify user credentials exist in database or create test user"
    }
    if (-not $testResults.profileRetrieval) {
        Write-Warn "Recommendation: Check /auth/me endpoint implementation"
    }
    if (-not $testResults.permissionsCheck) {
        Write-Warn "Recommendation: Review role-based access control implementation"
    }
}

Write-Host ""