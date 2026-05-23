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

  // SCEN-054
  test("[normal] 申請書類一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('#applications-list')).toBeVisible();
    await expect(page.locator('#applications-list').getByText('申請ID')).toBeVisible();
    await expect(page.locator('#applications-list').getByText('申請者名')).toBeVisible();
    await expect(page.locator('#applications-list').getByText('申請種別')).toBeVisible();
    await expect(page.locator('#applications-list').getByText('申請日時')).toBeVisible();
  });

  // SCEN-055
  test("[normal] 申請書類詳細が正常表示される", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('#application-detail')).toBeVisible();
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#application-content')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
  });

  // SCEN-056
  test("[normal] 承認処理が正常完了する", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.fill('#approval-comment', '承認します');
    await page.click('#btn-approve');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('承認済み');
  });

  // SCEN-057
  test("[normal] 差戻し処理が正常完了する", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.click('#btn-reject');
    await page.fill('#rejection-reason', '書類に不備があります');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('差戻し');
  });

  // SCEN-058
  test("[normal] 保留処理が正常完了する", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.click('#btn-hold');
    await page.fill('[data-testid="rejection-reason"]', '追加確認が必要です');
    await page.click('button:has-text("実行")');
    await expect(page.locator('#status-badge')).toContainText('保留中');
  });

  // SCEN-059
  test("[normal] 承認コメント入力で処理完了", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.fill('[data-testid="approval-comment"]', '内容を確認し承認いたします');
    await page.click('[data-testid="approve-button"]');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('承認済み');
  });

  // SCEN-060
  test("[normal] 差戻し理由入力で処理完了", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.fill('[data-testid="rejection-reason"]', '金額の根拠資料が不足しています');
    await page.click('button:has-text("実行")');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('差戻し');
  });

  // SCEN-061
  test("[normal] 承認履歴が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history"]')).toBeVisible();
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history"]').getByText('承認者')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history"]').getByText('結果')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history"]').getByText('日時')).toBeVisible();
  });

  // SCEN-062
  test("[normal] 添付ファイルが正常表示される", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('#attachments-section')).toBeVisible();
    await expect(page.locator('#attachments-list')).toBeVisible();
    const fileLink = page.locator('#attachments-list a:first-child');
    if (await fileLink.count() > 0) {
      await expect(fileLink).toBeVisible();
    }
  });

  // SCEN-063
  test("[normal] 承認フロー進捗が正常表示される", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-flow').getByText('✓')).toBeVisible();
  });

  // SCEN-064
  test("[error] 承認権限なしでエラー表示", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'user_no_permission');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422254479.html");
    await page.click('#applications-list tr:first-child');
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('.error-message')).toContainText('承認権限がありません');
  });

  // SCEN-065
  test("[error] 既承認済み書類で処理不可", async ({ page }) => {
    await page.click('#applications-list tr:last-child');
    await expect(page.locator('#status-badge')).toContainText('承認済み');
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('.error-message')).toContainText('この書類は既に承認済みのため、処理できません');
  });

  // SCEN-066
  test("[error] 差戻し理由未入力でエラー", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.click('button:has-text("実行")');
    await expect(page.locator('.error-message')).toContainText('差戻し理由を入力してください');
  });

  // SCEN-067
  test("[error] 存在しない申請書類でエラー", async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?id=99999");
    await expect(page.locator('.error-message')).toContainText('指定された申請書類が見つかりません');
  });

  // SCEN-068
  test("[error] 添付ファイル破損でエラー表示", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('#attachments-section')).toBeVisible();
    const corruptedFile = page.locator('#attachments-list').getByText('corrupted.pdf');
    if (await corruptedFile.count() > 0) {
      await corruptedFile.click();
      await expect(page.locator('.error-message')).toContainText('添付ファイルが破損しているため開けません');
    }
  });

  // SCEN-069
  test("[edge] 承認コメント最大文字数", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    const maxComment = 'あ'.repeat(1000);
    await page.fill('[data-testid="approval-comment"]', maxComment);
    await page.click('[data-testid="approve-button"]');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('承認済み');
    
    const overMaxComment = 'あ'.repeat(1001);
    await page.fill('[data-testid="approval-comment"]', overMaxComment);
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('.error-message')).toContainText('コメントは1000文字以内で入力してください');
  });

  // SCEN-070
  test("[edge] 差戻し理由最大文字数", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await page.click('[data-testid="reject-button"]');
    const maxReason = 'あ'.repeat(1000);
    await page.fill('[data-testid="rejection-reason"]', maxReason);
    await page.click('button:has-text("実行")');
    await page.click('#modal-confirm');
    await expect(page.locator('#status-badge')).toContainText('差戻し');
  });

  // SCEN-071
  test("[edge] 申請書類一覧0件表示", async ({ page }) => {
    await page.click('[data-testid="search-applications"]');
    await page.fill('[data-testid="search-applications"]', '存在しない申請');
    await expect(page.locator('#applications-list')).toContainText('承認待ちの申請書類はありません');
  });

  // SCEN-072
  test("[edge] 承認履歴0件表示", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('[data-testid="approval-history"]')).toContainText('承認履歴はありません');
  });

  // SCEN-073
  test("[edge] 添付ファイル0件表示", async ({ page }) => {
    await page.click('#applications-list tr:first-child');
    await expect(page.locator('#attachments-section')).toBeVisible();
    if (await page.locator('#attachments-list').textContent() === '') {
      await expect(page.locator('#attachments-section')).toContainText('添付ファイルなし');
    }
  });
});