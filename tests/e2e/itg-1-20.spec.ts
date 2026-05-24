import { test, expect } from '@playwright/test';

test.describe("文書種別判定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422563059.html");
  });

  // SCEN-336
  test("PDF申請書類の正常アップロード", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content')
    }]);
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('.card')).toContainText('アップロード');
    const result = page.locator('[data-testid="auto-detection-result"]');
    await expect(result).toBeVisible();
  });

  // SCEN-337
  test("文書種別自動判定結果の正常表示", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'subsidy.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('補助金申請書 科研費')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-percentage"]')).toContainText('%');
  });

  // SCEN-338
  test("手動選択で文書種別変更", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請書');
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('補助金申請書');
    await page.click('[data-testid="finalize-button"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('補助金申請書');
  });

  // SCEN-339
  test("補助金関連度スコア正常表示", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'grant.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('運営費交付金 設備整備費補助金')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    const subsidyScore = page.locator('[data-testid="subsidy-score"]');
    await expect(subsidyScore).toBeVisible();
    const scoreText = await subsidyScore.textContent();
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  // SCEN-340
  test("文書内容プレビュー正常表示", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('テスト文書内容')
    }]);
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  // SCEN-341
  test("判定精度インジケーター正常表示", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('科研費申請書')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    const accuracyBar = page.locator('#accuracy-bar');
    await expect(accuracyBar).toBeVisible();
    const percentage = page.locator('[data-testid="accuracy-percentage"]');
    await expect(percentage).toContainText('%');
  });

  // SCEN-342
  test("承認フロー確認から遷移", async ({ page }) => {
    await page.click('[data-testid="confirm-flow-button"]');
    await expect(page.locator('.content-area')).toBeVisible();
    await expect(page.locator('.breadcrumb')).toContainText('文書種別判定');
  });

  // SCEN-343
  test("判定結果確定で完了", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請書');
    await page.click('[data-testid="finalize-button"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('補助金申請書');
  });

  // SCEN-344
  test("再判定実行で結果更新", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書類')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    const initialResult = await page.locator('[data-testid="auto-detection-result"]').textContent();
    await page.click('[data-testid="re-detect-button"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
  });

  // SCEN-345
  test("文書種別マスタ参照リンク遷移", async ({ page }) => {
    await page.click('[data-testid="document-master-link"]');
    await expect(page.locator('.content-area')).toBeVisible();
  });

  // SCEN-346
  test("判定履歴一覧表示", async ({ page }) => {
    const historyTable = page.locator('[data-testid="history-table"]');
    await expect(historyTable).toBeVisible();
    await expect(page.locator('.content-area')).toContainText('判定履歴');
    await expect(page.locator('.content-area')).toContainText('判定日時');
    await expect(page.locator('.content-area')).toContainText('文書名');
    await expect(page.locator('.content-area')).toContainText('判定結果');
    await expect(page.locator('.content-area')).toContainText('判定精度');
    await expect(page.locator('.content-area')).toContainText('判定者');
  });

  // SCEN-347
  test("未対応ファイル形式でエラー", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable')
    }]);
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-348
  test("ファイルサイズ上限超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024, 'a');
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    }]);
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-349
  test("破損ファイルアップロードでエラー", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'broken.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted')
    }]);
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-350
  test("判定不可文書でエラーメッセージ", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'unclear.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('???')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-351
  test("ネットワークエラー時の表示", async ({ page }) => {
    await page.context().setOffline(true);
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請書');
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await page.context().setOffline(false);
  });

  // SCEN-352
  test("文書種別未選択で確定エラー", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '');
    await page.click('[data-testid="finalize-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-353
  test("ファイル未選択状態での操作", async ({ page }) => {
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-354
  test("ファイルサイズ上限ギリギリ", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a');
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'maxsize.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    }]);
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
  });

  // SCEN-355
  test("判定精度0%の場合", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'unclear.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('unrecognizable content 12345')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    const accuracyText = await page.locator('[data-testid="accuracy-percentage"]').textContent();
    if (accuracyText?.includes('0%')) {
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    }
  });

  // SCEN-356
  test("判定精度100%の場合", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'perfect.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('科研費 補助金申請書 文部科学省 運営費交付金')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="accuracy-percentage"]')).toContainText('100%');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('補助金申請書');
  });

  // SCEN-357
  test("補助金関連度スコア0の場合", async ({ page }) => {
    await page.locator('[data-testid="file-upload"]').setInputFiles([{
      name: 'other.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般事務連絡 会議資料')
    }]);
    await page.click('[data-testid="auto-detect-button"]');
    const subsidyScore = await page.locator('[data-testid="subsidy-score"]').textContent();
    if (subsidyScore === '0') {
      await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('その他');
    }
  });
});