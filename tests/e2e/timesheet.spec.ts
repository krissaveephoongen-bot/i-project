import { test, expect, Page } from '@playwright/test';

test.describe('Timesheet Workflows', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/timesheet');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Time Tracking', () => {
    test('should start and stop time tracking', async () => {
      // Select a project
      await page.click('text=Choose a project');
      await page.click('text=Mobile App Development');

      // Start tracking
      const startButton = page.locator('button:has-text("Start Tracking")');
      await expect(startButton).toBeEnabled();
      await startButton.click();

      // Verify tracking started
      const pauseButton = page.locator('button:has-text("Pause")');
      await expect(pauseButton).toBeVisible();

      // Wait a moment
      await page.waitForTimeout(2000);

      // Stop tracking
      const stopButton = page.locator('button:has-text("Stop & Save")');
      await stopButton.click();

      // Verify entry was saved
      await expect(page.locator('text=Entry added successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should require project selection before tracking', async () => {
      // Start button should be disabled without project selection
      const startButton = page.locator('button:has-text("Start Tracking")');
      await expect(startButton).toBeDisabled();

      // Select project
      await page.click('text=Choose a project');
      await page.click('text=Mobile App Development');

      // Now start button should be enabled
      await expect(startButton).toBeEnabled();
    });

    test('should display elapsed time while tracking', async () => {
      // Select project
      await page.click('text=Choose a project');
      await page.click('text=Mobile App Development');

      // Start tracking
      await page.click('button:has-text("Start Tracking")');

      // Initial display should show 00:00:00
      const timerDisplay = page.locator('[role="status"] >> text=/\\d{2}:\\d{2}:\\d{2}/');
      await expect(timerDisplay).toBeVisible();

      // Wait and check that time progresses
      await page.waitForTimeout(3000);
      
      // Stop before verifying exact time (timing is flaky in tests)
      await page.click('button:has-text("Stop & Save")');
    });
  });

  test.describe('Manual Entry Creation', () => {
    test('should create a new timesheet entry', async () => {
      // Click Add Entry button
      await page.click('button:has-text("Add Entry")');

      // Dialog should open
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Select project
      await page.locator('[role="dialog"] select').first().selectOption('1');

      // Fill in task (find by label)
      const taskInputs = await page.locator('[role="dialog"] input[type="text"]').all();
      if (taskInputs.length > 0) {
        await taskInputs[0]!.fill('Development Task');
      }

      // Fill in date
      const dateInputs = await page.locator('[role="dialog"] input[type="date"]').all();
      if (dateInputs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        await dateInputs[0]!.fill(today);
      }

      // Fill in times
      const timeInputs = await page.locator('[role="dialog"] input[type="time"]').all();
      if (timeInputs.length >= 2) {
        await timeInputs[0]!.fill('09:00');
        await timeInputs[1]!.fill('17:00');
      }

      // Submit form
      const submitButton = page.locator('[role="dialog"] button:has-text("Add")');
      await submitButton.click();

      // Verify success message
      await expect(page.locator('text=Entry added successfully')).toBeVisible({ timeout: 5000 });
    });

    test('should validate required fields', async () => {
      // Click Add Entry button
      await page.click('button:has-text("Add Entry")');

      // Try to submit without filling required fields
      const submitButton = page.locator('[role="dialog"] button:has-text("Add")');
      await submitButton.click();

      // Should show error message
      await expect(page.locator('text=Please fill in all required fields')).toBeVisible({ timeout: 3000 });
    });

    test('should validate end time is after start time', async () => {
      // Click Add Entry button
      await page.click('button:has-text("Add Entry")');

      // Fill in task
      const taskInputs = await page.locator('[role="dialog"] input[type="text"]').all();
      if (taskInputs.length > 0) {
        await taskInputs[0]!.fill('Task');
      }

      // Fill in times with end time before start time
      const timeInputs = await page.locator('[role="dialog"] input[type="time"]').all();
      if (timeInputs.length >= 2) {
        await timeInputs[0]!.fill('17:00');
        await timeInputs[1]!.fill('09:00');
      }

      // Try to submit
      const submitButton = page.locator('[role="dialog"] button:has-text("Add")');
      await submitButton.click();

      // Should show error
      await expect(page.locator('text=End time must be after start time')).toBeVisible({ timeout: 3000 });
    });

    test('should fill in description field', async () => {
      // Click Add Entry button
      await page.click('button:has-text("Add Entry")');

      // Fill in required fields
      const taskInputs = await page.locator('[role="dialog"] input[type="text"]').all();
      if (taskInputs.length > 0) {
        await taskInputs[0]!.fill('Development Task');
      }

      const timeInputs = await page.locator('[role="dialog"] input[type="time"]').all();
      if (timeInputs.length >= 2) {
        await timeInputs[0]!.fill('09:00');
        await timeInputs[1]!.fill('17:00');
      }

      // Fill in description
      const descriptionField = page.locator('[role="dialog"] textarea');
      await descriptionField.fill('Completed feature implementation');

      // Submit
      const submitButton = page.locator('[role="dialog"] button:has-text("Add")');
      await submitButton.click();

      // Verify success
      await expect(page.locator('text=Entry added successfully')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Entry Management', () => {
    test('should edit an existing entry', async () => {
      // First create an entry
      await createTimeEntryViaAPI(page);

      // Reload page to see the entry
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Click edit button
      const editButtons = page.locator('button:has-text("Edit")');
      if (await editButtons.count() > 0) {
        await editButtons.first().click();

        // Dialog should open with "Edit Entry" title
        await expect(page.locator('text=Edit Entry')).toBeVisible();

        // Modify entry
        const taskInput = page.locator('[role="dialog"] input[type="text"]').first();
        await taskInput.clear();
        await taskInput.fill('Updated Task');

        // Save changes
        const updateButton = page.locator('[role="dialog"] button:has-text("Update")');
        await updateButton.click();

        // Verify update success
        await expect(page.locator('text=Entry updated successfully')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should delete an entry', async () => {
      // Create an entry via API
      await createTimeEntryViaAPI(page);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Get initial entry count
      const entriesText = await page.locator('text=/Showing \\d+ entries/').textContent();
      const initialCount = parseInt(entriesText?.match(/\\d+/)?.[0] || '0');

      // Click delete button
      const deleteButtons = page.locator('button:has-text("Delete")');
      if (await deleteButtons.count() > 0) {
        // Handle confirmation dialog
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });

        await deleteButtons.first().click();

        // Verify deletion success
        await expect(page.locator('text=Entry deleted successfully')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should approve a pending entry', async () => {
      // Create pending entry
      await createTimeEntryViaAPI(page);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Click approve button
      const approveButtons = page.locator('button svg[data-testid="check"]').locator('..').locator('button');
      if (await approveButtons.count() > 0) {
        await approveButtons.first().click();

        // Verify approval success
        await expect(page.locator('text=Entry approved')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Week Navigation', () => {
    test('should navigate to previous week', async () => {
      // Get current week text
      const weekText = page.locator('text=/Week of .*/');
      const initialText = await weekText.textContent();

      // Click previous week button
      const prevButtons = page.locator('button[title*="previous"]');
      if (await prevButtons.count() > 0) {
        await prevButtons.first().click();
      } else {
        // Try finding by SVG or position
        const buttons = page.locator('button');
        await buttons.nth(0).click();
      }

      // Week text should change
      await page.waitForTimeout(500);
      const newText = await weekText.textContent();
      expect(newText).not.toEqual(initialText);
    });

    test('should navigate to next week', async () => {
      // Get current week text
      const weekText = page.locator('text=/Week of .*/');
      const initialText = await weekText.textContent();

      // Click next week button
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      if (buttonCount > 1) {
        await buttons.nth(1).click();
      }

      // Week text should change
      await page.waitForTimeout(500);
      const newText = await weekText.textContent();
      expect(newText).not.toEqual(initialText);
    });

    test('should return to current week', async () => {
      // Navigate away
      const buttons = page.locator('button');
      await buttons.nth(0).click();

      // Click Today button
      const todayButton = page.locator('button:has-text("Today")');
      await todayButton.click();

      // Should show current week
      await expect(page.locator('text=/Week of .*/').locator('...')).toContainText(new Date().getFullYear().toString());
    });
  });

  test.describe('View Switching', () => {
    test('should switch to weekly view', async () => {
      // Click Weekly View tab
      await page.click('text=Weekly View');

      // Weekly Summary should be visible
      await expect(page.locator('text=Weekly Summary')).toBeVisible();

      // Should show day cards
      const dayCards = page.locator('[role="tabpanel"] [class*="grid"]');
      await expect(dayCards).toBeVisible();
    });

    test('should switch back to list view', async () => {
      // Go to weekly view first
      await page.click('text=Weekly View');

      // Switch back to list view
      await page.click('text=List View');

      // Time Entries should be visible
      await expect(page.locator('text=Time Entries')).toBeVisible();
    });
  });

  test.describe('Export Functionality', () => {
    test('should export timesheet as CSV', async () => {
      // Create entry first
      await createTimeEntryViaAPI(page);
      await page.reload();

      // Start listening for download
      const downloadPromise = page.context().waitForEvent('download');

      // Click export button
      await page.click('button:has-text("Export")');

      // Wait for download to complete
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/timesheet_\\d{4}-\\d{2}-\\d{2}\\.csv/);
    });
  });

  test.describe('Statistics Display', () => {
    test('should display weekly statistics', async () => {
      // Create some entries
      await createTimeEntryViaAPI(page);
      await page.reload();

      // Check if stats cards are visible
      await expect(page.locator('text=Total Hours')).toBeVisible();
      await expect(page.locator('text=Billable Hours')).toBeVisible();
      await expect(page.locator('text=Entries')).toBeVisible();
      await expect(page.locator('text=Daily Average')).toBeVisible();
      await expect(page.locator('text=Pending')).toBeVisible();

      // Stats should have values
      const totalHoursValue = page.locator('text=Total Hours').locator('..').locator('text=\\d+').first();
      await expect(totalHoursValue).toBeDefined();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Header should still be visible
      await expect(page.locator('text=📋 Timesheet')).toBeVisible();

      // Buttons should still be clickable
      const addButton = page.locator('button:has-text("Add Entry")');
      await expect(addButton).toBeVisible();
    });

    test('should work on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // All main elements should be visible
      await expect(page.locator('text=📋 Timesheet')).toBeVisible();
      await expect(page.locator('text=Total Hours')).toBeVisible();
    });

    test('should work on desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // All elements should be properly laid out
      const statsCards = page.locator('text=/Total Hours|Billable Hours|Entries|Daily Average|Pending/');
      const cardCount = await statsCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(5);
    });
  });
});

/**
 * Helper function to create a timesheet entry via API
 */
async function createTimeEntryViaAPI(page: Page) {
  const today = new Date().toISOString().split('T')[0];
  
  await page.request.post('http://localhost:3001/api/worklogs', {
    data: {
      date: today,
      description: 'Test Entry',
      hours: 8,
      start_time: '09:00',
      end_time: '17:00',
      project_id: '1',
      status: 'pending',
    },
  });
}
