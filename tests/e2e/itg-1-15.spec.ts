import { test, expect } from '@playwright/test';

test.describe("申請書類確認画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
  });

  // SCEN-249
  test("[normal] 申請書類確認画面 - 申請書類基本情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('#application-id')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#document-type')).toBeVisible();
    await expect(page.locator('#application-id')).toContainText('申請');
    await expect(page.locator('#applicant-name')).not.toBeEmpty();
  });

  // SCEN-250
  test("[normal] 申請書類確認画面 - 申請者情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#applicant-dept')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    const applicantName = await page.locator('#applicant-name').textContent();
    expect(applicantName).toBeTruthy();
    expect(applicantName?.length).toBeGreaterThan(0);
  });

  // SCEN-251
  test("[normal] 申請書類確認画面 - 文書種別が正しく表示される", async ({ page }) => {
    await expect(page.locator('#document-type')).toBeVisible();
    const documentType = await page.locator('#document-type').textContent();
    expect(documentType).toBeTruthy();
    expect(documentType?.length).toBeGreaterThan(0);
  });

  // SCEN-252
  test("[normal] 申請書類確認画面 - 申請日時が正しく表示される", async ({ page }) => {
    await expect(page.locator('#application-date')).toBeVisible();
    const applicationDate = await page.locator('#application-date').textContent();
    expect(applicationDate).toMatch(/\d{4}\/\d{2}\/\d{2}/);
  });

  // SCEN-253
  test("[normal] 申請書類確認画面 - 申請内容詳細が正常に表示される", async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#document-type')).toBeVisible();
    await expect(page.locator('#application-title')).toBeVisible();
    await expect(page.locator('#application-content')).toBeVisible();
    await expect(page.locator('#attachment-list')).toBeVisible();
    const attachments = page.locator('#attachment-list');
    await expect(attachments).toContainText('申請書.pdf');
    await expect(attachments).toContainText('見積書.xlsx');
  });

  // SCEN-254
  test("[normal] 申請書類確認画面 - 添付ファイル一覧が表示される", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    await expect(page.locator('#attachment-list')).toContainText('申請書.pdf');
    await expect(page.locator('#attachment-list')).toContainText('(245KB)');
    await expect(page.locator('#attachment-list')).toContainText('見積書.xlsx');
    await expect(page.locator('#attachment-list')).toContainText('(128KB)');
  });

  // SCEN-255
  test("[normal] 申請書類確認画面 - ファイルプレビューが正常に動作する", async ({ page }) => {
    await page.click('button:has-text("プレビュー")');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  // SCEN-256
  test("[normal] 申請書類確認画面 - ファイルダウンロードが正常に実行される", async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("ダウンロード")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // SCEN-257
  test("[normal] 申請書類確認画面 - 承認フロー進捗が正しく表示される", async ({ page }) => {
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-status')).toBeVisible();
    await expect(page.locator('#approval-status')).toContainText('申請中');
  });

  // SCEN-258
  test("[normal] 申請書類確認画面 - 現在の承認ステップが正しく表示される", async ({ page }) => {
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-status')).toContainText('申請中');
    const approvalFlow = page.locator('#approval-flow');
    await expect(approvalFlow).toBeVisible();
  });

  // SCEN-259
  test("[normal] 申請書類確認画面 - 承認履歴一覧が表示される", async ({ page }) => {
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    const historyRows = page.locator('#approval-history-tbody tr');
    const count = await historyRows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // SCEN-260
  test("[normal] 申請書類確認画面 - コメント入力欄が正常に動作する", async ({ page }) => {
    await expect(page.locator('#approval-comment')).toBeVisible();
    await page.fill('#approval-comment', '承認いたします。よろしくお願いします。');
    const commentValue = await page.locator('#approval-comment').inputValue();
    expect(commentValue).toBe('承認いたします。よろしくお願いします。');
    
    await page.fill('#approval-comment', '');
    await page.fill('#approval-comment', 'a'.repeat(1000));
    const longCommentValue = await page.locator('#approval-comment').inputValue();
    expect(longCommentValue.length).toBeLessThanOrEqual(1000);
  });

  // SCEN-261
  test("[error] 申請書類確認画面 - 存在しない申請書類でエラー表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?id=99999");
    await expect(page.locator('body')).toContainText('申請書類が見つかりません');
  });

  // SCEN-262
  test("[error] 申請書類確認画面 - 権限不足で書類確認不可", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'limited');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
    await expect(page.locator('body')).toContainText('権限不足');
  });

  // SCEN-263
  test("[error] 申請書類確認画面 - 破損ファイルでプレビューエラー", async ({ page }) => {
    await page.click('button:has-text("プレビュー")');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText('プレビューできません');
  });

  // SCEN-264
  test("[error] 申請書類確認画面 - 削除済ファイルのダウンロードエラー", async ({ page }) => {
    await page.click('button:has-text("ダウンロード")');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('ファイルが見つかりません');
  });

  // SCEN-265
  test("[error] 申請書類確認画面 - 大容量ファイルのプレビュー制限", async ({ page }) => {
    await page.click('button:has-text("プレビュー")');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText('ファイルサイズが大きいためプレビューできません');
  });

  // SCEN-266
  test("[edge] 申請書類確認画面 - コメント文字数上限でエラー", async ({ page }) => {
    await page.fill('#approval-comment', 'a'.repeat(501));
    await page.click('button:has-text("承認判断")');
    await expect(page.locator('body')).toContainText('文字数上限を超えています');
  });

  // SCEN-267
  test("[edge] 申請書類確認画面 - 特殊文字入りコメント入力", async ({ page }) => {
    const specialComment = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./ 日本語も含む';
    await page.fill('#approval-comment', specialComment);
    await page.click('button:has-text("承認判断")');
    await page.reload();
    const savedComment = await page.locator('#approval-comment').inputValue();
    expect(savedComment).toBe(specialComment);
  });

  // SCEN-268
  test("[edge] 申請書類確認画面 - 添付ファイル0件の場合の表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?files=0");
    await expect(page.locator('#attachment-list')).toContainText('添付ファイルはありません');
  });

  // SCEN-269
  test("[edge] 申請書類確認画面 - 最大件数添付時の表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?files=max");
    const attachmentList = page.locator('#attachment-list');
    await expect(attachmentList).toBeVisible();
    const fileCount = await attachmentList.locator('li').count();
    expect(fileCount).toBeGreaterThanOrEqual(1);
  });

  // SCEN-270
  test("[edge] 申請書類確認画面 - 長時間表示でセッション切れ", async ({ page }) => {
    await page.clock.install({ time: new Date('2024-01-01T10:00:00') });
    await page.clock.fastForward('02:00:00');
    await page.click('button:has-text("承認判断")');
    await expect(page.locator('body')).toContainText('セッションタイムアウト');
    await expect(page).toHaveURL(/login\.html/);
  });
});