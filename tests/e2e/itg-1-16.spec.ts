import { test, expect } from '@playwright/test';

test.describe("承認判断入力画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422452973.html");
  });

  // SCEN-271
  test("承認選択で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', '承認理由を記載');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  // SCEN-272
  test("差戻し選択で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="reject-radio"]');
    await page.fill('[data-testid="approval-comment"]', '差戻し理由を記載');
    await page.click('[data-testid="submit-decision"]');
    
    await page.click('button:text("OK")');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  // SCEN-273
  test("却下選択で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="deny-radio"]');
    await page.fill('[data-testid="approval-comment"]', '却下理由を記載');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  // SCEN-274
  test("条件付き承認で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.check('[data-testid="conditional-checkbox"]');
    await page.fill('[data-testid="approval-comment"]', '承認条件を記載');
    await page.click('[data-testid="submit-decision"]');
    
    await page.click('button:text("OK")');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  // SCEN-275
  test("承認コメント入力で正常送信", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', '承認コメントを入力');
    await page.click('button:text("送信")');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  // SCEN-276
  test("添付ファイルプレビュー表示", async ({ page }) => {
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('#file-preview-modal')).toBeVisible();
    await expect(page.locator('#preview-content')).toBeVisible();
    await page.click('#close-preview');
    await expect(page.locator('#file-preview-modal')).toBeHidden();
  });

  // SCEN-277
  test("承認履歴が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history"]')).toContainText('📜 承認履歴');
  });

  // SCEN-278
  test("判断未選択で送信エラー", async ({ page }) => {
    await page.fill('[data-testid="approval-comment"]', '何らかのコメント');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-279
  test("差戻し時コメント必須チェック", async ({ page }) => {
    await page.click('[data-testid="reject-radio"]');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-280
  test("却下時コメント必須チェック", async ({ page }) => {
    await page.click('[data-testid="deny-radio"]');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-281
  test("権限なし申請でアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'unauthorized');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422452973.html");
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-282
  test("コメント最大文字数制限", async ({ page }) => {
    const longComment = 'あ'.repeat(1001);
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', longComment);
    
    const commentValue = await page.locator('[data-testid="approval-comment"]').inputValue();
    expect(commentValue.length).toBeLessThanOrEqual(1000);
  });

  // SCEN-283
  test("コメント最小文字数制限", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', 'あ');
    await page.click('[data-testid="submit-decision"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-284
  test("添付ファイル0件表示", async ({ page }) => {
    await expect(page.locator('[data-testid="attachment-list"]')).toContainText('添付ファイルはありません');
    await expect(page.locator('[data-testid="preview-button"]')).toBeHidden();
  });

  // SCEN-285
  test("承認履歴0件表示", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history"]')).toContainText('承認履歴はありません');
  });
});