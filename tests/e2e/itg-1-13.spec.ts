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

  test('SCEN-220: [normal] 催促通知送信処理 - 遅延申請一覧が正常表示される', async ({ page }) => {
    // SCEN-220
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="delayed-applications-tbody"]')).toBeVisible();
    await expect(page.locator('text=申請書類番号')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=現在承認ステップ')).toBeVisible();
  });

  test('SCEN-221: [normal] 催促通知送信処理 - 個別催促通知が正常送信される', async ({ page }) => {
    // SCEN-221
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await page.click('text=催促');
    await expect(page.locator('#remind-modal')).toBeVisible();
    await expect(page.locator('text=催促通知送信確認')).toBeVisible();
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-222: [normal] 催促通知送信処理 - 一括催促通知が正常送信される', async ({ page }) => {
    // SCEN-222
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-remind-button"]');
    await expect(page.locator('#remind-modal')).toBeVisible();
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-223: [normal] 催促通知送信処理 - 通知履歴が正常表示される', async ({ page }) => {
    // SCEN-223
    await page.click('[data-testid="search-button"]');
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
    await page.click('[data-testid="notification-history-button"]');
    await expect(page.locator('text=通知履歴')).toBeVisible();
  });

  test('SCEN-224: [normal] 催促通知送信処理 - 緊急度レベル別での表示フィルタリング', async ({ page }) => {
    // SCEN-224
    await page.selectOption('[data-testid="urgency-filter"]', '緊急');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="urgency-filter"]', '高');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="urgency-filter"]', '全て');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
  });

  test('SCEN-225: [normal] 催促通知送信処理 - 遅延日数での並び替え機能', async ({ page }) => {
    // SCEN-225
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await page.click('[data-testid="sort-delay-days"]');
    await expect(page.locator('#sort-icon')).toBeVisible();
    await page.click('[data-testid="sort-delay-days"]');
    await expect(page.locator('#sort-icon')).toBeVisible();
  });

  test('SCEN-226: [error] 催促通知送信処理 - 送信権限なしでボタン非活性化', async ({ page }) => {
    // SCEN-226
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'normaluser');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
    
    await page.click('[data-testid="search-button"]');
    const bulkRemindButton = page.locator('[data-testid="bulk-remind-button"]');
    await expect(bulkRemindButton).toBeDisabled();
  });

  test('SCEN-227: [error] 催促通知送信処理 - 承認者メールアドレス未設定でエラー', async ({ page }) => {
    // SCEN-227
    await page.click('[data-testid="search-button"]');
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者のメールアドレスが設定されていないため');
  });

  test('SCEN-228: [error] 催促通知送信処理 - ネットワーク障害時の送信エラー処理', async ({ page }) => {
    // SCEN-228
    await page.route('**/api/remind', route => route.abort());
    await page.click('[data-testid="search-button"]');
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-229: [error] 催促通知送信処理 - 重複送信防止制御', async ({ page }) => {
    // SCEN-229
    await page.click('[data-testid="search-button"]');
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
    
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('既に催促通知が送信済みです');
  });

  test('SCEN-230: [edge] 催促通知送信処理 - 遅延申請ゼロ件時の表示', async ({ page }) => {
    // SCEN-230
    await page.route('**/api/delayed-applications', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-data-message')).toContainText('催促対象の申請はありません');
  });

  test('SCEN-231: [edge] 催促通知送信処理 - 大量申請での一括送信性能', async ({ page }) => {
    // SCEN-231
    const largeDataSet = Array.from({length: 1000}, (_, i) => ({
      id: `app-${i}`,
      title: `申請書類${i}`,
      applicant: `申請者${i}`,
      delayDays: Math.floor(Math.random() * 30) + 1
    }));
    
    await page.route('**/api/delayed-applications', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeDataSet)
      });
    });
    
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="select-all-checkbox"]');
    
    const startTime = Date.now();
    await page.click('[data-testid="bulk-remind-button"]');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
    const endTime = Date.now();
    
    const processingTime = endTime - startTime;
    expect(processingTime).toBeLessThan(300000); // 5分以内
  });

  test('SCEN-232: [edge] 催促通知送信処理 - 最大遅延日数での表示確認', async ({ page }) => {
    // SCEN-232
    const maxDelayData = [{
      id: 'app-max',
      title: '最大遅延申請',
      applicant: '申請者',
      delayDays: 35,
      urgency: 'high'
    }];
    
    await page.route('**/api/delayed-applications', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(maxDelayData)
      });
    });
    
    await page.selectOption('[data-testid="delay-filter"]', '15日以上');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="delayed-applications-list"]')).toBeVisible();
    await page.click('text=催促');
    await page.click('#btn-confirm-remind');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-233: [edge] 催促通知送信処理 - 送信履歴上限到達時の処理', async ({ page }) => {
    // SCEN-233
    await page.route('**/api/remind-history/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({count: 10, maxCount: 10})
      });
    });
    
    await page.click('[data-testid="search-button"]');
    await page.click('text=催促');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('送信履歴が上限値に達しています');
    
    const remindButton = page.locator('text=催促');
    await expect(remindButton).toBeDisabled();
  });
});