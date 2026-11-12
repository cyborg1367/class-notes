import { defineConfig, devices } from '@playwright/test';
const port = Number(process.env.E2E_PORT || 4174);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid E2E_PORT');
const executablePath = process.env.E2E_CHROMIUM_EXECUTABLE;
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, forbidOnly: Boolean(process.env.CI), retries: 0,
  workers: 2, timeout: 60_000, expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]], outputDir: 'test-results/browser',
  use: { baseURL: `http://127.0.0.1:${port}`, locale: 'fa-IR', timezoneId: 'Asia/Tehran',
    reducedMotion: 'reduce', serviceWorkers: 'block', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions: { executablePath } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions: { executablePath } } },
    { name: 'narrow-chromium', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 740 }, launchOptions: { executablePath } } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: 'npm run build && node tests/browser/server.mjs',
    url: `http://127.0.0.1:${port}/__browser_test_health`, reuseExistingServer: false, timeout: 120_000, env: { E2E_PORT: String(port) } },
});
