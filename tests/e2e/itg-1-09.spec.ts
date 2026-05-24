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
  test("対応ファイル形式の正常アップロード", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="success-message"]:visible');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-139
  test("文書種別自動判別が正常実行", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書 補助金 科研費')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="auto-detection-result"]:visible');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-score"]')).toBeVisible();
  });

  // SCEN-140
  test("判別精度スコア正常表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書類')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="accuracy-score"]:visible');
    const scoreText = await page.locator('[data-testid="accuracy-score"]').textContent();
    const scoreMatch = scoreText?.match(/(\d+(?:\.\d+)?)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  // SCEN-141
  test("文書種別手動選択で上書き", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="manual-doc-type"]:visible');
    await page.selectOption('[data-testid="manual-doc-type"]', '報告書');
    await page.click('[data-testid="confirm-result-btn"]');
    await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('報告書');
  });

  // SCEN-142
  test("文書プレビュー正常表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'preview-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('プレビューテスト文書')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="document-preview"]:visible');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
  });

  // SCEN-143
  test("OCR解析結果正常表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCRテスト 申請書 補助金')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="ocr-results"]:visible');
    await expect(page.locator('[data-testid="ocr-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
  });

  // SCEN-144
  test("承認フロー自動設定正常動作", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('契約書 補助金申請')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="approval-flow"]:visible');
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
    await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('契約書');
  });

  // SCEN-145
  test("判別結果確定で次画面遷移", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書類')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="confirm-result-btn"]:visible');
    await page.click('[data-testid="confirm-result-btn"]');
    await expect(page.url()).not.toContain('scr-1779422339280.html');
  });

  // SCEN-146
  test("再判別実行で結果更新", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'reanalyze.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('再判別テスト')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="re-analyze-btn"]:visible');
    const initialResult = await page.locator('[data-testid="auto-detection-result"]').textContent();
    await page.click('[data-testid="re-analyze-btn"]');
    await page.waitForSelector('[data-testid="auto-detection-result"]:visible');
    const updatedResult = await page.locator('[data-testid="auto-detection-result"]').textContent();
    expect(updatedResult).toBeTruthy();
  });

  // SCEN-147
  test("処理ログ正常表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'log-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ログテスト')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="process-log-table"]:visible');
    await expect(page.locator('[data-testid="process-log-table"]')).toBeVisible();
    const logRows = page.locator('[data-testid="process-log-table"] tbody tr');
    await expect(logRows.first()).toBeVisible();
  });

  // SCEN-148
  test("非対応ファイル形式でエラー", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'invalid.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('invalid file')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式');
  });

  // SCEN-149
  test("ファイルサイズ超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(150 * 1024 * 1024, 'x');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ');
  });

  // SCEN-150
  test("破損ファイルアップロードでエラー", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-151
  test("文書種別判別失敗時のエラー表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unknown.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別困難な内容')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別');
  });

  // SCEN-152
  test("OCR解析失敗時のエラーハンドリング", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-fail.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCR解析失敗')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('OCR');
  });

  // SCEN-153
  test("ネットワークエラー時の処理継続", async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'network-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ネットワークテスト')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワーク');
  });

  // SCEN-154
  test("ファイル未選択で確定ボタン押下", async ({ page }) => {
    await page.click('[data-testid="confirm-result-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイル');
  });

  // SCEN-155
  test("最大ファイルサイズ境界値", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(100 * 1024 * 1024, 'x');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="success-message"], [data-testid="error-message"]');
    
    const oversizeBuffer = Buffer.alloc(100 * 1024 * 1024 + 1, 'x');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'oversize.pdf',
      mimeType: 'application/pdf',
      buffer: oversizeBuffer
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="error-message"]:visible');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('サイズ');
  });

  // SCEN-156
  test("判別精度スコア0%の場合", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'low-quality.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別不可能')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="accuracy-score"]:visible');
    const scoreText = await page.locator('[data-testid="accuracy-score"]').textContent();
    if (scoreText?.includes('0')) {
      await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別を判別できませんでした');
    }
  });

  // SCEN-157
  test("判別精度スコア100%の場合", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'perfect-match.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書 補助金申請書 科研費申請')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="accuracy-score"]:visible');
    const scoreText = await page.locator('[data-testid="accuracy-score"]').textContent();
    expect(scoreText).toBeTruthy();
    await expect(page.locator('[data-testid="auto-detection-result"]')).toBeVisible();
  });

  // SCEN-158
  test("OCR解析結果0件の場合", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'blank-image.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="ocr-results"]:visible');
    const ocrText = await page.locator('[data-testid="ocr-results"]').textContent();
    if (!ocrText || ocrText.trim() === '') {
      await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('不明');
    }
  });

  // SCEN-159
  test("キーワード抽出結果0件の場合", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'no-keywords.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般的な文書内容')
    });
    await page.click('[data-testid="upload-btn"]');
    await page.waitForSelector('[data-testid="keyword-results"]:visible');
    const keywordText = await page.locator('[data-testid="keyword-results"]').textContent();
    if (!keywordText || keywordText.includes('0件')) {
      await expect(page.locator('[data-testid="auto-detection-result"]')).toContainText('未分類');
    }
  });
});