import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 20000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://127.0.0.1:4200',
    viewport: { width: 1440, height: 1100 },
    trace: 'retain-on-failure',
    launchOptions: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
      ? { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] } : {}
  },
  webServer: { command: 'npm start -- --port 4200', url: 'http://127.0.0.1:4200', reuseExistingServer: !process.env['CI'], timeout: 90000 }
});
