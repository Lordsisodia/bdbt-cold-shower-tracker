import { test, expect } from '@playwright/test';

test.describe('Admin routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'AdminPass123!');
    await page.click('[data-testid="login-button"]');
  });

  test('admin can access dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).not.toHaveURL('/unauthorized');
  });

  test('non-admin redirected to unauthorized', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/unauthorized');
  });
});