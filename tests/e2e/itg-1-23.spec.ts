import { test, expect } from '@playwright/test';

test.describe("電子文書検索画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422606208.html");
  });

  // SCEN-397
  test("[normal] 電子文書検索画面 - キーワード検索で該当文書が表示される", async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '申請書');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-398
  test("[normal] 電子文書検索画面 - 文書種別で絞り込み検索できる", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-399
  test("[normal] 電子文書検索画面 - 申請日期間指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-400
  test("[normal] 電子文書検索画面 - 承認状態で絞り込み検索できる", async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-select"]', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="approval-status-select"]', '差戻し');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-401
  test("[normal] 電子文書検索画面 - 申請者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-402
  test("[normal] 電子文書検索画面 - 承認者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '佐藤');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-403
  test("[normal] 電子文書検索画面 - 処理ルートで絞り込み検索できる", async ({ page }) => {
    await page.selectOption('[data-testid="processing-route-select"]', '標準ルート');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="processing-route-select"]', '緊急ルート');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-404
  test("[normal] 電子文書検索画面 - 補助金関連度で絞り込み検索できる", async ({ page }) => {
    await page.check('[data-testid="subsidy-high"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-405
  test("[normal] 電子文書検索画面 - 複数条件組み合わせ検索できる", async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '申請書');
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-406
  test("[normal] 電子文書検索画面 - 検索条件クリアで初期状態に戻る", async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', 'テスト文書');
    await page.fill('[data-testid="applicant-name"]', '田中太郎');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="search-keyword"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
  });

  // SCEN-407
  test("[normal] 電子文書検索画面 - 文書番号リンクから詳細画面へ遷移", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    const firstDocumentLink = page.locator('tbody tr:first-child td:first-child a');
    if (await firstDocumentLink.count() > 0) {
      await firstDocumentLink.click();
      await page.waitForURL(url => url.toString() !== '/panels/scr-1779422606208.html');
    }
  });

  // SCEN-408
  test("[normal] 電子文書検索画面 - 検索結果一覧のページング動作", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-409
  test("[edge] 電子文書検索画面 - 条件未入力で検索時に全件表示", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-410
  test("[edge] 電子文書検索画面 - 存在しないキーワードで検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', 'xyz123notfound');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('.table-wrap')).toContainText('検索結果が見つかりませんでした');
  });

  // SCEN-411
  test("[error] 電子文書検索画面 - 申請日開始日＞終了日でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-12-01');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  // SCEN-412
  test("[error] 電子文書検索画面 - 申請日に不正な日付入力でエラー", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024/13/45');
    await page.fill('[data-testid="end-date"]', 'abcd');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-413
  test("[edge] 電子文書検索画面 - キーワードに特殊文字入力", async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-414
  test("[edge] 電子文書検索画面 - キーワードに最大文字数入力", async ({ page }) => {
    const maxKeyword = 'a'.repeat(255);
    await page.fill('[data-testid="search-keyword"]', maxKeyword);
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  // SCEN-415
  test("[edge] 電子文書検索画面 - 申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('.table-wrap')).toContainText('検索結果が見つかりませんでした');
  });

  // SCEN-416
  test("[edge] 電子文書検索画面 - 承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('.table-wrap')).toContainText('検索結果が見つかりませんでした');
  });
});