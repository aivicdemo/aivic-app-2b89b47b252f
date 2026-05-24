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

  // SCEN-122
  test("[normal] 申請書類作成画面 - 必須項目入力して申請書類作成", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="title-input"]', '夏季休暇申請書');
    await page.fill('[data-testid="reason-textarea"]', '夏季休暇取得のため申請いたします。');
    await page.fill('[data-testid="application-date-input"]', '2024-02-01');
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });

  // SCEN-123
  test("[normal] 申請書類作成画面 - 全項目入力して申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '研究費申請書');
    await page.selectOption('[name="departments"]', 'dept-general');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '研究活動に必要な設備購入費用として申請いたします。');
    await page.fill('[data-testid="application-date-input"]', '2024-03-01');
    await page.selectOption('[data-testid="approval-flow-select"]', '標準承認フロー');
    await page.click('[data-testid="urgency-highest"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });

  // SCEN-124
  test("[normal] 申請書類作成画面 - 添付ファイルありで申請書類作成", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="title-input"]', '設備購入申請書');
    await page.fill('[data-testid="content-textarea"]', '実験装置購入に関する申請書類です。');
    await page.setInputFiles('[data-testid="attachment-input"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test file content')
    });
    await page.click('[data-testid="upload-button"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });

  // SCEN-125
  test("[normal] 申請書類作成画面 - 既存申請書類の編集保存", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '出張申請書');
    await page.selectOption('[data-testid="document-type-select"]', '出張申請');
    await page.fill('[data-testid="content-textarea"]', '学会参加のための出張申請です。');
    await page.click('[data-testid="save-draft-button"]');
    
    await page.fill('[data-testid="title-input"]', '出張申請書（修正版）');
    await page.fill('[data-testid="content-textarea"]', '学会参加および研究打合せのための出張申請です。');
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue('出張申請書（修正版）');
  });

  // SCEN-126
  test("[error] 申請書類作成画面 - 必須項目未入力でバリデーションエラー", async ({ page }) => {
    await page.fill('[data-testid="content-textarea"]', '任意項目のみ入力');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-127
  test("[edge] 申請書類作成画面 - 申請書類タイトル文字数上限超過でエラー", async ({ page }) => {
    const longTitle = 'a'.repeat(101);
    await page.fill('[data-testid="title-input"]', longTitle);
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="reason-textarea"]', '申請理由');
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-128
  test("[edge] 申請書類作成画面 - 申請内容詳細文字数上限超過でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類タイトル');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    const longContent = 'a'.repeat(5001);
    await page.fill('[data-testid="content-textarea"]', longContent);
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-129
  test("[error] 申請書類作成画面 - 申請金額に負の値入力でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '経費申請書');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="amount-input"]', '-10000');
    await page.fill('[data-testid="content-textarea"]', '申請内容');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-130
  test("[error] 申請書類作成画面 - 申請金額に文字入力でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '経費申請書');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="amount-input"]', 'abc');
    await page.fill('[data-testid="content-textarea"]', '申請内容');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-131
  test("[edge] 申請書類作成画面 - 申請金額上限値でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '高額経費申請書');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="amount-input"]', '9999999');
    await page.fill('[data-testid="content-textarea"]', '高額設備購入申請');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });

  // SCEN-132
  test("[error] 申請書類作成画面 - サポート外ファイル形式アップロードでエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容');
    await page.setInputFiles('[data-testid="attachment-input"]', {
      name: 'test.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable file')
    });
    await page.click('[data-testid="upload-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-133
  test("[edge] 申請書類作成画面 - ファイルサイズ上限超過でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '申請内容');
    const largeFile = Buffer.alloc(11 * 1024 * 1024);
    await page.setInputFiles('[data-testid="attachment-input"]', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeFile
    });
    await page.click('[data-testid="upload-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-134
  test("[error] 申請書類作成画面 - 過去日付選択でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="application-date-input"]', '2020-01-01');
    await page.fill('[data-testid="content-textarea"]', '申請内容');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-135
  test("[edge] 申請書類作成画面 - 申請理由文字数上限でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請書類');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    const maxReasonText = 'a'.repeat(500);
    await page.fill('[data-testid="reason-textarea"]', maxReasonText);
    
    const overLimitText = 'a'.repeat(501);
    await page.fill('[data-testid="reason-textarea"]', overLimitText);
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeVisible();
  });

  // SCEN-136
  test("[normal] 申請書類作成画面 - 複数部署選択で申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '部門横断プロジェクト申請');
    await page.selectOption('[data-testid="document-type-select"]', '稟議申請');
    await page.click('[data-testid="dept-general"]');
    await page.click('[data-testid="dept-hr"]');
    await page.click('[data-testid="dept-accounting"]');
    await page.fill('[data-testid="content-textarea"]', '複数部署による協働プロジェクトの申請です。');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });

  // SCEN-137
  test("[normal] 申請書類作成画面 - 緊急度最高で申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '緊急設備修理申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="content-textarea"]', '研究に必要な設備が故障したため緊急修理が必要です。');
    await page.click('[data-testid="urgency-highest"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[id="error-message"]')).toBeHidden();
  });
});