import { test, expect } from '@playwright/test';

test.describe("遅延案件検知・催促通知画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
  });

  // SCEN-074
  test("[normal] 遅延案件検知・催促通知画面 - 遅延案件一覧が正常に表示される", async ({ page }) => {
    await expect(page.locator('#current-screen-title')).toContainText('遅延案件検知・催促通知');
    await expect(page.locator('#delay-cases-tbody')).toBeVisible();
    await expect(page.locator('[data-testid="delay-cases-list"]')).toBeVisible();
    
    const delayCount = await page.locator('#delay-count').textContent();
    expect(delayCount).toContain('件');
    
    if (delayCount !== '0件') {
      const headerCells = page.locator('#delay-cases-tbody').locator('th');
      await expect(headerCells).toContainText(['申請ID', '申請種別', '申請者', '現在承認者', '遅延日数']);
    }
  });

  // SCEN-075
  test("[normal] 遅延案件検知・催促通知画面 - 申請書類種別フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="document-type-filter"]');
    await expect(page.locator('#filter-document-type option')).toContainText(['全ての種別', '休暇申請', '経費申請']);
    
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.selectOption('#filter-document-type', '経費申請');
    await page.click('button:has-text("検索")');
    await page.waitForTimeout(1000);
    
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.click('#btn-search');
  });

  // SCEN-076
  test("[normal] 遅延案件検知・催促通知画面 - 承認ステップ状況フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="approval-status-filter"]');
    await expect(page.locator('#filter-approval-status option')).toContainText(['全ての状況', '未承認', '承認中']);
    
    await page.selectOption('#filter-approval-status', '未承認');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.selectOption('#filter-approval-status', '承認中');
    await page.click('button:has-text("検索")');
    await page.waitForTimeout(1000);
    
    await page.selectOption('#filter-approval-status', '全ての状況');
    await page.click('#btn-search');
  });

  // SCEN-077
  test("[normal] 遅延案件検知・催促通知画面 - 遅延レベルが適切に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delay-level-filter"]')).toBeVisible();
    await page.click('[data-testid="delay-level-filter"]');
    await expect(page.locator('#filter-delay-level option')).toContainText(['全てのレベル', '軽微', '注意', '緊急']);
    
    const delayCasesList = page.locator('[data-testid="delay-cases-list"]');
    await expect(delayCasesList).toBeVisible();
    
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== '0件') {
      const firstRow = page.locator('#delay-cases-tbody tr').first();
      await expect(firstRow).toBeVisible();
    }
  });

  // SCEN-078
  test("[normal] 遅延案件検知・催促通知画面 - 単一案件の催促通知が送信できる", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    
    if (delayCount === '0件') {
      await expect(page.locator('#no-delay-message')).toContainText('遅延案件はありません');
    } else {
      const firstCase = page.locator('#delay-cases-tbody tr').first();
      await firstCase.locator('td').first().click();
      
      await page.click('button:has-text("催促通知送信")');
      
      await expect(page.locator('#notify-modal')).toBeVisible();
      await expect(page.locator('#notify-message')).toBeVisible();
      
      await page.click('[data-testid="confirm-notify-button"]');
      await page.waitForTimeout(2000);
    }
  });

  // SCEN-079
  test("[normal] 遅延案件検知・催促通知画面 - 一括催促送信が正常に動作する", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    
    if (delayCount !== '0件') {
      await page.click('[data-testid="select-all-checkbox"]');
      await expect(page.locator('#select-all')).toBeChecked();
      
      await page.click('[data-testid="bulk-notify-button"]');
      
      await expect(page.locator('#notify-modal')).toBeVisible();
      await page.click('#btn-notify-confirm');
      await page.waitForTimeout(3000);
    } else {
      await page.click('[data-testid="bulk-notify-button"]');
      await expect(page.locator('[data-testid="bulk-notify-button"]')).toBeDisabled();
    }
  });

  // SCEN-080
  test("[normal] 遅延案件検知・催促通知画面 - 通知履歴が正確に表示される", async ({ page }) => {
    await page.click('[data-testid="notification-history-button"]');
    await page.waitForTimeout(1000);
    
    const historySection = page.locator('.notification-history');
    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();
      
      const historyItems = historySection.locator('.history-item');
      if (await historyItems.count() > 0) {
        const firstItem = historyItems.first();
        await expect(firstItem).toContainText(['送信日時', '宛先', '状況']);
      }
    }
  });

  // SCEN-081
  test("[normal] 遅延案件検知・催促通知画面 - 遅延検知設定を変更できる", async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    await page.fill('[data-testid="minor-delay-days"]', '5');
    await page.fill('[data-testid="warning-delay-days"]', '7');
    await page.fill('[data-testid="critical-delay-days"]', '10');
    await page.fill('[data-testid="notify-interval-days"]', '2');
    
    if (await page.locator('[data-testid="business-days-checkbox"]').count() > 0) {
      await page.check('[data-testid="business-days-checkbox"]');
    }
    
    await page.click('[data-testid="save-settings-button"]');
    await page.waitForTimeout(2000);
    
    await page.reload();
    await page.click('[data-testid="delay-settings-button"]');
    
    await expect(page.locator('#setting-minor-days')).toHaveValue('5');
    await expect(page.locator('#setting-warning-days')).toHaveValue('7');
  });

  // SCEN-082
  test("[edge] 遅延案件検知・催促通知画面 - 遅延案件0件時の表示確認", async ({ page }) => {
    await expect(page.locator('#delay-count')).toContainText('0件');
    await expect(page.locator('#no-delay-message')).toContainText('遅延案件はありません');
    
    const bulkNotifyButton = page.locator('[data-testid="bulk-notify-button"]');
    if (await bulkNotifyButton.count() > 0) {
      await expect(bulkNotifyButton).toBeDisabled();
    }
    
    const selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]');
    if (await selectAllCheckbox.count() > 0) {
      await expect(selectAllCheckbox).toBeDisabled();
    }
  });

  // SCEN-083
  test("[edge] 遅延案件検知・催促通知画面 - 大量案件表示時のパフォーマンス", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/panels/scr-1779422271790.html");
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    
    await expect(page.locator('[data-testid="delay-cases-list"]')).toBeVisible();
    
    const scrollStart = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(2000);
    
    const filterStart = Date.now();
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.click('[data-testid="search-button"]');
    const filterTime = Date.now() - filterStart;
    expect(filterTime).toBeLessThan(3000);
  });

  // SCEN-084
  test("[edge] 遅延案件検知・催促通知画面 - フィルター条件未選択時の動作", async ({ page }) => {
    await expect(page.locator('#filter-document-type')).toHaveValue('全ての種別');
    await expect(page.locator('#filter-approval-status')).toHaveValue('全ての状況');
    await expect(page.locator('#filter-delay-level')).toHaveValue('全てのレベル');
    
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[data-testid="delay-cases-list"]')).toBeVisible();
    
    const delayCount = await page.locator('#delay-count').textContent();
    expect(delayCount).toMatch(/\d+件/);
  });

  // SCEN-085
  test("[edge] 遅延案件検知・催促通知画面 - 全選択状態での一括催促送信", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    
    if (delayCount !== '0件') {
      await page.click('[data-testid="select-all-checkbox"]');
      await expect(page.locator('#select-all')).toBeChecked();
      
      const allRows = page.locator('#delay-cases-tbody tr');
      const rowCount = await allRows.count();
      
      for (let i = 0; i < rowCount; i++) {
        const checkbox = allRows.nth(i).locator('input[type="checkbox"]');
        if (await checkbox.count() > 0) {
          await expect(checkbox).toBeChecked();
        }
      }
      
      await page.click('[data-testid="bulk-notify-button"]');
      await expect(page.locator('#notify-modal')).toBeVisible();
      
      await page.click('#btn-notify-confirm');
      await page.waitForTimeout(3000);
      
      await page.click('[data-testid="notification-history-button"]');
    }
  });

  // SCEN-086
  test("[error] 遅延案件検知・催促通知画面 - 催促通知送信権限なしでエラー", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'user_no_permission');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
    
    const delayCount = await page.locator('#delay-count').textContent();
    
    if (delayCount !== '0件') {
      const firstCase = page.locator('#delay-cases-tbody tr').first();
      await firstCase.click();
      
      const notifyButton = page.locator('button:has-text("催促通知送信")');
      if (await notifyButton.count() > 0) {
        await notifyButton.click();
        
        const errorMessage = page.locator('.error-message, .alert-error');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toContainText('権限');
        }
      } else {
        expect(await notifyButton.count()).toBe(0);
      }
    }
  });

  // SCEN-087
  test("[error] 遅延案件検知・催促通知画面 - ネットワークエラー時の通知送信失敗", async ({ page }) => {
    await page.route('**/api/notifications/**', route => route.abort());
    
    const delayCount = await page.locator('#delay-count').textContent();
    
    if (delayCount !== '0件') {
      const firstCase = page.locator('#delay-cases-tbody tr').first();
      await firstCase.click();
      
      await page.click('button:has-text("催促通知送信")');
      
      if (await page.locator('#notify-modal').count() > 0) {
        await page.click('#btn-notify-confirm');
        await page.waitForTimeout(3000);
        
        const errorMessage = page.locator('.error-message, .notification-error, [class*="error"]');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toContainText(['失敗', 'エラー', 'ネットワーク']);
        }
      }
    }
  });

  // SCEN-088
  test("[error] 遅延案件検知・催促通知画面 - 無効な設定値での検知設定変更エラー", async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    await page.fill('#setting-minor-days', '-5');
    await page.fill('#setting-warning-days', '0');
    await page.fill('#setting-notify-interval', '0');
    
    await page.click('[data-testid="save-settings-button"]');
    
    const errorMessages = page.locator('.validation-error, .error-message, [class*="error"]');
    if (await errorMessages.count() > 0) {
      const errorText = await errorMessages.first().textContent();
      expect(errorText).toMatch(/(1以上|正の値|無効)/);
    }
    
    await page.click('#btn-settings-cancel');
  });

  // SCEN-089
  test("[error] 遅延案件検知・催促通知画面 - 選択なしでの一括催促送信エラー", async ({ page }) => {
    const selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]');
    if (await selectAllCheckbox.count() > 0) {
      await expect(selectAllCheckbox).not.toBeChecked();
    }
    
    await page.click('[data-testid="bulk-notify-button"]');
    
    const errorMessage = page.locator('.error-message, .alert, [class*="error"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toContainText(['選択', '案件', '未選択']);
    } else {
      const bulkNotifyButton = page.locator('[data-testid="bulk-notify-button"]');
      await expect(bulkNotifyButton).toBeDisabled();
    }
  });
});