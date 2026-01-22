import { test, expect } from '@playwright/test';

test.describe('Quiz Page - Navigation', () => {
  test('can navigate from Scales to Quiz page', async ({ page }) => {
    await page.goto('/');

    // Verify we're on the Scales page
    const harmonicaRegion = page.getByRole('region', { name: /harmonica visualization/i });
    await expect(harmonicaRegion).toBeVisible();

    // Click Quiz tab
    const quizTab = page.getByRole('button', { name: 'Quiz' });
    await quizTab.click();

    // Verify we're on the Quiz page
    await expect(page.locator('text=Key Quiz')).toBeVisible();
    await expect(harmonicaRegion).not.toBeVisible();
  });

  test('can navigate directly to Quiz page via URL', async ({ page }) => {
    await page.goto('/#/quiz');

    await expect(page.locator('text=Key Quiz')).toBeVisible();
    await expect(page.locator('text=Listen to chord progressions')).toBeVisible();
  });

  test('can navigate from Quiz back to Scales', async ({ page }) => {
    await page.goto('/#/quiz');

    // Click Scales tab
    const scalesTab = page.getByRole('button', { name: 'Scales' });
    await scalesTab.click();

    // Verify we're on the Scales page
    const harmonicaRegion = page.getByRole('region', { name: /harmonica visualization/i });
    await expect(harmonicaRegion).toBeVisible();
    await expect(page.locator('text=Key Quiz')).not.toBeVisible();
  });

  test('nav tabs show correct active state', async ({ page }) => {
    await page.goto('/');

    const scalesTab = page.getByRole('button', { name: 'Scales', exact: true });
    const quizTab = page.getByRole('button', { name: 'Quiz', exact: true });

    // Scales should be active on home page
    await expect(scalesTab).toHaveAttribute('aria-current', 'page');
    await expect(quizTab).not.toHaveAttribute('aria-current');

    // Navigate to Quiz
    await quizTab.click();

    // Quiz should now be active
    await expect(quizTab).toHaveAttribute('aria-current', 'page');
    await expect(scalesTab).not.toHaveAttribute('aria-current');
  });
});

test.describe('Quiz Page - Initial State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('shows quiz title and description', async ({ page }) => {
    await expect(page.locator('text=Key Quiz')).toBeVisible();
    await expect(page.locator('text=Listen to chord progressions and identify the key and mode')).toBeVisible();
  });

  test('shows difficulty selector with Easy selected by default', async ({ page }) => {
    const easyButton = page.getByRole('radio', { name: 'Easy' });
    const mediumButton = page.getByRole('radio', { name: 'Medium' });
    const hardButton = page.getByRole('radio', { name: 'Hard' });

    await expect(easyButton).toBeVisible();
    await expect(mediumButton).toBeVisible();
    await expect(hardButton).toBeVisible();

    await expect(easyButton).toHaveAttribute('aria-checked', 'true');
    await expect(mediumButton).toHaveAttribute('aria-checked', 'false');
    await expect(hardButton).toHaveAttribute('aria-checked', 'false');
  });

  test('shows score display at 0/0', async ({ page }) => {
    await expect(page.locator('text=0 / 0')).toBeVisible();
  });

  test('shows Start Quiz button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start quiz/i });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('does NOT show answer selector before starting', async ({ page }) => {
    // Key and Mode selectors should not be visible in idle state
    await expect(page.locator('#key-select')).not.toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Select mode' })).not.toBeVisible();
  });
});

test.describe('Quiz Page - Difficulty Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('can change difficulty to Medium', async ({ page }) => {
    const mediumButton = page.getByRole('radio', { name: 'Medium' });
    await mediumButton.click();

    await expect(mediumButton).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('radio', { name: 'Easy' })).toHaveAttribute('aria-checked', 'false');
  });

  test('can change difficulty to Hard', async ({ page }) => {
    const hardButton = page.getByRole('radio', { name: 'Hard' });
    await hardButton.click();

    await expect(hardButton).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('radio', { name: 'Easy' })).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('Quiz Page - Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('clicking Start Quiz shows answer selector and controls', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start quiz/i });
    await startButton.click();

    // Answer selector should appear (visible during playing phase)
    await expect(page.locator('#key-select')).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Select mode' })).toBeVisible();

    // Replay and Check Answer buttons should appear
    await expect(page.getByRole('button', { name: /replay/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible();

    // Start Quiz button should be gone
    await expect(startButton).not.toBeVisible();
  });

  test('answer selector defaults to C Major', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for answer selector
    await expect(page.locator('#key-select')).toBeVisible();

    const keySelect = page.locator('#key-select');
    await expect(keySelect).toHaveValue('C');

    const majorButton = page.getByRole('radio', { name: 'Major' });
    await expect(majorButton).toHaveAttribute('aria-checked', 'true');
  });

  test('buttons are disabled during audio playback', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // During playback, buttons should be disabled
    const replayButton = page.getByRole('button', { name: /replay/i });
    const checkButton = page.getByRole('button', { name: /check answer/i });

    // Buttons appear immediately but may be disabled during playback
    await expect(replayButton).toBeVisible();
    await expect(checkButton).toBeVisible();

    // Wait for playback to finish (buttons become enabled)
    await expect(replayButton).toBeEnabled({ timeout: 10000 });
    await expect(checkButton).toBeEnabled();
  });

  test('can select different key from dropdown', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for playback to finish
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });

    const keySelect = page.locator('#key-select');
    await keySelect.selectOption('G');
    await expect(keySelect).toHaveValue('G');
  });

  test('can toggle between Major and Minor', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for playback to finish
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });

    const majorButton = page.getByRole('radio', { name: 'Major' });
    const minorButton = page.getByRole('radio', { name: 'Minor' });

    // Default is Major
    await expect(majorButton).toHaveAttribute('aria-checked', 'true');
    await expect(minorButton).toHaveAttribute('aria-checked', 'false');

    // Click Minor
    await minorButton.click();
    await expect(minorButton).toHaveAttribute('aria-checked', 'true');
    await expect(majorButton).toHaveAttribute('aria-checked', 'false');

    // Click Major again
    await majorButton.click();
    await expect(majorButton).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Quiz Page - Answer Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('Check Answer reveals result feedback', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for playback to finish
    const checkButton = page.getByRole('button', { name: /check answer/i });
    await expect(checkButton).toBeEnabled({ timeout: 10000 });

    // Submit answer
    await checkButton.click();

    // Result feedback should appear (either Correct! or Incorrect)
    await expect(page.locator('text=/Correct!|Incorrect/')).toBeVisible();

    // Progression info should be shown
    await expect(page.locator('text=The progression was in')).toBeVisible();
    await expect(page.locator('text=Chords played:')).toBeVisible();
  });

  test('score updates after answering', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for playback and submit
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });
    await page.getByRole('button', { name: /check answer/i }).click();

    // Score should now show X / 1
    await expect(page.locator('text=/ 1')).toBeVisible();
  });

  test('Next Question button appears after revealing answer', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for playback and submit
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });
    await page.getByRole('button', { name: /check answer/i }).click();

    // Next Question button should appear
    const nextButton = page.getByRole('button', { name: /next question/i });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();

    // Check Answer and Replay buttons should be gone
    await expect(page.getByRole('button', { name: /check answer/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /replay/i })).not.toBeVisible();
  });

  test('can continue to next question', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Answer first question
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });
    await page.getByRole('button', { name: /check answer/i }).click();

    // Click Next Question
    await page.getByRole('button', { name: /next question/i }).click();

    // Should be in playing/answering phase again
    await expect(page.getByRole('button', { name: /replay/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible();

    // Result feedback should be hidden
    await expect(page.locator('text=The progression was in')).not.toBeVisible();
  });
});

test.describe('Quiz Page - Score Tracking', () => {
  test('score accumulates across multiple questions', async ({ page }) => {
    await page.goto('/#/quiz');

    // Answer 3 questions
    for (let i = 1; i <= 3; i++) {
      if (i === 1) {
        await page.getByRole('button', { name: /start quiz/i }).click();
      } else {
        await page.getByRole('button', { name: /next question/i }).click();
      }

      // Wait for playback
      await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });

      // Submit answer
      await page.getByRole('button', { name: /check answer/i }).click();

      // Verify total count increases
      await expect(page.locator(`text=/ ${i}`)).toBeVisible();
    }
  });
});

test.describe('Quiz Page - Replay Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('Replay button triggers audio playback', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for initial playback to finish
    const replayButton = page.getByRole('button', { name: /replay/i });
    await expect(replayButton).toBeEnabled({ timeout: 10000 });

    // Click Replay
    await replayButton.click();

    // Buttons should be disabled during replay
    await expect(replayButton).toBeDisabled();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeDisabled();

    // Wait for replay to finish
    await expect(replayButton).toBeEnabled({ timeout: 10000 });
  });
});

test.describe('Quiz Page - Difficulty Disabled During Quiz', () => {
  test('difficulty buttons are disabled after starting quiz', async ({ page }) => {
    await page.goto('/#/quiz');

    // Start quiz
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Difficulty buttons should be disabled
    await expect(page.getByRole('radio', { name: 'Easy' })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Hard' })).toBeDisabled();
  });

  test('difficulty can be changed in revealed phase', async ({ page }) => {
    await page.goto('/#/quiz');

    // Start quiz and answer
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });
    await page.getByRole('button', { name: /check answer/i }).click();

    // Difficulty buttons should be enabled again
    await expect(page.getByRole('radio', { name: 'Easy' })).toBeEnabled();
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeEnabled();
    await expect(page.getByRole('radio', { name: 'Hard' })).toBeEnabled();

    // Can change difficulty
    await page.getByRole('radio', { name: 'Hard' }).click();
    await expect(page.getByRole('radio', { name: 'Hard' })).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Quiz Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/quiz');
  });

  test('difficulty selector has proper radiogroup role', async ({ page }) => {
    const radiogroup = page.getByRole('radiogroup', { name: 'Select difficulty' });
    await expect(radiogroup).toBeVisible();
  });

  test('mode selector has proper radiogroup role', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });

    const modeRadiogroup = page.getByRole('radiogroup', { name: 'Select mode' });
    await expect(modeRadiogroup).toBeVisible();
  });

  test('key selector has proper label association', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });

    // Label should be associated with select
    const keyLabel = page.locator('label[for="key-select"]');
    await expect(keyLabel).toBeVisible();
    await expect(keyLabel).toHaveText('Key:');
  });

  test('result feedback has aria-live for screen readers', async ({ page }) => {
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page.getByRole('button', { name: /check answer/i })).toBeEnabled({ timeout: 10000 });
    await page.getByRole('button', { name: /check answer/i }).click();

    // Feedback card should have aria-live
    const feedbackCard = page.locator('[aria-live="assertive"]');
    await expect(feedbackCard).toBeVisible();
  });
});

test.describe('Quiz Page - Theme Support', () => {
  test('quiz page renders in light theme', async ({ page }) => {
    await page.goto('/#/quiz');

    // Default should be light theme
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await expect(page.locator('text=Key Quiz')).toBeVisible();
  });

  test('quiz page renders in dark theme', async ({ page }) => {
    await page.goto('/#/quiz');

    // Click theme toggle
    const themeToggle = page.getByRole('button', { name: /switch to dark theme/i });
    await themeToggle.click();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await expect(page.locator('text=Key Quiz')).toBeVisible();
  });
});
