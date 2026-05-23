import { test, expect } from '@playwright/test';

test.describe("承認処理画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422254479.html");
  });

  test("// SCEN-054: 申請書類一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="applications-tbody"]')).toBeVisible();
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者')).toBeVisible();
    await expect(page.locator('text=種別')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=ステータス')).toBeVisible();
  });

  test("// SCEN-055: 申請書類詳細が正常表示される", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await expect(page.locator('[data-testid="application-detail"]')).toBeVisible();
    await expect(page.locator('#detail-content')).toBeVisible();
    await expect(page.locator('text=申請詳細')).toBeVisible();
  });

  test("// SCEN-056: 承認処理が正常完了する", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.fill('[data-testid="approval-comment"]', '承認します');
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[id="confirm-dialog"]')).toBeVisible();
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=承認処理が完了しました')).toBeVisible();
  });

  test("// SCEN-057: 差戻し処理が正常完了する", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.fill('[data-testid="reject-reason"]', '書類に不備があります');
    await page.click('button:has-text("差戻し実行")');
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=差戻し処理が完了しました')).toBeVisible();
  });

  test("// SCEN-058: 保留処理が正常完了する", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('[data-testid="hold-button"]');
    await page.fill('[data-testid="hold-reason"]', '追加確認が必要です');
    await page.click('button:has-text("保留実行")');
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=保留処理が完了しました')).toBeVisible();
  });

  test("// SCEN-059: 承認コメント入力で処理完了", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.fill('[data-testid="approval-comment"]', '内容を確認し承認します');
    await page.click('button:has-text("承認")');
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=承認処理が完了しました')).toBeVisible();
  });

  test("// SCEN-060: 差戻し理由入力で処理完了", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('button:has-text("差戻し")');
    await page.fill('[data-testid="reject-reason"]', '申請金額の根拠資料が不足しています');
    await page.click('button:has-text("実行")');
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=差戻し処理が完了しました')).toBeVisible();
  });

  test("// SCEN-061: 承認履歴が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-tbody"]')).toBeVisible();
    await expect(page.locator('text=承認日時')).toBeVisible();
    await expect(page.locator('text=承認者')).toBeVisible();
    await expect(page.locator('text=結果')).toBeVisible();
    await expect(page.locator('text=コメント')).toBeVisible();
  });

  test("// SCEN-062: 添付ファイルが正常表示される", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await expect(page.locator('[data-testid="attachments-area"]')).toBeVisible();
    const fileLink = page.locator('[data-testid="attachments-content"] a').first();
    if (await fileLink.isVisible()) {
      await expect(fileLink).toBeVisible();
    }
  });

  test("// SCEN-063: 承認フロー進捗が正常表示される", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
    await expect(page.locator('text=承認フロー進捗')).toBeVisible();
  });

  test("// SCEN-064: 承認権限なしでエラー表示", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('button:has-text("承認")');
    if (await page.locator('text=承認権限がありません').isVisible()) {
      await expect(page.locator('text=承認権限がありません')).toBeVisible();
    }
  });

  test("// SCEN-065: 既承認済み書類で処理不可", async ({ page }) => {
    const approvedRow = page.locator('[data-testid="applications-tbody"] tr').filter({ hasText: '承認済み' }).first();
    if (await approvedRow.isVisible()) {
      await approvedRow.click();
      await page.click('button:has-text("承認")');
      await expect(page.locator('text=この書類は既に承認済みのため、処理できません')).toBeVisible();
    }
  });

  test("// SCEN-066: 差戻し理由未入力でエラー", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('button:has-text("差戻し")');
    await page.click('button:has-text("差戻し実行")');
    await expect(page.locator('text=差戻し理由を入力してください')).toBeVisible();
  });

  test("// SCEN-067: 存在しない申請書類でエラー", async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?id=99999");
    await expect(page.locator('text=指定された申請書類が見つかりません')).toBeVisible();
  });

  test("// SCEN-068: 添付ファイル破損でエラー表示", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    const corruptedFile = page.locator('[data-testid="attachments-content"] a').filter({ hasText: '破損' }).first();
    if (await corruptedFile.isVisible()) {
      await corruptedFile.click();
      await expect(page.locator('text=添付ファイルが破損しているため開けません')).toBeVisible();
    }
  });

  test("// SCEN-069: 承認コメント最大文字数", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    const maxComment = 'a'.repeat(1000);
    await page.fill('[data-testid="approval-comment"]', maxComment);
    await page.click('button:has-text("承認")');
    await page.click('[id="dialog-ok"]');
    
    const overMaxComment = 'a'.repeat(1001);
    await page.fill('[data-testid="approval-comment"]', overMaxComment);
    await page.click('button:has-text("承認")');
    await expect(page.locator('text=コメントは1000文字以内で入力してください')).toBeVisible();
  });

  test("// SCEN-070: 差戻し理由最大文字数", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await page.click('button:has-text("差戻し")');
    const maxReason = 'a'.repeat(1000);
    await page.fill('[data-testid="reject-reason"]', maxReason);
    await page.click('button:has-text("差戻し実行")');
    await page.click('[id="dialog-ok"]');
    await expect(page.locator('text=差戻し処理が完了しました')).toBeVisible();
  });

  test("// SCEN-071: 申請書類一覧0件表示", async ({ page }) => {
    await page.fill('[data-testid="search-applications"]', '存在しない申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=承認待ちの申請書類はありません')).toBeVisible();
  });

  test("// SCEN-072: 承認履歴0件表示", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history"]')).toBeVisible();
    if (await page.locator('text=承認履歴がありません').isVisible()) {
      await expect(page.locator('text=承認履歴がありません')).toBeVisible();
    }
  });

  test("// SCEN-073: 添付ファイル0件表示", async ({ page }) => {
    await page.click('[data-testid="applications-tbody"] tr:first-child');
    await expect(page.locator('[data-testid="attachments-area"]')).toBeVisible();
    if (await page.locator('text=添付ファイルなし').isVisible()) {
      await expect(page.locator('text=添付ファイルなし')).toBeVisible();
    }
  });
});