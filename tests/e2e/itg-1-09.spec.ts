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
  test("[normal] 対応ファイル形式の正常アップロード", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('#file-name')).toContainText('test-document.pdf');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('申請書');
    await expect(page.locator('[data-testid="accuracy-score"]')).toContainText('85');
  });

  // SCEN-139
  test("[normal] 文書種別自動判別が正常実行", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('補助金申請書 科研費申請内容')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('申請書');
    await expect(page.locator('[data-testid="accuracy-score"]')).toContainText('92');
    await expect(page.locator('[data-testid="subsidy-confidence"]')).toContainText('高');
  });

  // SCEN-140
  test("[normal] 判別精度スコア正常表示", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('年度報告書内容')
    });
    
    await page.waitForTimeout(2000);
    
    const accuracyScore = await page.locator('[data-testid="accuracy-score"]').textContent();
    expect(Number(accuracyScore)).toBeGreaterThanOrEqual(0);
    expect(Number(accuracyScore)).toBeLessThanOrEqual(100);
  });

  // SCEN-141
  test("[normal] 文書種別手動選択で上書き", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('テスト文書')
    });
    
    await page.waitForTimeout(2000);
    
    await page.selectOption('[data-testid="manual-type-select"]', '報告書');
    await page.click('[data-testid="confirm-button"]');
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('報告書');
  });

  // SCEN-142
  test("[normal] 文書プレビュー正常表示", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'preview-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('プレビューテスト文書内容')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('申請書');
  });

  // SCEN-143
  test("[normal] OCR解析結果正常表示", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCRテスト用文書 補助金申請関連')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="ocr-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-score"]')).toContainText('88');
    await expect(page.locator('[data-testid="subsidy-confidence"]')).toContainText('高');
  });

  // SCEN-144
  test("[normal] 承認フロー自動設定正常動作", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('契約書 補助金関連契約')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="approval-flow-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('契約書');
    await expect(page.locator('#approval-steps')).toContainText('承認段数');
  });

  // SCEN-145
  test("[normal] 判別結果確定で次画面遷移", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書類内容')
    });
    
    await page.waitForTimeout(2000);
    await page.click('[data-testid="confirm-button"]');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/panels\/scr-/);
  });

  // SCEN-146
  test("[normal] 再判別実行で結果更新", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'reanalyze.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('再判別テスト文書')
    });
    
    await page.waitForTimeout(2000);
    
    const initialType = await page.locator('[data-testid="detected-type"]').textContent();
    
    await page.click('[data-testid="re-analyze-button"]');
    await page.waitForTimeout(2000);
    
    const updatedType = await page.locator('[data-testid="detected-type"]').textContent();
    expect(updatedType).toBeTruthy();
  });

  // SCEN-147
  test("[normal] 処理ログ正常表示", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'log-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ログテスト文書')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="process-log-table"]')).toBeVisible();
    await expect(page.locator('#log-tbody')).toContainText('実行日時');
  });

  // SCEN-148
  test("[error] 非対応ファイル形式でエラー", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable content')
    });
    
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式');
  });

  // SCEN-149
  test("[error] ファイルサイズ超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(100 * 1024 * 1024 + 1);
    
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ');
  });

  // SCEN-150
  test("[error] 破損ファイルアップロードでエラー", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted file content invalid format')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイル');
  });

  // SCEN-151
  test("[error] 文書種別判別失敗時のエラー表示", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unknown.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別不可能な内容')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別');
  });

  // SCEN-152
  test("[error] OCR解析失敗時のエラーハンドリング", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'ocr-fail.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('OCR解析失敗テスト')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-153
  test("[error] ネットワークエラー時の処理継続", async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'network-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('ネットワークテスト文書')
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-154
  test("[edge] ファイル未選択で確定ボタン押下", async ({ page }) => {
    await page.click('[data-testid="confirm-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイル');
  });

  // SCEN-155
  test("[edge] 最大ファイルサイズ境界値", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(100 * 1024 * 1024);
    
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('[data-testid="detected-type"]')).toBeVisible();
    
    const oversizeBuffer = Buffer.alloc(100 * 1024 * 1024 + 1);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'oversize.pdf',
      mimeType: 'application/pdf',
      buffer: oversizeBuffer
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-156
  test("[edge] 判別精度スコア0%の場合", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'zero-confidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判別不可能')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="accuracy-score"]')).toContainText('0');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判別');
  });

  // SCEN-157
  test("[edge] 判別精度スコア100%の場合", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'perfect-match.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書 補助金申請書 科研費申請 運営費交付金')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="accuracy-score"]')).toContainText('100');
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('申請書');
  });

  // SCEN-158
  test("[edge] OCR解析結果0件の場合", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'blank-image.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('不明');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('読み取れませんでした');
  });

  // SCEN-159
  test("[edge] キーワード抽出結果0件の場合", async ({ page }) => {
    await page.click('[data-testid="file-select-button"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'no-keywords.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般的な文書内容 特定のキーワードなし')
    });
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="detected-type"]')).toContainText('未分類');
    await expect(page.locator('[data-testid="keywords-container"]')).toContainText('処理ログはありません');
  });
});