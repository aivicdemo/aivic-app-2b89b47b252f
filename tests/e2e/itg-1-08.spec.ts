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
    await page.selectOption('select[name="document-type"]', '休暇申請');
    await page.fill('input[name="applicant"]', '田中太郎');
    await page.fill('textarea[name="reason"]', '年次有給休暇の取得を申請いたします。家族旅行のため1日休暇を希望します。');
    await page.fill('input[name="application-date"]', '2024-03-15');
    await page.fill('input[name="application-date"]', '2024-03-15');
    await page.click('button[data-testid="draft-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成され')).toBeVisible();
    await expect(page.locator('text=下書き')).toBeVisible();
  });

  // SCEN-123
  test("[normal] 申請書類作成画面 - 全項目入力して申請書類作成", async ({ page }) => {
    await page.fill('input[name="applicant"]', '佐藤花子');
    await page.selectOption('select[name="departments"]', '総務部');
    await page.selectOption('select[name="document-type"]', '経費申請');
    await page.fill('input[name="title"]', '研究機材購入申請');
    await page.fill('textarea[name="content-detail"]', '研究用パソコン購入のため経費申請を行います。予算範囲内での購入を予定しています。');
    await page.fill('input[name="application-date"]', '2024-04-01');
    await page.click('input[data-testid="urgency-high"]');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成され')).toBeVisible();
    await expect(page.locator('text=承認待ち')).toBeVisible();
  });

  // SCEN-124
  test("[normal] 申請書類作成画面 - 添付ファイルありで申請書類作成", async ({ page }) => {
    await page.selectOption('select[name="document-type"]', '設備申請');
    await page.fill('input[name="applicant"]', '山田次郎');
    await page.fill('textarea[name="content-detail"]', 'プロジェクター購入申請です。教室での使用を予定しており、見積書を添付いたします。');
    await page.setInputFiles('input[name="attachment"]', {
      name: 'estimate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成され')).toBeVisible();
    await expect(page.locator('text=添付ファイル')).toBeVisible();
  });

  // SCEN-125
  test("[normal] 申請書類作成画面 - 既存申請書類の編集保存", async ({ page }) => {
    await page.fill('input[name="title"]', '既存申請書類の編集');
    await page.fill('input[name="applicant"]', '鈴木一郎');
    await page.selectOption('select[name="document-type"]', '人事申請');
    await page.fill('textarea[name="content-detail"]', '異動申請について内容を修正いたします。配属希望部署を変更します。');
    await page.fill('textarea[name="reason"]', '家庭の事情により通勤時間を考慮した配属を希望いたします。');
    await page.click('button[data-testid="draft-button"]');
    
    await expect(page.locator('text=保存完了')).toBeVisible();
    await expect(page.locator('text=更新されていることを確認')).toBeVisible();
  });

  // SCEN-126
  test("[error] 申請書類作成画面 - 必須項目未入力でバリデーションエラー", async ({ page }) => {
    await page.fill('input[name="applicant"]', '');
    await page.selectOption('select[name="document-type"]', '');
    await page.fill('textarea[name="reason"]', '');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=必須項目未入力')).toBeVisible();
  });

  // SCEN-127
  test("[edge] 申請書類作成画面 - 申請書類タイトル文字数上限超過でエラー", async ({ page }) => {
    const longTitle = 'a'.repeat(101);
    await page.fill('input[name="title"]', longTitle);
    await page.fill('input[name="applicant"]', '田中太郎');
    await page.selectOption('select[name="document-type"]', '経費申請');
    await page.fill('textarea[name="reason"]', '正常な申請理由です。');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=文字数上限超過')).toBeVisible();
  });

  // SCEN-128
  test("[edge] 申請書類作成画面 - 申請内容詳細文字数上限超過でエラー", async ({ page }) => {
    await page.fill('input[name="applicant"]', '佐藤花子');
    await page.selectOption('select[name="document-type"]', '研究申請');
    const longContent = 'a'.repeat(2001);
    await page.fill('textarea[name="content-detail"]', longContent);
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=文字数上限超過エラー')).toBeVisible();
  });

  // SCEN-129
  test("[error] 申請書類作成画面 - 申請金額に負の値入力でエラー", async ({ page }) => {
    await page.fill('input[name="applicant"]', '山田次郎');
    await page.selectOption('select[name="document-type"]', '経費申請');
    await page.fill('input[name="amount"]', '-10000');
    await page.fill('textarea[name="reason"]', '正常な申請理由です。');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=正の数値を入力してください')).toBeVisible();
  });

  // SCEN-130
  test("[error] 申請書類作成画面 - 申請金額に文字入力でエラー", async ({ page }) => {
    await page.fill('input[name="applicant"]', '鈴木一郎');
    await page.selectOption('select[name="document-type"]', '経費申請');
    await page.fill('input[name="amount"]', 'abc');
    await page.fill('textarea[name="reason"]', '正常な申請理由です。');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=数値を入力してください')).toBeVisible();
  });

  // SCEN-131
  test("[edge] 申請書類作成画面 - 申請金額上限値でバリデーション", async ({ page }) => {
    await page.selectOption('select[name="document-type"]', '経費申請');
    await page.fill('input[name="amount"]', '9999999');
    await page.fill('input[name="applicant"]', '田中太郎');
    await page.fill('textarea[name="reason"]', '上限値での申請です。');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    await expect(page.locator('text=確認画面')).toBeVisible();
  });

  // SCEN-132
  test("[error] 申請書類作成画面 - サポート外ファイル形式アップロードでエラー", async ({ page }) => {
    await page.fill('input[name="applicant"]', '佐藤花子');
    await page.selectOption('select[name="document-type"]', '設備申請');
    await page.fill('textarea[name="content-detail"]', '機材購入申請です。');
    await page.setInputFiles('input[name="attachment"]', {
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('executable content')
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=サポートされていないファイル形式')).toBeVisible();
  });

  // SCEN-133
  test("[edge] 申請書類作成画面 - ファイルサイズ上限超過でエラー", async ({ page }) => {
    await page.fill('input[name="title"]', 'ファイル添付申請');
    await page.fill('input[name="applicant"]', '山田次郎');
    await page.selectOption('select[name="document-type"]', '研究申請');
    await page.fill('textarea[name="content-detail"]', '大容量ファイル添付申請です。');
    const largeBuffer = Buffer.alloc(12 * 1024 * 1024);
    await page.setInputFiles('input[name="attachment"]', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=ファイルサイズ上限超過')).toBeVisible();
  });

  // SCEN-134
  test("[error] 申請書類作成画面 - 過去日付選択でエラー", async ({ page }) => {
    await page.selectOption('select[name="document-type"]', '休暇申請');
    await page.fill('input[name="applicant"]', '鈴木一郎');
    await page.fill('textarea[name="reason"]', '過去日付での申請です。');
    await page.fill('input[name="application-date"]', '2023-01-01');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=過去の日付は選択できません')).toBeVisible();
  });

  // SCEN-135
  test("[edge] 申請書類作成画面 - 申請理由文字数上限でバリデーション", async ({ page }) => {
    await page.fill('input[name="applicant"]', '田中太郎');
    await page.selectOption('select[name="document-type"]', '経費申請');
    const maxLengthReason = 'a'.repeat(500);
    await page.fill('textarea[name="reason"]', maxLengthReason);
    
    const counter = page.locator('#reason-counter');
    await expect(counter).toContainText('500');
    
    const overLimitReason = 'a'.repeat(501);
    await page.fill('textarea[name="reason"]', overLimitReason);
    await page.click('button[data-testid="draft-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=文字数上限超過')).toBeVisible();
  });

  // SCEN-136
  test("[normal] 申請書類作成画面 - 複数部署選択で申請書類作成", async ({ page }) => {
    await page.selectOption('select[name="document-type"]', '予算申請');
    await page.fill('input[name="title"]', '複数部署連携申請');
    await page.click('input[data-testid="dept-general"]');
    await page.click('input[data-testid="dept-hr"]');
    await page.click('input[data-testid="dept-accounting"]');
    await page.fill('textarea[name="content-detail"]', '複数部署にまたがるプロジェクトのための予算申請です。');
    await page.fill('input[name="applicant"]', '佐藤花子');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成され')).toBeVisible();
    await expect(page.locator('text=総務部')).toBeVisible();
    await expect(page.locator('text=人事部')).toBeVisible();
    await expect(page.locator('text=経理部')).toBeVisible();
  });

  // SCEN-137
  test("[normal] 申請書類作成画面 - 緊急度最高で申請書類作成", async ({ page }) => {
    await page.fill('input[name="title"]', '緊急申請案件');
    await page.fill('input[name="applicant"]', '山田次郎');
    await page.selectOption('select[name="document-type"]', '設備申請');
    await page.click('input[data-testid="urgency-urgent"]');
    await page.fill('textarea[name="content-detail"]', '緊急を要する設備故障対応のための申請です。即座の対応が必要です。');
    await page.fill('textarea[name="reason"]', '業務に重大な支障をきたすため緊急対応を要請します。');
    await page.click('button[data-testid="submit-button"]');
    
    await expect(page.locator('text=申請書類が正常に作成され')).toBeVisible();
    await expect(page.locator('text=緊急申請として通知')).toBeVisible();
    await expect(page.locator('text=最高')).toBeVisible();
  });
});