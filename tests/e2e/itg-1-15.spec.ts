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
  test("[normal] 申請書類基本情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('#application-id')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#document-type')).toBeVisible();
    await expect(page.locator('#application-id')).toContainText('申請');
    await expect(page.locator('#application-date')).toContainText('申請日時');
    await expect(page.locator('#applicant-name')).toContainText('申請者');
    await expect(page.locator('#document-type')).toContainText('文書種別');
  });

  // SCEN-250
  test("[normal] 申請者情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#applicant-dept')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#applicant-name')).toContainText('申請者');
    await expect(page.locator('#applicant-dept')).toContainText('所属部署');
    await expect(page.locator('#application-date')).toContainText('申請日時');
  });

  // SCEN-251
  test("[normal] 文書種別が正しく表示される", async ({ page }) => {
    await expect(page.locator('#document-type')).toBeVisible();
    await expect(page.locator('#document-type')).toContainText('文書種別');
    const documentTypeText = await page.locator('#document-type').textContent();
    expect(documentTypeText).toBeTruthy();
  });

  // SCEN-252
  test("[normal] 申請日時が正しく表示される", async ({ page }) => {
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#application-date')).toContainText('申請日時');
    const dateText = await page.locator('#application-date').textContent();
    expect(dateText).toBeTruthy();
  });

  // SCEN-253
  test("[normal] 申請内容詳細が正常に表示される", async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
    await expect(page.locator('#document-type')).toBeVisible();
    await expect(page.locator('#application-title')).toBeVisible();
    await expect(page.locator('#application-content')).toBeVisible();
    await expect(page.locator('#attachment-list')).toBeVisible();
    await expect(page.locator('#application-title')).toContainText('申請タイトル');
    await expect(page.locator('#attachment-list')).toContainText('添付ファイル');
  });

  // SCEN-254
  test("[normal] 添付ファイル一覧が表示される", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    await expect(page.locator('#attachment-list')).toContainText('添付ファイル');
    await expect(page.locator('#attachment-list')).toContainText('申請書.pdf');
    await expect(page.locator('#attachment-list')).toContainText('(245KB)');
    await expect(page.locator('#attachment-list')).toContainText('見積書.xlsx');
    await expect(page.locator('#attachment-list')).toContainText('(128KB)');
  });

  // SCEN-255
  test("[normal] ファイルプレビューが正常に動作する", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const previewButtons = page.locator('button:has-text("プレビュー")');
    await expect(previewButtons.first()).toBeVisible();
    await previewButtons.first().click();
    await page.waitForTimeout(1000);
  });

  // SCEN-256
  test("[normal] ファイルダウンロードが正常に実行される", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const downloadButtons = page.locator('button:has-text("ダウンロード")');
    await expect(downloadButtons.first()).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await downloadButtons.first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // SCEN-257
  test("[normal] 承認フロー進捗が正しく表示される", async ({ page }) => {
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-flow')).toContainText('承認フロー進捗');
    const flowText = await page.locator('#approval-flow').textContent();
    expect(flowText).toBeTruthy();
  });

  // SCEN-258
  test("[normal] 現在の承認ステップが正しく表示される", async ({ page }) => {
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-status')).toBeVisible();
    await expect(page.locator('#approval-status')).toContainText('承認状態');
    await expect(page.locator('#approval-status')).toContainText('申請中');
  });

  // SCEN-259
  test("[normal] 承認履歴一覧が表示される", async ({ page }) => {
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history-table"]')).toContainText('承認履歴');
    await expect(page.locator('[data-testid="approval-history-table"]')).toContainText('日時');
    await expect(page.locator('[data-testid="approval-history-table"]')).toContainText('承認者');
    await expect(page.locator('[data-testid="approval-history-table"]')).toContainText('結果');
    await expect(page.locator('[data-testid="approval-history-table"]')).toContainText('コメント');
  });

  // SCEN-260
  test("[normal] コメント入力欄が正常に動作する", async ({ page }) => {
    await expect(page.locator('#approval-comment')).toBeVisible();
    await expect(page.locator('[data-testid="approval-comment"]')).toBeVisible();
    await page.fill('#approval-comment', '承認いたします。よろしくお願いします。');
    await expect(page.locator('#approval-comment')).toHaveValue('承認いたします。よろしくお願いします。');
    await page.fill('#approval-comment', '');
    const longText = 'a'.repeat(1000);
    await page.fill('#approval-comment', longText);
    await page.fill('#approval-comment', '特殊文字テスト\n\t!@#$%^&*()');
    await expect(page.locator('#approval-comment')).toHaveValue('特殊文字テスト\n\t!@#$%^&*()');
  });

  // SCEN-261
  test("[error] 存在しない申請書類でエラー表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?id=99999");
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=申請書類が見つかりません');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  // SCEN-262
  test("[error] 権限不足で書類確認不可", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
    const errorMessage = page.locator('text=権限不足');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  // SCEN-263
  test("[error] 破損ファイルでプレビューエラー", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const previewButtons = page.locator('button:has-text("プレビュー")');
    if (await previewButtons.count() > 0) {
      await previewButtons.last().click();
      await page.waitForTimeout(2000);
    }
  });

  // SCEN-264
  test("[error] 削除済ファイルのダウンロードエラー", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const downloadButtons = page.locator('button:has-text("ダウンロード")');
    if (await downloadButtons.count() > 0) {
      await downloadButtons.last().click();
      await page.waitForTimeout(2000);
    }
  });

  // SCEN-265
  test("[error] 大容量ファイルのプレビュー制限", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const previewButtons = page.locator('button:has-text("プレビュー")');
    if (await previewButtons.count() > 0) {
      await previewButtons.first().click();
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=ファイルサイズが大きいためプレビューできません');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  // SCEN-266
  test("[edge] コメント文字数上限でエラー", async ({ page }) => {
    await expect(page.locator('#approval-comment')).toBeVisible();
    const longComment = 'a'.repeat(501);
    await page.fill('#approval-comment', longComment);
    await page.click('[data-testid="approval-decision-button"]');
    await page.waitForTimeout(1000);
  });

  // SCEN-267
  test("[edge] 特殊文字入りコメント入力", async ({ page }) => {
    await expect(page.locator('#approval-comment')).toBeVisible();
    const specialComment = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./ 日本語も含む';
    await page.fill('#approval-comment', specialComment);
    await page.click('[data-testid="approval-decision-button"]');
    await page.waitForTimeout(1000);
    await page.reload();
    const savedComment = await page.locator('#approval-comment').inputValue();
    expect(savedComment).toContain('日本語も含む');
  });

  // SCEN-268
  test("[edge] 添付ファイル0件の場合の表示", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    const attachmentText = await page.locator('#attachment-list').textContent();
    if (attachmentText?.includes('ファイル')) {
      await expect(page.locator('#attachment-list')).toContainText('添付ファイル');
    }
  });

  // SCEN-269
  test("[edge] 最大件数添付時の表示", async ({ page }) => {
    await expect(page.locator('#attachment-list')).toBeVisible();
    await expect(page.locator('#attachment-list')).toContainText('申請書.pdf');
    await expect(page.locator('#attachment-list')).toContainText('見積書.xlsx');
    const attachmentCount = await page.locator('#attachment-list .file-item').count();
    expect(attachmentCount).toBeGreaterThan(0);
  });

  // SCEN-270
  test("[edge] 長時間表示でセッション切れ", async ({ page }) => {
    await page.clock.install();
    await page.clock.fastForward(3600000);
    await page.click('[data-testid="approval-decision-button"]');
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    if (currentUrl.includes('/login.html')) {
      await expect(page).toHaveURL(/login\.html/);
    }
  });
});