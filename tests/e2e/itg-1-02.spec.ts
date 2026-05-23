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
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content')
    });
    
    await page.click('[data-testid="auto-detect-button"]');
    
    await expect(page.locator('#detection-result')).toBeVisible();
    await expect(page.locator('#detected-type')).not.toBeEmpty();
    await expect(page.locator('#confidence-percent')).toContainText('%');
  });

  // SCEN-017
  test("[normal] ドラッグ&ドロップでファイルアップロード", async ({ page }) => {
    const fileBuffer = Buffer.from('%PDF-1.4 test document content');
    
    await page.locator('[data-testid="file-drop-zone"]').setInputFiles({
      name: 'dragged-document.pdf',
      mimeType: 'application/pdf',
      buffer: fileBuffer
    });
    
    await expect(page.locator('#file-name')).toContainText('dragged-document.pdf');
    await expect(page.locator('#detection-result')).toBeVisible();
    await expect(page.locator('#detected-type')).not.toBeEmpty();
  });

  // SCEN-018
  test("[normal] 手動で文書種別を変更して申請", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 申請書類')
    });
    
    await page.click('[data-testid="auto-detect-button"]');
    await page.waitForSelector('#detection-result');
    
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="application-title"]', '経費申請書');
    await page.fill('[data-testid="application-content"]', '会議費用の申請です。');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=申請が正常に登録されました')).toBeVisible();
  });

  // SCEN-019
  test("[normal] 緊急度設定で承認フロー変更", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '研究設備購入申請');
    await page.fill('[data-testid="application-content"]', '緊急に必要な研究設備の購入申請');
    
    await page.check('[data-testid="urgency-urgent"]');
    
    await expect(page.locator('#approval-flow-result')).toContainText('緊急');
    await expect(page.locator('#flow-name')).toContainText('短縮');
    
    await page.check('[data-testid="urgency-normal"]');
    
    await expect(page.locator('#approval-flow-result')).toContainText('標準');
  });

  // SCEN-020
  test("[normal] 申請タイトルと説明を入力して登録", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '出張費用申請書');
    await page.fill('[data-testid="application-content"]', '学会発表のための出張費用を申請いたします。');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=登録完了')).toBeVisible();
    await expect(page.locator('text=出張費用申請書')).toBeVisible();
  });

  // SCEN-021
  test("[error] 非対応ファイル形式でエラー表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'invalid-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not a valid document')
    });
    
    await expect(page.locator('text=対応していないファイル形式です')).toBeVisible();
    await expect(page.locator('text=PDF、JPEG、PNG形式')).toBeVisible();
  });

  // SCEN-022
  test("[error] ファイルサイズ上限超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    
    await expect(page.locator('text=ファイルサイズが上限を超過')).toBeVisible();
    await expect(page.locator('text=アップロードが拒否')).toBeVisible();
  });

  // SCEN-023
  test("[error] 文書種別判別失敗時の手動選択", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 不鮮明な文書')
    });
    
    await page.click('[data-testid="auto-detect-button"]');
    
    await expect(page.locator('text=自動判別に失敗')).toBeVisible();
    await expect(page.locator('[data-testid="document-type-select"]')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-select"]', '報告書');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=手動選択により登録完了')).toBeVisible();
  });

  // SCEN-024
  test("[error] 申請タイトル未入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="application-content"]', '申請内容の詳細説明です。');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=申請タイトルを入力してください')).toBeVisible();
    await expect(page.locator('text=申請タイトルは必須項目です')).toBeVisible();
  });

  // SCEN-025
  test("[error] 承認者不在でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '承認者不在テスト申請');
    await page.fill('[data-testid="application-content"]', '承認者が設定されていない申請です。');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=承認者不在')).toBeVisible();
    await expect(page.locator('text=承認者が設定されていない')).toBeVisible();
  });

  // SCEN-026
  test("[edge] 最大ファイルサイズでアップロード", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024);
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size-document.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    
    await page.click('[data-testid="auto-detect-button"]');
    
    await expect(page.locator('#file-name')).toContainText('max-size-document.pdf');
    await expect(page.locator('#file-size')).toContainText('10');
    await expect(page.locator('#detection-result')).toBeVisible();
  });

  // SCEN-027
  test("[edge] 申請タイトル文字数上限", async ({ page }) => {
    const maxLengthTitle = 'a'.repeat(200);
    const overLengthTitle = 'a'.repeat(201);
    
    await page.fill('[data-testid="application-title"]', maxLengthTitle);
    await expect(page.locator('[data-testid="application-title"]')).toHaveValue(maxLengthTitle);
    
    await page.fill('[data-testid="application-title"]', overLengthTitle);
    const actualValue = await page.locator('[data-testid="application-title"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
  });

  // SCEN-028
  test("[edge] 申請説明最大文字数入力", async ({ page }) => {
    const maxContent = 'あ'.repeat(1000);
    const overContent = 'あ'.repeat(1001);
    
    await page.fill('[data-testid="application-content"]', maxContent);
    await expect(page.locator('[data-testid="application-content"]')).toHaveValue(maxContent);
    
    await page.fill('[data-testid="application-content"]', overContent);
    const actualValue = await page.locator('[data-testid="application-content"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(1000);
  });

  // SCEN-029
  test("[edge] 判別信頼度低下時の警告表示", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'low-quality.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 不鮮明で判別困難な文書')
    });
    
    await page.click('[data-testid="auto-detect-button"]');
    
    await expect(page.locator('text=判別信頼度が低いため')).toBeVisible();
    await expect(page.locator('text=手動での確認をお勧めします')).toBeVisible();
    await expect(page.locator('.warning')).toHaveCSS('color', /rgb\(255,\s*165,\s*0\)|rgb\(255,\s*0,\s*0\)/);
  });

  // SCEN-030
  test("[edge] 複数ファイル同時アップロード", async ({ page }) => {
    const file1 = { name: 'doc1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 document 1') };
    const file2 = { name: 'doc2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 document 2') };
    const file3 = { name: 'doc3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('JPEG image data') };
    
    await page.setInputFiles('[data-testid="file-input"]', [file1, file2, file3]);
    
    await expect(page.locator('#uploaded-files')).toContainText('doc1.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('doc2.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('doc3.jpg');
    
    const fileCount = await page.locator('#uploaded-files .file-item').count();
    expect(fileCount).toBe(3);
  });
});