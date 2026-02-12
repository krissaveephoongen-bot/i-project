 import { test, expect } from '@playwright/test';
 
 const pages = ['/', '/projects', '/tasks', '/timesheet'];
 
 test.describe('Navigation after login', () => {
   test('should navigate main pages without errors', async ({ page }) => {
     for (const path of pages) {
       await page.goto(path, { waitUntil: 'domcontentloaded' });
       const errors: string[] = [];
       page.on('pageerror', (e) => errors.push(String(e)));
       page.on('console', (msg) => {
         if (msg.type() === 'error') errors.push(msg.text());
       });
       await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}\\/?$`), { timeout: 10000 });
       expect(errors, `Console errors found on ${path}`).toHaveLength(0);
     }
   });
 });
