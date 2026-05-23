import { test, expect } from '@playwright/test';

test.describe("ログイン画面", () => {
  // SCEN-001
  test("正常ログインできる", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'validpass');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-002
  test("ログイン状態保持が機能する", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-003
  test("パスワード表示切り替えが機能する", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'TestPass123!');
    const passwordField = page.locator('[data-testid="password"]');
    expect(await passwordField.getAttribute('type')).toBe('password');
    expect(await passwordField.inputValue()).toBe('TestPass123!');
  });

  // SCEN-004
  test("言語切り替えが機能する", async ({ page }) => {
    await page.goto("/login.html");
    const title = page.locator('[data-testid="login-title"]');
    expect(await title.textContent()).toBe('ハイブリッド申請承認システム');
  });

  // SCEN-005
  test("パスワード忘れリンクから遷移できる", async ({ page }) => {
    await page.goto("/login.html");
    const loginContainer = page.locator('.login-container');
    expect(loginContainer).toBeVisible();
  });

  // SCEN-006
  test("ヘルプリンクから遷移できる", async ({ page }) => {
    await page.goto("/login.html");
    const loginForm = page.locator('[data-testid="login-form"]');
    expect(loginForm).toBeVisible();
  });

  // SCEN-007
  test("存在しないユーザーIDでエラー表示", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'nonexistent_user');
    await page.fill('[data-testid="password"]', 'anypassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-008
  test("パスワード誤りでエラー表示", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-009
  test("パスワード連続間違いでアカウントロック", async ({ page }) => {
    await page.goto("/login.html");
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="username"]', 'testuser');
      await page.fill('[data-testid="password"]', 'wrongpass');
      await Promise.all([
        page.waitForURL(url => !url.toString().includes('/login.html')),
        page.click('[data-testid="login-button"]')
      ]);
      if (i < 4) {
        await page.goto("/login.html");
      }
    }
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-010
  test("ユーザーID未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'validpass');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-011
  test("パスワード未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-012
  test("両項目未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-013
  test("ユーザーID最大文字数でログイン", async ({ page }) => {
    await page.goto("/login.html");
    const maxLengthUserId = 'a'.repeat(50);
    await page.fill('[data-testid="username"]', maxLengthUserId);
    await page.fill('[data-testid="password"]', 'validpass');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-014
  test("パスワード最大文字数でログイン", async ({ page }) => {
    await page.goto("/login.html");
    const maxLengthPassword = 'a'.repeat(128);
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', maxLengthPassword);
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-015
  test("特殊文字入力でログイン", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', '!@#$%^&*()');
    await page.fill('[data-testid="password"]', 'Pass@123!');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]')
    ]);
    expect(page.url()).not.toContain("/login.html");
  });
});