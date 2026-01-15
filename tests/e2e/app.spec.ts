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

  test('shows Play Scale button', async ({ page }) => {
    const playScaleButton = page.getByRole('button', { name: /play scale/i });
    await expect(playScaleButton).toBeVisible();
  });

  test('Play Scale button is enabled when scale has notes', async ({ page }) => {
    const playScaleButton = page.getByRole('button', { name: /play scale/i });
    await expect(playScaleButton).toBeEnabled();
  });

  test('Play Scale button shows playing state when clicked', async ({ page }) => {
    const playScaleButton = page.getByRole('button', { name: /play scale/i });
    await playScaleButton.click();

    // Button should show "Playing..." text and be disabled during playback
    // Use a fresh locator since aria-label changes when playing
    const playingButton = page.getByRole('button', { name: /playing/i });
    await expect(playingButton).toBeVisible();
    await expect(playingButton).toBeDisabled();
  });

  test('scale notes are displayed', async ({ page }) => {
    // C Major scale should show C, D, E, F, G, A, B notes
    const scaleSection = page.locator('text=C Major Scale');
    await expect(scaleSection).toBeVisible();
  });
});
