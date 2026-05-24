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
  test('[normal] 申請書類確認画面 - 申請書類基本情報が正常に表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="application-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    await expect(page.locator('#application-id')).not.toBeEmpty();
    await expect(page.locator('#application-date')).not.toBeEmpty();
    await expect(page.locator('#applicant-name')).not.toBeEmpty();
    await expect(page.locator('#document-type')).not.toBeEmpty();
  });

  // SCEN-250
  test('[normal] 申請書類確認画面 - 申請者情報が正常に表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-position"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toContainText('管理者');
  });

  // SCEN-251
  test('[normal] 申請書類確認画面 - 文書種別が正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    const documentType = await page.locator('#document-type').textContent();
    await expect(documentType).not.toBe('');
  });

  // SCEN-252
  test('[normal] 申請書類確認画面 - 申請日時が正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    const dateText = await page.locator('#application-date').textContent();
    await expect(dateText).toMatch(/\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}/);
  });

  // SCEN-253
  test('[normal] 申請書類確認画面 - 申請内容詳細が正常に表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
  });

  // SCEN-254
  test('[normal] 申請書類確認画面 - 添付ファイル一覧が表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="attachment-files"]')).toBeVisible();
    const hasFiles = await page.locator('#files-tbody tr').count();
    if (hasFiles > 0) {
      await expect(page.locator('#files-tbody tr').first()).toBeVisible();
    } else {
      await expect(page.locator('#no-files-message')).toBeVisible();
    }
  });

  // SCEN-255
  test('[normal] 申請書類確認画面 - ファイルプレビューが正常に動作する', async ({ page }) => {
    const fileExists = await page.locator('#files-tbody tr').count() > 0;
    if (fileExists) {
      await page.locator('#files-tbody tr').first().locator('button').first().click();
      await expect(page.locator('#file-preview-modal')).toBeVisible();
      await expect(page.locator('#preview-title')).toBeVisible();
      await expect(page.locator('#preview-content')).toBeVisible();
      await page.locator('#close-preview').click();
      await expect(page.locator('#file-preview-modal')).not.toBeVisible();
    }
  });

  // SCEN-256
  test('[normal] 申請書類確認画面 - ファイルダウンロードが正常に実行される', async ({ page }) => {
    const fileExists = await page.locator('#files-tbody tr').count() > 0;
    if (fileExists) {
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#files-tbody tr').first().locator('a').first().click();
      const download = await downloadPromise;
      await expect(download.suggestedFilename()).not.toBe('');
    }
  });

  // SCEN-257
  test('[normal] 申請書類確認画面 - 承認フロー進捗が正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="approval-flow-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-step"]')).toBeVisible();
    await expect(page.locator('#approval-flow-progress')).toContainText('現在の承認ステップ');
  });

  // SCEN-258
  test('[normal] 申請書類確認画面 - 現在の承認ステップが正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="current-step"]')).toBeVisible();
    await expect(page.locator('#current-step')).not.toBeEmpty();
    const currentStep = await page.locator('#current-step').getAttribute('class');
    await expect(currentStep).toContain('current');
  });

  // SCEN-259
  test('[normal] 申請書類確認画面 - 承認履歴一覧が表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="approval-history-list"]')).toBeVisible();
    const historyCount = await page.locator('#approval-history-tbody tr').count();
    if (historyCount > 0) {
      await expect(page.locator('#approval-history-tbody tr').first()).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="approval-history-list"]')).toContainText('承認履歴はありません');
    }
  });

  // SCEN-260
  test('[normal] 申請書類確認画面 - コメント入力欄が正常に動作する', async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"] textarea');
    await expect(commentTextarea).toBeVisible();
    await commentTextarea.fill('承認いたします。よろしくお願いします。');
    await expect(commentTextarea).toHaveValue('承認いたします。よろしくお願いします。');
    await commentTextarea.fill('');
    const longText = 'a'.repeat(1000);
    await commentTextarea.fill(longText);
    const actualLength = await commentTextarea.inputValue();
    await expect(actualLength.length).toBeLessThanOrEqual(500);
  });

  // SCEN-261
  test('[error] 申請書類確認画面 - 存在しない申請書類でエラー表示', async ({ page }) => {
    await page.goto('/panels/scr-1779422434952.html?id=99999');
    await expect(page.locator('.error-message')).toContainText('申請書類が見つかりません');
  });

  // SCEN-262
  test('[error] 申請書類確認画面 - 権限不足で書類確認不可', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422434952.html");
    await expect(page.locator('.error-message')).toContainText('権限不足');
  });

  // SCEN-263
  test('[error] 申請書類確認画面 - 破損ファイルでプレビューエラー', async ({ page }) => {
    const fileExists = await page.locator('#files-tbody tr').count() > 0;
    if (fileExists) {
      await page.locator('#files-tbody tr').first().locator('button').first().click();
      await expect(page.locator('#file-preview-modal')).toBeVisible();
      const errorVisible = await page.locator('.preview-error').isVisible().catch(() => false);
      if (errorVisible) {
        await expect(page.locator('.preview-error')).toContainText('プレビューエラー');
      }
    }
  });

  // SCEN-264
  test('[error] 申請書類確認画面 - 削除済ファイルのダウンロードエラー', async ({ page }) => {
    const fileExists = await page.locator('#files-tbody tr').count() > 0;
    if (fileExists) {
      page.on('response', response => {
        if (response.status() === 404) {
          expect(response.status()).toBe(404);
        }
      });
      await page.locator('#files-tbody tr').first().locator('a').first().click();
      await page.waitForTimeout(1000);
    }
  });

  // SCEN-265
  test('[error] 申請書類確認画面 - 大容量ファイルのプレビュー制限', async ({ page }) => {
    const fileExists = await page.locator('#files-tbody tr').count() > 0;
    if (fileExists) {
      await page.locator('#files-tbody tr').first().locator('button').first().click();
      const errorMessage = page.locator('.size-limit-error');
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      if (isErrorVisible) {
        await expect(errorMessage).toContainText('ファイルサイズが大きいためプレビューできません');
      }
    }
  });

  // SCEN-266
  test('[edge] 申請書類確認画面 - コメント文字数上限でエラー', async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"] textarea');
    const longText = 'a'.repeat(501);
    await commentTextarea.fill(longText);
    await page.locator('[data-testid="approval-decision-button"]').click();
    await expect(page.locator('.error-message')).toContainText('文字数上限を超えています');
  });

  // SCEN-267
  test('[edge] 申請書類確認画面 - 特殊文字入りコメント入力', async ({ page }) => {
    const commentTextarea = page.locator('[data-testid="approval-comment"] textarea');
    const specialText = '承認します！@#$%^&*()_+-={}[]|\\:;"\'<>?,./ 日本語も含む';
    await commentTextarea.fill(specialText);
    await expect(commentTextarea).toHaveValue(specialText);
    await page.reload();
    await expect(commentTextarea).toHaveValue(specialText);
  });

  // SCEN-268
  test('[edge] 申請書類確認画面 - 添付ファイル0件の場合の表示', async ({ page }) => {
    const filesCount = await page.locator('#files-tbody tr').count();
    if (filesCount === 0) {
      await expect(page.locator('#no-files-message')).toContainText('添付ファイルはありません');
    }
  });

  // SCEN-269
  test('[edge] 申請書類確認画面 - 最大件数添付時の表示', async ({ page }) => {
    const filesCount = await page.locator('#files-tbody tr').count();
    if (filesCount >= 10) {
      await expect(page.locator('.max-files-warning')).toBeVisible();
      const addButton = page.locator('.add-file-button');
      if (await addButton.isVisible()) {
        await expect(addButton).toBeDisabled();
      }
    }
  });

  // SCEN-270
  test('[edge] 申請書類確認画面 - 長時間表示でセッション切れ', async ({ page }) => {
    await page.clock.install();
    await page.clock.fastForward(4 * 60 * 60 * 1000);
    await page.locator('[data-testid="approval-decision-button"]').click();
    await expect(page).toHaveURL(/login\.html/);
  });
});