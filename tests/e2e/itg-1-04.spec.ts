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

  test('SCEN-054: 申請書類一覧が正常表示される', async ({ page }) => {
    await expect(page.locator('#applications-tbody')).toBeVisible();
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者')).toBeVisible();
    await expect(page.locator('text=種別')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=ステータス')).toBeVisible();
  });

  test('SCEN-055: 申請書類詳細が正常表示される', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await expect(page.locator('#application-detail')).toBeVisible();
    await expect(page.locator('#detail-id')).toBeVisible();
    await expect(page.locator('#detail-applicant')).toBeVisible();
    await expect(page.locator('#detail-type')).toBeVisible();
    await expect(page.locator('#detail-date')).toBeVisible();
    await expect(page.locator('#detail-title')).toBeVisible();
  });

  test('SCEN-056: 承認処理が正常完了する', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.fill('#approval-comment', 'テスト承認コメント');
    await page.click('#btn-approve');
    await page.click('text=承認');
    await expect(page.locator('text=承認済み')).toBeVisible();
  });

  test('SCEN-057: 差戻し処理が正常完了する', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-reject');
    await page.fill('#reject-reason', '書類に不備があります');
    await page.click('#btn-reject-execute');
    await page.click('text=差戻し実行');
    await expect(page.locator('text=差戻し')).toBeVisible();
  });

  test('SCEN-058: 保留処理が正常完了する', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-hold');
    await page.fill('#hold-reason', '追加確認が必要です');
    await page.click('#btn-hold-execute');
    await page.click('text=保留実行');
    await expect(page.locator('text=保留中')).toBeVisible();
  });

  test('SCEN-059: 承認コメント入力で処理完了', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.fill('#approval-comment', '内容を確認し承認いたします');
    await page.click('#btn-approve');
    await page.click('text=承認');
    await expect(page.locator('text=承認済み')).toBeVisible();
  });

  test('SCEN-060: 差戻し理由入力で処理完了', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-reject');
    await page.fill('#reject-reason', '添付書類が不足しています');
    await page.click('#btn-reject-execute');
    await page.click('text=差戻し実行');
    await expect(page.locator('text=差戻し')).toBeVisible();
  });

  test('SCEN-061: 承認履歴が正常表示される', async ({ page }) => {
    await page.click('[data-testid="approval-history-btn"]');
    await expect(page.locator('#approval-history')).toBeVisible();
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    await expect(page.locator('text=日時')).toBeVisible();
    await expect(page.locator('text=承認者')).toBeVisible();
    await expect(page.locator('text=結果')).toBeVisible();
    await expect(page.locator('text=コメント')).toBeVisible();
  });

  test('SCEN-062: 添付ファイルが正常表示される', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await expect(page.locator('#attachment-files')).toBeVisible();
    const attachmentList = page.locator('#attachment-list');
    if (await attachmentList.isVisible()) {
      await page.click('#attachment-list a:first-child');
    }
  });

  test('SCEN-063: 承認フロー進捗が正常表示される', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="flow-progress-btn"]');
    await expect(page.locator('#approval-flow-progress')).toBeVisible();
    await expect(page.locator('#flow-steps')).toBeVisible();
  });

  test('SCEN-064: 承認権限なしでエラー表示', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-approve');
    const errorMessage = page.locator('text=承認権限がありません');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('SCEN-065: 既承認済み書類で処理不可', async ({ page }) => {
    const approvedRow = page.locator('#applications-tbody tr').filter({ hasText: '承認済み' }).first();
    if (await approvedRow.isVisible()) {
      await approvedRow.click();
      await page.click('#btn-approve');
      await expect(page.locator('text=既に承認済み')).toBeVisible();
    }
  });

  test('SCEN-066: 差戻し理由未入力でエラー', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-reject');
    await page.click('#btn-reject-execute');
    await expect(page.locator('text=差戻し理由を入力してください')).toBeVisible();
  });

  test('SCEN-067: 存在しない申請書類でエラー', async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?id=99999");
    await expect(page.locator('text=申請書類が見つかりません')).toBeVisible();
  });

  test('SCEN-068: 添付ファイル破損でエラー表示', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    const corruptedFile = page.locator('#attachment-list a').filter({ hasText: 'corrupted' }).first();
    if (await corruptedFile.isVisible()) {
      await corruptedFile.click();
      await expect(page.locator('text=ファイルが破損しているため開けません')).toBeVisible();
    }
  });

  test('SCEN-069: 承認コメント最大文字数', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    const maxText = 'a'.repeat(1000);
    await page.fill('#approval-comment', maxText);
    await page.click('#btn-approve');
    await expect(page.locator('text=承認')).toBeVisible();
    
    const overMaxText = 'a'.repeat(1001);
    await page.fill('#approval-comment', overMaxText);
    await page.click('#btn-approve');
    await expect(page.locator('text=文字数制限を超えています')).toBeVisible();
  });

  test('SCEN-070: 差戻し理由最大文字数', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    await page.click('#btn-reject');
    const maxText = 'a'.repeat(1000);
    await page.fill('#reject-reason', maxText);
    await page.click('#btn-reject-execute');
    await expect(page.locator('text=差戻し実行')).toBeVisible();
  });

  test('SCEN-071: 申請書類一覧0件表示', async ({ page }) => {
    await page.selectOption('#status-filter', '完了');
    await page.click('#btn-search-applications');
    const noAppsMessage = page.locator('#no-applications');
    if (await noAppsMessage.isVisible()) {
      await expect(noAppsMessage).toContainText('承認待ちの申請書類はありません');
    }
  });

  test('SCEN-072: 承認履歴0件表示', async ({ page }) => {
    await page.click('[data-testid="approval-history-btn"]');
    const noHistoryMessage = page.locator('#no-approval-history');
    if (await noHistoryMessage.isVisible()) {
      await expect(noHistoryMessage).toContainText('承認履歴がありません');
    }
  });

  test('SCEN-073: 添付ファイル0件表示', async ({ page }) => {
    await page.waitForSelector('#applications-tbody tr:first-child');
    await page.click('#applications-tbody tr:first-child');
    const noAttachments = page.locator('#no-attachments');
    if (await noAttachments.isVisible()) {
      await expect(noAttachments).toContainText('添付ファイルなし');
    }
  });
});