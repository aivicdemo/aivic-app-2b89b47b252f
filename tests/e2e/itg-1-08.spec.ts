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
  await page.selectOption('select[name="documentType"]', '休暇申請');
  await page.fill('input[name="applicantName"]', '申請者太郎');
  await page.fill('textarea[name="applicationContent"]', '有給休暇取得のためシステム操作に関する質問内容をテストデータとして入力します');
  await page.fill('input[name="applicationDate"]', '2024-02-01');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
});

// SCEN-123
test("[normal] 申請書類作成画面 - 全項目入力して申請書類作成", async ({ page }) => {
  await page.fill('input[name="applicantName"]', '申請者花子');
  await page.selectOption('[data-testid="dept-general"]', '総務部');
  await page.selectOption('select[name="documentType"]', '経費申請');
  await page.fill('input[data-testid="application-title"]', '出張費用の経費申請');
  await page.fill('textarea[name="applicationContent"]', '業務出張に伴う交通費・宿泊費の申請を行います詳細は添付資料を確認してください');
  await page.fill('input[name="applicationDate"]', '2024-03-15');
  await page.click('input[data-testid="urgency-high"]');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=承認待ち')).toBeVisible();
});

// SCEN-124
test("[normal] 申請書類作成画面 - 添付ファイルありで申請書類作成", async ({ page }) => {
  await page.selectOption('select[name="documentType"]', '購買申請');
  await page.fill('input[name="applicantName"]', '申請者三郎');
  await page.fill('textarea[name="applicationContent"]', '研究用機器購入のための申請書類です仕様書と見積書を添付いたします');
  
  const fileInput = page.locator('input[data-testid="file-input"]');
  await fileInput.setInputFiles({
    name: 'test-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('test file content')
  });
  
  await page.click('button[data-testid="upload-button"]');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=申請が完了')).toBeVisible();
});

// SCEN-125
test("[normal] 申請書類作成画面 - 既存申請書類の編集保存", async ({ page }) => {
  await page.selectOption('select[name="documentType"]', '稟議書');
  await page.fill('input[name="applicantName"]', '申請者四郎');
  await page.fill('textarea[name="applicationContent"]', '既存の申請書類を編集して再提出する内容に変更いたします追加情報を含めて更新');
  await page.click('button[data-testid="draft-button"]');
  
  await page.fill('textarea[name="applicationContent"]', '既存の申請書類を編集して再提出する内容に変更いたします追加情報を含めて更新完了');
  await page.click('button[data-testid="draft-button"]');
  
  await expect(page.locator('text=保存完了')).toBeVisible();
});

// SCEN-126
test("[error] 申請書類作成画面 - 必須項目未入力でバリデーションエラー", async ({ page }) => {
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('.error-message')).toBeVisible();
  await expect(page.locator('#title-error')).toContainText('必須項目');
});

// SCEN-127
test("[edge] 申請書類作成画面 - 申請書類タイトル文字数上限超過でエラー", async ({ page }) => {
  const longTitle = 'a'.repeat(102);
  await page.fill('input[data-testid="application-title"]', longTitle);
  await page.fill('input[name="applicantName"]', '申請者');
  await page.selectOption('select[name="documentType"]', '休暇申請');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('#title-error')).toContainText('文字数上限');
});

// SCEN-128
test("[edge] 申請書類作成画面 - 申請内容詳細文字数上限超過でエラー", async ({ page }) => {
  await page.fill('input[name="applicantName"]', '申請者');
  await page.selectOption('select[name="documentType"]', '休暇申請');
  
  const longContent = 'あ'.repeat(2001);
  await page.fill('textarea[name="applicationContent"]', longContent);
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('#content-error')).toContainText('文字数上限');
});

// SCEN-129
test("[error] 申請書類作成画面 - 申請金額に負の値入力でエラー", async ({ page }) => {
  await page.fill('input[name="applicantName"]', '申請者');
  await page.selectOption('select[name="documentType"]', '経費申請');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  await page.fill('input[name="applicationAmount"]', '-10000');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('#amount-error')).toContainText('正の数値');
});

// SCEN-130
test("[error] 申請書類作成画面 - 申請金額に文字入力でエラー", async ({ page }) => {
  await page.fill('input[name="applicationAmount"]', 'abc');
  await page.fill('input[name="applicantName"]', '申請者');
  await page.selectOption('select[name="documentType"]', '経費申請');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('#amount-error')).toContainText('数値を入力');
});

// SCEN-131
test("[edge] 申請書類作成画面 - 申請金額上限値でバリデーション", async ({ page }) => {
  await page.selectOption('select[name="documentType"]', '経費申請');
  await page.fill('input[name="applicationAmount"]', '9999999');
  await page.fill('input[name="applicantName"]', '申請者');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=確認画面')).toBeVisible();
});

// SCEN-132
test("[error] 申請書類作成画面 - サポート外ファイル形式アップロードでエラー", async ({ page }) => {
  await page.fill('input[name="applicantName"]', '申請者');
  await page.selectOption('select[name="documentType"]', '購買申請');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  
  const fileInput = page.locator('input[data-testid="file-input"]');
  await fileInput.setInputFiles({
    name: 'malicious.exe',
    mimeType: 'application/x-executable',
    buffer: Buffer.from('executable content')
  });
  
  await page.click('button[data-testid="upload-button"]');
  
  await expect(page.locator('#file-error')).toContainText('サポートされていないファイル形式');
});

// SCEN-133
test("[edge] 申請書類作成画面 - ファイルサイズ上限超過でエラー", async ({ page }) => {
  await page.fill('input[data-testid="application-title"]', '大容量ファイル申請');
  await page.fill('textarea[name="applicationContent"]', '大容量ファイルをアップロードして申請します');
  
  const largeBuffer = Buffer.alloc(12 * 1024 * 1024);
  const fileInput = page.locator('input[data-testid="file-input"]');
  await fileInput.setInputFiles({
    name: 'large-file.pdf',
    mimeType: 'application/pdf',
    buffer: largeBuffer
  });
  
  await expect(page.locator('#file-error')).toContainText('ファイルサイズ上限');
});

// SCEN-134
test("[error] 申請書類作成画面 - 過去日付選択でエラー", async ({ page }) => {
  await page.selectOption('select[name="documentType"]', '休暇申請');
  await page.fill('input[name="applicantName"]', '申請者');
  await page.fill('textarea[name="applicationContent"]', '申請内容です');
  await page.fill('input[name="applicationDate"]', '2020-01-01');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('#date-error')).toContainText('過去の日付は選択できません');
});

// SCEN-135
test("[edge] 申請書類作成画面 - 申請理由文字数上限でバリデーション", async ({ page }) => {
  const reasonText = 'あ'.repeat(500);
  await page.fill('textarea[name="applicationReason"]', reasonText);
  
  await expect(page.locator('#reason-counter')).toContainText('500');
  
  const overLimitText = 'あ'.repeat(501);
  await page.fill('textarea[name="applicationReason"]', overLimitText);
  await page.click('button[data-testid="draft-button"]');
  
  await expect(page.locator('#reason-error')).toContainText('文字数上限');
});

// SCEN-136
test("[normal] 申請書類作成画面 - 複数部署選択で申請書類作成", async ({ page }) => {
  await page.selectOption('select[name="documentType"]', '稟議書');
  await page.fill('input[data-testid="application-title"]', '複数部署連携案件');
  await page.check('input[data-testid="dept-general"]');
  await page.check('input[data-testid="dept-hr"]');
  await page.check('input[data-testid="dept-accounting"]');
  await page.fill('textarea[name="applicationContent"]', '複数部署にまたがる重要な申請案件です総務部人事部経理部の連携が必要');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=総務部')).toBeVisible();
  await expect(page.locator('text=人事部')).toBeVisible();
  await expect(page.locator('text=経理部')).toBeVisible();
});

// SCEN-137
test("[normal] 申請書類作成画面 - 緊急度最高で申請書類作成", async ({ page }) => {
  await page.fill('input[data-testid="application-title"]', '緊急度最高の申請');
  await page.fill('input[name="applicantName"]', '申請者');
  await page.click('input[data-testid="urgency-urgent"]');
  await page.fill('textarea[name="applicationContent"]', '緊急度が最高レベルの重要な申請書類です迅速な対応をお願いいたします');
  await page.click('button:has-text("申請書類作成")');
  
  await expect(page.locator('text=申請完了')).toBeVisible();
  await expect(page.locator('text=最高')).toBeVisible();
});

});