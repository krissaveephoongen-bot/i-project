// tests/e2e/api.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Load credentials from environment (set in global-setup)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jakgrits.ph@appworks.co.th';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AppWorks@123!';

test.describe('API Integration and Frontend Interaction', () => {

  test('should allow an authenticated user to view projects', async ({ page }) => {
    await page.goto('/projects');
    
    // Expect a heading to contain "My Projects" or similar, indicating successful navigation
    await expect(page.locator('h1', { hasText: /My Projects|Projects/i })).toBeVisible();

    // Expect at least one project item to be visible, implying data has loaded
    // This assumes the seeded data includes projects
    await expect(page.locator('.project-card').first()).toBeVisible();
    
    console.log(`User ${ADMIN_EMAIL} successfully viewed projects page.`);
  });

  test('should allow an authenticated user to create, edit, and delete a project', async ({ page }) => {
    const projectName = `Test Project ${faker.word.verb()} ${faker.string.uuid()}`;
    const updatedProjectName = `Updated Project ${faker.word.verb()} ${faker.string.uuid()}`;
    const projectDescription = faker.lorem.sentence();

    await page.goto('/projects');
    await expect(page.locator('h1', { hasText: /My Projects|Projects/i })).toBeVisible();

    // 1. Create a new project
    console.log('Attempting to create a new project...');
    await page.getByRole('button', { name: /Add New Project|Create Project/i }).click();
    await expect(page.locator('h2', { hasText: /Create New Project/i })).toBeVisible();

    await page.locator('input[name="name"]').fill(projectName);
    await page.locator('textarea[name="description"]').fill(projectDescription);
    // Assuming a manager or admin is logged in, select a client
    // You might need to adjust selectors based on your actual form
    await page.locator('select[name="clientId"]').selectOption({ index: 1 }); // Select the first available client

    await page.getByRole('button', { name: /Create Project/i }).click();

    // Expect success notification
    await expect(page.locator('div[role="status"]', { hasText: /Project created successfully/i })).toBeVisible();
    await page.waitForURL('/projects'); // Wait for navigation back to projects list

    // 2. Verify the new project is in the list
    console.log('Verifying created project in list...');
    const projectCard = page.locator(`.project-card:has-text("${projectName}")`);
    await expect(projectCard).toBeVisible();
    console.log(`Project "${projectName}" created and found.`);

    // 3. Edit the project
    console.log('Attempting to edit the project...');
    await projectCard.locator('button[aria-label="Edit project"]').click(); // Assuming an edit button is present
    await expect(page.locator('h2', { hasText: /Edit Project/i })).toBeVisible();

    await page.locator('input[name="name"]').fill(updatedProjectName);
    await page.getByRole('button', { name: /Update Project/i }).click();

    // Expect success notification
    await expect(page.locator('div[role="status"]', { hasText: /Project updated successfully/i })).toBeVisible();
    await page.waitForURL('/projects');

    // Verify updated name
    const updatedProjectCard = page.locator(`.project-card:has-text("${updatedProjectName}")`);
    await expect(updatedProjectCard).toBeVisible();
    console.log(`Project name updated to "${updatedProjectName}".`);

    // 4. Delete the project
    console.log('Attempting to delete the project...');
    await updatedProjectCard.locator('button[aria-label="Delete project"]').click(); // Assuming a delete button is present
    // Confirm deletion if there's a modal
    await page.getByRole('button', { name: /Confirm Delete|Delete/i }).click(); 

    // Expect success notification
    await expect(page.locator('div[role="status"]', { hasText: /Project deleted successfully/i })).toBeVisible();
    
    // Verify project is no longer in the list
    await expect(page.locator(`.project-card:has-text("${updatedProjectName}")`)).not.toBeVisible();
    console.log(`Project "${updatedProjectName}" deleted.`);
  });

  // Example of a test checking API fallback/error
  test('should handle API errors gracefully (e.g., project not found)', async ({ page }) => {
    // Navigate to a project detail page with a non-existent ID
    const nonExistentProjectId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    await page.goto(`/projects/${nonExistentProjectId}`);

    // Expect an error message or 404 page content
    await expect(page.locator('h1', { hasText: /Project Not Found|404/i })).toBeVisible();
    await expect(page.locator('p', { hasText: /The project you are looking for does not exist./i })).toBeVisible();
    console.log('API error for non-existent project handled gracefully.');
  });
});
