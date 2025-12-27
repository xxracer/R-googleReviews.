
const { test, expect } = require('@playwright/test');

test.describe('CMS Login Verification', () => {
  test('should allow an admin to log in and access the dashboard', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login');

    // Fill in the admin credentials
    await page.fill('input[id="username"]', 'moon');
    await page.fill('input[id="password"]', 'Reignrules123');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for the URL to change to the admin dashboard
    await page.waitForURL('http://localhost:3000/admin');
    await expect(page).toHaveURL('http://localhost:3000/admin');

    // **CRITICAL FIX:** Explicitly wait for the target h2 element to be visible.
    // This resolves the race condition between Playwright and React rendering.
    const expectedHeader = page.locator('.admin-content h2', { hasText: 'Manage Homepage' });
    await expectedHeader.waitFor({ state: 'visible', timeout: 5000 });

    // Now, perform the assertion on the element we already located and waited for.
    await expect(expectedHeader).toBeVisible();

    // Take a screenshot to visually confirm the dashboard is loaded
    await page.screenshot({ path: '/home/jules/verification/cms_dashboard_access.png' });
  });
});
