import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('user can register successfully', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="signup-button"]');
    await expect(page).toHaveURL('/verify-email');
  });

  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });
});