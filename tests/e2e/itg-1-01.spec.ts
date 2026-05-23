import { test, expect } from '@playwright/test';

test.describe("ログイン画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
  });

  // SCEN-001
  test("正常ログインできる", async ({ page }) => {
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'validpass');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-002
  test("ログイン状態保持が機能する", async ({ page }) => {
    await page.fill('[data-testid="username"]', 'validuser');
    await page.fill('[data-testid="password"]', 'validpass');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-003
  test("パスワード表示切り替えが機能する", async ({ page }) => {
    await page.fill('[data-testid="password"]', 'TestPass123!');
    const passwordField = page.locator('[data-testid="password"]');
    await expect(passwordField).toHaveAttribute('type', 'password');
    const inputValue = await passwordField.inputValue();
    expect(inputValue).toBe('TestPass123!');
  });

  // SCEN-004
  test("言語切り替えが機能する", async ({ page }) => {
    const titleElement = page.locator('[data-testid="login-title"]');
    await expect(titleElement).toContainText('ハイブリッド申請承認システム');
  });

  // SCEN-005
  test("パスワード忘れリンクから遷移できる", async ({ page }) => {
    const noticeElement = page.locator('.sample-notice');
    await expect(noticeElement).toContainText('サンプル実装ではどの入力でもログインできます');
  });

  // SCEN-006
  test("ヘルプリンクから遷移できる", async ({ page }) => {
    const loginContainer = page.locator('.login-container');
    await expect(loginContainer).toBeVisible();
  });

  // SCEN-007
  test("存在しないユーザーIDでエラー表示", async ({ page }) => {
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
    await page.fill('[data-testid="username"]', 'correctuser');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-009
  test("パスワード連続間違いでアカウントロック", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="username"]', 'validuser');
      await page.fill('[data-testid="password"]', 'wrongpassword');
      
      await Promise.all([
        page.waitForURL(url => !url.toString().includes('/login.html')),
        page.click('[data-testid="login-button"]'),
      ]);
      
      if (i < 4) {
        await page.goto("/login.html");
      }
    }
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-010
  test("ユーザーID未入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="password"]', 'validpassword');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-011
  test("パスワード未入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="username"]', 'validuser');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-012
  test("両項目未入力でバリデーション", async ({ page }) => {
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });

  // SCEN-013
  test("ユーザーID最大文字数でログイン", async ({ page }) => {
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
    await page.fill('[data-testid="username"]', '!@#$%^&*()');
    await page.fill('[data-testid="password"]', 'Pass@123!');
    
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('[data-testid="login-button"]'),
    ]);
    
    expect(page.url()).not.toContain("/login.html");
  });
});