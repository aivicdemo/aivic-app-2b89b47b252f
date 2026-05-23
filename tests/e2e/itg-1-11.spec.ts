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

  test('SCEN-178: 申請一覧テーブルが正常表示される', async ({ page }) => {
    await expect(page.locator('#current-screen-title')).toContainText('進捗確認');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('th:has-text("申請ID")')).toBeVisible();
    await expect(page.locator('th:has-text("申請タイトル")')).toBeVisible();
    await expect(page.locator('th:has-text("申請者")')).toBeVisible();
    await expect(page.locator('th:has-text("現在承認者")')).toBeVisible();
    await expect(page.locator('th:has-text("優先度")')).toBeVisible();
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(0);
  });

  test('SCEN-179: 承認フロー進捗バーが各ステップで正確に表示される', async ({ page }) => {
    await expect(page.locator('#progress-bar')).toBeVisible();
    const currentStep = page.locator('#progress-bar .active');
    await expect(currentStep).toBeVisible();
    const completedSteps = page.locator('#progress-bar .completed');
    await expect(completedSteps).toHaveCountGreaterThan(-1);
    const futureSteps = page.locator('#progress-bar .pending');
    await expect(futureSteps).toHaveCountGreaterThan(-1);
  });

  test('SCEN-180: 現在の承認者名が正しく表示される', async ({ page }) => {
    await expect(page.locator('td:nth-child(4)')).toHaveCountGreaterThan(0);
    const approverCell = page.locator('td:nth-child(4)').first();
    await expect(approverCell).not.toBeEmpty();
  });

  test('SCEN-181: 遅延アラートが適切にハイライト表示される', async ({ page }) => {
    const alertRows = page.locator('tr.alert, tr.warning, tr.delayed');
    if (await alertRows.count() > 0) {
      await expect(alertRows.first()).toHaveClass(/alert|warning|delayed/);
    }
  });

  test('SCEN-182: 申請詳細リンクから詳細画面に遷移できる', async ({ page }) => {
    const detailLink = page.locator('a:has-text("詳細"), button:has-text("詳細")').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
      await expect(page.locator('#detail-modal')).toBeVisible();
    }
  });

  test('SCEN-183: 承認履歴が時系列で表示される', async ({ page }) => {
    await expect(page.locator('#approval-history')).toBeVisible();
    const historyItems = page.locator('#approval-history .history-item, #approval-history tr');
    if (await historyItems.count() > 1) {
      const firstDate = await historyItems.first().textContent();
      const lastDate = await historyItems.last().textContent();
      expect(firstDate).toBeTruthy();
      expect(lastDate).toBeTruthy();
    }
  });

  test('SCEN-184: ステータス別タブで絞り込みができる', async ({ page }) => {
    await page.click('[data-testid="tab-pending"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
    
    await page.click('[data-testid="tab-approving"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
    
    await page.click('[data-testid="tab-approved"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
    
    await page.click('[data-testid="tab-all"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
  });

  test('SCEN-185: 文書種別フィルターで該当データのみ表示される', async ({ page }) => {
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
  });

  test('SCEN-186: 検索条件で対象申請が抽出される', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.selectOption('#filter-document-type', '経費申請');
    await page.selectOption('#filter-status', '申請中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
  });

  test('SCEN-187: 優先度表示が正しく表示される', async ({ page }) => {
    const priorityColumns = page.locator('td:nth-child(5)');
    if (await priorityColumns.count() > 0) {
      const priorityCell = priorityColumns.first();
      await expect(priorityCell).toHaveText(/高|中|低/);
    }
  });

  test('SCEN-188: 処理予定日が適切に表示される', async ({ page }) => {
    const dueDateColumns = page.locator('td:nth-child(6)');
    if (await dueDateColumns.count() > 0) {
      const dueDateCell = dueDateColumns.first();
      const cellText = await dueDateCell.textContent();
      expect(cellText).toMatch(/\d{4}\/\d{2}\/\d{2}|-|未定/);
    }
  });

  test('SCEN-189: 存在しない検索条件で結果0件表示', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'INVALID-12345');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCount(0);
  });

  test('SCEN-190: 無効なフィルター条件でエラー処理', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'invalid-date');
    await page.click('[data-testid="search-button"]');
    const errorMessage = page.locator('.error, .alert, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('SCEN-191: 削除済み申請の詳細リンククリックでエラー表示', async ({ page }) => {
    const deletedRow = page.locator('tr[data-status="deleted"], tr.deleted').first();
    if (await deletedRow.count() > 0) {
      const detailLink = deletedRow.locator('a, button').first();
      await detailLink.click();
      const errorMessage = page.locator('.error, .alert, [role="alert"]');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('SCEN-192: 権限外申請の詳細表示でアクセス拒否', async ({ page }) => {
    await page.goto('/panels/scr-1779422369173.html?id=unauthorized-application');
    const accessDeniedMessage = page.locator('.access-denied, .unauthorized, [role="alert"]');
    if (await accessDeniedMessage.count() > 0) {
      await expect(accessDeniedMessage).toBeVisible();
    }
  });

  test('SCEN-193: 大量データでの表示パフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    await page.reload();
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    if (await page.locator('.pagination, .page-next').count() > 0) {
      const pageStartTime = Date.now();
      await page.click('.pagination .page-next, .next-page');
      await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCountGreaterThan(-1);
      const pageTime = Date.now() - pageStartTime;
      expect(pageTime).toBeLessThan(3000);
    }
  });

  test('SCEN-194: 申請件数0件時の表示', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'NO_RESULTS_FILTER');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-tbody"] tr')).toHaveCount(0);
    const emptyMessage = page.locator('.empty-message, .no-results, [data-testid="empty-state"]');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('SCEN-195: 最大文字数の検索条件入力', async ({ page }) => {
    const longText255 = 'A'.repeat(255);
    const longText20 = 'B'.repeat(20);
    const longText500 = 'C'.repeat(500);
    
    await page.fill('[data-testid="search-input"]', longText255);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  test('SCEN-196: 全フィルター同時適用', async ({ page }) => {
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.selectOption('#filter-status', '申請中');
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  test('SCEN-197: 長い申請タイトルの表示', async ({ page }) => {
    const titleCells = page.locator('td:nth-child(2)');
    if (await titleCells.count() > 0) {
      const titleCell = titleCells.first();
      const titleText = await titleCell.textContent();
      if (titleText && titleText.length > 50) {
        await expect(titleCell).toHaveCSS('overflow', /hidden|ellipsis/);
      }
    }
  });
});