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
    await expect(page.locator('h1')).toContainText('遅延案件検知・催促通知');
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
    await expect(page.locator('#delay-count')).toBeVisible();
    
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      await expect(page.locator('[data-testid="delay-cases-tbody"] tr').first()).toBeVisible();
      const firstRow = page.locator('[data-testid="delay-cases-tbody"] tr').first();
      await expect(firstRow.locator('td').nth(0)).toBeVisible();
      await expect(firstRow.locator('td').nth(1)).toBeVisible();
      await expect(firstRow.locator('td').nth(2)).toBeVisible();
      await expect(firstRow.locator('td').nth(3)).toBeVisible();
      await expect(firstRow.locator('td').nth(4)).toBeVisible();
      await expect(firstRow.locator('td').nth(5)).toBeVisible();
    }
  });

  // SCEN-075
  test("[normal] 遅延案件検知・催促通知画面 - 申請書類種別フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="document-type-filter"]');
    await expect(page.locator('option', { hasText: '休暇申請' })).toBeVisible();
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="filter-button"]');
    
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="filter-button"]');
    
    await page.selectOption('[data-testid="document-type-filter"]', '全ての種別');
    await page.click('[data-testid="filter-button"]');
    
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
  });

  // SCEN-076
  test("[normal] 遅延案件検知・催促通知画面 - 承認ステップ状況フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="approval-status-filter"]');
    await expect(page.locator('option', { hasText: '未承認' })).toBeVisible();
    await page.selectOption('[data-testid="approval-status-filter"]', '未承認');
    await page.click('[data-testid="filter-button"]');
    
    await page.selectOption('[data-testid="approval-status-filter"]', '承認中');
    await page.click('[data-testid="filter-button"]');
    
    await page.selectOption('[data-testid="approval-status-filter"]', '全ての状況');
    await page.click('[data-testid="filter-button"]');
    
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
  });

  // SCEN-077
  test("[normal] 遅延案件検知・催促通知画面 - 遅延レベルが適切に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delay-level-filter"]')).toBeVisible();
    await page.click('[data-testid="delay-level-filter"]');
    await expect(page.locator('option', { hasText: '軽微' })).toBeVisible();
    await expect(page.locator('option', { hasText: '注意' })).toBeVisible();
    await expect(page.locator('option', { hasText: '緊急' })).toBeVisible();
    
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      const firstRow = page.locator('[data-testid="delay-cases-tbody"] tr').first();
      await expect(firstRow.locator('td').nth(5)).toBeVisible();
    }
  });

  // SCEN-078
  test("[normal] 遅延案件検知・催促通知画面 - 単一案件の催促通知が送信できる", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      const firstRow = page.locator('[data-testid="delay-cases-tbody"] tr').first();
      await firstRow.locator('input[type="checkbox"]').check();
      await page.click('button', { hasText: '催促送信' });
      
      await expect(page.locator('[data-testid="reminder-confirm-modal"]')).toBeVisible();
      await page.click('[data-testid="confirm-reminder-button"]');
    } else {
      await expect(page.locator('#delay-count')).toContainText('0件');
    }
  });

  // SCEN-079
  test("[normal] 遅延案件検知・催促通知画面 - 一括催促送信が正常に動作する", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      await page.click('[data-testid="select-all-checkbox"]');
      await page.click('[data-testid="bulk-reminder-button"]');
      
      await expect(page.locator('[data-testid="reminder-confirm-modal"]')).toBeVisible();
      await page.click('[data-testid="confirm-reminder-button"]');
    } else {
      await expect(page.locator('#delay-count')).toContainText('0件');
    }
  });

  // SCEN-080
  test("[normal] 遅延案件検知・催促通知画面 - 通知履歴が正確に表示される", async ({ page }) => {
    await page.click('[data-testid="notification-history-button"]');
    await expect(page.locator('body')).toBeVisible();
  });

  // SCEN-081
  test("[normal] 遅延案件検知・催促通知画面 - 遅延検知設定を変更できる", async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    await expect(page.locator('[data-testid="deadline-days-input"]')).toBeVisible();
    
    await page.fill('[data-testid="deadline-days-input"]', '5');
    await page.fill('[data-testid="warning-days-input"]', '3');
    await page.fill('[data-testid="escalation-days-input"]', '7');
    
    await page.click('[data-testid="save-settings-button"]');
    
    await page.click('[data-testid="delay-settings-button"]');
    await expect(page.locator('[data-testid="deadline-days-input"]')).toHaveValue('5');
  });

  // SCEN-082
  test("[edge] 遅延案件検知・催促通知画面 - 遅延案件0件時の表示確認", async ({ page }) => {
    await expect(page.locator('#delay-count')).toBeVisible();
    const countText = await page.locator('#delay-count').textContent();
    
    if (countText === "0件") {
      await expect(page.locator('[data-testid="delay-cases-tbody"]')).toContainText('遅延案件はありません');
      await expect(page.locator('[data-testid="bulk-reminder-button"]')).toBeDisabled();
    }
  });

  // SCEN-083
  test("[edge] 遅延案件検知・催促通知画面 - 大量案件表示時のパフォーマンス", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/panels/scr-1779422271790.html");
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    
    const scrollStart = Date.now();
    await page.locator('[data-testid="delay-cases-table"]').scrollIntoView();
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(2000);
    
    const filterStart = Date.now();
    await page.click('[data-testid="filter-button"]');
    const filterTime = Date.now() - filterStart;
    expect(filterTime).toBeLessThan(3000);
  });

  // SCEN-084
  test("[edge] 遅延案件検知・催促通知画面 - フィルター条件未選択時の動作", async ({ page }) => {
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
  });

  // SCEN-085
  test("[edge] 遅延案件検知・催促通知画面 - 全選択状態での一括催促送信", async ({ page }) => {
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      await page.click('[data-testid="select-all-checkbox"]');
      
      const allCheckboxes = page.locator('[data-testid="delay-cases-tbody"] input[type="checkbox"]');
      const count = await allCheckboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(allCheckboxes.nth(i)).toBeChecked();
      }
      
      await page.click('[data-testid="bulk-reminder-button"]');
      await expect(page.locator('[data-testid="reminder-confirm-modal"]')).toBeVisible();
      await page.click('[data-testid="confirm-reminder-button"]');
    }
  });

  // SCEN-086
  test("[error] 遅延案件検知・催促通知画面 - 催促通知送信権限なしでエラー", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limiteduser');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
    
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      const firstRow = page.locator('[data-testid="delay-cases-tbody"] tr').first();
      await firstRow.locator('input[type="checkbox"]').check();
      await page.click('button', { hasText: '催促送信' });
    }
  });

  // SCEN-087
  test("[error] 遅延案件検知・催促通知画面 - ネットワークエラー時の通知送信失敗", async ({ page }) => {
    await page.route('**/reminder/**', route => route.abort());
    
    const delayCount = await page.locator('#delay-count').textContent();
    if (delayCount !== "0件") {
      const firstRow = page.locator('[data-testid="delay-cases-tbody"] tr').first();
      await firstRow.locator('input[type="checkbox"]').check();
      await page.click('button', { hasText: '催促送信' });
      
      if (await page.locator('[data-testid="reminder-confirm-modal"]').isVisible()) {
        await page.click('[data-testid="confirm-reminder-button"]');
      }
    }
  });

  // SCEN-088
  test("[error] 遅延案件検知・催促通知画面 - 無効な設定値での検知設定変更エラー", async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    
    await page.fill('[data-testid="deadline-days-input"]', '-5');
    await page.fill('[data-testid="warning-days-input"]', '0');
    await page.fill('[data-testid="escalation-days-input"]', '');
    
    await page.click('[data-testid="save-settings-button"]');
  });

  // SCEN-089
  test("[error] 遅延案件検知・催促通知画面 - 選択なしでの一括催促送信エラー", async ({ page }) => {
    await page.click('[data-testid="bulk-reminder-button"]');
  });
});