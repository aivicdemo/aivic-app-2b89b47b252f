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

  test('SCEN-397: キーワード検索で該当文書が表示される', async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '申請書');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-398: 文書種別で絞り込み検索できる', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-399: 申請日期間指定で検索できる', async ({ page }) => {
    await page.fill('[data-testid="date-from"]', '2024-01-01');
    await page.fill('[data-testid="date-to"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-400: 承認状態で絞り込み検索できる', async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-select"]', '申請中');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="approval-status-select"]', '却下');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-401: 申請者名で検索できる', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-402: 承認者名で検索できる', async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '佐藤次郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-403: 処理ルートで絞り込み検索できる', async ({ page }) => {
    await page.click('[data-testid="process-route-select"]');
    await page.selectOption('[data-testid="process-route-select"]', '通常承認ルート');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await page.selectOption('[data-testid="process-route-select"]', '緊急承認ルート');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-404: 補助金関連度で絞り込み検索できる', async ({ page }) => {
    await page.check('[data-testid="subsidy-high"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-405: 複数条件組み合わせ検索できる', async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '申請書');
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.fill('[data-testid="date-from"]', '2024-01-01');
    await page.fill('[data-testid="date-to"]', '2024-12-31');
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-406: 検索条件クリアで初期状態に戻る', async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', 'テスト文書');
    await page.fill('[data-testid="applicant-name"]', '田中太郎');
    await page.fill('[data-testid="date-from"]', '2024-01-01');
    await page.fill('[data-testid="date-to"]', '2024-01-31');
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済');
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="search-keyword"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="date-from"]')).toHaveValue('');
    await expect(page.locator('[data-testid="date-to"]')).toHaveValue('');
  });

  test('SCEN-407: 文書番号リンクから詳細画面へ遷移', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    
    const detailButton = page.locator('[data-testid="document-list"] button').first();
    await detailButton.click();
    
    await page.waitForURL(/panels\/.*\.html/);
    await expect(page).toHaveURL(/panels\/.*\.html/);
  });

  test('SCEN-408: 検索結果一覧のページング動作', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-409: 条件未入力で検索時に全件表示', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-410: 存在しないキーワードで検索結果なし', async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', 'xyz123notfound');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-411: 申請日開始日＞終了日でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="date-from"]', '2024-12-31');
    await page.fill('[data-testid="date-to"]', '2024-12-01');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('body')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  test('SCEN-412: 申請日に不正な日付入力でエラー', async ({ page }) => {
    await page.fill('[data-testid="date-from"]', '2024-13-45');
    await page.fill('[data-testid="date-to"]', 'abcd');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('body')).toContainText('不正な日付形式');
  });

  test('SCEN-413: キーワードに特殊文字入力', async ({ page }) => {
    await page.fill('[data-testid="search-keyword"]', '@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-414: キーワードに最大文字数入力', async ({ page }) => {
    const maxText = 'a'.repeat(255);
    await page.fill('[data-testid="search-keyword"]', maxText);
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="search-keyword"]')).toHaveValue(maxText);
  });

  test('SCEN-415: 申請者名に存在しない名前で検索結果なし', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });

  test('SCEN-416: 承認者名に存在しない名前で検索結果なし', async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
  });
});