import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/');
  
  // Test login form
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Verify successful login
  await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
});