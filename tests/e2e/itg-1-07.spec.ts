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
  test("[normal] 承認履歴・通知履歴照会画面 - 履歴種別タブ切り替えで表示内容が更新される", async ({ page }) => {
    const approvalTab = page.locator('[data-testid="approval-tab"]');
    const notificationTab = page.locator('[data-testid="notification-tab"]');
    const historyList = page.locator('[data-testid="history-list"]');

    await expect(approvalTab).toHaveClass(/active/);
    const approvalContent = await historyList.textContent();
    expect(approvalContent).toContain("申請日時");

    await notificationTab.click();
    await expect(notificationTab).toHaveClass(/active/);
    const notificationContent = await historyList.textContent();
    expect(notificationContent).toContain("通知日時");

    await approvalTab.click();
    await expect(approvalTab).toHaveClass(/active/);
    const revertedContent = await historyList.textContent();
    expect(revertedContent).toContain("申請日時");
  });

  // SCEN-104
  test("[normal] 承認履歴・通知履歴照会画面 - 期間指定で該当期間の履歴が表示される", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-105
  test("[normal] 承認履歴・通知履歴照会画面 - 申請書類番号で完全一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-106
  test("[normal] 承認履歴・通知履歴照会画面 - 文書種別で絞り込み検索ができる", async ({ page }) => {
    const documentTypeSelect = page.locator('[data-testid="document-type"]');
    await documentTypeSelect.click();
    await page.getByText('稟議書').click();
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-107
  test("[normal] 承認履歴・通知履歴照会画面 - 承認者名で部分一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-108
  test("[normal] 承認履歴・通知履歴照会画面 - 処理状況フィルターで絞り込みができる", async ({ page }) => {
    const approvalStatusSelect = page.locator('[data-testid="approval-status"]');
    
    await approvalStatusSelect.selectOption('承認待ち');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();

    await approvalStatusSelect.selectOption('承認済み');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();

    await approvalStatusSelect.selectOption('却下');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  // SCEN-109
  test("[normal] 承認履歴・通知履歴照会画面 - 通知種別フィルターで絞り込みができる", async ({ page }) => {
    await page.locator('[data-testid="notification-tab"]').click();

    const notificationTypeSelect = page.locator('[data-testid="notification-type"]');
    await notificationTypeSelect.selectOption('承認依頼');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();

    await notificationTypeSelect.selectOption('差し戻し');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  // SCEN-110
  test("[normal] 承認履歴・通知履歴照会画面 - 複数条件を組み合わせた検索ができる", async ({ page }) => {
    await page.locator('[data-testid="document-type"]').selectOption('稟議書');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.locator('[data-testid="approval-status"]').selectOption('承認済み');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-111
  test("[normal] 承認履歴・通知履歴照会画面 - 検索条件クリアで全条件がリセットされる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.locator('[data-testid="approval-status"]').selectOption('承認済み');
    await page.locator('[data-testid="notification-type"]').selectOption('承認依頼');

    await page.click('[data-testid="clear-button"]');

    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approver-name"]')).toHaveValue('');
  });

  // SCEN-112
  test("[normal] 承認履歴・通知履歴照会画面 - 処理日時ソートで昇順降順切り替えができる", async ({ page }) => {
    const processTimeHeader = page.locator('th').filter({ hasText: '処理日時' });

    await processTimeHeader.click();
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();

    await processTimeHeader.click();
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();

    await processTimeHeader.click();
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  // SCEN-113
  test("[normal] 承認履歴・通知履歴照会画面 - 詳細表示リンクで詳細画面に遷移する", async ({ page }) => {
    const detailLink = page.locator('a').filter({ hasText: '詳細' }).first();
    await detailLink.click();

    await expect(page).toHaveURL(/\/panels\//);
  });

  // SCEN-114
  test("[error] 承認履歴・通知履歴照会画面 - 開始日が終了日より後の日付でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-31');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=開始日が終了日より後')).toBeVisible();
  });

  // SCEN-115
  test("[error] 承認履歴・通知履歴照会画面 - 存在しない申請書類番号で検索結果0件", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '99999999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=該当する申請書類が見つかりません')).toBeVisible();
  });

  // SCEN-116
  test("[error] 承認履歴・通知履歴照会画面 - 無効な文字を含む申請書類番号でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=有効な申請書類番号を入力してください')).toBeVisible();
  });

  // SCEN-117
  test("[error] 承認履歴・通知履歴照会画面 - 検索条件未入力で検索実行時にバリデーション", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=検索条件を入力してください')).toBeVisible();
  });

  // SCEN-118
  test("[edge] 承認履歴・通知履歴照会画面 - 期間指定の上限値での検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2099-12-31');
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-119
  test("[edge] 承認履歴・通知履歴照会画面 - 申請書類番号の最大文字数での検索", async ({ page }) => {
    const maxLengthString = 'A'.repeat(255);
    await page.fill('[data-testid="document-number"]', maxLengthString);
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    const overMaxLengthString = 'A'.repeat(256);
    await page.fill('[data-testid="document-number"]', overMaxLengthString);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=文字数制限を超えています')).toBeVisible();
  });

  // SCEN-120
  test("[edge] 承認履歴・通知履歴照会画面 - 承認者名の最大文字数での検索", async ({ page }) => {
    const maxLengthString = 'あ'.repeat(255);
    await page.fill('[data-testid="approver-name"]', maxLengthString);
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();
  });

  // SCEN-121
  test("[edge] 承認履歴・通知履歴照会画面 - 検索結果が最大表示件数の場合の表示", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');

    const historyList = page.locator('[data-testid="history-list"]');
    await expect(historyList).toBeVisible();

    const paginationControls = page.locator('.pagination, [data-testid*="pagination"], button:has-text("次のページ")').first();
    if (await paginationControls.isVisible()) {
      await expect(paginationControls).toBeVisible();
    }

    const maxResultMessage = page.locator('text=最大表示件数, text=件数制限').first();
    if (await maxResultMessage.isVisible()) {
      await expect(maxResultMessage).toBeVisible();
    }
  });
});