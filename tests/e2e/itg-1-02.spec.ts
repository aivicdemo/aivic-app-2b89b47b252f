import { test, expect } from '@playwright/test';

test.describe("申請書類登録・自動判別画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422207222.html");
  });

  // SCEN-016
  test("[normal] PDF文書アップロードで自動判別成功", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('#detection-result')).toBeVisible();
    await expect(page.locator('#detected-type')).not.toBeEmpty();
  });

  // SCEN-017
  test("[normal] ドラッグ&ドロップでファイルアップロード", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('[data-testid="upload-area"]').dragTo(page.locator('[data-testid="upload-area"]'));
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });

    await expect(page.locator('#uploaded-files')).toContainText('test-document.pdf');
    await expect(page.locator('#detection-result')).toBeVisible();
  });

  // SCEN-018
  test("[normal] 手動で文書種別を変更して申請", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });

    await page.click('[data-testid="auto-detect-button"]');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請書');
    await page.fill('[data-testid="application-title"]', '経費申請書のテスト');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('#detection-result')).toContainText('経費申請書');
  });

  // SCEN-019
  test("[normal] 緊急度設定で承認フロー変更", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '緊急承認テスト申請');
    await page.fill('[data-testid="application-description"]', '緊急度設定による承認フロー変更のテスト申請書類です。緊急処理が必要な内容を含みます。');
    
    await page.click('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('#approval-flow-name')).toContainText('緊急');
  });

  // SCEN-020
  test("[normal] 申請タイトルと説明を入力して登録", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '有効なタイトルテスト');
    await page.fill('[data-testid="application-description"]', 'これは申請の詳細な説明文です。必要な情報をすべて含んでいます。');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('#detection-result')).toBeVisible();
  });

  // SCEN-021
  test("[error] 非対応ファイル形式でエラー表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'invalid-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid file content')
    });

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式');
  });

  // SCEN-022
  test("[error] ファイルサイズ上限超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ');
  });

  // SCEN-023
  test("[error] 文書種別判別失敗時の手動選択", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Unclear content')
    });

    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('[data-testid="document-type-select"]')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請書');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('#detected-type')).toContainText('休暇申請書');
  });

  // SCEN-024
  test("[error] 申請タイトル未入力でバリデーション", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請書');
    await page.fill('[data-testid="application-description"]', '申請内容の説明です。十分な文字数で記載されています。');
    
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('申請タイトル');
  });

  // SCEN-025
  test("[error] 承認者不在でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '承認者不在テスト申請');
    await page.fill('[data-testid="application-description"]', '承認者が不在状態での申請テストです。');
    
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者不在');
  });

  // SCEN-026
  test("[edge] 最大ファイルサイズでアップロード", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size-file.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });

    await page.click('[data-testid="register-button"]');

    await expect(page.locator('#uploaded-files')).toContainText('max-size-file.pdf');
    await expect(page.locator('#detection-result')).toBeVisible();
  });

  // SCEN-027
  test("[edge] 申請タイトル文字数上限", async ({ page }) => {
    const maxTitle = 'A'.repeat(200);
    const overMaxTitle = 'A'.repeat(201);
    
    await page.fill('[data-testid="application-title"]', maxTitle);
    await expect(page.locator('[data-testid="application-title"]')).toHaveValue(maxTitle);
    
    await page.fill('[data-testid="application-title"]', overMaxTitle);
    const actualValue = await page.locator('[data-testid="application-title"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
  });

  // SCEN-028
  test("[edge] 申請説明最大文字数入力", async ({ page }) => {
    const maxDescription = 'A'.repeat(2000);
    const overMaxDescription = 'A'.repeat(2001);
    
    await page.fill('[data-testid="application-description"]', maxDescription);
    await expect(page.locator('[data-testid="application-description"]')).toHaveValue(maxDescription);
    
    await page.fill('[data-testid="application-description"]', overMaxDescription);
    const actualValue = await page.locator('[data-testid="application-description"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(2000);
  });

  // SCEN-029
  test("[edge] 判別信頼度低下時の警告表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear-quality.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Low quality content')
    });

    await page.click('[data-testid="auto-detect-button"]');

    await expect(page.locator('#confidence-warning')).toBeVisible();
    await expect(page.locator('#confidence-text')).toContainText('0%');
  });

  // SCEN-030
  test("[edge] 複数ファイル同時アップロード", async ({ page }) => {
    const files = [
      { name: 'file1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF1') },
      { name: 'file2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF2') },
      { name: 'file3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('JPEG') }
    ];

    await page.setInputFiles('[data-testid="file-input"]', files);

    await expect(page.locator('#uploaded-files')).toContainText('file1.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('file2.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('file3.jpg');
    
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('#detection-result')).toBeVisible();
  });
});