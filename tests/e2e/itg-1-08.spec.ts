import { test, expect } from '@playwright/test';

test.describe("申請書類作成画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422326698.html");
  });

  test('SCEN-122: 必須項目入力して申請書類作成', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類作成テスト');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('input[name="applicant-name"]', '田中太郎');
    await page.fill('[data-testid="reason-textarea"]', '休暇取得のため申請いたします');
    await page.fill('[data-testid="application-date-input"]', '2024-01-15');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  test('SCEN-123: 全項目入力して申請書類作成', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '補助金申請書類作成');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('#applicant-name', '田中 太郎');
    await page.fill('#applicant-department', '営業部');
    await page.fill('#applicant-email', 'tanaka@company.com');
    await page.fill('[data-testid="content-textarea"]', '申請内容の詳細を記載します');
    await page.fill('[data-testid="amount-input"]', '500000');
    await page.click('[data-testid="urgency-high"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  test('SCEN-124: 添付ファイルありで申請書類作成', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', 'ファイル添付申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '添付ファイルを含む申請書類です');
    
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles([{
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test file content')
    }]);
    
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  test('SCEN-125: 既存申請書類の編集保存', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '編集対象書類');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="content-textarea"]', '編集前の内容');
    await page.click('[data-testid="draft-button"]');
    
    await page.fill('[data-testid="title-input"]', '編集後の書類');
    await page.fill('[data-testid="content-textarea"]', '編集後の内容に変更しました');
    await page.click('[data-testid="draft-button"]');
    
    await expect(page.locator('text=保存完了')).toBeVisible();
  });

  test('SCEN-126: 必須項目未入力でバリデーションエラー', async ({ page }) => {
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類のタイトルを入力してください')).toBeVisible();
  });

  test('SCEN-127: 申請書類タイトル文字数上限超過でエラー', async ({ page }) => {
    const longTitle = 'a'.repeat(201);
    await page.fill('[data-testid="title-input"]', longTitle);
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容です');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類のタイトルは10文字以上200文字以内で入力してください')).toBeVisible();
  });

  test('SCEN-128: 申請内容詳細文字数上限超過でエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類タイトル');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    const longContent = 'a'.repeat(5001);
    await page.fill('[data-testid="content-textarea"]', longContent);
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請内容は50文字以上で詳しく記載してください')).toBeVisible();
  });

  test('SCEN-129: 申請金額に負の値入力でエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '金額申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容を記載します');
    await page.fill('[data-testid="amount-input"]', '-10000');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請金額は正の数値を入力してください')).toBeVisible();
  });

  test('SCEN-130: 申請金額に文字入力でエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '金額申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容を記載します');
    await page.fill('[data-testid="amount-input"]', 'abc');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=数値を入力してください')).toBeVisible();
  });

  test('SCEN-131: 申請金額上限値でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '上限金額申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '上限値での申請です');
    await page.fill('[data-testid="amount-input"]', '9999999');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  test('SCEN-132: サポート外ファイル形式アップロードでエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', 'ファイルアップロード申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', 'ファイルを添付します');
    
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles([{
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable file')
    }]);
    
    await expect(page.locator('text=サポートされていないファイル形式です')).toBeVisible();
  });

  test('SCEN-133: ファイルサイズ上限超過でエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '大容量ファイル申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '大容量ファイルを添付します');
    
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles([{
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    }]);
    
    await expect(page.locator('text=ファイルサイズ上限超過')).toBeVisible();
  });

  test('SCEN-134: 過去日付選択でエラー', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '日付申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容です');
    await page.fill('[data-testid="application-date-input"]', '2020-01-01');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=過去の日付は選択できません')).toBeVisible();
  });

  test('SCEN-135: 申請理由文字数上限でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '理由記載申請');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容です');
    
    const maxLengthReason = 'a'.repeat(1001);
    await page.fill('[data-testid="reason-textarea"]', maxLengthReason);
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=文字数上限超過')).toBeVisible();
  });

  test('SCEN-136: 複数部署選択で申請書類作成', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '複数部署申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '複数部署に関わる申請です');
    
    await page.click('[data-testid="dept-finance"]');
    await page.click('[data-testid="dept-hr"]');
    
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  test('SCEN-137: 緊急度最高で申請書類作成', async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '緊急申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '緊急性の高い申請です');
    await page.click('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
    await expect(page.locator('text=緊急申請として通知されました')).toBeVisible();
  });
});