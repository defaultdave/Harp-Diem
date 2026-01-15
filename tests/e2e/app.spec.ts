import { test, expect } from '@playwright/test';

test.describe('Harp Diem Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the application', async ({ page }) => {
    // Use role-based selector for the harmonica region
    const harmonicaRegion = page.getByRole('region', { name: /harmonica visualization/i });
    await expect(harmonicaRegion).toBeVisible();
  });

  test('displays harmonica holes', async ({ page }) => {
    // Use the group role with aria-label
    const holesGroup = page.getByRole('group', { name: /harmonica holes/i });
    await expect(holesGroup).toBeVisible();
  });

  test('has harmonica key selector', async ({ page }) => {
    const selector = page.locator('#harmonica-key');
    await expect(selector).toBeVisible();
    await expect(selector).toHaveValue('C');
  });

  test('has song key selector', async ({ page }) => {
    const selector = page.locator('#song-key');
    await expect(selector).toBeVisible();
  });

  test('has scale type selector', async ({ page }) => {
    const selector = page.locator('#scale-type');
    await expect(selector).toBeVisible();
  });

  test('can change harmonica key', async ({ page }) => {
    await page.selectOption('#harmonica-key', 'G');
    await expect(page.locator('#harmonica-key')).toHaveValue('G');
  });

  test('shows tab notation toggle', async ({ page }) => {
    const tabButton = page.getByRole('button', { name: /tab/i });
    await expect(tabButton).toBeVisible();
  });

  test('shows degrees toggle', async ({ page }) => {
    const degreesButton = page.getByRole('button', { name: /degrees/i });
    await expect(degreesButton).toBeVisible();
  });
});
