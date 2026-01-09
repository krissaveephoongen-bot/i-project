// tests/e2e/global-setup.ts
import { chromium, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import url from 'url';

// Get __dirname equivalent in ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env.development to get test user credentials
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env.development') });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jakgrits.ph@appworks.co.th';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AppWorks@123!';
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

async function globalSetup() {
  console.log('\n✨ Global Setup started...');

  // 1. Seed the database
  console.log('🌱 Seeding database for tests...');
  try {
    execSync('npm run db:seed', { cwd: path.resolve(__dirname, '../../backend'), stdio: 'inherit' });
    console.log('✅ Database seeded successfully.');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }

  // 2. Authenticate and save storage state
  console.log('🔐 Authenticating admin user...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to login page
  await page.goto(`${FRONTEND_URL}/auth/login`);

  // Ensure login form is visible
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();

  // Fill in credentials and log in
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to a protected route (e.g., dashboard or projects)
  // Use a more generic check for successful login post-redirect
  await page.waitForURL((url) => {
    return url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/projects');
  }, { timeout: 10000 }); // Increased timeout

  // Verify successful login (e.g., check for an element that only appears after login)
  const successIndicator = page.locator('header').filter({ hasText: 'Dashboard' }).or(page.locator('h1').filter({ hasText: 'My Projects' }));
  await expect(successIndicator).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: 'playwright-auth.json' });
  console.log('✅ Admin user authenticated and state saved to playwright-auth.json');

  await browser.close();
  console.log('✨ Global Setup completed.');
}

export default globalSetup;
