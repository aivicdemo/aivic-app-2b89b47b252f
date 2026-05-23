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
  test("[normal] 承認判断入力画面 - 承認選択で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="decision-approve"]');
    await page.fill('[data-testid="approval-comment"]', '内容を確認し承認します。');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=承認処理が完了しました')).toBeVisible();
  });

  // SCEN-272
  test("[normal] 承認判断入力画面 - 差戻し選択で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="decision-return"]');
    await page.fill('[data-testid="approval-comment"]', '追加資料が必要です。再提出をお願いします。');
    await page.click('[data-testid="confirm-button"]');
    await page.click('text=OK');
    await expect(page.locator('text=差戻し処理が完了しました')).toBeVisible();
  });

  // SCEN-273
  test("[normal] 承認判断入力画面 - 却下選択で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="decision-reject"]');
    await page.fill('[data-testid="approval-comment"]', '申請要件を満たしていないため却下します。');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=却下処理が完了しました')).toBeVisible();
  });

  // SCEN-274
  test("[normal] 承認判断入力画面 - 条件付き承認で正常に判断できる", async ({ page }) => {
    await page.check('[data-testid="conditional-approval"]');
    await page.fill('[data-testid="approval-condition"]', '予算の修正が必要です。');
    await page.fill('[data-testid="approval-comment"]', '条件を満たした上で承認します。');
    await page.click('[data-testid="confirm-button"]');
    await page.click('text=OK');
    await expect(page.locator('text=条件付き承認が完了しました')).toBeVisible();
  });

  // SCEN-275
  test("[normal] 承認判断入力画面 - 承認コメント入力で正常送信", async ({ page }) => {
    await page.check('[data-testid="decision-approve"]');
    await page.fill('[data-testid="approval-comment"]', '申請内容を確認し、適切と判断します。');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=承認コメントが送信されました')).toBeVisible();
  });

  // SCEN-276
  test("[normal] 承認判断入力画面 - 添付ファイルプレビュー表示", async ({ page }) => {
    await page.click('text=ファイルプレビュー');
    await expect(page.locator('text=プレビュー表示')).toBeVisible();
    await page.click('text=閉じる');
    await expect(page.locator('text=プレビュー表示')).toBeHidden();
  });

  // SCEN-277
  test("[normal] 承認判断入力画面 - 承認履歴が正常に表示される", async ({ page }) => {
    const historySection = page.locator('[data-testid="approval-history"]');
    await expect(historySection).toBeVisible();
    await expect(historySection.locator('text=山田主任')).toBeVisible();
    await expect(historySection.locator('text=内容確認済み。承認します。')).toBeVisible();
  });

  // SCEN-278
  test("[error] 承認判断入力画面 - 判断未選択で送信エラー", async ({ page }) => {
    await page.fill('[data-testid="approval-comment"]', '任意のコメント');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=承認判断を選択してください')).toBeVisible();
  });

  // SCEN-279
  test("[error] 承認判断入力画面 - 差戻し時コメント必須チェック", async ({ page }) => {
    await page.check('[data-testid="decision-return"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=差戻し理由を入力してください')).toBeVisible();
  });

  // SCEN-280
  test("[error] 承認判断入力画面 - 却下時コメント必須チェック", async ({ page }) => {
    await page.check('[data-testid="decision-reject"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=却下理由を入力してください')).toBeVisible();
  });

  // SCEN-281
  test("[error] 承認判断入力画面 - 権限なし申請でアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'unauthorized');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422452973.html");
    await expect(page.locator('text=アクセス権限がありません')).toBeVisible();
  });

  // SCEN-282
  test("[edge] 承認判断入力画面 - コメント最大文字数制限", async ({ page }) => {
    const longComment = 'a'.repeat(1001);
    await page.check('[data-testid="decision-approve"]');
    await page.fill('[data-testid="approval-comment"]', longComment);
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=コメントは1000文字以内で入力してください')).toBeVisible();
  });

  // SCEN-283
  test("[edge] 承認判断入力画面 - コメント最小文字数制限", async ({ page }) => {
    await page.check('[data-testid="decision-approve"]');
    await page.fill('[data-testid="approval-comment"]', 'a');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=コメントは10文字以上で入力してください')).toBeVisible();
  });

  // SCEN-284
  test("[edge] 承認判断入力画面 - 添付ファイル0件表示", async ({ page }) => {
    const attachmentSection = page.locator('text=添付ファイル').locator('..');
    await expect(attachmentSection.locator('text=添付ファイルはありません')).toBeVisible();
  });

  // SCEN-285
  test("[edge] 承認判断入力画面 - 承認履歴0件表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422452973.html?history=empty");
    const historySection = page.locator('[data-testid="approval-history"]');
    await expect(historySection.locator('text=承認履歴はありません')).toBeVisible();
  });
});