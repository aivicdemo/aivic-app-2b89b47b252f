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
  test('[normal] 申請書類登録・自動判別画面 - PDF文書アップロードで自動判別成功', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('[data-testid="document-type-detection-btn"]');
    
    await expect(page.locator('[data-testid="detected-document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
  });

  // SCEN-017
  test('[normal] 申請書類登録・自動判別画面 - ドラッグ&ドロップでファイルアップロード', async ({ page }) => {
    const fileBuffer = Buffer.from('PDF test content');
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await dataTransfer.evaluate((dt, buffer) => {
      const file = new File([new Uint8Array(buffer)], 'test.pdf', { type: 'application/pdf' });
      dt.items.add(file);
    }, Array.from(fileBuffer));

    await page.dispatchEvent('[data-testid="file-drop-zone"]', 'drop', { dataTransfer });
    
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="detected-document-type"]')).toBeVisible();
  });

  // SCEN-018
  test('[normal] 申請書類登録・自動判別画面 - 手動で文書種別を変更して申請', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('[data-testid="document-type-detection-btn"]');
    await page.waitForSelector('[data-testid="document-type-select"]', { state: 'visible' });
    
    await page.selectOption('[data-testid="document-type-select"]', '経費申請書');
    await page.fill('[data-testid="application-title-input"]', '経費申請のテスト');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('text=申請登録')).toBeVisible();
  });

  // SCEN-019
  test('[normal] 申請書類登録・自動判別画面 - 緊急度設定で承認フロー変更', async ({ page }) => {
    await page.fill('[data-testid="application-title-input"]', '緊急申請書類テスト');
    
    await page.check('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="approval-flow-preview"]')).toBeVisible();
    
    await page.check('[data-testid="urgency-normal"]');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="approval-flow-preview"]')).toBeVisible();
  });

  // SCEN-020
  test('[normal] 申請書類登録・自動判別画面 - 申請タイトルと説明を入力して登録', async ({ page }) => {
    await page.fill('[data-testid="application-title-input"]', '研究費申請書類');
    await page.fill('[data-testid="application-description-input"]', 'この申請は研究活動のための予算確保を目的としています。');
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('text=申請書類が正常に登録')).toBeVisible();
  });

  // SCEN-021
  test('[error] 申請書類登録・自動判別画面 - 非対応ファイル形式でエラー表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('text content')
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式です');
  });

  // SCEN-022
  test('[error] 申請書類登録・自動判別画面 - ファイルサイズ上限超過でエラー', async ({ page }) => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズが上限を超過');
  });

  // SCEN-023
  test('[error] 申請書類登録・自動判別画面 - 文書種別判別失敗時の手動選択', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('unclear content')
    });
    
    await page.click('[data-testid="document-type-detection-btn"]');
    
    await expect(page.locator('[data-testid="document-type-select"]')).toBeVisible();
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請書');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('text=書類登録が正常に完了')).toBeVisible();
  });

  // SCEN-024
  test('[error] 申請書類登録・自動判別画面 - 申請タイトル未入力でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="application-description-input"]', '申請内容の説明文です');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('申請タイトル');
  });

  // SCEN-025
  test('[error] 申請書類登録・自動判別画面 - 承認者不在でエラー表示', async ({ page }) => {
    await page.fill('[data-testid="application-title-input"]', '承認者不在テスト申請');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者不在');
  });

  // SCEN-026
  test('[edge] 申請書類登録・自動判別画面 - 最大ファイルサイズでアップロード', async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    
    await page.click('[data-testid="document-type-detection-btn"]');
    
    await expect(page.locator('[data-testid="detected-document-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toBeVisible();
  });

  // SCEN-027
  test('[edge] 申請書類登録・自動判別画面 - 申請タイトル文字数上限', async ({ page }) => {
    const maxLengthTitle = 'a'.repeat(200);
    await page.fill('[data-testid="application-title-input"]', maxLengthTitle);
    
    const overLimitTitle = 'a'.repeat(201);
    await page.fill('[data-testid="application-title-input"]', overLimitTitle);
    
    const inputValue = await page.inputValue('[data-testid="application-title-input"]');
    expect(inputValue.length).toBeLessThanOrEqual(200);
  });

  // SCEN-028
  test('[edge] 申請書類登録・自動判別画面 - 申請説明最大文字数入力', async ({ page }) => {
    const maxLengthDesc = 'テスト文字'.repeat(250); // 1000文字相当
    await page.fill('[data-testid="application-description-input"]', maxLengthDesc);
    
    const overLimitDesc = 'テスト文字'.repeat(251); // 1004文字相当
    await page.fill('[data-testid="application-description-input"]', overLimitDesc);
    
    const inputValue = await page.inputValue('[data-testid="application-description-input"]');
    expect(inputValue.length).toBeLessThanOrEqual(1000);
  });

  // SCEN-029
  test('[edge] 申請書類登録・自動判別画面 - 判別信頼度低下時の警告表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'low-quality.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('低画質な内容')
    });
    
    await page.click('[data-testid="document-type-detection-btn"]');
    
    await expect(page.locator('#low-confidence-warning')).toBeVisible();
    await expect(page.locator('#low-confidence-warning')).toContainText('判別信頼度が低い');
  });

  // SCEN-030
  test('[edge] 申請書類登録・自動判別画面 - 複数ファイル同時アップロード', async ({ page }) => {
    const files = [
      { name: 'file1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF1') },
      { name: 'file2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF2') },
      { name: 'file3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('JPG') }
    ];
    
    await page.setInputFiles('[data-testid="file-input"]', files);
    
    await page.click('[data-testid="document-type-detection-btn"]');
    
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toContainText('file1.pdf');
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toContainText('file2.pdf');
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toContainText('file3.jpg');
    await expect(page.locator('[data-testid="detected-document-type"]')).toBeVisible();
  });

});