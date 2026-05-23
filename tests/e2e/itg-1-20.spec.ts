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
    await page.setInputFiles('#file-input', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await expect(page.locator('#file-name')).toContainText('test.pdf');
    await expect(page.locator('#auto-detection-result')).toBeVisible();
  });

  // SCEN-337
  test("文書種別自動判定結果の正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'subsidy.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('補助金申請書類')
    });
    
    await expect(page.locator('#auto-detection-result')).toContainText('補助金申請書');
    await expect(page.locator('#accuracy-text')).toContainText('85%');
  });

  // SCEN-338
  test("手動選択で文書種別変更", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書')
    });
    
    await page.selectOption('#manual-document-type', '休暇申請書');
    await page.click('#btn-confirm');
    
    await expect(page.locator('#auto-detection-result')).toContainText('休暇申請書');
  });

  // SCEN-339
  test("補助金関連度スコア正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'subsidy.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('科研費申請書類')
    });
    
    await expect(page.locator('#subsidy-score-text')).toContainText('75');
    await expect(page.locator('#subsidy-score-bar')).toHaveAttribute('style', /width: 75%/);
  });

  // SCEN-340
  test("文書内容プレビュー正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書内容')
    });
    
    await page.click('button:has-text("プレビュー表示")');
    await expect(page.locator('#document-preview')).toBeVisible();
    
    await page.click('button:has-text("プレビューを閉じる")');
    await expect(page.locator('#document-preview')).not.toBeVisible();
  });

  // SCEN-341
  test("判定精度インジケーター正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'clear_document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('明確な申請書類')
    });
    
    await expect(page.locator('#accuracy-bar')).toBeVisible();
    await expect(page.locator('#accuracy-text')).toContainText('92%');
    await expect(page.locator('#accuracy-bar')).toHaveAttribute('style', /width: 92%/);
  });

  // SCEN-342
  test("承認フロー確認から遷移", async ({ page }) => {
    await page.goto("/panels/scr-1779422241190.html");
    await page.click('button:has-text("文書種別判定")');
    
    await expect(page).toHaveURL('/panels/scr-1779422563059.html');
    await expect(page.locator('#upload-area')).toBeVisible();
  });

  // SCEN-343
  test("判定結果確定で完了", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書類')
    });
    
    await page.selectOption('#manual-document-type', '補助金申請書');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text=判定結果が確定されました')).toBeVisible();
  });

  // SCEN-344
  test("再判定実行で結果更新", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'unclear.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('不明確な内容')
    });
    
    const initialType = await page.locator('#auto-detection-result').textContent();
    
    await page.click('#btn-re-detect');
    await page.waitForTimeout(1000);
    
    const updatedType = await page.locator('#auto-detection-result').textContent();
    expect(initialType).not.toBe(updatedType);
  });

  // SCEN-345
  test("文書種別マスタ参照リンク遷移", async ({ page }) => {
    await page.click('[data-testid="document-master-link"]');
    
    await expect(page).toHaveURL('/panels/scr-1779422575885.html');
    await expect(page.locator('text=文書種別一覧')).toBeVisible();
  });

  // SCEN-346
  test("判定履歴一覧表示", async ({ page }) => {
    await page.click('[data-testid="classification-history"]');
    
    await expect(page.locator('#history-tbody')).toBeVisible();
    await expect(page.locator('text=日時')).toBeVisible();
    await expect(page.locator('text=判定結果')).toBeVisible();
    await expect(page.locator('text=精度')).toBeVisible();
  });

  // SCEN-347
  test("未対応ファイル形式でエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable')
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式です');
  });

  // SCEN-348
  test("ファイルサイズ上限超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    
    await page.setInputFiles('#file-input', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ上限');
  });

  // SCEN-349
  test("破損ファイルアップロードでエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'broken.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('invalid pdf content')
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルが破損');
  });

  // SCEN-350
  test("判定不可文書でエラーメッセージ", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'unreadable.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判定不可能な内容')
    });
    
    await page.click('button:has-text("判定実行")');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判定不可能');
  });

  // SCEN-351
  test("ネットワークエラー時の表示", async ({ page }) => {
    await page.context().setOffline(true);
    
    await page.setInputFiles('#file-input', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('テスト内容')
    });
    
    await page.selectOption('#manual-document-type', '補助金申請書');
    await page.click('#btn-confirm');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワークエラー');
  });

  // SCEN-352
  test("文書種別未選択で確定エラー", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('申請書')
    });
    
    await page.click('#btn-confirm');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別を選択してください');
  });

  // SCEN-353
  test("ファイル未選択状態での操作", async ({ page }) => {
    await page.click('button:has-text("判定実行")');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択してください');
    
    await page.click('button:has-text("アップロード")');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択してください');
  });

  // SCEN-354
  test("ファイルサイズ上限ギリギリ", async ({ page }) => {
    const limitBuffer = Buffer.alloc(10 * 1024 * 1024);
    
    await page.setInputFiles('#file-input', {
      name: 'limit.pdf',
      mimeType: 'application/pdf',
      buffer: limitBuffer
    });
    
    await expect(page.locator('#file-name')).toContainText('limit.pdf');
    await expect(page.locator('#auto-detection-result')).toBeVisible();
  });

  // SCEN-355
  test("判定精度0%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'unrecognizable.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('判定不可能')
    });
    
    await expect(page.locator('#accuracy-text')).toContainText('0%');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判定不可');
  });

  // SCEN-356
  test("判定精度100%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'perfect.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('明確な補助金申請書')
    });
    
    await expect(page.locator('#accuracy-text')).toContainText('100%');
    await expect(page.locator('#auto-detection-result')).toContainText('補助金申請書');
  });

  // SCEN-357
  test("補助金関連度スコア0の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'non_subsidy.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('一般的な申請書')
    });
    
    await expect(page.locator('#subsidy-score-text')).toContainText('0');
    await expect(page.locator('#auto-detection-result')).toContainText('その他');
  });
});