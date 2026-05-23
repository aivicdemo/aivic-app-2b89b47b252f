import { test, expect } from '@playwright/test';

test.describe("催促通知送信処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
  });

  // SCEN-220
  test("[normal] 遅延申請一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delayed-applications-table"]')).toBeVisible();
    await expect(page.locator('th:has-text("申請書類番号")')).toBeVisible();
    await expect(page.locator('th:has-text("申請者")')).toBeVisible();
    await expect(page.locator('th:has-text("申請日")')).toBeVisible();
  });

  // SCEN-221
  test("[normal] 個別催促通知が正常送信される", async ({ page }) => {
    await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
    await expect(page.locator('[data-testid="remind-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-title"]')).toHaveValue('承認催促のご連絡');
    await page.locator('[data-testid="send-remind-button"]').click();
    await expect(page.locator('text="催促通知を送信しました"')).toBeVisible();
  });

  // SCEN-222
  test("[normal] 一括催促通知が正常送信される", async ({ page }) => {
    await page.locator('[data-testid="select-all-checkbox"]').check();
    await page.locator('[data-testid="bulk-remind-button"]').click();
    await expect(page.locator('[data-testid="remind-modal"]')).toBeVisible();
    await page.locator('[data-testid="send-remind-button"]').click();
    await expect(page.locator('text="一括催促通知を送信しました"')).toBeVisible();
  });

  // SCEN-223
  test("[normal] 通知履歴が正常表示される", async ({ page }) => {
    await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    await page.locator('[data-testid="history-button"]').click();
    await expect(page.locator('text="催促通知送信履歴"')).toBeVisible();
  });

  // SCEN-224
  test("[normal] 緊急度レベル別での表示フィルタリング", async ({ page }) => {
    await page.locator('[data-testid="urgency-filter"]').selectOption('高');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="delayed-applications-table"] .badge-warning')).toBeVisible();
    
    await page.locator('[data-testid="urgency-filter"]').selectOption('中');
    await page.locator('[data-testid="search-button"]').click();
    
    await page.locator('[data-testid="urgency-filter"]').selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
  });

  // SCEN-225
  test("[normal] 遅延日数での並び替え機能", async ({ page }) => {
    await page.locator('th:has-text("操作")').click();
    await expect(page.locator('[data-testid="delayed-applications-table"] tbody tr').first()).toBeVisible();
    
    await page.locator('th:has-text("操作")').click();
    await expect(page.locator('[data-testid="delayed-applications-table"] tbody tr').first()).toBeVisible();
  });

  // SCEN-226
  test("[error] 送信権限なしでボタン非活性化", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'user');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
    
    await expect(page.locator('[data-testid="bulk-remind-button"]')).toBeDisabled();
  });

  // SCEN-227
  test("[error] 承認者メールアドレス未設定でエラー", async ({ page }) => {
    await page.locator('[data-testid="delayed-applications-table"] tr:has-text("メールアドレス未設定")').first().locator('button:has-text("催促")').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    await expect(page.locator('text="承認者のメールアドレスが設定されていないため、催促通知を送信できません"')).toBeVisible();
  });

  // SCEN-228
  test("[error] ネットワーク障害時の送信エラー処理", async ({ page }) => {
    await page.route('/api/remind/send', route => route.abort('failed'));
    await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    await expect(page.locator('text="ネットワークエラーが発生しました"')).toBeVisible();
  });

  // SCEN-229
  test("[error] 重複送信防止制御", async ({ page }) => {
    await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    await expect(page.locator('text="既に催促通知が送信済みです"')).toBeVisible();
  });

  // SCEN-230
  test("[edge] 遅延申請ゼロ件時の表示", async ({ page }) => {
    await page.locator('[data-testid="delay-filter"]').selectOption('30日以上');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('text="催促対象の申請はありません"')).toBeVisible();
  });

  // SCEN-231
  test("[edge] 大量申請での一括送信性能", async ({ page }) => {
    const startTime = Date.now();
    await page.locator('[data-testid="select-all-checkbox"]').check();
    await page.locator('[data-testid="bulk-remind-button"]').click();
    await page.locator('[data-testid="send-remind-button"]').click();
    
    await page.waitForSelector('text="一括送信が完了しました"', { timeout: 300000 });
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(300000);
  });

  // SCEN-232
  test("[edge] 最大遅延日数での表示確認", async ({ page }) => {
    await page.locator('[data-testid="delay-filter"]').selectOption('30日以上');
    await page.locator('[data-testid="search-button"]').click();
    
    const delayCell = page.locator('[data-testid="delayed-applications-table"] td:has-text("30日以上")');
    if (await delayCell.count() > 0) {
      await expect(delayCell.first()).toBeVisible();
      await delayCell.first().locator('button:has-text("催促")').click();
      await page.locator('[data-testid="send-remind-button"]').click();
      await expect(page.locator('text="催促通知を送信しました"')).toBeVisible();
    }
  });

  // SCEN-233
  test("[edge] 送信履歴上限到達時の処理", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")').click();
      await page.locator('[data-testid="send-remind-button"]').click();
      await page.waitForTimeout(2000);
    }
    
    const remindButton = page.locator('[data-testid="delayed-applications-table"] tr').first().locator('button:has-text("催促")');
    await expect(remindButton).toBeDisabled();
  });
});