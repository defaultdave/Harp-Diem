import { test, expect, Page } from '@playwright/test';

// Mobile viewport settings
const MOBILE_PORTRAIT = { width: 375, height: 667 };  // iPhone SE portrait
const MOBILE_LANDSCAPE = { width: 667, height: 375 }; // iPhone SE landscape

// Helper to set up mobile device emulation
async function setupMobileDevice(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  // Emulate mobile user agent
  await page.context().addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      writable: false
    });
    Object.defineProperty(navigator, 'userAgentData', {
      value: { mobile: true },
      writable: false
    });
  });
}

test.describe('Rotate Phone Overlay', () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.addInitScript(() => {
      sessionStorage.clear();
    });
  });

  test('shows overlay on mobile device in portrait mode with narrow viewport', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();
    await expect(page.locator('text=Rotate Your Phone')).toBeVisible();
    await expect(page.locator('text=Continue Anyway')).toBeVisible();
  });

  test('does NOT show overlay on desktop', async ({ page }) => {
    // Desktop viewport - should not show overlay
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).not.toBeVisible();
  });

  test('does NOT show overlay in landscape mode', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_LANDSCAPE);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).not.toBeVisible();
  });

  test('does NOT show overlay on mobile with viewport >= 525px', async ({ page }) => {
    await setupMobileDevice(page, { width: 600, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).not.toBeVisible();
  });

  test('Continue Anyway button dismisses overlay', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Click Continue Anyway
    await page.click('text=Continue Anyway');

    // Wait for exit animation
    await page.waitForTimeout(300);

    await expect(overlay).not.toBeVisible();
  });

  test('Close button (X) dismisses overlay', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Click X button
    await page.click('button[aria-label="Close"]');

    // Wait for exit animation
    await page.waitForTimeout(300);

    await expect(overlay).not.toBeVisible();
  });

  test('clicking backdrop dismisses overlay', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Click on backdrop (top-left corner, outside card)
    await page.click('[role="dialog"]', { position: { x: 10, y: 10 } });

    // Wait for exit animation
    await page.waitForTimeout(300);

    await expect(overlay).not.toBeVisible();
  });

  test('overlay does NOT reappear after dismissal in same session', async ({ page }) => {
    // Don't use beforeEach's sessionStorage.clear for this test - we need to verify persistence
    // First, set up mobile device and set dismiss flag in sessionStorage before page load
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        writable: false
      });
      Object.defineProperty(navigator, 'userAgentData', {
        value: { mobile: true },
        writable: false
      });
      // Simulate previously dismissed overlay
      sessionStorage.setItem('rotateOverlayDismissed', 'true');
    });
    await page.setViewportSize(MOBILE_PORTRAIT);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');

    // Overlay should NOT appear because dismiss flag is already set in sessionStorage
    await expect(overlay).not.toBeVisible();
  });

  test('sessionStorage stores dismiss preference', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dismiss overlay
    await page.click('text=Continue Anyway');
    await page.waitForTimeout(300);

    // Check sessionStorage
    const dismissed = await page.evaluate(() => {
      return sessionStorage.getItem('rotateOverlayDismissed');
    });

    expect(dismissed).toBe('true');
  });

  test('Escape key dismisses overlay', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait for exit animation
    await page.waitForTimeout(300);

    await expect(overlay).not.toBeVisible();
  });

  test('Tab key cycles focus within overlay (focus trap)', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Focus should start on Continue Anyway button
    const continueButton = page.locator('text=Continue Anyway');
    await expect(continueButton).toBeFocused();

    // Tab should move to Close button
    await page.keyboard.press('Tab');
    const closeButton = page.locator('button[aria-label="Close"]');
    await expect(closeButton).toBeFocused();

    // Tab again should cycle back to Continue button
    await page.keyboard.press('Tab');
    await expect(continueButton).toBeFocused();

    // Shift+Tab should go back to Close button
    await page.keyboard.press('Shift+Tab');
    await expect(closeButton).toBeFocused();
  });

  test('overlay has proper ARIA attributes', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toHaveAttribute('aria-modal', 'true');
    await expect(overlay).toHaveAttribute('aria-labelledby', 'rotate-overlay-heading');

    // Heading should exist with correct id
    const heading = page.locator('#rotate-overlay-heading');
    await expect(heading).toHaveText('Rotate Your Phone');
  });

  test('overlay prevents body scroll', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check body overflow is hidden when overlay is visible
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    // Dismiss overlay
    await page.click('text=Continue Anyway');
    await page.waitForTimeout(300);

    // Body scroll should be restored
    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).not.toBe('hidden');
  });
});

test.describe('Rotate Phone Overlay - Theme Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
    });
  });

  test('renders correctly in light theme', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Check that overlay card is visible and has light background
    const card = page.locator('[role="dialog"] > div');
    await expect(card).toBeVisible();
  });

  test('renders correctly in dark theme', async ({ page }) => {
    // Set dark theme via localStorage before page load (using correct storage key)
    await page.context().addInitScript(() => {
      localStorage.setItem('harp-diem-theme', 'dark');
    });

    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Check that dark theme is applied
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');

    // Verify overlay card is visible with dark theme
    const card = page.locator('[role="dialog"] > div');
    await expect(card).toBeVisible();
  });
});

test.describe('Rotate Phone Overlay - Auto-dismiss on Rotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
    });
  });

  test('auto-dismisses when viewport changes to landscape', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Simulate rotation by changing viewport to landscape
    await page.setViewportSize(MOBILE_LANDSCAPE);

    // Give time for React to re-render
    await page.waitForTimeout(100);

    // Overlay should auto-dismiss because width > height (landscape)
    await expect(overlay).not.toBeVisible();
  });

  test('overlay reappears if rotated back to portrait (if not dismissed)', async ({ page }) => {
    await setupMobileDevice(page, MOBILE_PORTRAIT);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Rotate to landscape
    await page.setViewportSize(MOBILE_LANDSCAPE);
    await page.waitForTimeout(100);
    await expect(overlay).not.toBeVisible();

    // Rotate back to portrait
    await page.setViewportSize(MOBILE_PORTRAIT);
    await page.waitForTimeout(100);

    // Overlay should reappear (wasn't explicitly dismissed)
    await expect(overlay).toBeVisible();
  });
});
