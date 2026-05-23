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
  test('[normal] 催促通知送信処理 - 遅延申請一覧が正常表示される', async ({ page }) => {
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-list')).toBeVisible();
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    await expect(page.locator('text=申請書類番号')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=遅延日数')).toBeVisible();
  });

  // SCEN-221
  test('[normal] 催促通知送信処理 - 個別催促通知が正常送信される', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('text=催促送信');
    await expect(page.locator('#notify-modal')).toBeVisible();
    await expect(page.locator('#notify-content')).toBeVisible();
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-222
  test('[normal] 催促通知送信処理 - 一括催促通知が正常送信される', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('#select-all');
    await page.click('#btn-bulk-notify');
    await expect(page.locator('#notify-modal')).toBeVisible();
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-223
  test('[normal] 催促通知送信処理 - 通知履歴が正常表示される', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await page.click('#btn-notification-history');
    await expect(page.locator('text=送信日時')).toBeVisible();
    await expect(page.locator('text=宛先')).toBeVisible();
    await expect(page.locator('text=件名')).toBeVisible();
  });

  // SCEN-224
  test('[normal] 催促通知送信処理 - 緊急度レベル別での表示フィルタリング', async ({ page }) => {
    await page.selectOption('#urgency-filter', '高');
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    
    await page.selectOption('#urgency-filter', '中');
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    
    await page.selectOption('#urgency-filter', '低');
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    
    await page.selectOption('#urgency-filter', '全て');
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
  });

  // SCEN-225
  test('[normal] 催促通知送信処理 - 遅延日数での並び替え機能', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('#sort-delay-days');
    await expect(page.locator('#sort-icon')).toBeVisible();
    await page.click('#sort-delay-days');
    await expect(page.locator('#sort-icon')).toBeVisible();
  });

  // SCEN-226
  test('[error] 催促通知送信処理 - 送信権限なしでボタン非活性化', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
    
    await page.click('#btn-search');
    await expect(page.locator('text=催促送信')).toBeDisabled();
  });

  // SCEN-227
  test('[error] 催促通知送信処理 - 承認者メールアドレス未設定でエラー', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#error-message')).toContainText('承認者のメールアドレスが設定されていないため、催促通知を送信できません');
  });

  // SCEN-228
  test('[error] 催促通知送信処理 - ネットワーク障害時の送信エラー処理', async ({ page }) => {
    await page.route('**/api/notifications/**', route => route.abort());
    await page.click('#btn-search');
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-229
  test('[error] 催促通知送信処理 - 重複送信防止制御', async ({ page }) => {
    await page.click('#btn-search');
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await page.waitForSelector('#success-message');
    
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#error-message')).toContainText('既に催促通知が送信済みです');
  });

  // SCEN-230
  test('[edge] 催促通知送信処理 - 遅延申請ゼロ件時の表示', async ({ page }) => {
    await page.selectOption('#delay-days-filter', '30');
    await page.click('#btn-search');
    await expect(page.locator('#no-data-message')).toContainText('催促対象の申請はありません');
  });

  // SCEN-231
  test('[edge] 催促通知送信処理 - 大量申請での一括送信性能', async ({ page }) => {
    const startTime = Date.now();
    await page.click('#btn-search');
    await page.click('#select-all');
    await page.click('#btn-bulk-notify');
    await page.click('#btn-confirm-notify');
    await page.waitForSelector('#success-message', { timeout: 300000 });
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(300000);
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-232
  test('[edge] 催促通知送信処理 - 最大遅延日数での表示確認', async ({ page }) => {
    await page.selectOption('#delay-days-filter', '30以上');
    await page.click('#btn-search');
    await expect(page.locator('#delayed-applications-tbody')).toBeVisible();
    await expect(page.locator('text=30日以上')).toBeVisible();
    
    await page.click('text=催促送信');
    await page.click('#btn-confirm-notify');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-233
  test('[edge] 催促通知送信処理 - 送信履歴上限到達時の処理', async ({ page }) => {
    await page.click('#btn-search');
    
    for (let i = 0; i < 10; i++) {
      await page.click('text=催促送信');
      await page.click('#btn-confirm-notify');
      await page.waitForSelector('#success-message');
    }
    
    await expect(page.locator('text=催促送信')).toBeDisabled();
  });
});