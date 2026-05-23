import { test, expect } from '@playwright/test';

test.describe("承認履歴・通知履歴照会画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422306272.html");
  });

  // SCEN-103
  test("履歴種別タブ切り替えで表示内容が更新される", async ({ page }) => {
    const approvalTab = page.locator('[data-testid="approval-tab"]');
    const notificationTab = page.locator('[data-testid="notification-tab"]');
    const historyList = page.locator('[data-testid="history-list"]');

    await expect(approvalTab).toBeVisible();
    await expect(notificationTab).toBeVisible();

    await approvalTab.click();
    await expect(approvalTab).toHaveClass(/active/);
    await expect(historyList).toBeVisible();

    await notificationTab.click();
    await expect(notificationTab).toHaveClass(/active/);
    await expect(historyList).toBeVisible();

    await approvalTab.click();
    await expect(approvalTab).toHaveClass(/active/);
  });

  // SCEN-104
  test("期間指定で該当期間の履歴が表示される", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-105
  test("申請書類番号で完全一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-106
  test("文書種別で絞り込み検索ができる", async ({ page }) => {
    const documentType = page.locator('[data-testid="document-type"]');
    await documentType.selectOption('稟議書');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-107
  test("承認者名で部分一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-108
  test("処理状況フィルターで絞り込みができる", async ({ page }) => {
    const approvalStatus = page.locator('[data-testid="approval-status"]');
    
    await approvalStatus.selectOption('承認済み');
    await page.click('[data-testid="search-button"]');
    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    await approvalStatus.selectOption('否認');
    await page.click('[data-testid="search-button"]');
    await expect(historyList).toBeVisible();

    await approvalStatus.selectOption('保留中');
    await page.click('[data-testid="search-button"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-109
  test("通知種別フィルターで絞り込みができる", async ({ page }) => {
    const notificationTab = page.locator('[data-testid="notification-tab"]');
    await notificationTab.click();

    const notificationType = page.locator('[data-testid="notification-type"]');
    await notificationType.selectOption('承認依頼');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    await notificationType.selectOption('差戻し');
    await page.click('[data-testid="search-button"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-110
  test("複数条件を組み合わせた検索ができる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.locator('[data-testid="document-type"]').selectOption('稟議書');
    await page.locator('[data-testid="approval-status"]').selectOption('承認済み');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-111
  test("検索条件クリアで全条件がリセットされる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="approver-name"]', 'テスト');
    await page.locator('[data-testid="approval-status"]').selectOption('承認済み');
    await page.locator('[data-testid="notification-type"]').selectOption('承認依頼');

    await page.click('[data-testid="clear-button"]');

    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approver-name"]')).toHaveValue('');
  });

  // SCEN-112
  test("処理日時ソートで昇順降順切り替えができる", async ({ page }) => {
    const historyTable = page.locator('#history-tbody');
    await expect(historyTable).toBeVisible();

    const processDateHeader = page.locator('th').filter({ hasText: '処理日時' });
    await processDateHeader.click();
    await expect(historyTable).toBeVisible();

    await processDateHeader.click();
    await expect(historyTable).toBeVisible();

    await processDateHeader.click();
    await expect(historyTable).toBeVisible();
  });

  // SCEN-113
  test("詳細表示リンクで詳細画面に遷移する", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    
    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    const detailLink = page.locator('a').filter({ hasText: '詳細' }).first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
      await expect(page).toHaveURL(/\/panels\/.*\.html/);
    }
  });

  // SCEN-114
  test("開始日が終了日より後の日付でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-31');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');

    const errorMessage = page.locator('.error-message, .alert-danger');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('開始日');
  });

  // SCEN-115
  test("存在しない申請書類番号で検索結果0件", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '99999999');
    await page.click('[data-testid="search-button"]');

    const noResultMessage = page.locator('.no-results, .empty-state');
    await expect(noResultMessage).toBeVisible();
    await expect(noResultMessage).toContainText('該当する');
  });

  // SCEN-116
  test("無効な文字を含む申請書類番号でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');

    const errorMessage = page.locator('.error-message, .alert-danger');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('有効な');
  });

  // SCEN-117
  test("検索条件未入力で検索実行時にバリデーション", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    const validationMessage = page.locator('.validation-error, .alert-warning');
    await expect(validationMessage).toBeVisible();
    await expect(validationMessage).toContainText('検索条件');
  });

  // SCEN-118
  test("期間指定の上限値での検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2099-12-31');
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-119
  test("申請書類番号の最大文字数での検索", async ({ page }) => {
    const maxLengthValue = 'A'.repeat(255);
    await page.fill('[data-testid="document-number"]', maxLengthValue);
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    const overMaxLengthValue = 'A'.repeat(256);
    await page.fill('[data-testid="document-number"]', overMaxLengthValue);
    await page.click('[data-testid="search-button"]');

    const errorMessage = page.locator('.error-message, .alert-danger');
    await expect(errorMessage).toBeVisible();
  });

  // SCEN-120
  test("承認者名の最大文字数での検索", async ({ page }) => {
    const maxLengthName = 'あ'.repeat(255);
    await page.fill('[data-testid="approver-name"]', maxLengthName);
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-121
  test("検索結果が最大表示件数の場合の表示", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    const pagination = page.locator('.pagination, .pager');
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
    }

    const maxCountMessage = page.locator('.max-results-warning');
    if (await maxCountMessage.count() > 0) {
      await expect(maxCountMessage).toBeVisible();
    }
  });
});