# Vercel Backend Deployment Script
# Copy and paste commands one by one into PowerShell

Write-Host "=== Vercel Backend Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy
Write-Host "STEP 1: Deploy Backend" -ForegroundColor Yellow
Write-Host "Command: vercel deploy --prod" -ForegroundColor Green
Write-Host "Run this command and wait for it to complete" -ForegroundColor White
Write-Host ""

# Step 2: Generate JWT Secret
Write-Host "STEP 2: Generate JWT Secret" -ForegroundColor Yellow
Write-Host "Command: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor Green
Write-Host "SAVE THE OUTPUT - You'll need it next" -ForegroundColor Red
Write-Host ""

# Step 3: Set Environment Variables
Write-Host "STEP 3: Set Environment Variables" -ForegroundColor Yellow
Write-Host "You'll set 6 variables. For each one:" -ForegroundColor White
Write-Host "1. Run the command" -ForegroundColor Cyan
Write-Host "2. Paste your value when prompted" -ForegroundColor Cyan
Write-Host "3. Press Enter" -ForegroundColor Cyan
Write-Host ""

Write-Host "3.1: DATABASE_URL" -ForegroundColor Green
Write-Host "Command: vercel env add DATABASE_URL" -ForegroundColor White
Write-Host "Paste: postgresql://user:password@host:5432/database" -ForegroundColor Gray
Write-Host ""

Write-Host "3.2: JWT_SECRET" -ForegroundColor Green
Write-Host "Command: vercel env add JWT_SECRET" -ForegroundColor White
Write-Host "Paste: The random hex string from STEP 2" -ForegroundColor Gray
Write-Host ""

Write-Host "3.3: CORS_ORIGIN" -ForegroundColor Green
Write-Host "Command: vercel env add CORS_ORIGIN" -ForegroundColor White
Write-Host "Paste: https://ticket-apw.vercel.app" -ForegroundColor Gray
Write-Host ""

Write-Host "3.4: NODE_ENV" -ForegroundColor Green
Write-Host "Command: vercel env add NODE_ENV" -ForegroundColor White
Write-Host "Paste: production" -ForegroundColor Gray
Write-Host ""

Write-Host "3.5: JWT_EXPIRY" -ForegroundColor Green
Write-Host "Command: vercel env add JWT_EXPIRY" -ForegroundColor White
Write-Host "Paste: 7d" -ForegroundColor Gray
Write-Host ""

Write-Host "3.6: BCRYPT_ROUNDS" -ForegroundColor Green
Write-Host "Command: vercel env add BCRYPT_ROUNDS" -ForegroundColor White
Write-Host "Paste: 10" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 4: Redeploy with Environment Variables" -ForegroundColor Yellow
Write-Host "Command: vercel deploy --prod" -ForegroundColor Green
Write-Host "Wait for deployment to complete" -ForegroundColor White
Write-Host ""

Write-Host "STEP 5: Test Health Endpoint" -ForegroundColor Yellow
Write-Host "Command: curl https://ticket-apw-api.vercel.app/api/health" -ForegroundColor Green
Write-Host "Should return: {`"status`":`"ok`",`"message`":`"Server is running`"}" -ForegroundColor Gray
Write-Host ""

Write-Host "STEP 6: Update Frontend in Vercel Dashboard" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Click: ticket-apw project" -ForegroundColor White
Write-Host "3. Go to: Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Add:" -ForegroundColor White
Write-Host "   Name: VITE_API_URL" -ForegroundColor Cyan
Write-Host "   Value: https://ticket-apw-api.vercel.app" -ForegroundColor Cyan
Write-Host "5. Click: Save" -ForegroundColor White
Write-Host "6. Click: Redeploy (button at top)" -ForegroundColor White
Write-Host ""

Write-Host "STEP 7: Test in Browser" -ForegroundColor Yellow
Write-Host "1. Open: https://ticket-apw.vercel.app" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "3. Go to Network tab" -ForegroundColor White
Write-Host "4. Try logging in or making any API call" -ForegroundColor White
Write-Host "5. Verify API calls go to ticket-apw-api.vercel.app" -ForegroundColor White
Write-Host "6. Check response status is 200 (not 404/500)" -ForegroundColor White
Write-Host ""

Write-Host "=== DONE! Your backend is live! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Final URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: https://ticket-apw.vercel.app" -ForegroundColor White
Write-Host "  Backend:  https://ticket-apw-api.vercel.app" -ForegroundColor White
Write-Host "  Health:   https://ticket-apw-api.vercel.app/api/health" -ForegroundColor White
