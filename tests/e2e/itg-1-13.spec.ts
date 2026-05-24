import { test, expect } from '@playwright/test';

test.describe("催促通知送信処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
  });

  // SCEN-220
  test("遅延申請一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    await expect(page.locator('#total-delayed')).toContainText('${row.申請書類番号}');
  });

  // SCEN-221
  test("個別催促通知が正常送信される", async ({ page }) => {
    await page.locator('button:has-text("催促送信")').first().click();
    await expect(page.locator('#reminder-modal')).toBeVisible();
    await expect(page.locator('#reminder-content')).toBeVisible();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-222
  test("一括催促通知が正常送信される", async ({ page }) => {
    await page.locator('#select-all').check();
    await page.locator('[data-testid="bulk-reminder-button"]').click();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-223
  test("通知履歴が正常表示される", async ({ page }) => {
    await page.locator('[data-testid="notification-history-button"]').click();
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
  });

  // SCEN-224
  test("緊急度レベル別での表示フィルタリング", async ({ page }) => {
    await page.locator('#urgency-filter').selectOption('高');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    
    await page.locator('#urgency-filter').selectOption('中');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    
    await page.locator('#urgency-filter').selectOption('低');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    
    await page.locator('#urgency-filter').selectOption('全ての緊急度');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
  });

  // SCEN-225
  test("遅延日数での並び替え機能", async ({ page }) => {
    await page.locator('#sort-delay-days').click();
    await expect(page.locator('#sort-icon')).toBeVisible();
    
    await page.locator('#sort-delay-days').click();
    await expect(page.locator('#sort-icon')).toBeVisible();
  });

  // SCEN-226
  test("送信権限なしでボタン非活性化", async ({ page }) => {
    await expect(page.locator('button:has-text("催促送信")')).toBeDisabled();
  });

  // SCEN-227
  test("承認者メールアドレス未設定でエラー", async ({ page }) => {
    await page.locator('button:has-text("催促送信")').first().click();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('承認者のメールアドレスが設定されていない');
  });

  // SCEN-228
  test("ネットワーク障害時の送信エラー処理", async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    
    await page.locator('button:has-text("催促送信")').first().click();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-229
  test("重複送信防止制御", async ({ page }) => {
    await page.locator('button:has-text("催促送信")').first().click();
    await page.locator('#btn-confirm-reminder').click();
    
    await page.locator('button:has-text("催促送信")').first().click();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#error-message')).toContainText('既に催促通知が送信済みです');
  });

  // SCEN-230
  test("遅延申請ゼロ件時の表示", async ({ page }) => {
    await expect(page.locator('#total-delayed')).toContainText('0');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toContainText('催促対象の申請はありません');
  });

  // SCEN-231
  test("大量申請での一括送信性能", async ({ page }) => {
    const startTime = Date.now();
    
    await page.locator('#select-all').check();
    await page.locator('[data-testid="bulk-reminder-button"]').click();
    await page.locator('#btn-confirm-reminder').click();
    
    await expect(page.locator('#success-message')).toBeVisible({ timeout: 300000 });
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    expect(processingTime).toBeLessThan(300);
  });

  // SCEN-232
  test("最大遅延日数での表示確認", async ({ page }) => {
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await expect(page.locator('#delayed-applications-tbody')).toContainText('30日以上');
    
    await page.locator('button:has-text("催促送信")').first().click();
    await page.locator('#btn-confirm-reminder').click();
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-233
  test("送信履歴上限到達時の処理", async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.locator('button:has-text("催促送信")').first().click();
      await page.locator('#btn-confirm-reminder').click();
      await page.waitForTimeout(1000);
    }
    
    await page.locator('button:has-text("催促送信")').first().click();
    await expect(page.locator('#error-message')).toContainText('送信履歴が上限値に達しました');
  });
});