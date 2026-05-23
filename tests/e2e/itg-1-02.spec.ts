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
      buffer: Buffer.from('test pdf content')
    });
    await page.click('button:has-text("アップロード")');
    await expect(page.locator('#detection-result')).toBeVisible();
    await expect(page.locator('#detected-type')).toContainText('補助金申請');
  });

  test('SCEN-017: ドラッグ&ドロップでファイルアップロード', async ({ page }) => {
    await expect(page.locator('[data-testid="file-drop-zone"]')).toBeVisible();
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('#file-name')).toContainText('test-doc.pdf');
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('#detected-type')).toBeVisible();
  });

  test('SCEN-018: 手動で文書種別を変更して申請', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('content')
    });
    await page.click('[data-testid="auto-detect-button"]');
    await page.click('[data-testid="document-type-select"]');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="application-title"]', '経費申請書類の提出について');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=申請を受け付けました')).toBeVisible();
  });

  test('SCEN-019: 緊急度設定で承認フロー変更', async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '設備導入申請書');
    await page.fill('[data-testid="application-content"]', '研究用設備の緊急導入申請です');
    await page.click('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#flow-name')).toContainText('緊急承認フロー');
    
    await page.click('[data-testid="urgency-normal"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#flow-name')).toContainText('標準承認フロー');
  });

  test('SCEN-020: 申請タイトルと説明を入力して登録', async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '研究費申請書の提出について');
    await page.fill('[data-testid="application-content"]', '令和5年度科学研究費助成事業（科研費）の申請書類を提出いたします。研究課題名は「AI技術を活用した教育支援システムの開発」です。');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=登録完了')).toBeVisible();
  });

  test('SCEN-021: 非対応ファイル形式でエラー表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content')
    });
    await expect(page.locator('text=対応していないファイル形式です')).toBeVisible();
  });

  test('SCEN-022: ファイルサイズ上限超過でエラー', async ({ page }) => {
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    await expect(page.locator('text=ファイルサイズが上限を超過')).toBeVisible();
  });

  test('SCEN-023: 文書種別判別失敗時の手動選択', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'unclear.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('不鮮明な内容')
    });
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('text=自動判別に失敗しました')).toBeVisible();
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=保存完了')).toBeVisible();
  });

  test('SCEN-024: 申請タイトル未入力でバリデーション', async ({ page }) => {
    await page.selectOption('#manual-type', '休暇申請');
    await page.fill('[data-testid="application-content"]', '有給休暇を申請します');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=申請タイトルを入力してください')).toBeVisible();
  });

  test('SCEN-025: 承認者不在でエラー表示', async ({ page }) => {
    await page.fill('[data-testid="application-title"]', '設備購入申請');
    await page.fill('[data-testid="application-content"]', '研究設備の購入申請');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#no-flow-message')).toContainText('承認者が設定されていません');
  });

  test('SCEN-026: 最大ファイルサイズでアップロード', async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    await expect(page.locator('#progress-bar')).toBeVisible();
    await page.waitForSelector('#file-name');
    await expect(page.locator('#file-name')).toContainText('max-size.pdf');
    await expect(page.locator('#file-size')).toContainText('10.0MB');
  });

  test('SCEN-027: 申請タイトル文字数上限', async ({ page }) => {
    const maxTitle = 'a'.repeat(200);
    const overTitle = 'a'.repeat(201);
    
    await page.fill('[data-testid="application-title"]', maxTitle);
    await expect(page.locator('[data-testid="application-title"]')).toHaveValue(maxTitle);
    
    await page.fill('[data-testid="application-title"]', overTitle);
    const actualValue = await page.locator('[data-testid="application-title"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(200);
  });

  test('SCEN-028: 申請説明最大文字数入力', async ({ page }) => {
    const maxContent = 'あ'.repeat(1000);
    const overContent = 'あ'.repeat(1001);
    
    await page.fill('[data-testid="application-content"]', maxContent);
    await expect(page.locator('[data-testid="application-content"]')).toHaveValue(maxContent);
    
    await page.fill('[data-testid="application-content"]', overContent);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=文字数制限を超えています')).toBeVisible();
  });

  test('SCEN-029: 判別信頼度低下時の警告表示', async ({ page }) => {
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'blurry.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('不鮮明な画像データ')
    });
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('#confidence-percent')).toContainText('45%');
    await expect(page.locator('text=判別信頼度が低いため、手動での確認をお勧めします')).toBeVisible();
  });

  test('SCEN-030: 複数ファイル同時アップロード', async ({ page }) => {
    const files = [
      { name: 'doc1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('content1') },
      { name: 'doc2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('content2') },
      { name: 'doc3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('image content') }
    ];
    
    await page.setInputFiles('[data-testid="file-input"]', files);
    
    await expect(page.locator('#uploaded-files')).toContainText('doc1.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('doc2.pdf');
    await expect(page.locator('#uploaded-files')).toContainText('doc3.jpg');
    
    await page.click('[data-testid="auto-detect-button"]');
    await expect(page.locator('#detected-type')).toBeVisible();
  });
});