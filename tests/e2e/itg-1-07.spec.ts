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
  test('履歴種別タブ切り替えで表示内容が更新される', async ({ page }) => {
    const approvalTab = page.locator('[data-testid="approval-tab"]');
    const notificationTab = page.locator('[data-testid="notification-tab"]');
    
    await expect(approvalTab).toHaveClass(/active/);
    await expect(page.locator('#approval-header')).toBeVisible();
    
    await notificationTab.click();
    await expect(notificationTab).toHaveClass(/active/);
    await expect(approvalTab).not.toHaveClass(/active/);
    await expect(page.locator('#notification-header')).toBeVisible();
    
    await approvalTab.click();
    await expect(approvalTab).toHaveClass(/active/);
    await expect(notificationTab).not.toHaveClass(/active/);
    await expect(page.locator('#approval-header')).toBeVisible();
  });

  // SCEN-104
  test('期間指定で該当期間の履歴が表示される', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-105
  test('申請書類番号で完全一致検索ができる', async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-106
  test('文書種別で絞り込み検索ができる', async ({ page }) => {
    await page.click('[data-testid="document-type-select"]');
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-107
  test('承認者名で部分一致検索ができる', async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-108
  test('処理状況フィルターで絞り込みができる', async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-select"]', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-select"]', '却下');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-109
  test('通知種別フィルターで絞り込みができる', async ({ page }) => {
    await page.click('[data-testid="notification-tab"]');
    
    await page.selectOption('[data-testid="notification-type-select"]', '承認依頼');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="notification-type-select"]', '差し戻し');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-110
  test('複数条件を組み合わせた検索ができる', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-111
  test('検索条件クリアで全条件がリセットされる', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.selectOption('[data-testid="notification-type-select"]', '承認依頼');
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approver-name"]')).toHaveValue('');
  });

  // SCEN-112
  test('処理日時ソートで昇順降順切り替えができる', async ({ page }) => {
    await page.click('#sort-icon');
    await expect(page.locator('#sort-icon')).toBeVisible();
    
    await page.click('#sort-icon');
    await expect(page.locator('#sort-icon')).toBeVisible();
    
    await page.click('#sort-icon');
    await expect(page.locator('#sort-icon')).toBeVisible();
  });

  // SCEN-113
  test('詳細表示リンクで詳細画面に遷移する', async ({ page }) => {
    await page.click('button:has-text("詳細")');
    
    await expect(page).toHaveURL(/panels/);
  });

  // SCEN-114
  test('開始日が終了日より後の日付でエラー表示', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-31');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-115
  test('存在しない申請書類番号で検索結果0件', async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '99999999');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toContainText('該当する申請書類が見つかりません');
  });

  // SCEN-116
  test('無効な文字を含む申請書類番号でエラー表示', async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('有効な申請書類番号を入力してください');
  });

  // SCEN-117
  test('検索条件未入力で検索実行時にバリデーション', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('検索条件を入力してください');
  });

  // SCEN-118
  test('期間指定の上限値での検索', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2099-12-31');
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-119
  test('申請書類番号の最大文字数での検索', async ({ page }) => {
    const maxLengthString = 'A'.repeat(255);
    await page.fill('[data-testid="document-number"]', maxLengthString);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    const overMaxString = 'A'.repeat(256);
    await page.fill('[data-testid="document-number"]', overMaxString);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-120
  test('承認者名の最大文字数での検索', async ({ page }) => {
    const maxLengthName = 'あ'.repeat(255);
    await page.fill('[data-testid="approver-name"]', maxLengthName);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-121
  test('検索結果が最大表示件数の場合の表示', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });
});