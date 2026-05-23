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

  test('SCEN-016: PDF文書アップロードで自動判別成功', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('[data-testid="register-button"]');
    await page.waitForSelector('[data-testid="detection-result"]', { state: 'visible' });
    
    await expect(page.locator('[data-testid="detection-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-type-select"]')).toBeVisible();
  });

  test('SCEN-017: ドラッグ&ドロップでファイルアップロード', async ({ page }) => {
    const fileContent = Buffer.from('PDF test content');
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'drag-drop-test.pdf',
      mimeType: 'application/pdf',
      buffer: fileContent
    });

    await expect(page.locator('[data-testid="uploaded-files-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="detection-result"]')).toBeVisible();
  });

  test('SCEN-018: 手動で文書種別を変更して申請', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'manual-change-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });

    await page.waitForSelector('[data-testid="document-type-select"]', { state: 'visible' });
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    
    await page.fill('[data-testid="application-title"]', '経費申請書類テスト');
    await page.fill('[data-testid="application-description"]', 'システムテスト用の経費申請書類です。テスト内容を詳しく記載します。');
    
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="detection-result"]')).toContainText('経費申請');
  });

  test('SCEN-019: 緊急度設定で承認フロー変更', async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '緊急承認フローテスト申請');
    await page.fill('[data-testid="application-description"]', 'テスト用の申請内容です。緊急度による承認フローの変更をテストします。');
    
    await page.check('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="approval-flow"]')).toBeVisible();
  });

  test('SCEN-020: 申請タイトルと説明を入力して登録', async ({ page }) => {
    const testTitle = "申請書類登録テスト";
    const testDescription = "システムテスト用の申請書類説明文です。詳細な内容を記載します。";
    
    await page.fill('[data-testid="application-title"]', testTitle);
    await page.fill('[data-testid="application-description"]', testDescription);
    
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="application-title"]')).toHaveValue(testTitle);
    await expect(page.locator('[data-testid="application-description"]')).toHaveValue(testDescription);
  });

  test('SCEN-021: 非対応ファイル形式でエラー表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'invalid-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid file content')
    });

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-022: ファイルサイズ上限超過でエラー', async ({ page }) => {
    const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-023: 文書種別判別失敗時の手動選択', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Unclear document content')
    });

    await page.waitForSelector('[data-testid="document-type-select"]', { state: 'visible' });
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="detection-result"]')).toBeVisible();
  });

  test('SCEN-024: 申請タイトル未入力でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="application-description"]', 'テスト用の申請内容です。タイトルが未入力の場合のバリデーションテストです。');
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'validation-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-025: 承認者不在でエラー表示', async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '承認者不在テスト申請');
    await page.fill('[data-testid="application-description"]', '承認者が不在状態での申請テストです。エラー表示を確認します。');
    
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-026: 最大ファイルサイズでアップロード', async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size-file.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });

    await expect(page.locator('[data-testid="uploaded-files-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="detection-result"]')).toBeVisible();
  });

  test('SCEN-027: 申請タイトル文字数上限', async ({ page }) => {
    const maxLengthTitle = 'あ'.repeat(200);
    const overLimitTitle = 'あ'.repeat(201);
    
    await page.fill('[data-testid="application-title"]', maxLengthTitle);
    await expect(page.locator('[data-testid="application-title"]')).toHaveValue(maxLengthTitle);
    
    await page.fill('[data-testid="application-title"]', overLimitTitle);
    const actualValue = await page.locator('[data-testid="application-title"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
  });

  test('SCEN-028: 申請説明最大文字数入力', async ({ page }) => {
    const maxDescription = 'テ'.repeat(2000);
    const overLimitDescription = 'テ'.repeat(2001);
    
    await page.fill('[data-testid="application-description"]', maxDescription);
    await expect(page.locator('[data-testid="application-description"]')).toHaveValue(maxDescription);
    
    await page.fill('[data-testid="application-description"]', overLimitDescription);
    const actualValue = await page.locator('[data-testid="application-description"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(2000);
  });

  test('SCEN-029: 判別信頼度低下時の警告表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'low-confidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Low quality document content')
    });

    await page.waitForSelector('[data-testid="detection-result"]', { state: 'visible' });
    await expect(page.locator('#low-confidence-warning')).toBeVisible();
  });

  test('SCEN-030: 複数ファイル同時アップロード', async ({ page }) => {
    const files = [
      { name: 'file1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF content 1') },
      { name: 'file2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF content 2') },
      { name: 'file3.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF content 3') }
    ];

    await page.setInputFiles('[data-testid="file-input"]', files);
    
    await expect(page.locator('[data-testid="uploaded-files-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="detection-result"]')).toBeVisible();
  });
});