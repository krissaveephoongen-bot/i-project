 import { chromium, FullConfig } from '@playwright/test';
 
 export default async function globalSetup(config: FullConfig) {
   const browser = await chromium.launch();
   const page = await browser.newPage();
 
   const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
   const email = process.env.E2E_EMAIL || '';
   const password = process.env.E2E_PASSWORD || '';
 
   console.log(`Navigating to ${baseURL}/staff/login`);
  await page.goto(`${baseURL}/staff/login`, { waitUntil: 'networkidle' });

  if (email && password) {
    console.log(`Attempting login with ${email}`);
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL(`${baseURL}/`, { timeout: 15000 });
      console.log('Login successful');
    } catch (e) {
      console.error('Login failed or timed out');
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      // Take a screenshot for debugging if possible (though we can't see it easily here)
      await page.screenshot({ path: 'login-failure.png' });
      throw e;
    }
  } else {
    console.warn('E2E_EMAIL or E2E_PASSWORD not set');
  }
 
   await page.context().storageState({ path: 'playwright-auth.json' });
   await browser.close();
 }
