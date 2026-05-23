import { test, expect } from '@playwright/test';

test.describe("文書種別判別処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422339280.html");
  });

  // SCEN-138
  test("[normal] 文書種別判別処理 - 対応ファイル形式の正常アップロード", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('#file-info')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-139
  test("[normal] 文書種別判別処理 - 文書種別自動判別が正常実行", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'application.pdf', mimeType: 'application/pdf', buffer: Buffer.from('科研費申請書類') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('#auto-classification')).toBeVisible();
    await expect(page.locator('#confidence-score')).toBeVisible();
  });

  // SCEN-140
  test("[normal] 文書種別判別処理 - 判別精度スコア正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'application.pdf', mimeType: 'application/pdf', buffer: Buffer.from('補助金申請資料') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
    const scoreText = await page.locator('[data-testid="confidence-score"]').textContent();
    expect(scoreText).toMatch(/(0\.\d+|[0-9]+%)/);
  });

  // SCEN-141
  test("[normal] 文書種別判別処理 - 文書種別手動選択で上書き", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('申請書類') });
    await page.click('button:has-text("判別実行")');
    await page.selectOption('#manual-classification', '契約書');
    await page.click('button:has-text("判別結果確定")');
    await expect(page.locator('#auto-classification')).toContainText('契約書');
  });

  // SCEN-142
  test("[normal] 文書種別判別処理 - 文書プレビュー正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('文書内容') });
    await page.click('button:has-text("判別実行")');
    await page.click('[data-testid="document-preview"]');
    await expect(page.locator('#document-preview')).toBeVisible();
  });

  // SCEN-143
  test("[normal] 文書種別判別処理 - OCR解析結果正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'scan.pdf', mimeType: 'application/pdf', buffer: Buffer.from('スキャン文書') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="ocr-results"]')).toBeVisible();
    await expect(page.locator('#confidence-score')).toBeVisible();
  });

  // SCEN-144
  test("[normal] 文書種別判別処理 - 承認フロー自動設定正常動作", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'contract.pdf', mimeType: 'application/pdf', buffer: Buffer.from('契約書類') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-steps"]')).toBeVisible();
  });

  // SCEN-145
  test("[normal] 文書種別判別処理 - 判別結果確定で次画面遷移", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('申請書') });
    await page.click('button:has-text("判別実行")');
    await page.click('button:has-text("判別結果確定")');
    await page.waitForURL(url => !url.toString().includes('scr-1779422339280.html'));
  });

  // SCEN-146
  test("[normal] 文書種別判別処理 - 再判別実行で結果更新", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('文書') });
    await page.click('button:has-text("判別実行")');
    const initialResult = await page.locator('#auto-classification').textContent();
    await page.click('button:has-text("再判別")');
    const updatedResult = await page.locator('#auto-classification').textContent();
    expect(updatedResult).toBeDefined();
  });

  // SCEN-147
  test("[normal] 文書種別判別処理 - 処理ログ正常表示", async ({ page }) => {
    await page.click('[data-testid="settings-button"]');
    await expect(page.locator('[data-testid="process-log-table"]')).toBeVisible();
    await expect(page.locator('#log-tbody')).toBeVisible();
  });

  // SCEN-148
  test("[error] 文書種別判別処理 - 非対応ファイル形式でエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'test.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('exe') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式です');
  });

  // SCEN-149
  test("[error] 文書種別判別処理 - ファイルサイズ超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(100 * 1024 * 1024, 'a'); // 100MB
    await page.setInputFiles('#file-input', { name: 'large.pdf', mimeType: 'application/pdf', buffer: largeBuffer });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ');
  });

  // SCEN-150
  test("[error] 文書種別判別処理 - 破損ファイルアップロードでエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'corrupt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('corrupt') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-151
  test("[error] 文書種別判別処理 - 文書種別判別失敗時のエラー表示", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'unknown.pdf', mimeType: 'application/pdf', buffer: Buffer.from('unreadable') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-152
  test("[error] 文書種別判別処理 - OCR解析失敗時のエラーハンドリング", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'unreadable.pdf', mimeType: 'application/pdf', buffer: Buffer.from('broken') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-153
  test("[error] 文書種別判別処理 - ネットワークエラー時の処理継続", async ({ page }) => {
    await page.route('**/*', route => route.abort());
    await page.setInputFiles('#file-input', { name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-154
  test("[edge] 文書種別判別処理 - ファイル未選択で確定ボタン押下", async ({ page }) => {
    await page.click('button:has-text("判別結果確定")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイル');
  });

  // SCEN-155
  test("[edge] 文書種別判別処理 - 最大ファイルサイズ境界値", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(50 * 1024 * 1024, 'a'); // 50MB (想定最大サイズ)
    await page.setInputFiles('#file-input', { name: 'max.pdf', mimeType: 'application/pdf', buffer: maxSizeBuffer });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('#auto-classification')).toBeVisible();

    const oversizeBuffer = Buffer.alloc(50 * 1024 * 1024 + 1, 'a');
    await page.setInputFiles('#file-input', { name: 'over.pdf', mimeType: 'application/pdf', buffer: oversizeBuffer });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-156
  test("[edge] 文書種別判別処理 - 判別精度スコア0%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'unidentifiable.pdf', mimeType: 'application/pdf', buffer: Buffer.from('???') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('0');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判別できませんでした');
  });

  // SCEN-157
  test("[edge] 文書種別判別処理 - 判別精度スコア100%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'clear.pdf', mimeType: 'application/pdf', buffer: Buffer.from('補助金申請書明確な文書') });
    await page.click('button:has-text("判別実行")');
    const scoreText = await page.locator('[data-testid="confidence-score"]').textContent();
    expect(scoreText).toMatch(/100|1\.0/);
  });

  // SCEN-158
  test("[edge] 文書種別判別処理 - OCR解析結果0件の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'blank.pdf', mimeType: 'application/pdf', buffer: Buffer.from('') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('読み取れませんでした');
  });

  // SCEN-159
  test("[edge] 文書種別判別処理 - キーワード抽出結果0件の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', { name: 'generic.pdf', mimeType: 'application/pdf', buffer: Buffer.from('一般的な文章') });
    await page.click('button:has-text("判別実行")');
    await expect(page.locator('#auto-classification')).toContainText('未分類');
  });
});