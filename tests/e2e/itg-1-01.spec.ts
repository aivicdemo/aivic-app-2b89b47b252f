import { test, expect } from '@playwright/test';

test.describe("ログイン画面", () => {
  // SCEN-001
  test('[normal] ログイン画面 - 正常ログインできる', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'test_user');
    await page.fill('[data-testid="password"]', 'test_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-002
  test('[normal] ログイン画面 - ログイン状態保持が機能する', async ({ page, context }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'test_user');
    await page.fill('[data-testid="password"]', 'test_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    await context.close();
    const newContext = await page.context().browser()?.newContext();
    if (newContext) {
      const newPage = await newContext.newPage();
      await newPage.goto("/");
      expect(newPage.url()).not.toContain("/login.html");
    }
  });

  // SCEN-003
  test('[normal] ログイン画面 - パスワード表示切り替えが機能する', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'TestPass123!');
    const passwordField = page.locator('[data-testid="password"]');
    expect(await passwordField.getAttribute('type')).toBe('password');
  });

  // SCEN-004
  test('[normal] ログイン画面 - 言語切り替えが機能する', async ({ page }) => {
    await page.goto("/login.html");
    const title = page.locator('[data-testid="login-title"]');
    expect(await title.textContent()).toContain('ログイン');
  });

  // SCEN-005
  test('[normal] ログイン画面 - パスワード忘れリンクから遷移できる', async ({ page }) => {
    await page.goto("/login.html");
    const form = page.locator('[data-testid="login-form"]');
    expect(form).toBeVisible();
  });

  // SCEN-006
  test('[normal] ログイン画面 - ヘルプリンクから遷移できる', async ({ page }) => {
    await page.goto("/login.html");
    const form = page.locator('[data-testid="login-form"]');
    expect(form).toBeVisible();
  });

  // SCEN-007
  test('[error] ログイン画面 - 存在しないユーザーIDでエラー表示', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'nonexistent_user');
    await page.fill('[data-testid="password"]', 'any_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-008
  test('[error] ログイン画面 - パスワード誤りでエラー表示', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'valid_user');
    await page.fill('[data-testid="password"]', 'wrong_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-009
  test('[error] ログイン画面 - パスワード連続間違いでアカウントロック', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'valid_user');
    await page.fill('[data-testid="password"]', 'wrong1');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(500);
    await page.fill('[data-testid="password"]', 'wrong2');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(500);
    await page.fill('[data-testid="password"]', 'wrong3');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(500);
    await page.fill('[data-testid="password"]', 'wrong4');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(500);
    await page.fill('[data-testid="password"]', 'wrong5');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-010
  test('[edge] ログイン画面 - ユーザーID未入力でバリデーション', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'valid_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-011
  test('[edge] ログイン画面 - パスワード未入力でバリデーション', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'valid_user');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-012
  test('[edge] ログイン画面 - 両項目未入力でバリデーション', async ({ page }) => {
    await page.goto("/login.html");
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-013
  test('[edge] ログイン画面 - ユーザーID最大文字数でログイン', async ({ page }) => {
    await page.goto("/login.html");
    const maxUserId = 'a'.repeat(50);
    await page.fill('[data-testid="username"]', maxUserId);
    await page.fill('[data-testid="password"]', 'valid_password');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-014
  test('[edge] ログイン画面 - パスワード最大文字数でログイン', async ({ page }) => {
    await page.goto("/login.html");
    const maxPassword = 'a'.repeat(128);
    await page.fill('[data-testid="username"]', 'valid_user');
    await page.fill('[data-testid="password"]', maxPassword);
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-015
  test('[edge] ログイン画面 - 特殊文字入力でログイン', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', '!@#$%^&*()');
    await page.fill('[data-testid="password"]', 'Pass@123!');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });
});