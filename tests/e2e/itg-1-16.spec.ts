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
    await page.check('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請内容を確認し、適切と判断します。');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-272
  test("差戻し選択で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="return-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請内容に不備があるため差し戻しします。');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-273
  test("却下選択で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="reject-radio"]');
    await page.fill('[data-testid="approval-comment"]', '申請要件を満たしていないため却下します。');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-274
  test("条件付き承認で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="conditional-approval-checkbox"]');
    await page.fill('[data-testid="approval-comment"]', '条件付きで承認します。指定条件を満たしてください。');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeHidden();
  });

  // SCEN-275
  test("承認コメント入力で正常送信", async ({ page }) => {
    await page.check('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', '承認します。');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeHidden();
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
    await expect(page.locator('[data-testid="approval-history-table"]')).toBeVisible();
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
  });

  // SCEN-278
  test("判断未選択で送信エラー", async ({ page }) => {
    await page.fill('[data-testid="approval-comment"]', '何らかのコメント');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('判定を選択してください');
  });

  // SCEN-279
  test("差戻し時コメント必須チェック", async ({ page }) => {
    await page.check('[data-testid="return-radio"]');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('コメントは必須です');
  });

  // SCEN-280
  test("却下時コメント必須チェック", async ({ page }) => {
    await page.check('[data-testid="reject-radio"]');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('コメントは必須です');
  });

  // SCEN-281
  test("権限なし申請でアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'unauthorized_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422452973.html");
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('アクセス権限がありません');
  });

  // SCEN-282
  test("コメント最大文字数制限", async ({ page }) => {
    const longComment = 'a'.repeat(1001);
    await page.check('[data-testid="approve-radio"]');
    await page.fill('[data-testid="approval-comment"]', longComment);
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('文字数制限を超えています');
  });

  // SCEN-283
  test("コメント最小文字数制限", async ({ page }) => {
    await page.check('[data-testid="reject-radio"]');
    await page.fill('[data-testid="approval-comment"]', 'a');
    await page.click('[data-testid="submit-decision-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('最小文字数に達していません');
  });

  // SCEN-284
  test("添付ファイル0件表示", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toContainText('添付ファイルはありません');
  });

  // SCEN-285
  test("承認履歴0件表示", async ({ page }) => {
    await expect(page.locator('#approval-history-tbody')).toContainText('承認履歴はありません');
  });
});