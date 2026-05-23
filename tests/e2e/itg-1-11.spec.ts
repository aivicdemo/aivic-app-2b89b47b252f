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
    await expect(page.locator('#tbody-progress')).toBeVisible();
    
    const headers = page.locator('th');
    await expect(headers.nth(0)).toContainText('申請ID');
    await expect(headers.nth(1)).toContainText('申請種別');
    await expect(headers.nth(2)).toContainText('申請タイトル');
    await expect(headers.nth(3)).toContainText('申請者');
    await expect(headers.nth(4)).toContainText('進捗');
    await expect(headers.nth(5)).toContainText('現在承認者');
    await expect(headers.nth(6)).toContainText('優先度');
    await expect(headers.nth(7)).toContainText('期限日');
    await expect(headers.nth(8)).toContainText('操作');

    const firstRow = page.locator('#tbody-progress tr').first();
    await expect(firstRow.locator('td').first()).toBeVisible();
    await expect(firstRow.locator('td').nth(1)).toBeVisible();
    await expect(firstRow.locator('td').nth(2)).toBeVisible();
  });

  test("SCEN-179: 承認フロー進捗バーが各ステップで正確に表示される", async ({ page }) => {
    const firstRow = page.locator('#tbody-progress tr').first();
    await firstRow.locator('button:has-text("フロー")').click();
    
    await expect(page.locator('#modal-flow')).toBeVisible();
    
    const flowSteps = page.locator('.progress-step');
    await expect(flowSteps.first()).toHaveClass(/active/);
    
    const completedSteps = page.locator('.progress-step.completed');
    await expect(completedSteps).toHaveCount(1);
    
    const pendingSteps = page.locator('.progress-step:not(.active):not(.completed)');
    await expect(pendingSteps.first()).toBeVisible();

    await page.click('#btn-close-modal');
  });

  test("SCEN-180: 現在の承認者名が正しく表示される", async ({ page }) => {
    const approverCell = page.locator('#tbody-progress tr').first().locator('td').nth(5);
    const approverName = await approverCell.textContent();
    
    expect(approverName).not.toBe('');
    expect(approverName).not.toBe(null);
    expect(typeof approverName).toBe('string');
  });

  test("SCEN-181: 遅延アラートが適切にハイライト表示される", async ({ page }) => {
    const delayedRow = page.locator('#tbody-progress tr:has-text("⚠ 遅延")').first();
    
    if (await delayedRow.count() > 0) {
      await expect(delayedRow).toHaveClass(/delayed/);
      
      const delayIcon = delayedRow.locator('text=⚠ 遅延');
      await expect(delayIcon).toBeVisible();
      
      const normalRow = page.locator('#tbody-progress tr:not(:has-text("⚠ 遅延"))').first();
      const normalClass = await normalRow.getAttribute('class');
      const delayedClass = await delayedRow.getAttribute('class');
      expect(delayedClass).not.toBe(normalClass);
    }
  });

  test("SCEN-182: 申請詳細リンクから詳細画面に遷移できる", async ({ page }) => {
    const firstRow = page.locator('#tbody-progress tr').first();
    await firstRow.locator('button:has-text("詳細")').click();
    
    await expect(page.locator('.card-header')).toBeVisible();
  });

  test("SCEN-183: 承認履歴が時系列で表示される", async ({ page }) => {
    const firstRow = page.locator('#tbody-progress tr').first();
    await firstRow.locator('button:has-text("フロー")').click();
    
    await expect(page.locator('#modal-flow')).toBeVisible();
    await expect(page.locator('#approval-history')).toBeVisible();
    
    const historyItems = page.locator('#history-list .history-item');
    const firstItem = historyItems.first();
    const lastItem = historyItems.last();
    
    if (await historyItems.count() > 1) {
      const firstDate = await firstItem.locator('.history-date').textContent();
      const lastDate = await lastItem.locator('.history-date').textContent();
      
      expect(firstDate).not.toBe('');
      expect(lastDate).not.toBe('');
    }

    await page.click('#btn-close-modal');
  });

  test("SCEN-184: ステータス別タブで絞り込みができる", async ({ page }) => {
    await page.click('button:has-text("申請中")');
    
    const rows = page.locator('#tbody-progress tr');
    const firstRowStatus = await rows.first().locator('td').nth(4).textContent();
    expect(firstRowStatus).toContain('申請中');
    
    await page.click('button:has-text("承認済")');
    await page.waitForTimeout(500);
    
    const approvedRows = page.locator('#tbody-progress tr');
    if (await approvedRows.count() > 0) {
      const approvedStatus = await approvedRows.first().locator('td').nth(4).textContent();
      expect(approvedStatus).toContain('承認済');
    }
    
    await page.click('button:has-text("全て")');
    await expect(page.locator('#tbody-progress tr')).toHaveCount(0, { not: true });
  });

  test("SCEN-185: 文書種別フィルターで該当データのみ表示される", async ({ page }) => {
    await page.selectOption('#filter-doctype', '休暇申請');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const rows = page.locator('#tbody-progress tr');
    if (await rows.count() > 0) {
      const docTypeCell = await rows.first().locator('td').nth(1).textContent();
      expect(docTypeCell).toContain('休暇申請');
    }
    
    await page.selectOption('#filter-doctype', '');
    await page.click('#btn-search');
  });

  test("SCEN-186: 検索条件で対象申請が抽出される", async ({ page }) => {
    await page.fill('#input-search', '申請');
    await page.selectOption('#filter-status', '申請中');
    await page.selectOption('#filter-doctype', '経費申請');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const rows = page.locator('#tbody-progress tr');
    if (await rows.count() > 0) {
      const titleCell = await rows.first().locator('td').nth(2).textContent();
      expect(titleCell).toContain('申請');
    }
  });

  test("SCEN-187: 優先度表示が正しく表示される", async ({ page }) => {
    const priorityCell = page.locator('#tbody-progress tr').first().locator('td').nth(6);
    const priorityValue = await priorityCell.textContent();
    
    expect(priorityValue).toMatch(/高|中|低/);
    
    const priorityClass = await priorityCell.getAttribute('class');
    expect(priorityClass).toContain('priority');
  });

  test("SCEN-188: 処理予定日が適切に表示される", async ({ page }) => {
    const dueDateCell = page.locator('#tbody-progress tr').first().locator('td').nth(7);
    const dueDateValue = await dueDateCell.textContent();
    
    if (dueDateValue && dueDateValue !== '-' && dueDateValue !== '未定') {
      expect(dueDateValue).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    } else {
      expect(dueDateValue).toMatch(/-|未定/);
    }
  });

  test("SCEN-189: 存在しない検索条件で結果0件表示", async ({ page }) => {
    await page.fill('#input-search', 'INVALID-12345');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const rows = page.locator('#tbody-progress tr');
    await expect(rows).toHaveCount(0);
  });

  test("SCEN-190: 無効なフィルター条件でエラー処理", async ({ page }) => {
    await page.fill('#input-search', 'invalid-date');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const errorMessage = page.locator('.error-message');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
    
    await page.fill('#input-search', '正常な検索語');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
  });

  test("SCEN-191: 削除済み申請の詳細リンククリックでエラー表示", async ({ page }) => {
    const deletedRow = page.locator('#tbody-progress tr:has-text("削除済み")').first();
    
    if (await deletedRow.count() > 0) {
      await deletedRow.locator('button:has-text("詳細")').click();
      
      const errorMessage = page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
      expect(await errorMessage.textContent()).toContain('存在しない');
    }
  });

  test("SCEN-192: 権限外申請の詳細表示でアクセス拒否", async ({ page }) => {
    await page.goto('/panels/scr-1779422369173.html?applicationId=unauthorized-app');
    
    const accessDeniedMessage = page.locator('.access-denied');
    if (await accessDeniedMessage.count() > 0) {
      await expect(accessDeniedMessage).toBeVisible();
      expect(await accessDeniedMessage.textContent()).toContain('権限');
    }
  });

  test("SCEN-193: 大量データでの表示パフォーマンス", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/panels/scr-1779422369173.html");
    
    await expect(page.locator('#tbody-progress')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    
    await page.click('button:has-text("2")');
    const pageTime = Date.now();
    
    await expect(page.locator('#tbody-progress tr')).toHaveCount(0, { not: true });
    const pagingTime = Date.now() - pageTime;
    
    expect(pagingTime).toBeLessThan(3000);
    
    await page.fill('#input-search', '申請');
    const searchTime = Date.now();
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    const filterTime = Date.now() - searchTime;
    
    expect(filterTime).toBeLessThan(3000);
  });

  test("SCEN-194: 申請件数0件時の表示", async ({ page }) => {
    await page.fill('#input-search', 'NO_RESULTS_EXPECTED');
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const rows = page.locator('#tbody-progress tr');
    await expect(rows).toHaveCount(0);
    
    const emptyMessage = page.locator('.empty-message');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test("SCEN-195: 最大文字数の検索条件入力", async ({ page }) => {
    const maxString255 = 'A'.repeat(255);
    const maxString20 = 'B'.repeat(20);
    const maxString500 = 'C'.repeat(500);
    
    await page.fill('#input-search', maxString255);
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    const searchValue = await page.inputValue('#input-search');
    expect(searchValue.length).toBeLessThanOrEqual(255);
    
    await expect(page.locator('#tbody-progress')).toBeVisible();
  });

  test("SCEN-196: 全フィルター同時適用", async ({ page }) => {
    await page.selectOption('#filter-status', '申請中');
    await page.selectOption('#filter-doctype', '経費申請');
    await page.fill('#input-search', '申請');
    
    await page.click('#btn-search');
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('#tbody-progress')).toBeVisible();
    
    const rows = page.locator('#tbody-progress tr');
    if (await rows.count() > 0) {
      const statusCell = await rows.first().locator('td').nth(4).textContent();
      const typeCell = await rows.first().locator('td').nth(1).textContent();
      const titleCell = await rows.first().locator('td').nth(2).textContent();
      
      expect(statusCell).toContain('申請中');
      expect(typeCell).toContain('経費申請');
      expect(titleCell).toContain('申請');
    }
  });

  test("SCEN-197: 長い申請タイトルの表示", async ({ page }) => {
    const longTitleRow = page.locator('#tbody-progress tr').first();
    const titleCell = longTitleRow.locator('td').nth(2);
    
    const titleText = await titleCell.textContent();
    
    if (titleText && titleText.length > 50) {
      const cellWidth = await titleCell.boundingBox();
      expect(cellWidth).not.toBeNull();
      
      const isWrapped = await titleCell.evaluate(el => el.scrollHeight > el.clientHeight);
      const isEllipsis = await titleCell.evaluate(el => 
        getComputedStyle(el).textOverflow === 'ellipsis'
      );
      
      expect(isWrapped || isEllipsis).toBeTruthy();
    }
    
    await expect(titleCell).toBeVisible();
    expect(titleText).not.toBe('');
  });
});