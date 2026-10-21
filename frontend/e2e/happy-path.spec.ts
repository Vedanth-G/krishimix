import { test, expect } from '@playwright/test';

test.describe('KrishiMix Smallholder Farmer Happy Path E2E', () => {
  test('User completes 5-step wizard and receives verified intercrop layout & evidence', async ({ page }) => {
    // 1. Visit application
    await page.goto('/');
    await expect(page).toHaveTitle(/KrishiMix/);
    await expect(page.locator('text=Step 1 of 5')).toBeVisible();

    // 2. Step 1: Location & Season
    await page.click('button:has-text("Kharif (Monsoon)")');
    await page.click('button:has-text("Continue")');

    // 3. Step 2: Land Dimensions (1 Acre, North-South orientation)
    await expect(page.locator('text=Step 2 of 5')).toBeVisible();
    await page.click('button:has-text("1 Acre")');
    await page.click('button:has-text("Continue")');

    // 4. Step 3: Soil & Irrigation
    await expect(page.locator('text=Step 3 of 5')).toBeVisible();
    await page.click('button:has-text("Red Sandy Loam")');
    await page.click('button:has-text("Continue")');

    // 5. Step 4: Crops & Varieties (Pick Maize + Pigeonpea)
    await expect(page.locator('text=Step 4 of 5')).toBeVisible();
    await page.click('button:has-text("Maize")');
    await page.click('button:has-text("Pigeonpea")');
    await page.click('button:has-text("2:1 Ratio")');

    // 6. Submit Evaluation
    const evaluateBtn = page.locator('button:has-text("Evaluate Intercropping Plan")');
    await expect(evaluateBtn).toBeVisible();
    await evaluateBtn.click();

    // 7. Step 5: Results Screen
    await expect(page.locator('text=Step 5 of 5')).toBeVisible();
    await expect(page.locator('text=Verdict:')).toBeVisible();

    // Evidence Badge check (Never present prediction as observation)
    const badge = page.locator('text=OBSERVED TRIAL').or(page.locator('text=MODEL-PREDICTED'));
    await expect(badge).toBeVisible();

    // SVG Layout Map check
    const svgMap = page.locator('svg.krishimix-layout-svg');
    await expect(svgMap).toBeVisible();

    // Dimension Table check
    await expect(page.locator('text=Planting Dimension & Spacing Specifications')).toBeVisible();
    await expect(page.locator('text=Total Rows Planted')).toBeVisible();
  });
});
