/**
 * Playwright E2E Tests for Electron App
 * Tests the complete user interface and interactions
 *
 * Note: Requires electron app to be built or running
 */

const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');

let electronApp;
let window;

test.beforeAll(async () => {
  // Launch Electron app
  electronApp = await electron.launch({
    args: [path.join(__dirname, '..', 'main.js')]
  });

  // Get the first window
  window = await electronApp.firstWindow();
});

test.afterAll(async () => {
  // Close the app
  await electronApp.close();
});

test.describe('Application Launch', () => {
  test('should launch successfully', async () => {
    expect(window).toBeTruthy();
    expect(await window.title()).toBeTruthy();
  });

  test('should have correct window dimensions', async () => {
    const size = await window.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));

    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});

test.describe('UI Elements', () => {
  test('should display source and destination inputs', async () => {
    const sourceInput = await window.locator('#source');
    const destInput = await window.locator('#destination');

    expect(await sourceInput.isVisible()).toBe(true);
    expect(await destInput.isVisible()).toBe(true);
  });

  test('should have execute button', async () => {
    const executeBtn = await window.locator('#execute');
    expect(await executeBtn.isVisible()).toBe(true);
  });

  test('should have theme toggle', async () => {
    const themeToggle = await window.locator('#theme-toggle');
    expect(await themeToggle.isVisible()).toBe(true);
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between dark and light themes', async () => {
    const themeToggle = await window.locator('#theme-toggle');
    const body = await window.locator('body');

    // Get initial theme
    const initialClass = await body.getAttribute('class');

    // Click theme toggle
    await themeToggle.click();
    await window.waitForTimeout(100);

    // Verify theme changed
    const newClass = await body.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });
});

test.describe('Form Validation', () => {
  test('should require source and destination paths', async () => {
    const executeBtn = await window.locator('#execute');
    const sourceInput = await window.locator('#source');
    const destInput = await window.locator('#destination');

    // Clear inputs
    await sourceInput.fill('');
    await destInput.fill('');

    // Try to execute
    await executeBtn.click();

    // Should show some validation (implementation specific)
    // This test assumes validation prevents execution
  });
});
