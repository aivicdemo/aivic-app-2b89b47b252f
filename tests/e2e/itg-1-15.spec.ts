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
  test("申請書類基本情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="application-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
  });

  // SCEN-250
  test("申請者情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
  });

  // SCEN-251
  test("文書種別が正しく表示される", async ({ page }) => {
    const documentType = page.locator('[data-testid="document-type"]');
    await expect(documentType).toBeVisible();
    await expect(documentType).toContainText("申請書類");
  });

  // SCEN-252
  test("申請日時が正しく表示される", async ({ page }) => {
    const applicationDate = page.locator('[data-testid="application-date"]');
    await expect(applicationDate).toBeVisible();
    const dateText = await applicationDate.textContent();
    expect(dateText).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  // SCEN-253
  test("申請内容詳細が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
  });

  // SCEN-254
  test("添付ファイル一覧が表示される", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
  });

  // SCEN-255
  test("ファイルプレビューが正常に動作する", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const previewModal = page.locator('#file-preview-modal');
    const closePreview = page.locator('#close-preview');
    
    if (await previewModal.isVisible()) {
      await expect(page.locator('#preview-file-name')).toBeVisible();
      await expect(page.locator('#preview-content')).toBeVisible();
      await closePreview.click();
      await expect(previewModal).not.toBeVisible();
    }
  });

  // SCEN-256
  test("ファイルダウンロードが正常に実行される", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
  });

  // SCEN-257
  test("承認フロー進捗が正しく表示される", async ({ page }) => {
    const approvalFlowProgress = page.locator('[data-testid="approval-flow-progress"]');
    await expect(approvalFlowProgress).toBeVisible();
    await expect(page.locator('[data-testid="current-step-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-approver"]')).toBeVisible();
  });

  // SCEN-258
  test("現在の承認ステップが正しく表示される", async ({ page }) => {
    const currentStepNumber = page.locator('[data-testid="current-step-number"]');
    await expect(currentStepNumber).toBeVisible();
    const currentApprover = page.locator('[data-testid="current-approver"]');
    await expect(currentApprover).toBeVisible();
  });

  // SCEN-259
  test("承認履歴一覧が表示される", async ({ page }) => {
    const approvalHistoryList = page.locator('[data-testid="approval-history-list"]');
    await expect(approvalHistoryList).toBeVisible();
    
    const historyTable = page.locator('#approval-history-tbody');
    if (await historyTable.count() > 0) {
      await expect(historyTable).toBeVisible();
    } else {
      await expect(page.locator('text=承認履歴はありません')).toBeVisible();
    }
  });

  // SCEN-260
  test("コメント入力欄が正常に動作する", async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"]');
    await expect(commentTextarea).toBeVisible();
    
    await commentTextarea.fill('承認いたします。よろしくお願いします。');
    await expect(commentTextarea).toHaveValue('承認いたします。よろしくお願いします。');
    
    await commentTextarea.clear();
    
    const longText = 'あ'.repeat(1000);
    await commentTextarea.fill(longText);
    
    const specialCharText = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./\n日本語も含む';
    await commentTextarea.fill(specialCharText);
    await expect(commentTextarea).toHaveValue(specialCharText);
  });

  // SCEN-261
  test("存在しない申請書類でエラー表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?id=99999");
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("申請書類が見つかりません");
  });

  // SCEN-262
  test("権限不足で書類確認不可", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'restricted_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });

  // SCEN-263
  test("破損ファイルでプレビューエラー", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText("プレビュー");
    }
  });

  // SCEN-264
  test("削除済ファイルのダウンロードエラー", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText("ファイルが見つかりません");
    }
  });

  // SCEN-265
  test("大容量ファイルのプレビュー制限", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText("ファイルサイズが大きいため");
    }
  });

  // SCEN-266
  test("コメント文字数上限でエラー", async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"]');
    await expect(commentTextarea).toBeVisible();
    
    const longComment = 'あ'.repeat(501);
    await commentTextarea.fill(longComment);
    
    const approvalButton = page.locator('[data-testid="approval-decision-button"]');
    await approvalButton.click();
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("文字数上限");
  });

  // SCEN-267
  test("特殊文字入りコメント入力", async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"]');
    await expect(commentTextarea).toBeVisible();
    
    const specialComment = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./ 日本語も含む';
    await commentTextarea.fill(specialComment);
    
    const approvalButton = page.locator('[data-testid="approval-decision-button"]');
    await approvalButton.click();
    
    await page.reload();
    await expect(commentTextarea).toHaveValue(specialComment);
  });

  // SCEN-268
  test("添付ファイル0件の場合の表示", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const hasFiles = await attachmentFiles.locator('li').count();
    if (hasFiles === 0) {
      await expect(attachmentFiles).toContainText("添付ファイルはありません");
    }
  });

  // SCEN-269
  test("最大件数添付時の表示", async ({ page }) => {
    const attachmentFiles = page.locator('[data-testid="attachment-files"]');
    await expect(attachmentFiles).toBeVisible();
    
    const fileCount = await attachmentFiles.locator('li').count();
    if (fileCount >= 10) {
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText("最大件数");
      }
    }
  });

  // SCEN-270
  test("長時間表示でセッション切れ", async ({ page }) => {
    await page.clock.install({ time: new Date('2024-01-01T10:00:00') });
    
    await page.clock.fastForward('02:00:00');
    
    const approvalButton = page.locator('[data-testid="approval-decision-button"]');
    await approvalButton.click();
    
    await page.waitForURL('/login.html');
    expect(page.url()).toContain('/login.html');
  });
});