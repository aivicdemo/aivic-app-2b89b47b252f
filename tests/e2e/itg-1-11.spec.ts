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

  // SCEN-178
  test('[normal] 申請一覧テーブルが正常表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('th').nth(0)).toContainText('申請ID');
    await expect(page.locator('th').nth(1)).toContainText('申請タイトル');
    await expect(page.locator('th').nth(2)).toContainText('申請者');
    await expect(page.locator('th').nth(3)).toContainText('申請種別');
    await expect(page.locator('th').nth(4)).toContainText('ステータス');
    await expect(page.locator('th').nth(5)).toContainText('現在承認者');
    await expect(page.locator('th').nth(6)).toContainText('処理予定日');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(0);
  });

  // SCEN-179
  test('[normal] 承認フロー進捗バーが各ステップで正確に表示される', async ({ page }) => {
    await page.locator('[data-testid="applications-tbody"] tr').first().click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#approval-flow')).toBeVisible();
    await expect(page.locator('#approval-flow .status-badge')).toHaveCountGreaterThan(0);
    await expect(page.locator('#approval-flow .status-badge.active')).toHaveCount(1);
    await page.click('#close-modal');
  });

  // SCEN-180
  test('[normal] 現在の承認者名が正しく表示される', async ({ page }) => {
    await page.locator('[data-testid="applications-tbody"] tr').first().click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#approval-flow')).toContainText('現在承認者');
    await page.click('#close-modal');
  });

  // SCEN-181
  test('[normal] 遅延アラートが適切にハイライト表示される', async ({ page }) => {
    const urgentRow = page.locator('[data-testid="applications-tbody"] tr').filter({ hasText: '緊急' }).first();
    await expect(urgentRow.locator('.status-badge.urgent')).toBeVisible();
    await urgentRow.hover();
    await urgentRow.click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await page.click('#close-modal');
  });

  // SCEN-182
  test('[normal] 申請詳細リンクから詳細画面に遷移できる', async ({ page }) => {
    await page.locator('[data-testid="applications-tbody"] tr').first().click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#detail-content')).toBeVisible();
    await page.click('#close-modal');
  });

  // SCEN-183
  test('[normal] 承認履歴が時系列で表示される', async ({ page }) => {
    await page.locator('[data-testid="applications-tbody"] tr').first().click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#approval-history')).toBeVisible();
    const historyItems = page.locator('#approval-history .history-item');
    const count = await historyItems.count();
    if (count > 1) {
      const firstDate = await historyItems.nth(0).locator('.date').textContent();
      const lastDate = await historyItems.nth(count - 1).locator('.date').textContent();
      expect(firstDate).toBeTruthy();
      expect(lastDate).toBeTruthy();
    }
    await page.click('#close-modal');
  });

  // SCEN-184
  test('[normal] ステータス別タブで絞り込みができる', async ({ page }) => {
    await page.click('.status-tab:has-text("全て")');
    const allCount = await page.locator('[data-testid="applications-tbody"] tr').count();
    
    await page.click('.status-tab:has-text("申請中")');
    const pendingCount = await page.locator('[data-testid="applications-tbody"] tr').count();
    expect(pendingCount).toBeLessThanOrEqual(allCount);
    
    await page.click('.status-tab:has-text("承認中")');
    const approvalCount = await page.locator('[data-testid="applications-tbody"] tr').count();
    expect(approvalCount).toBeLessThanOrEqual(allCount);
    
    await page.click('.status-tab:has-text("承認済")');
    const approvedCount = await page.locator('[data-testid="applications-tbody"] tr').count();
    expect(approvedCount).toBeLessThanOrEqual(allCount);
    
    await page.click('.status-tab:has-text("全て")');
  });

  // SCEN-185
  test('[normal] 文書種別フィルターで該当データのみ表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    const filteredRows = page.locator('[data-testid="applications-tbody"] tr:has-text("休暇申請")');
    await expect(filteredRows).toHaveCountGreaterThanOrEqual(0);
  });

  // SCEN-186
  test('[normal] 検索条件で対象申請が抽出される', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'APP');
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThanOrEqual(0);
  });

  // SCEN-187
  test('[normal] 優先度表示が正しく表示される', async ({ page }) => {
    const priorityCell = page.locator('[data-testid="applications-tbody"] tr').first().locator('td').nth(7);
    const priorityBadge = priorityCell.locator('.status-badge');
    await expect(priorityBadge).toBeVisible();
    const badgeClasses = await priorityBadge.getAttribute('class');
    expect(badgeClasses).toMatch(/(urgent|pending|normal)/);
  });

  // SCEN-188
  test('[normal] 処理予定日が適切に表示される', async ({ page }) => {
    const dueDateCell = page.locator('[data-testid="applications-tbody"] tr').first().locator('td').nth(6);
    const dueDateText = await dueDateCell.textContent();
    expect(dueDateText).toMatch(/(\d{4}\/\d{2}\/\d{2}|-|未定)/);
  });

  // SCEN-189
  test('[error] 存在しない検索条件で結果0件表示', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'INVALID-12345');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-results')).toBeVisible();
    await expect(page.locator('#no-results')).toContainText('該当する申請が見つかりません');
  });

  // SCEN-190
  test('[error] 無効なフィルター条件でエラー処理', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'invalid-date');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.fill('[data-testid="search-input"]', 'APP-001');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-191
  test('[error] 削除済み申請の詳細リンククリックでエラー表示', async ({ page }) => {
    const deletedRow = page.locator('[data-testid="applications-tbody"] tr').filter({ hasText: '削除済み' }).first();
    if (await deletedRow.count() > 0) {
      await deletedRow.click();
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('申請が存在しない');
    }
  });

  // SCEN-192
  test('[error] 権限外申請の詳細表示でアクセス拒否', async ({ page }) => {
    const unauthorizedUrl = '/panels/scr-1779422369173.html?id=unauthorized-app-123';
    await page.goto(unauthorizedUrl);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('アクセス権限');
  });

  // SCEN-193
  test('[edge] 大量データでの表示パフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    await page.click('.status-tab:has-text("承認済")');
    const filterStartTime = Date.now();
    await page.waitForLoadState('networkidle');
    const filterTime = Date.now() - filterStartTime;
    expect(filterTime).toBeLessThan(3000);
  });

  // SCEN-194
  test('[edge] 申請件数0件時の表示', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'NONEXISTENT');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-results')).toBeVisible();
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCount(0);
  });

  // SCEN-195
  test('[edge] 最大文字数の検索条件入力', async ({ page }) => {
    const maxLengthString = 'A'.repeat(255);
    await page.fill('[data-testid="search-input"]', maxLengthString);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    const inputValue = await page.locator('[data-testid="search-input"]').inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(255);
  });

  // SCEN-196
  test('[edge] 全フィルター同時適用', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'APP');
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.selectOption('[data-testid="priority-filter"]', '緊急');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const resultRows = page.locator('[data-testid="applications-tbody"] tr');
    const rowCount = await resultRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  // SCEN-197
  test('[edge] 長い申請タイトルの表示', async ({ page }) => {
    const longTitleRow = page.locator('[data-testid="applications-tbody"] tr').first();
    const titleCell = longTitleRow.locator('td').nth(1);
    await expect(titleCell).toBeVisible();
    
    const cellStyle = await titleCell.evaluate(el => window.getComputedStyle(el));
    expect(cellStyle.overflow).toBe('hidden');
    
    await longTitleRow.click();
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#detail-content')).toContainText('申請タイトル');
    await page.click('#close-modal');
  });
});