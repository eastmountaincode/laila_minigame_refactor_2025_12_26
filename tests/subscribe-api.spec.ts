import { test, expect } from '@playwright/test';

// Run serially to avoid race conditions with Google Sheets
test.describe.configure({ mode: 'serial' });

test.describe('Subscribe API - Duplicate Prevention', () => {
  // Track emails to clean up after tests
  const emailsToCleanup: string[] = [];

  test.afterAll(async ({ request }) => {
    // Clean up all test emails from Google Sheets
    for (const email of emailsToCleanup) {
      await request.post('/api/test-cleanup', { data: { email } });
    }
  });

  test('should accept first subscription', async ({ request }) => {
    const testEmail = `test-first-${Date.now()}@example.com`;
    emailsToCleanup.push(testEmail);

    const response = await request.post('/api/subscribe', {
      data: { email: testEmail },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  test('should handle duplicate email gracefully', async ({ request }) => {
    const testEmail = `test-dup-${Date.now()}@example.com`;
    emailsToCleanup.push(testEmail);

    // First subscription
    await request.post('/api/subscribe', {
      data: { email: testEmail },
    });

    // Second subscription with same email
    const response = await request.post('/api/subscribe', {
      data: { email: testEmail },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    // Should indicate already subscribed (but still success for UX)
    expect(json.message).toBe('Already subscribed');
  });

  test('should handle case-insensitive duplicate emails', async ({ request }) => {
    const testEmail = `test-case-${Date.now()}@example.com`;
    emailsToCleanup.push(testEmail.toLowerCase());

    // First subscription with lowercase
    await request.post('/api/subscribe', {
      data: { email: testEmail.toLowerCase() },
    });

    // Second subscription with uppercase
    const response = await request.post('/api/subscribe', {
      data: { email: testEmail.toUpperCase() },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe('Already subscribed');
  });

  test('should reject invalid email format', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email: 'not-an-email' },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid email format');
  });

  test('should reject missing email', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Email is required');
  });
});
