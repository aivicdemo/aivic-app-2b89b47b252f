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
  test('[normal] 文書種別判別処理 - 対応ファイル形式の正常アップロード', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF test content'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toBeVisible();
    await expect(page.locator('#file-info')).toContainText('test.pdf');
  });

  // SCEN-139
  test('[normal] 文書種別判別処理 - 文書種別自動判別が正常実行', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書 補助金申請 科研費'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('補助金申請書');
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('%');
  });

  // SCEN-140
  test('[normal] 文書種別判別処理 - 判別精度スコア正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('テスト申請書類'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
    const scoreText = await page.locator('[data-testid="confidence-score"]').textContent();
    const scoreMatch = scoreText?.match(/(\d+)%/);
    expect(scoreMatch).toBeTruthy();
    const score = parseInt(scoreMatch![1]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  // SCEN-141
  test('[normal] 文書種別判別処理 - 文書種別手動選択で上書き', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await page.selectOption('[data-testid="manual-type-select"]', '休暇申請書');
    await page.click('[data-testid="confirm-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('休暇申請書');
  });

  // SCEN-142
  test('[normal] 文書種別判別処理 - 文書プレビュー正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'preview-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('プレビューテスト文書'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="detected-type"]')).toBeVisible();
  });

  // SCEN-143
  test('[normal] 文書種別判別処理 - OCR解析結果正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCR解析テスト文書 申請書類'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="ocr-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="keywords-list"]')).toBeVisible();
  });

  // SCEN-144
  test('[normal] 文書種別判別処理 - 承認フロー自動設定正常動作', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('契約書 補助金申請'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
    await expect(page.locator('[data-testid="approval-flow"]')).toContainText('承認者');
  });

  // SCEN-145
  test('[normal] 文書種別判別処理 - 判別結果確定で次画面遷移', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'confirm-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('確定テスト文書'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await page.click('[data-testid="confirm-button"]');
    
    await expect(page).toHaveURL(/panels\/scr-/);
  });

  // SCEN-146
  test('[normal] 文書種別判別処理 - 再判別実行で結果更新', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'reanalyze-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('再判別テスト文書'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    const originalType = await page.locator('[data-testid="detected-type"]').textContent();
    await page.click('[data-testid="reanalyze-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toBeVisible();
  });

  // SCEN-147
  test('[normal] 文書種別判別処理 - 処理ログ正常表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'log-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ログテスト文書'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="processing-log"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-log"]')).toContainText('実行日時');
  });

  // SCEN-148
  test('[error] 文書種別判別処理 - 非対応ファイル形式でエラー', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable content'),
    });
    
    await expect(page.locator('text=対応していないファイル形式')).toBeVisible();
  });

  // SCEN-149
  test('[error] 文書種別判別処理 - ファイルサイズ超過でエラー', async ({ page }) => {
    const largeBuffer = Buffer.alloc(105 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer,
    });
    
    await expect(page.locator('text=ファイルサイズ超過')).toBeVisible();
  });

  // SCEN-150
  test('[error] 文書種別判別処理 - 破損ファイルアップロードでエラー', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('text=ファイルが破損')).toBeVisible();
  });

  // SCEN-151
  test('[error] 文書種別判別処理 - 文書種別判別失敗時のエラー表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unknown.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別困難な内容'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('text=文書種別判別に失敗')).toBeVisible();
  });

  // SCEN-152
  test('[error] 文書種別判別処理 - OCR解析失敗時のエラーハンドリング', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-fail.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCR読み取り不可能'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('text=OCR解析に失敗')).toBeVisible();
  });

  // SCEN-153
  test('[error] 文書種別判別処理 - ネットワークエラー時の処理継続', async ({ page }) => {
    await page.route('**/*', route => route.abort());
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'network-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ネットワークテスト'),
    });
    
    await expect(page.locator('text=ネットワークエラー')).toBeVisible();
  });

  // SCEN-154
  test('[edge] 文書種別判別処理 - ファイル未選択で確定ボタン押下', async ({ page }) => {
    await page.click('[data-testid="confirm-button"]');
    
    await expect(page.locator('text=ファイルを選択してください')).toBeVisible();
  });

  // SCEN-155
  test('[edge] 文書種別判別処理 - 最大ファイルサイズ境界値', async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(100 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer,
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toBeVisible();
    
    const oversizeBuffer = Buffer.alloc(100 * 1024 * 1024 + 1);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'oversize.pdf',
      mimeType: 'application/pdf',
      buffer: oversizeBuffer,
    });
    
    await expect(page.locator('text=ファイルサイズ超過')).toBeVisible();
  });

  // SCEN-156
  test('[edge] 文書種別判別処理 - 判別精度スコア0%の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'zero-confidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別不可能な低品質内容'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('0%');
    await expect(page.locator('text=文書種別を判別できませんでした')).toBeVisible();
  });

  // SCEN-157
  test('[edge] 文書種別判別処理 - 判別精度スコア100%の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'perfect-match.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('補助金申請書 科研費申請 文部科学省'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="confidence-score"]')).toContainText('100%');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('補助金申請書');
  });

  // SCEN-158
  test('[edge] 文書種別判別処理 - OCR解析結果0件の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'blank.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(''),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('不明');
    await expect(page.locator('text=文書内容を読み取れませんでした')).toBeVisible();
  });

  // SCEN-159
  test('[edge] 文書種別判別処理 - キーワード抽出結果0件の場合', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'no-keywords.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般的な文章でキーワードなし'),
    });
    await page.click('[data-testid="file-select-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('未分類');
    await expect(page.locator('[data-testid="keywords-list"]')).toBeEmpty();
  });
});