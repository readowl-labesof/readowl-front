import { test, expect } from '@playwright/test';

// Basic smoke test to ensure the public landing page loads
test('landing renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Readowl')).toBeVisible();
});
