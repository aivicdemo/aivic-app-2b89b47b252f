import { test, expect } from '@playwright/test';

test.describe("進捗確認画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422369173.html");
  });

  test("SCEN-178: 申請一覧テーブルが正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="progress-list"]')).toBeVisible();
    await expect(page.locator('#tbody-progress')).toBeVisible();
    const tableHeaders = page.locator('th');
    await expect(tableHeaders).toContainText(['申請ID', '申請種別', '申請タイトル', '申請者', '進捗', '現在承認者', '優先度', '期限日', '操作']);
    const firstRow = page.locator('#tbody-progress tr').first();
    await expect(firstRow).toBeVisible();
  });

  test("SCEN-179: 承認フロー進捗バーが各ステップで正確に表示される", async ({ page }) => {
    const firstRowFlowButton = page.locator('#tbody-progress tr').first().locator('button:has-text("フロー")');
    await firstRowFlowButton.click();
    await expect(page.locator('#modal-flow')).toBeVisible();
    const progressSteps = page.locator('#flow-content .progress-step');
    await expect(progressSteps).toHaveCount(4);
    const currentStep = page.locator('#flow-content .current');
    await expect(currentStep).toBeVisible();
    const completedSteps = page.locator('#flow-content .completed');
    await expect(completedSteps.first()).toBeVisible();
    await page.click('#btn-close-modal');
  });

  test("SCEN-180: 現在の承認者名が正しく表示される", async ({ page }) => {
    const approverCell = page.locator('#tbody-progress tr').first().locator('td').nth(5);
    await expect(approverCell).toContainText('田中部長');
  });

  test("SCEN-181: 遅延アラートが適切にハイライト表示される", async ({ page }) => {
    const delayedRow = page.locator('#tbody-progress tr:has-text("⚠ 遅延")');
    await expect(delayedRow).toBeVisible();
    await expect(delayedRow).toHaveClass(/delay/);
    await delayedRow.hover();
    await expect(page.locator('.tooltip')).toContainText('期限を過ぎています');
  });

  test("SCEN-182: 申請詳細リンクから詳細画面に遷移できる", async ({ page }) => {
    const detailButton = page.locator('#tbody-progress tr').first().locator('button:has-text("詳細")');
    await detailButton.click();
    await expect(page).toHaveURL(/application-detail/);
  });

  test("SCEN-183: 承認履歴が時系列で表示される", async ({ page }) => {
    const firstRowFlowButton = page.locator('#tbody-progress tr').first().locator('button:has-text("フロー")');
    await firstRowFlowButton.click();
    await expect(page.locator('#approval-history')).toBeVisible();
    const historyItems = page.locator('#history-list .history-item');
    await expect(historyItems).toHaveCountGreaterThan(0);
    const firstHistoryDate = await historyItems.first().locator('.history-date').textContent();
    const secondHistoryDate = await historyItems.nth(1).locator('.history-date').textContent();
    expect(new Date(firstHistoryDate)).toBeGreaterThan(new Date(secondHistoryDate));
    await page.click('#btn-close-modal');
  });

  test("SCEN-184: ステータス別タブで絞り込みができる", async ({ page }) => {
    await page.click('button:has-text("申請中")');
    const rows = page.locator('#tbody-progress tr');
    await expect(rows.first().locator('td').nth(4)).toContainText('申請中');
    
    await page.click('button:has-text("承認済")');
    await expect(rows.first().locator('td').nth(4)).toContainText('承認済');
    
    await page.click('button:has-text("全て")');
    await expect(rows).toHaveCountGreaterThan(0);
  });

  test("SCEN-185: 文書種別フィルターで該当データのみ表示される", async ({ page }) => {
    await page.selectOption('[data-testid="doctype-filter"]', '休暇申請');
    const rows = page.locator('#tbody-progress tr');
    await expect(rows.first().locator('td').nth(1)).toContainText('休暇申請');
  });

  test("SCEN-186: 検索条件で対象申請が抽出される", async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'AP001');
    await page.selectOption('[data-testid="status-filter"]', '申請中');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#tbody-progress tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator('td').first()).toContainText('AP001');
  });

  test("SCEN-187: 優先度表示が正しく表示される", async ({ page }) => {
    const priorityCell = page.locator('#tbody-progress tr').first().locator('td').nth(6);
    await expect(priorityCell).toContainText(['高', '中', '低']);
    const highPriorityRow = page.locator('#tbody-progress tr:has-text("高")');
    await expect(highPriorityRow.locator('.priority-high')).toBeVisible();
  });

  test("SCEN-188: 処理予定日が適切に表示される", async ({ page }) => {
    const dueDateCell = page.locator('#tbody-progress tr').first().locator('td').nth(7);
    const dueDateText = await dueDateCell.textContent();
    expect(dueDateText).toMatch(/\d{4}\/\d{2}\/\d{2}/);
  });

  test("SCEN-189: 存在しない検索条件で結果0件表示", async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'INVALID-12345');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('.no-results')).toContainText('該当する申請が見つかりません');
  });

  test("SCEN-190: 無効なフィルター条件でエラー処理", async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'invalid-date');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('.error-message')).toContainText('検索条件が正しくありません');
  });

  test("SCEN-191: 削除済み申請の詳細リンククリックでエラー表示", async ({ page }) => {
    const deletedRow = page.locator('#tbody-progress tr:has-text("削除済み")');
    const detailButton = deletedRow.locator('button:has-text("詳細")');
    await detailButton.click();
    await expect(page.locator('.error-dialog')).toContainText('申請が存在しません');
  });

  test("SCEN-192: 権限外申請の詳細表示でアクセス拒否", async ({ page }) => {
    await page.goto(`/panels/application-detail.html?id=unauthorized`);
    await expect(page.locator('.access-denied')).toContainText('アクセスが拒否されました');
  });

  test("SCEN-193: 大量データでの表示パフォーマンス", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/panels/scr-1779422369173.html");
    await page.waitForSelector('#tbody-progress tr');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    const nextPageButton = page.locator('button:has-text("次のページ")');
    const pageStartTime = Date.now();
    await nextPageButton.click();
    await page.waitForSelector('#tbody-progress tr');
    const pageTime = Date.now() - pageStartTime;
    expect(pageTime).toBeLessThan(3000);
  });

  test("SCEN-194: 申請件数0件時の表示", async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'NONEXISTENT');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('.empty-state')).toContainText('申請データがありません');
    await expect(page.locator('#tbody-progress tr')).toHaveCount(0);
  });

  test("SCEN-195: 最大文字数の検索条件入力", async ({ page }) => {
    const maxLengthText = 'A'.repeat(255);
    await page.fill('[data-testid="search-input"]', maxLengthText);
    await page.click('[data-testid="search-button"]');
    const inputValue = await page.locator('[data-testid="search-input"]').inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(255);
  });

  test("SCEN-196: 全フィルター同時適用", async ({ page }) => {
    await page.selectOption('[data-testid="status-filter"]', '申請中');
    await page.selectOption('[data-testid="doctype-filter"]', '経費申請');
    await page.fill('[data-testid="search-input"]', '田中');
    await page.click('[data-testid="search-button"]');
    
    const rows = page.locator('#tbody-progress tr');
    await expect(rows.first().locator('td').nth(1)).toContainText('経費申請');
    await expect(rows.first().locator('td').nth(4)).toContainText('申請中');
    await expect(rows.first().locator('td').nth(3)).toContainText('田中');
  });

  test("SCEN-197: 長い申請タイトルの表示", async ({ page }) => {
    const longTitle = '令和6年度第1四半期における全社的なデジタルトランスフォーメーション推進に関する予算申請及び人員配置計画の承認依頼について（緊急案件）';
    const titleCell = page.locator('#tbody-progress tr:has-text("' + longTitle.substring(0, 20) + '")').first().locator('td').nth(2);
    await expect(titleCell).toBeVisible();
    const titleText = await titleCell.textContent();
    expect(titleText.includes('...')).toBeTruthy();
  });
});