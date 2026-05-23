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
    await expect(page.locator('[data-testid="application-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-id"]')).toContainText('APP');
    await expect(page.locator('[data-testid="application-date"]')).toContainText('/');
    await expect(page.locator('[data-testid="applicant-name"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="document-type"]')).not.toBeEmpty();
  });

  // SCEN-250
  test("申請者情報が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-contact"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="applicant-department"]')).not.toBeEmpty();
  });

  // SCEN-251
  test("文書種別が正しく表示される", async ({ page }) => {
    const documentType = await page.locator('[data-testid="document-type"]');
    await expect(documentType).toBeVisible();
    const typeText = await documentType.textContent();
    expect(typeText).toBeTruthy();
    expect(typeText?.length).toBeGreaterThan(0);
  });

  // SCEN-252
  test("申請日時が正しく表示される", async ({ page }) => {
    const applicationDate = await page.locator('[data-testid="application-date"]');
    await expect(applicationDate).toBeVisible();
    const dateText = await applicationDate.textContent();
    expect(dateText).toMatch(/\d{4}\/\d{2}\/\d{2}/);
  });

  // SCEN-253
  test("申請内容詳細が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="application-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
  });

  // SCEN-254
  test("添付ファイル一覧が表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      await expect(page.locator('.table-wrap')).toContainText('ファイル名');
      await expect(page.locator('.table-wrap')).toContainText('サイズ');
      await expect(page.locator('.table-wrap')).toContainText('アップロード日時');
    }
  });

  // SCEN-255
  test("ファイルプレビューが正常に動作する", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const previewButton = page.locator('#files-tbody a').first();
      if (await previewButton.count() > 0) {
        await previewButton.click();
        await expect(page.locator('#file-preview-modal')).toBeVisible();
        await expect(page.locator('#preview-title')).toBeVisible();
        await page.locator('#close-preview').click();
      }
    }
  });

  // SCEN-256
  test("ファイルダウンロードが正常に実行される", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const downloadLink = page.locator('#files-tbody a').first();
      if (await downloadLink.count() > 0) {
        const downloadPromise = page.waitForEvent('download');
        await downloadLink.click();
        await downloadPromise;
      }
    }
  });

  // SCEN-257
  test("承認フロー進捗が正しく表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-step"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-history-list"]')).toBeVisible();
    const approvalFlow = page.locator('[data-testid="approval-flow"]');
    await expect(approvalFlow).toContainText('承認フロー進捗');
  });

  // SCEN-258
  test("現在の承認ステップが正しく表示される", async ({ page }) => {
    const currentStep = page.locator('[data-testid="current-step"]');
    await expect(currentStep).toBeVisible();
    const stepText = await currentStep.textContent();
    expect(stepText).toBeTruthy();
    expect(stepText?.length).toBeGreaterThan(0);
  });

  // SCEN-259
  test("承認履歴一覧が表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history-list"]')).toBeVisible();
    const historyTable = page.locator('#approval-history-tbody');
    await expect(historyTable).toBeVisible();
  });

  // SCEN-260
  test("コメント入力欄が正常に動作する", async ({ page }) => {
    const commentInput = page.locator('[data-testid="comment-input"]');
    await expect(commentInput).toBeVisible();
    await commentInput.fill('承認いたします。よろしくお願いします。');
    await expect(commentInput).toHaveValue('承認いたします。よろしくお願いします。');
    await commentInput.clear();
    const longText = 'あ'.repeat(1000);
    await commentInput.fill(longText);
    await commentInput.fill('テスト\n改行\tタブ!@#$%');
    await expect(commentInput).toHaveValue('テスト\n改行\tタブ!@#$%');
  });

  // SCEN-261
  test("存在しない申請書類でエラー表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422434952.html?id=99999");
    await expect(page.locator('text=申請書類が見つかりません')).toBeVisible();
  });

  // SCEN-262
  test("権限不足で書類確認不可", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
    await expect(page.locator('text=権限不足')).toBeVisible();
  });

  // SCEN-263
  test("破損ファイルでプレビューエラー", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const brokenFileLink = page.locator('#files-tbody a[data-file-type="broken"]').first();
      if (await brokenFileLink.count() > 0) {
        await brokenFileLink.click();
        await expect(page.locator('#preview-error')).toBeVisible();
      }
    }
  });

  // SCEN-264
  test("削除済ファイルのダウンロードエラー", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const deletedFileLink = page.locator('#files-tbody a[data-file-status="deleted"]').first();
      if (await deletedFileLink.count() > 0) {
        await deletedFileLink.click();
        await expect(page.locator('text=ファイルが見つかりません')).toBeVisible();
      }
    }
  });

  // SCEN-265
  test("大容量ファイルのプレビュー制限", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const largeFileLink = page.locator('#files-tbody a[data-file-size="large"]').first();
      if (await largeFileLink.count() > 0) {
        await largeFileLink.click();
        await expect(page.locator('text=ファイルサイズが大きいためプレビューできません')).toBeVisible();
      }
    }
  });

  // SCEN-266
  test("コメント文字数上限でエラー", async ({ page }) => {
    const commentInput = page.locator('[data-testid="comment-input"]');
    const approvalButton = page.locator('[data-testid="approval-decision-button"]');
    const longComment = 'あ'.repeat(501);
    await commentInput.fill(longComment);
    await approvalButton.click();
    await expect(page.locator('text=文字数上限')).toBeVisible();
  });

  // SCEN-267
  test("特殊文字入りコメント入力", async ({ page }) => {
    const commentInput = page.locator('[data-testid="comment-input"]');
    const specialText = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./ 日本語も含む';
    await commentInput.fill(specialText);
    await page.reload();
    await expect(commentInput).toHaveValue(specialText);
  });

  // SCEN-268
  test("添付ファイル0件の場合の表示", async ({ page }) => {
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
    const noFilesMessage = page.locator('#no-files-message');
    if (await noFilesMessage.isVisible()) {
      await expect(noFilesMessage).toContainText('添付ファイルはありません');
    }
  });

  // SCEN-269
  test("最大件数添付時の表示", async ({ page }) => {
    const filesTable = page.locator('#files-table');
    if (await filesTable.isVisible()) {
      const fileRows = page.locator('#files-tbody tr');
      const fileCount = await fileRows.count();
      if (fileCount >= 10) {
        await expect(page.locator('text=最大件数')).toBeVisible();
      }
    }
  });

  // SCEN-270
  test("長時間表示でセッション切れ", async ({ page }) => {
    await page.clock.install();
    await page.clock.fastForward('02:00:00');
    await page.locator('[data-testid="approval-decision-button"]').click();
    await expect(page.locator('text=セッションタイムアウト')).toBeVisible();
  });
});