import { test, expect } from '@playwright/test';

test.describe('Deep Linking', () => {
  test('loads correct state from deep link URL with all four params', async ({ page }) => {
    await page.goto('/#/?harpKey=G&songKey=D&scale=blues&tuning=country');

    await expect(page.locator('#harmonica-key')).toHaveValue('G');
    await expect(page.locator('#song-key')).toHaveValue('D');
    await expect(page.locator('#scale-type')).toHaveValue('blues');
    await expect(page.locator('#tuning')).toHaveValue('country');
  });

  test('uses defaults for omitted params in deep link URL', async ({ page }) => {
    await page.goto('/#/?harpKey=A');

    await expect(page.locator('#harmonica-key')).toHaveValue('A');
    await expect(page.locator('#song-key')).toHaveValue('C');
    await expect(page.locator('#scale-type')).toHaveValue('major');
    await expect(page.locator('#tuning')).toHaveValue('richter');
  });

  test('silently ignores invalid param values and uses defaults', async ({ page }) => {
    await page.goto('/#/?harpKey=INVALID&scale=not-a-scale');

    await expect(page.locator('#harmonica-key')).toHaveValue('C');
    await expect(page.locator('#scale-type')).toHaveValue('major');
  });

  test('updates URL when harmonica key dropdown changes', async ({ page }) => {
    await page.goto('/');

    await page.selectOption('#harmonica-key', 'G');

    await expect(page).toHaveURL(/#.*harpKey=G/);
  });

  test('updates URL when song key dropdown changes', async ({ page }) => {
    await page.goto('/');

    await page.selectOption('#song-key', 'D');

    await expect(page).toHaveURL(/#.*songKey=D/);
  });

  test('updates URL when scale type dropdown changes', async ({ page }) => {
    await page.goto('/');

    await page.selectOption('#scale-type', 'blues');

    await expect(page).toHaveURL(/#.*scale=blues/);
  });

  test('updates URL when tuning dropdown changes', async ({ page }) => {
    await page.goto('/');

    await page.selectOption('#tuning', 'country');

    await expect(page).toHaveURL(/#.*tuning=country/);
  });

  test('quiz route still works when no query params present', async ({ page }) => {
    await page.goto('/#/quiz');

    // Quiz page should load, not scales page
    const quizContent = page.getByText(/quiz/i).first();
    await expect(quizContent).toBeVisible();

    // Harmonica key selector should not be visible on quiz page
    await expect(page.locator('#harmonica-key')).not.toBeVisible();
  });

  test('deep link with flat key (Bb) loads correctly', async ({ page }) => {
    await page.goto('/#/?harpKey=Bb&songKey=Eb');

    await expect(page.locator('#harmonica-key')).toHaveValue('Bb');
    await expect(page.locator('#song-key')).toHaveValue('Eb');
  });

  test('deep link with multi-word scale (minor pentatonic) loads correctly', async ({ page }) => {
    await page.goto('/#/?scale=minor+pentatonic');

    await expect(page.locator('#scale-type')).toHaveValue('minor pentatonic');
  });
});
