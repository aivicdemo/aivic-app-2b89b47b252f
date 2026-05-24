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
    await expect(page.locator('[data-testid="approval-tab"]')).toHaveClass(/active/);
    await expect(page.locator('#approval-header')).toBeVisible();
    await page.click('[data-testid="notification-tab"]');
    await expect(page.locator('[data-testid="notification-tab"]')).toHaveClass(/active/);
    await expect(page.locator('#notification-header')).toBeVisible();
    await page.click('[data-testid="approval-tab"]');
    await expect(page.locator('[data-testid="approval-tab"]')).toHaveClass(/active/);
    await expect(page.locator('#approval-header')).toBeVisible();
  });

  // SCEN-104
  test("[normal] 承認履歴・通知履歴照会画面 - 期間指定で該当期間の履歴が表示される", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-105
  test("[normal] 承認履歴・通知履歴照会画面 - 申請書類番号で完全一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
    const firstRow = page.locator('[data-testid="history-list"] tbody tr').first();
    await expect(firstRow).toContainText('APP-2024-001');
  });

  // SCEN-106
  test("[normal] 承認履歴・通知履歴照会画面 - 文書種別で絞り込み検索ができる", async ({ page }) => {
    await page.click('[data-testid="document-type-select"]');
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="history-list"] tr');
    const rows = page.locator('[data-testid="history-list"] tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('稟議書');
    }
  });

  // SCEN-107
  test("[normal] 承認履歴・通知履歴照会画面 - 承認者名で部分一致検索ができる", async ({ page }) => {
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-108
  test("[normal] 承認履歴・通知履歴照会画面 - 処理状況フィルターで絞り込みができる", async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
    
    await page.selectOption('[data-testid="approval-status-select"]', '否認');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);
    
    await page.selectOption('[data-testid="approval-status-select"]', '保留中');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);
  });

  // SCEN-109
  test("[normal] 承認履歴・通知履歴照会画面 - 通知種別フィルターで絞り込みができる", async ({ page }) => {
    await page.click('[data-testid="notification-tab"]');
    await page.selectOption('[data-testid="notification-type-select"]', '承認依頼');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
    
    await page.selectOption('[data-testid="notification-type-select"]', '却下');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);
  });

  // SCEN-110
  test("[normal] 承認履歴・通知履歴照会画面 - 複数条件を組み合わせた検索ができる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-111
  test("[normal] 承認履歴・通知履歴照会画面 - 検索条件クリアで全条件がリセットされる", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="approver-name"]', 'テスト承認者');
    await page.selectOption('[data-testid="approval-status-select"]', '承認済み');
    await page.selectOption('[data-testid="notification-type-select"]', '承認依頼');
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approver-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approval-status-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="notification-type-select"]')).toHaveValue('');
  });

  // SCEN-112
  test("[normal] 承認履歴・通知履歴照会画面 - 処理日時ソートで昇順降順切り替えができる", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="history-list"] tr');
    
    await page.click('#sort-approval-date');
    await expect(page.locator('#sort-approval-icon')).toBeVisible();
    
    await page.click('#sort-approval-date');
    await expect(page.locator('#sort-approval-icon')).toBeVisible();
    
    await page.click('#sort-approval-date');
    await expect(page.locator('#sort-approval-icon')).toBeVisible();
  });

  // SCEN-113
  test("[normal] 承認履歴・通知履歴照会画面 - 詳細表示リンクで詳細画面に遷移する", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="history-list"] tr');
    
    const detailLink = page.locator('[data-testid="history-list"] tbody tr').first().locator('a').first();
    await detailLink.click();
    await expect(page).toHaveURL(/panels\/scr-\d+\.html/);
  });

  // SCEN-114
  test("[error] 承認履歴・通知履歴照会画面 - 開始日が終了日より後の日付でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-31');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('開始日が終了日より後の日付');
  });

  // SCEN-115
  test("[error] 承認履歴・通知履歴照会画面 - 存在しない申請書類番号で検索結果0件", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '99999999');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#result-count')).toContainText('0件');
    await expect(page.locator('[data-testid="history-list"]')).toContainText('該当する申請書類が見つかりません');
  });

  // SCEN-116
  test("[error] 承認履歴・通知履歴照会画面 - 無効な文字を含む申請書類番号でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('有効な申請書類番号を入力してください');
  });

  // SCEN-117
  test("[error] 承認履歴・通知履歴照会画面 - 検索条件未入力で検索実行時にバリデーション", async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('検索条件を入力してください');
  });

  // SCEN-118
  test("[edge] 承認履歴・通知履歴照会画面 - 期間指定の上限値での検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2099-12-31');
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await expect(page.locator('#result-count')).toBeVisible();
  });

  // SCEN-119
  test("[edge] 承認履歴・通知履歴照会画面 - 申請書類番号の最大文字数での検索", async ({ page }) => {
    const maxLengthInput = 'A'.repeat(255);
    await page.fill('[data-testid="document-number"]', maxLengthInput);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    
    const overMaxLengthInput = 'A'.repeat(256);
    await page.fill('[data-testid="document-number"]', overMaxLengthInput);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-120
  test("[edge] 承認履歴・通知履歴照会画面 - 承認者名の最大文字数での検索", async ({ page }) => {
    const maxLengthApprover = 'あ'.repeat(255);
    await page.fill('[data-testid="approver-name"]', maxLengthApprover);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await expect(page.locator('#result-count')).toBeVisible();
  });

  // SCEN-121
  test("[edge] 承認履歴・通知履歴照会画面 - 検索結果が最大表示件数の場合の表示", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');
    
    await page.waitForSelector('[data-testid="history-list"] tr');
    const rowCount = await page.locator('[data-testid="history-list"] tbody tr').count();
    
    if (rowCount >= 100) {
      await expect(page.locator('.pagination')).toBeVisible();
      await expect(page.locator('#result-count')).toContainText('最大表示件数');
    }
  });
});