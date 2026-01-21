import { test, expect } from '@playwright/test';

test.describe('Tempo Control Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows default tempo of 120 BPM', async ({ page }) => {
    const tempoValue = page.locator('[class*="tempoValue"]');
    await expect(tempoValue).toHaveText('120 BPM');
  });

  test('slider has correct range (40-200)', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    await expect(slider).toHaveAttribute('min', '40');
    await expect(slider).toHaveAttribute('max', '200');
  });

  test('slider updates BPM display', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    const tempoValue = page.locator('[class*="tempoValue"]');

    await slider.fill('60');
    await expect(tempoValue).toHaveText('60 BPM');

    await slider.fill('150');
    await expect(tempoValue).toHaveText('150 BPM');
  });

  test('minimum tempo (40 BPM) works', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    const tempoValue = page.locator('[class*="tempoValue"]');

    await slider.fill('40');
    await expect(tempoValue).toHaveText('40 BPM');
  });

  test('maximum tempo (200 BPM) works', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    const tempoValue = page.locator('[class*="tempoValue"]');

    await slider.fill('200');
    await expect(tempoValue).toHaveText('200 BPM');
  });

  test('slider is disabled during playback', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    const playButton = page.locator('button:has-text("Play Scale")');

    // Start playback
    await playButton.click();
    await page.waitForTimeout(200);

    // Slider should be disabled
    await expect(slider).toBeDisabled();

    // Stop playback
    const stopButton = page.locator('button:has-text("Stop")');
    await stopButton.click();
    await page.waitForTimeout(200);

    // Slider should be enabled again
    await expect(slider).toBeEnabled();
  });

  test('has proper accessibility attributes', async ({ page }) => {
    const slider = page.locator('#tempo-slider');
    const label = page.locator('label[for="tempo-slider"]');

    // Label exists and is associated
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Tempo');

    // Slider has aria-label
    await slider.fill('90');
    const ariaLabel = await slider.getAttribute('aria-label');
    expect(ariaLabel).toContain('90');
    expect(ariaLabel).toContain('BPM');
  });

  test('play button toggles to stop during playback', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play Scale")');

    await playButton.click();
    await page.waitForTimeout(200);

    // Button should now show Stop
    const stopButton = page.locator('button:has-text("Stop")');
    await expect(stopButton).toBeVisible();

    // Click stop
    await stopButton.click();
    await page.waitForTimeout(200);

    // Button should show Play Scale again
    await expect(playButton).toBeVisible();
  });
});
