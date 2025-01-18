import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1313';
const FOOTER_THEME_SELECTOR = 'div#footer-color-selector button.bd-theme-selector';

test.describe('Theme switching functionality', () => {
  test('verifies bold styling of selected theme and updates on switch', async ({ page }) => {
    // Go to homepage
    await page.goto(BASE_URL);
    
    // Open theme dropdown
    await page.locator(FOOTER_THEME_SELECTOR).click();
    
    // Verify initial Light theme is bold (font-weight: 700)
    const lightButton = page.locator('#footer-color-selector .dropdown-item[data-bs-theme-value="light"]');
    await expect(lightButton).toHaveCSS('font-weight', '700');
    
    // Switch to Dark theme
    await page.locator('div#footer-color-selector .dropdown-item[data-bs-theme-value="dark"]').click();
    
    // Verify Dark theme is now bold and Light is not
    const darkButton = page.locator('#footer-color-selector .dropdown-item[data-bs-theme-value="dark"]');
    await expect(darkButton).toHaveCSS('font-weight', '700');
    await expect(lightButton).toHaveCSS('font-weight', '400');
    
    // Switch to Auto theme
    await page.locator(FOOTER_THEME_SELECTOR).click();
    await page.locator('div#footer-color-selector .dropdown-item[data-bs-theme-value="auto"]').click();
    
    // Verify Auto theme is bold and others are not
    const autoButton = page.locator('#footer-color-selector .dropdown-item[data-bs-theme-value="auto"]');
    await expect(autoButton).toHaveCSS('font-weight', '700');
    await expect(darkButton).toHaveCSS('font-weight', '400');
    await expect(lightButton).toHaveCSS('font-weight', '400');
  });

  test('theme selection persists after page reload', async ({ page }) => {
    // Go to homepage
    await page.goto(BASE_URL);
    
    // Switch to Dark theme
    await page.locator(FOOTER_THEME_SELECTOR).click();
    await page.locator('div#footer-color-selector .dropdown-item[data-bs-theme-value="dark"]').click();
    
    // Reload page
    await page.reload();
    
    // Open dropdown and verify Dark theme is still bold
    await page.locator(FOOTER_THEME_SELECTOR).click();
    const darkButton = page.locator('#footer-color-selector .dropdown-item[data-bs-theme-value="dark"]');
    await expect(darkButton).toHaveCSS('font-weight', '700');
  });
});