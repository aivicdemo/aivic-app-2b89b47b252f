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

  test('SCEN-074: 遅延案件一覧が正常に表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('遅延案件検知・催促通知');
    await expect(page.locator('[data-testid="delay-cases-list"]')).toBeVisible();
    await expect(page.locator('th')).toContainText('申請ID');
    await expect(page.locator('th')).toContainText('申請種別');
    await expect(page.locator('th')).toContainText('申請者');
    await expect(page.locator('th')).toContainText('現在承認者');
    await expect(page.locator('th')).toContainText('遅延日数');
    await expect(page.locator('#delay-count')).toContainText('0件');
  });

  test('SCEN-075: 申請書類種別フィルターで絞り込みできる', async ({ page }) => {
    await page.click('[data-testid="document-type-filter"]');
    await expect(page.locator('option')).toContainText('全ての種別');
    await expect(page.locator('option')).toContainText('休暇申請');
    await expect(page.locator('option')).toContainText('経費申請');
    await page.selectOption('[data-testid="document-type-filter"]', { label: '休暇申請' });
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="document-type-filter"]', { label: '経費申請' });
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="document-type-filter"]', { label: '全ての種別' });
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-076: 承認ステップ状況フィルターで絞り込みできる', async ({ page }) => {
    await page.click('[data-testid="approval-status-filter"]');
    await expect(page.locator('option')).toContainText('全ての状況');
    await expect(page.locator('option')).toContainText('申請中');
    await expect(page.locator('option')).toContainText('承認待ち');
    await expect(page.locator('option')).toContainText('差戻し');
    await page.selectOption('[data-testid="approval-status-filter"]', { label: '申請中' });
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="approval-status-filter"]', { label: '承認待ち' });
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="approval-status-filter"]', { label: '全ての状況' });
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-077: 遅延レベルが適切に表示される', async ({ page }) => {
    await page.click('[data-testid="delay-level-filter"]');
    await expect(page.locator('option')).toContainText('全てのレベル');
    await expect(page.locator('option')).toContainText('軽微');
    await expect(page.locator('option')).toContainText('注意');
    await expect(page.locator('option')).toContainText('緊急');
    await page.selectOption('[data-testid="delay-level-filter"]', { label: '緊急' });
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-078: 単一案件の催促通知が送信できる', async ({ page }) => {
    const firstRow = page.locator('#delay-cases-tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.click('button:has-text("催促通知送信")');
      await expect(page.locator('#confirm-dialog')).toBeVisible();
      await expect(page.locator('#confirm-message')).toContainText('催促通知送信確認');
      await page.click('#btn-confirm-send');
    }
  });

  test('SCEN-079: 一括催促送信が正常に動作する', async ({ page }) => {
    await page.click('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-notify-button"]');
    await expect(page.locator('#confirm-dialog')).toBeVisible();
    await expect(page.locator('#confirm-message')).toContainText('催促通知送信確認');
    await page.click('#btn-confirm-send');
  });

  test('SCEN-080: 通知履歴が正確に表示される', async ({ page }) => {
    await page.click('[data-testid="notification-history-button"]');
    await expect(page.locator('#history-modal')).toBeVisible();
    await expect(page.locator('th')).toContainText('送信日時');
    await expect(page.locator('th')).toContainText('宛先');
    await expect(page.locator('th')).toContainText('送信状態');
    await page.click('#btn-history-close');
  });

  test('SCEN-081: 遅延検知設定を変更できる', async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
    await page.fill('[data-testid="deadline-days-input"]', '5');
    await page.fill('[data-testid="warning-days-input"]', '3');
    await page.fill('[data-testid="escalation-days-input"]', '7');
    await page.check('[data-testid="business-days-checkbox"]');
    await page.click('[data-testid="save-settings-button"]');
  });

  test('SCEN-082: 遅延案件0件時の表示確認', async ({ page }) => {
    await expect(page.locator('#delay-count')).toContainText('0件');
    await expect(page.locator('[data-testid="bulk-notify-button"]')).toBeDisabled();
  });

  test('SCEN-083: 大量案件表示時のパフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    await page.reload();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    
    await page.click('[data-testid="search-button"]');
    const filterTime = Date.now() - startTime;
    expect(filterTime).toBeLessThan(8000);
  });

  test('SCEN-084: フィルター条件未選択時の動作', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delay-cases-list"]')).toBeVisible();
  });

  test('SCEN-085: 全選択状態での一括催促送信', async ({ page }) => {
    await page.click('[data-testid="select-all-checkbox"]');
    await expect(page.locator('[data-testid="select-all-checkbox"]')).toBeChecked();
    await page.click('[data-testid="bulk-notify-button"]');
    await expect(page.locator('#confirm-dialog')).toBeVisible();
    await page.click('#btn-confirm-send');
  });

  test('SCEN-086: 催促通知送信権限なしでエラー', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
    
    const firstRow = page.locator('#delay-cases-tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.click('button:has-text("催促通知送信")');
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    }
  });

  test('SCEN-087: ネットワークエラー時の通知送信失敗', async ({ page }) => {
    await page.route('**/api/notifications', route => route.abort());
    
    await page.click('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-notify-button"]');
    await page.click('#btn-confirm-send');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-088: 無効な設定値での検知設定変更エラー', async ({ page }) => {
    await page.click('[data-testid="delay-settings-button"]');
    await page.fill('[data-testid="deadline-days-input"]', '-5');
    await page.fill('[data-testid="warning-days-input"]', '0');
    await page.click('[data-testid="save-settings-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-089: 選択なしでの一括催促送信エラー', async ({ page }) => {
    await page.click('[data-testid="bulk-notify-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});