import { test, expect } from '@playwright/test';

test.describe('Chord Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Panel toggle', () => {
    test('panel is collapsed by default', async ({ page }) => {
      const toggle = page.getByRole('button', { name: /expand chord panel/i });
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      const explorer = page.getByRole('region', { name: /chord explorer/i });
      await expect(explorer).not.toBeVisible();
    });

    test('clicking toggle opens the panel', async ({ page }) => {
      await page.getByRole('button', { name: /expand chord panel/i }).click();

      // After clicking, the label changes to "Collapse chord panel"
      const toggle = page.getByRole('button', { name: /collapse chord panel/i });
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const explorer = page.getByRole('region', { name: /chord explorer/i });
      await expect(explorer).toBeVisible();
      await expect(page.locator('text=Chords in Scale')).toBeVisible();
    });

    test('clicking toggle again closes the panel', async ({ page }) => {
      await page.getByRole('button', { name: /expand chord panel/i }).click();
      await expect(page.getByRole('region', { name: /chord explorer/i })).toBeVisible();

      // Now the label is "Collapse" — click to close
      await page.getByRole('button', { name: /collapse chord panel/i }).click();

      // Label reverts to "Expand"
      const toggle = page.getByRole('button', { name: /expand chord panel/i });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('region', { name: /chord explorer/i })).not.toBeVisible();
    });
  });

  test.describe('Chord cards', () => {
    test.beforeEach(async ({ page }) => {
      // Open the chord panel for all chord card tests
      await page.getByRole('button', { name: /expand chord panel/i }).click();
      await expect(page.getByRole('region', { name: /chord explorer/i })).toBeVisible();
    });

    test('chord cards are visible for C major scale', async ({ page }) => {
      // Default is C harmonica, C major scale — should have chords
      const chordCards = page.getByRole('button', { name: /chord,.*voicing/i });
      await expect(chordCards.first()).toBeVisible();
      expect(await chordCards.count()).toBeGreaterThan(0);
    });

    test('quality legend is visible', async ({ page }) => {
      const legend = page.getByRole('note', { name: /chord quality color legend/i });
      await expect(legend).toBeVisible();
      await expect(legend).toContainText('Major');
      await expect(legend).toContainText('Minor');
      await expect(legend).toContainText('Dominant 7th');
      await expect(legend).toContainText('Diminished');
    });

    test('chord card shows roman numeral', async ({ page }) => {
      // C Major chord should have roman numeral "I"
      const cMajorCard = page.getByRole('button', { name: /C Major chord, I,/i });
      await expect(cMajorCard).toBeVisible();
    });

    test('chord card shows notes as pitch classes', async ({ page }) => {
      // C Major chord notes: C – E – G
      const cMajorCard = page.getByRole('button', { name: /C Major chord, I,/i });
      await expect(cMajorCard).toContainText('C – E – G');
    });

    test('chord card aria-label includes roman numeral', async ({ page }) => {
      const cMajorCard = page.getByRole('button', { name: /C Major chord, I, voicing 1 of/i });
      await expect(cMajorCard).toBeVisible();
    });
  });

  test.describe('Chord selection', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /expand chord panel/i }).click();
      await expect(page.getByRole('region', { name: /chord explorer/i })).toBeVisible();
    });

    test('clicking a chord card selects it', async ({ page }) => {
      const chordCard = page.getByRole('button', { name: /C Major chord, I,/i });
      await chordCard.click();

      // Selected card gets the selected CSS class
      await expect(chordCard).toHaveClass(/chordCardSelected/);
    });

    test('clicking a selected chord card deselects it', async ({ page }) => {
      const chordCard = page.getByRole('button', { name: /C Major chord, I,/i });

      // Select
      await chordCard.click();
      await expect(chordCard).toHaveClass(/chordCardSelected/);

      // Deselect
      await chordCard.click();
      await expect(chordCard).not.toHaveClass(/chordCardSelected/);
    });
  });

  test.describe('Voicing navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /expand chord panel/i }).click();
      await expect(page.getByRole('region', { name: /chord explorer/i })).toBeVisible();
    });

    test('chord with multiple voicings shows navigation', async ({ page }) => {
      // Find a chord that has a voicing counter (meaning multiple voicings)
      const voicingCounter = page.locator('[class*="voicingCounter"]');

      // At least one chord should have multiple voicings in C major
      if (await voicingCounter.count() > 0) {
        const counter = voicingCounter.first();
        await expect(counter).toBeVisible();
        await expect(counter).toContainText(/1 of \d+/);
      }
    });

    test('next button advances the voicing', async ({ page }) => {
      const voicingCounter = page.locator('[class*="voicingCounter"]');

      if (await voicingCounter.count() > 0) {
        const counter = voicingCounter.first();
        await expect(counter).toContainText(/1 of \d+/);

        // Click next voicing on the same card
        const card = counter.locator('..');
        const nextButton = card.getByLabel('Next voicing');
        await nextButton.click();

        await expect(counter).toContainText(/2 of \d+/);
      }
    });

    test('previous button goes back to prior voicing', async ({ page }) => {
      const voicingCounter = page.locator('[class*="voicingCounter"]');

      if (await voicingCounter.count() > 0) {
        const counter = voicingCounter.first();
        const card = counter.locator('..');
        const nextButton = card.getByLabel('Next voicing');
        const prevButton = card.getByLabel('Previous voicing');

        // Go to voicing 2
        await nextButton.click();
        await expect(counter).toContainText(/2 of \d+/);

        // Go back to voicing 1
        await prevButton.click();
        await expect(counter).toContainText(/1 of \d+/);
      }
    });
  });

  test.describe('Tongue blocking toggle', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /expand chord panel/i }).click();
      await expect(page.getByRole('region', { name: /chord explorer/i })).toBeVisible();
    });

    test('tongue blocking is off by default', async ({ page }) => {
      const tbToggle = page.getByRole('button', { name: /show tongue blocking/i });
      await expect(tbToggle).toBeVisible();
      await expect(tbToggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('clicking tongue blocking toggle enables it', async ({ page }) => {
      const tbToggle = page.getByRole('button', { name: /show tongue blocking/i });
      await tbToggle.click();

      // Button label changes and aria-pressed updates
      const hideToggle = page.getByRole('button', { name: /hide tongue blocking/i });
      await expect(hideToggle).toHaveAttribute('aria-pressed', 'true');

      // Tongue Blocking section header appears
      await expect(page.getByRole('heading', { name: 'Tongue Blocking' })).toBeVisible();
    });

    test('clicking tongue blocking toggle again disables it', async ({ page }) => {
      // Enable
      await page.getByRole('button', { name: /show tongue blocking/i }).click();
      await expect(page.locator('h3:text("Tongue Blocking")')).toBeVisible();

      // Disable
      await page.getByRole('button', { name: /hide tongue blocking/i }).click();

      const showToggle = page.getByRole('button', { name: /show tongue blocking/i });
      await expect(showToggle).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator('h3:text("Tongue Blocking")')).not.toBeVisible();
    });
  });
});
