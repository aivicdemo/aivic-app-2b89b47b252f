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
  test('対応ファイル形式の正常アップロード', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF file content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('#file-info')).toContainText('test.pdf');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
  });

  // SCEN-139
  test('文書種別自動判別が正常実行', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('85%');
  });

  // SCEN-140
  test('判別精度スコア正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    const scoreText = await page.locator('[data-testid="confidence-score"]').textContent();
    expect(scoreText).toMatch(/\d+%/);
    const score = parseInt(scoreText!.replace('%', ''));
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  // SCEN-141
  test('文書種別手動選択で上書き', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    await page.selectOption('[data-testid="manual-type-select"]', '休暇申請書');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('休暇申請書');
  });

  // SCEN-142
  test('文書プレビュー正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'preview.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
  });

  // SCEN-143
  test('OCR解析結果正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCR test content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="ocr-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('85%');
    await expect(page.locator('[data-testid="keywords-list"]')).toBeVisible();
  });

  // SCEN-144
  test('承認フロー自動設定正常動作', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('契約書内容')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('契約承認申請');
    await expect(page.locator('[data-testid="approval-flow"]')).toContainText('部長→理事');
  });

  // SCEN-145
  test('判別結果確定で次画面遷移', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'app.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.url()).toContain('scr-');
  });

  // SCEN-146
  test('再判別実行で結果更新', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'recheck.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    const initialType = await page.locator('[data-testid="detected-type"]').textContent();
    await page.click('[data-testid="reanalyze-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).not.toBe(initialType);
  });

  // SCEN-147
  test('処理ログ正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'log.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="processing-log"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-log"]')).toContainText('判別完了');
  });

  // SCEN-148
  test('非対応ファイル形式でエラー', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('EXE content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('対応していないファイル形式');
  });

  // SCEN-149
  test('ファイルサイズ超過でエラー', async ({ page }) => {
    const largeBuffer = Buffer.alloc(150 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('ファイルサイズ超過');
  });

  // SCEN-150
  test('破損ファイルアップロードでエラー', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'corrupt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('ファイルが破損');
  });

  // SCEN-151
  test('文書種別判別失敗時のエラー表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unknown.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('unknown format')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('文書種別を判別できません');
  });

  // SCEN-152
  test('OCR解析失敗時のエラーハンドリング', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'bad-ocr.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('unreadable content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('OCR解析に失敗');
    await expect(page.locator('[data-testid="processing-log"]')).toContainText('エラー');
  });

  // SCEN-153
  test('ネットワークエラー時の処理継続', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'network.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Content')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('ネットワークエラー');
    await page.unroute('**/api/**');
    await page.click('[data-testid="reanalyze-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
  });

  // SCEN-154
  test('ファイル未選択で確定ボタン押下', async ({ page }) => {
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('.error-message')).toContainText('ファイルを選択してください');
  });

  // SCEN-155
  test('最大ファイルサイズ境界値', async ({ page }) => {
    const maxBuffer = Buffer.alloc(100 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxBuffer
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
    
    const overBuffer = Buffer.alloc(100 * 1024 * 1024 + 1);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'over-size.pdf',
      mimeType: 'application/pdf',
      buffer: overBuffer
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('.error-message')).toContainText('ファイルサイズ超過');
  });

  // SCEN-156
  test('判別精度スコア0%の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'zero-confidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('undecipherable')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('0%');
    await expect(page.locator('.error-message')).toContainText('文書種別を判別できませんでした');
    await expect(page.locator('[data-testid="manual-type-select"]')).toBeVisible();
  });

  // SCEN-157
  test('判別精度スコア100%の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'perfect.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('経費申請書 領収書 交通費')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('100%');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('経費申請書');
  });

  // SCEN-158
  test('OCR解析結果0件の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'blank.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('不明');
    await expect(page.locator('.error-message')).toContainText('文書内容を読み取れませんでした');
  });

  // SCEN-159
  test('キーワード抽出結果0件の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'no-keywords.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般的な文章')
    });
    await page.click('[data-testid="file-select-button"]');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('未分類');
    await expect(page.locator('.warning-message')).toContainText('キーワードが抽出できませんでした');
  });
});