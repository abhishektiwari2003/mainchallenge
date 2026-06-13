import { test, expect } from '@playwright/test';

/**
 * Happy path: onboard (name the exam) -> write a journal entry -> run analysis
 * -> see the hidden-trigger insight surface on the dashboard.
 *
 * The run is hermetic: data uses the in-browser LocalRepo (NEXT_PUBLIC_E2E=1)
 * and the AI insight endpoint is intercepted, so no API key or DB is required.
 */
test('student onboards, journals, and uncovers a hidden trigger', async ({ page }) => {
  await page.route('**/api/insights', async (route) => {
    await route.fulfill({
      json: {
        insight: {
          triggers: ['Stress spikes the night before mock tests, not the test itself'],
          patterns: ['Mood recovers by the morning of the exam'],
          burnoutScore: 57,
          suggestedAction: 'Plan a 10-minute wind-down ritual the night before each mock.',
          distressLevel: 'moderate',
        },
      },
    });
  });

  // 1. Onboarding — name the exam and consent.
  await page.goto('/onboarding');
  await page.getByLabel(/what should we call you/i).fill('Asha');
  await page.getByRole('radio', { name: 'JEE' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /start reflecting/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/Hello, Asha/)).toBeVisible();

  // 2. Write a journal entry.
  await page.getByRole('link', { name: /journal/i }).click();
  await expect(page).toHaveURL(/\/journal/);
  await page
    .getByLabel(/what.+on your mind/i)
    .fill('Could not sleep, worried about the mock test tomorrow morning.');
  await page.getByRole('button', { name: /save entry/i }).click();
  await expect(page.getByText(/worried about the mock test/i)).toBeVisible();

  // 3. Analyze and reveal the hidden trigger on the dashboard.
  await page.getByRole('link', { name: /dashboard/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: /analyze my journal/i }).click();

  await expect(page.getByText(/night before mock tests/i)).toBeVisible();
  await expect(page.getByText(/Burnout estimate: 57\/100/)).toBeVisible();
});
