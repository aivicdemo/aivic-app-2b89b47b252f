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
    await page.fill('[data-testid="approval-comment"]', '申請内容を確認し、承認いたします。');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeHidden();
    await expect(page.locator('text=承認済み')).toBeVisible();
  });

  // SCEN-272
  test("差戻し選択で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="reject-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請内容に不備があるため差戻しいたします。');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-273
  test("却下選択で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="deny-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請要件を満たさないため却下いたします。');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-274
  test("条件付き承認で正常に判断できる", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.click('[data-testid="conditional-approval-checkbox"]');
    await page.fill('[data-testid="approval-comment"]', '条件を満たすことを前提に承認いたします。');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-275
  test("承認コメント入力で正常送信", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請内容を確認し、承認いたします。');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-276
  test("添付ファイルプレビュー表示", async ({ page }) => {
    await page.click('[data-testid="preview-file-btn"]');
    await expect(page.locator('#file-preview-modal')).toBeVisible();
    await expect(page.locator('#preview-content')).toBeVisible();
    
    await page.click('#close-preview');
    await expect(page.locator('#file-preview-modal')).toBeHidden();
  });

  // SCEN-277
  test("承認履歴が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history-table"]')).toBeVisible();
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    
    const historyRows = page.locator('#approval-history-tbody tr');
    await expect(historyRows).toHaveCountGreaterThan(0);
  });

  // SCEN-278
  test("判断未選択で送信エラー", async ({ page }) => {
    await page.fill('[data-testid="approval-comment"]', '判断を選択せずにコメントのみ入力');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('判断');
  });

  // SCEN-279
  test("差戻し時コメント必須チェック", async ({ page }) => {
    await page.click('[data-testid="reject-radio"]');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#comment-required')).toBeVisible();
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-280
  test("却下時コメント必須チェック", async ({ page }) => {
    await page.click('[data-testid="deny-radio"]');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#comment-required')).toBeVisible();
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-281
  test("権限なし申請でアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'no_permission');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    
    await page.goto("/panels/scr-1779422452973.html");
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-282
  test("コメント最大文字数制限", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    const longComment = 'あ'.repeat(1001);
    await page.fill('[data-testid="approval-comment"]', longComment);
    
    const commentValue = await page.locator('[data-testid="approval-comment"]').inputValue();
    expect(commentValue.length).toBeLessThanOrEqual(1000);
    
    await page.click('[data-testid="submit-decision-button"]');
    const commentCount = page.locator('#comment-count');
    await expect(commentCount).toContainText('1000');
  });

  // SCEN-283
  test("コメント最小文字数制限", async ({ page }) => {
    await page.click('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', 'あ');
    await page.click('[data-testid="submit-decision-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-284
  test("添付ファイル0件表示", async ({ page }) => {
    await expect(page.locator('#no-attachments')).toBeVisible();
    await expect(page.locator('#no-attachments')).toContainText('添付ファイルはありません');
    await expect(page.locator('[data-testid="preview-file-btn"]')).toBeDisabled();
  });

  // SCEN-285
  test("承認履歴0件表示", async ({ page }) => {
    await expect(page.locator('#no-approval-history')).toBeVisible();
    await expect(page.locator('#no-approval-history')).toContainText('承認履歴はありません');
  });
});