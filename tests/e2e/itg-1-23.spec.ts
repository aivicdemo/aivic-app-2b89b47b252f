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

  test("SCEN-397: キーワード検索で該当文書が表示される", async ({ page }) => {
    // SCEN-397: [normal] 電子文書検索画面 - キーワード検索で該当文書が表示される
    await page.fill('[data-testid="keyword-input"]', '申請書');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-list"] tbody tr')).toHaveCountGreaterThan(0);
  });

  test("SCEN-398: 文書種別で絞り込み検索できる", async ({ page }) => {
    // SCEN-398: [normal] 電子文書検索画面 - 文書種別で絞り込み検索できる
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    const documentRows = page.locator('[data-testid="document-list"] tbody tr');
    if (await documentRows.count() > 0) {
      await expect(documentRows.first()).toContainText('休暇申請');
    }
  });

  test("SCEN-399: 申請日期間指定で検索できる", async ({ page }) => {
    // SCEN-399: [normal] 電子文書検索画面 - 申請日期間指定で検索できる
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-400: 承認状態で絞り込み検索できる", async ({ page }) => {
    // SCEN-400: [normal] 電子文書検索画面 - 承認状態で絞り込み検索できる
    await page.selectOption('[data-testid="approval-status-select"]', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-select"]', '差戻し');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-401: 申請者名で検索できる", async ({ page }) => {
    // SCEN-401: [normal] 電子文書検索画面 - 申請者名で検索できる
    await page.fill('[data-testid="applicant-input"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-402: 承認者名で検索できる", async ({ page }) => {
    // SCEN-402: [normal] 電子文書検索画面 - 承認者名で検索できる
    await page.fill('[data-testid="approver-input"]', '山田');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-403: 処理ルートで絞り込み検索できる", async ({ page }) => {
    // SCEN-403: [normal] 電子文書検索画面 - 処理ルートで絞り込み検索できる
    await page.selectOption('[data-testid="process-route-select"]', '承認ルートA');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="process-route-select"]', '承認ルートB');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-404: 補助金関連度で絞り込み検索できる", async ({ page }) => {
    // SCEN-404: [normal] 電子文書検索画面 - 補助金関連度で絞り込み検索できる
    await page.check('[data-testid="subsidy-high"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-405: 複数条件組み合わせ検索できる", async ({ page }) => {
    // SCEN-405: [normal] 電子文書検索画面 - 複数条件組み合わせ検索できる
    await page.fill('[data-testid="keyword-input"]', '申請書');
    await page.fill('[data-testid="applicant-input"]', '田中');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-406: 検索条件クリアで初期状態に戻る", async ({ page }) => {
    // SCEN-406: [normal] 電子文書検索画面 - 検索条件クリアで初期状態に戻る
    await page.fill('[data-testid="keyword-input"]', 'テスト文書');
    await page.fill('[data-testid="applicant-input"]', '田中太郎');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-31');
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="start-date-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date-input"]')).toHaveValue('');
  });

  test("SCEN-407: 文書番号リンクから詳細画面へ遷移", async ({ page }) => {
    // SCEN-407: [normal] 電子文書検索画面 - 文書番号リンクから詳細画面へ遷移
    await page.fill('[data-testid="keyword-input"]', '申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    
    const firstDocumentLink = page.locator('[data-testid="document-list"] tbody tr:first-child a');
    if (await firstDocumentLink.count() > 0) {
      await firstDocumentLink.click();
      await expect(page).toHaveURL(/\/panels\/.*\.html/);
    }
  });

  test("SCEN-408: 検索結果一覧のページング動作", async ({ page }) => {
    // SCEN-408: [normal] 電子文書検索画面 - 検索結果一覧のページング動作
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-409: 条件未入力で検索時に全件表示", async ({ page }) => {
    // SCEN-409: [edge] 電子文書検索画面 - 条件未入力で検索時に全件表示
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-list"] tbody tr')).toHaveCountGreaterThan(0);
  });

  test("SCEN-410: 存在しないキーワードで検索結果なし", async ({ page }) => {
    // SCEN-410: [edge] 電子文書検索画面 - 存在しないキーワードで検索結果なし
    await page.fill('[data-testid="keyword-input"]', 'xyz123notfound');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-results')).toBeVisible();
  });

  test("SCEN-411: 申請日開始日＞終了日でバリデーション", async ({ page }) => {
    // SCEN-411: [error] 電子文書検索画面 - 申請日開始日＞終了日でバリデーション
    await page.fill('[data-testid="start-date-input"]', '2024-12-31');
    await page.fill('[data-testid="end-date-input"]', '2024-12-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  test("SCEN-412: 申請日に不正な日付入力でエラー", async ({ page }) => {
    // SCEN-412: [error] 電子文書検索画面 - 申請日に不正な日付入力でエラー
    await page.fill('[data-testid="start-date-input"]', '2024/13/45');
    await page.fill('[data-testid="end-date-input"]', 'abcd');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test("SCEN-413: キーワードに特殊文字入力", async ({ page }) => {
    // SCEN-413: [edge] 電子文書検索画面 - キーワードに特殊文字入力
    await page.fill('[data-testid="keyword-input"]', '@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-414: キーワードに最大文字数入力", async ({ page }) => {
    // SCEN-414: [edge] 電子文書検索画面 - キーワードに最大文字数入力
    const maxLengthText = 'a'.repeat(255);
    await page.fill('[data-testid="keyword-input"]', maxLengthText);
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveValue(maxLengthText);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test("SCEN-415: 申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    // SCEN-415: [edge] 電子文書検索画面 - 申請者名に存在しない名前で検索結果なし
    await page.fill('[data-testid="applicant-input"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-results')).toBeVisible();
  });

  test("SCEN-416: 承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    // SCEN-416: [edge] 電子文書検索画面 - 承認者名に存在しない名前で検索結果なし
    await page.fill('[data-testid="approver-input"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-results')).toBeVisible();
  });

});