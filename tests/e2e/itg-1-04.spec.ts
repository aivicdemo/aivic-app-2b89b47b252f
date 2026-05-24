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
  test("申請書類一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '申請ID' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '申請者' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '申請種別' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '申請日時' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'ステータス' })).toBeVisible();
  });

  // SCEN-055
  test("申請書類詳細が正常表示される", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await expect(page.locator('[data-testid="application-detail"]')).toBeVisible();
    await expect(page.locator('#detail-id')).toContainText('APP-001');
    await expect(page.locator('#detail-applicant')).toContainText('田中太郎');
    await expect(page.locator('#detail-type')).toContainText('補助金申請書');
    await expect(page.locator('#detail-date')).toContainText('2024-01-15');
  });

  // SCEN-056
  test("承認処理が正常完了する", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.fill('[data-testid="approval-comment"]', '申請内容を確認し、承認いたします。');
    await page.click('[data-testid="approve-button"]');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('承認済み');
  });

  // SCEN-057
  test("差戻し処理が正常完了する", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.fill('[data-testid="reject-reason"]', '申請書類の記載内容に不備があります。修正して再提出してください。');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('差戻し');
  });

  // SCEN-058
  test("保留処理が正常完了する", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="hold-button"]');
    await page.fill('[data-testid="reject-reason"]', '追加資料の確認が必要なため一時保留とします。');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('保留中');
  });

  // SCEN-059
  test("承認コメント入力で処理完了", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.fill('[data-testid="approval-comment"]', '内容を確認いたしました。適切な申請であり承認いたします。');
    await page.click('[data-testid="approve-button"]');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('承認済み');
  });

  // SCEN-060
  test("差戻し理由入力で処理完了", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.fill('[data-testid="reject-reason"]', '申請金額の根拠資料が不足しています。');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('差戻し');
  });

  // SCEN-061
  test("承認履歴が正常表示される", async ({ page }) => {
    await page.click('[data-testid="history-btn"]');
    await expect(page.locator('[data-testid="approval-history"]')).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '承認者' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '結果' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: '日時' })).toBeVisible();
    await expect(page.locator('#history-tbody tr:first-child')).toContainText('佐藤部長');
  });

  // SCEN-062
  test("添付ファイルが正常表示される", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
    await expect(page.locator('[data-testid="attachment-files"] a')).toContainText('申請書.pdf');
    await page.click('[data-testid="attachment-files"] a:first-child');
  });

  // SCEN-063
  test("承認フロー進捗が正常表示される", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="flow-progress-btn"]');
    await expect(page.locator('[data-testid="approval-flow-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-flow-progress"] .current')).toBeVisible();
    await expect(page.locator('[data-testid="approval-flow-progress"] .completed')).toBeVisible();
  });

  // SCEN-064
  test("承認権限なしでエラー表示", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'user');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422254479.html");
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認権限がありません');
  });

  // SCEN-065
  test("既承認済み書類で処理不可", async ({ page }) => {
    await page.click('#applications-tbody tr').filter({ hasText: '承認済み' }).first();
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この書類は既に承認済みのため、処理できません');
  });

  // SCEN-066
  test("差戻し理由未入力でエラー", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="reject-button"]');
    await page.click('#dialog-confirm');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('差戻し理由を入力してください');
  });

  // SCEN-067
  test("存在しない申請書類でエラー", async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?id=99999");
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された申請書類が見つかりません');
  });

  // SCEN-068
  test("添付ファイル破損でエラー表示", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="attachment-files"] a').filter({ hasText: '破損ファイル.pdf' });
    await expect(page.locator('[data-testid="error-message"]')).toContainText('添付ファイルが破損しているため開けません');
  });

  // SCEN-069
  test("承認コメント最大文字数", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    const maxComment = 'a'.repeat(1000);
    await page.fill('[data-testid="approval-comment"]', maxComment);
    await page.click('[data-testid="approve-button"]');
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('承認済み');
    
    const overMaxComment = 'a'.repeat(1001);
    await page.fill('[data-testid="approval-comment"]', overMaxComment);
    await page.click('[data-testid="approve-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数制限を超えています');
  });

  // SCEN-070
  test("差戻し理由最大文字数", async ({ page }) => {
    await page.click('#applications-tbody tr:first-child');
    await page.click('[data-testid="reject-button"]');
    const maxReason = 'a'.repeat(1000);
    await page.fill('[data-testid="reject-reason"]', maxReason);
    await page.click('#dialog-confirm');
    await expect(page.locator('#detail-content')).toContainText('差戻し');
  });

  // SCEN-071
  test("申請書類一覧0件表示", async ({ page }) => {
    await page.fill('[data-testid="search-input"]', '存在しない申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toContainText('承認待ちの申請書類はありません');
  });

  // SCEN-072
  test("承認履歴0件表示", async ({ page }) => {
    await page.click('#applications-tbody tr').filter({ hasText: '申請中' }).first();
    await page.click('[data-testid="history-btn"]');
    await expect(page.locator('[data-testid="approval-history"]')).toContainText('承認履歴がありません');
  });

  // SCEN-073
  test("添付ファイル0件表示", async ({ page }) => {
    await page.click('#applications-tbody tr').filter({ hasText: 'ファイルなし' }).first();
    await expect(page.locator('[data-testid="attachment-files"]')).toContainText('添付ファイルなし');
  });
});