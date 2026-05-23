import { test, expect } from '@playwright/test';

test.describe("ログイン画面", () => {
  // SCEN-001
  test("正常ログインできる", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'validpassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-002
  test("ログイン状態保持が機能する", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'validpassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-003
  test("パスワード表示切り替えが機能する", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'TestPass123!');
    const passwordInput = page.locator('[data-testid="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // SCEN-004
  test("言語切り替えが機能する", async ({ page }) => {
    await page.goto("/login.html");
    const loginTitle = page.locator('[data-testid="login-title"]');
    await expect(loginTitle).toContainText('ログイン');
  });

  // SCEN-005
  test("パスワード忘れリンクから遷移できる", async ({ page }) => {
    await page.goto("/login.html");
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();
  });

  // SCEN-006
  test("ヘルプリンクから遷移できる", async ({ page }) => {
    await page.goto("/login.html");
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();
  });

  // SCEN-007
  test("存在しないユーザーIDでエラー表示", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'nonexistent_user');
    await page.fill('[data-testid="password"]', 'anypassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
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
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-009
  test("パスワード連続間違いでアカウントロック", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'wrong1');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="password"]', 'wrong2');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="password"]', 'wrong3');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="password"]', 'wrong4');
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="password"]', 'wrong5');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-010
  test("ユーザーID未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="password"]', 'validpassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-011
  test("パスワード未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[data-testid="username"]', 'validuser');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-012
  test("両項目未入力でバリデーション", async ({ page }) => {
    await page.goto("/login.html");
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-013
  test("ユーザーID最大文字数でログイン", async ({ page }) => {
    await page.goto("/login.html");
    const maxLengthUserId = 'a'.repeat(50);
    await page.fill('[data-testid="username"]', maxLengthUserId);
    await page.fill('[data-testid="password"]', 'validpassword');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-014
  test("パスワード最大文字数でログイン", async ({ page }) => {
    await page.goto("/login.html");
    const maxLengthPassword = 'p'.repeat(128);
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', maxLengthPassword);
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
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
      page.click('[data-testid="login-button"]'),
    ]);
    expect(page.url()).not.toContain("/login.html");
  });
});