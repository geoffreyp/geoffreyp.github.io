import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1313';

test.describe('Blog page content', () => {
  test('should show "Demo Blog" heading and "Welcome to the demo blog" text', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Verify heading is displayed
    await expect(page.getByRole('heading', { name: /demo blog/i })).toBeVisible();
    
    // Verify body text is displayed
    await expect(page.getByText('Welcome to the demo blog')).toBeVisible();
  });
});