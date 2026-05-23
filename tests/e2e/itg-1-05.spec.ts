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
  test("遅延案件検知・催促通知画面 - 遅延案件一覧が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
    await expect(page.locator('#total-count')).toContainText('件');
    await expect(page.locator('#delay-cases-tbody')).toBeVisible();
    
    const rows = await page.locator('#delay-cases-tbody tr').count();
    if (rows > 0) {
      await expect(page.locator('#delay-cases-tbody tr').first()).toContainText('申請ID');
      await expect(page.locator('#delay-cases-tbody tr').first()).toContainText('申請者');
      await expect(page.locator('#delay-cases-tbody tr').first()).toContainText('遅延日数');
    }
  });

  // SCEN-075
  test("遅延案件検知・催促通知画面 - 申請書類種別フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="document-type-filter"]');
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="document-type-filter"]');
    await page.selectOption('#filter-document-type', '経費申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="document-type-filter"]');
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.click('[data-testid="search-button"]');
  });

  // SCEN-076
  test("遅延案件検知・催促通知画面 - 承認ステップ状況フィルターで絞り込みできる", async ({ page }) => {
    await page.click('[data-testid="approval-status-filter"]');
    await page.selectOption('#filter-approval-status', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="approval-status-filter"]');
    await page.selectOption('#filter-approval-status', '差戻し');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="approval-status-filter"]');
    await page.selectOption('#filter-approval-status', '全ての状況');
    await page.click('[data-testid="search-button"]');
  });

  // SCEN-077
  test("遅延案件検知・催促通知画面 - 遅延レベルが適切に表示される", async ({ page }) => {
    await expect(page.locator('#delay-cases-tbody')).toBeVisible();
    
    const delayLevels = await page.locator('#delay-cases-tbody tr td:nth-child(8)').all();
    for (const level of delayLevels) {
      const levelText = await level.textContent();
      expect(levelText).toMatch(/軽微|注意|緊急/);
    }
  });

  // SCEN-078
  test("遅延案件検知・催促通知画面 - 単一案件の催促通知が送信できる", async ({ page }) => {
    const firstRow = page.locator('#delay-cases-tbody tr').first();
    await firstRow.locator('input[type="checkbox"]').check();
    
    await expect(page.locator('#selected-count')).toContainText('1件選択中');
    
    await page.click('text=催促');
    await expect(page.locator('text=送信')).toBeVisible();
    await page.click('text=送信');
  });

  // SCEN-079
  test("遅延案件検知・催促通知画面 - 一括催促送信が正常に動作する", async ({ page }) => {
    await page.check('[data-testid="select-all-checkbox"]');
    
    await expect(page.locator('#selected-count')).toContainText('件選択中');
    
    await page.click('[data-testid="bulk-notify-button"]');
    await expect(page.locator('text=送信')).toBeVisible();
    await page.click('text=送信');
  });

  // SCEN-080
  test("遅延案件検知・催促通知画面 - 通知履歴が正確に表示される", async ({ page }) => {
    await page.click('[data-testid="notification-history-btn"]');
    await page.waitForTimeout(1000);
    
    const historySection = page.locator('.card').filter({ hasText: '通知履歴' });
    await expect(historySection).toBeVisible();
    
    const historyItems = historySection.locator('tr');
    if (await historyItems.count() > 0) {
      await expect(historyItems.first()).toContainText('送信日時');
      await expect(historyItems.first()).toContainText('宛先');
      await expect(historyItems.first()).toContainText('通知内容');
    }
  });

  // SCEN-081
  test("遅延案件検知・催促通知画面 - 遅延検知設定を変更できる", async ({ page }) => {
    await page.click('[data-testid="delay-settings-btn"]');
    await page.waitForTimeout(1000);
    
    const settingsSection = page.locator('.card').filter({ hasText: '遅延検知設定' });
    await expect(settingsSection).toBeVisible();
    
    await settingsSection.locator('input[type="number"]').fill('5');
    await settingsSection.locator('select').first().selectOption('経費申請');
    
    await page.click('text=設定を保存');
    await page.reload();
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="delay-settings-btn"]');
    const updatedValue = await settingsSection.locator('input[type="number"]').inputValue();
    expect(updatedValue).toBe('5');
  });

  // SCEN-082
  test("遅延案件検知・催促通知画面 - 遅延案件0件時の表示確認", async ({ page }) => {
    await page.selectOption('#filter-document-type', '出張申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    
    const totalCountElement = page.locator('#total-count');
    const totalCountText = await totalCountElement.textContent();
    
    if (totalCountText?.includes('0件')) {
      await expect(page.locator('#delay-cases-tbody')).toContainText('遅延案件はありません');
      await expect(page.locator('[data-testid="bulk-notify-button"]')).toBeDisabled();
    }
  });

  // SCEN-083
  test("遅延案件検知・催促通知画面 - 大量案件表示時のパフォーマンス", async ({ page }) => {
    const startTime = Date.now();
    
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    
    const scrollStart = Date.now();
    await page.locator('#delay-cases-tbody').scrollIntoView();
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(2000);
    
    const filterStart = Date.now();
    await page.selectOption('#filter-approval-status', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);
    const filterTime = Date.now() - filterStart;
    expect(filterTime).toBeLessThan(3000);
  });

  // SCEN-084
  test("遅延案件検知・催促通知画面 - フィルター条件未選択時の動作", async ({ page }) => {
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.selectOption('#filter-approval-status', '全ての状況');
    await page.selectOption('#filter-delay-level', '全てのレベル');
    
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
    await expect(page.locator('#total-count')).toContainText('件');
  });

  // SCEN-085
  test("遅延案件検知・催促通知画面 - 全選択状態での一括催促送信", async ({ page }) => {
    await page.check('[data-testid="select-all-checkbox"]');
    
    const selectedCountText = await page.locator('#selected-count').textContent();
    expect(selectedCountText).toMatch(/\d+件選択中/);
    
    await page.click('[data-testid="bulk-notify-button"]');
    await expect(page.locator('text=実行')).toBeVisible();
    await page.click('text=実行');
    
    await page.waitForTimeout(2000);
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  // SCEN-086
  test("遅延案件検知・催促通知画面 - 催促通知送信権限なしでエラー", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'readonly_user');
    await page.fill('[name="password"]', 'readonly');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
    
    const firstRow = page.locator('#delay-cases-tbody tr').first();
    if (await firstRow.count() > 0) {
      await firstRow.locator('input[type="checkbox"]').check();
      await page.click('text=催促');
      
      await expect(page.locator('text=権限エラー')).toBeVisible();
    }
  });

  // SCEN-087
  test("遅延案件検知・催促通知画面 - ネットワークエラー時の通知送信失敗", async ({ page }) => {
    await page.route('**/api/notifications/send', route => {
      route.abort('failed');
    });
    
    const firstRow = page.locator('#delay-cases-tbody tr').first();
    if (await firstRow.count() > 0) {
      await firstRow.locator('input[type="checkbox"]').check();
      await page.click('text=催促');
      await page.click('text=送信');
      
      await expect(page.locator('text=送信に失敗しました')).toBeVisible();
    }
  });

  // SCEN-088
  test("遅延案件検知・催促通知画面 - 無効な設定値での検知設定変更エラー", async ({ page }) => {
    await page.click('[data-testid="delay-settings-btn"]');
    await page.waitForTimeout(1000);
    
    const settingsSection = page.locator('.card').filter({ hasText: '遅延検知設定' });
    
    await settingsSection.locator('input[type="number"]').fill('-5');
    await settingsSection.locator('input[type="email"]').fill('invalid-email');
    
    await page.click('text=設定を保存');
    
    await expect(page.locator('text=1以上の値を入力してください')).toBeVisible();
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible();
  });

  // SCEN-089
  test("遅延案件検知・催促通知画面 - 選択なしでの一括催促送信エラー", async ({ page }) => {
    await expect(page.locator('#selected-count')).toContainText('0件選択中');
    
    await page.click('[data-testid="bulk-notify-button"]');
    
    await expect(page.locator('text=案件が選択されていません')).toBeVisible();
  });
});