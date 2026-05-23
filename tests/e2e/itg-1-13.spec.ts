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
  test("[normal] 催促通知送信処理 - 遅延申請一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="delayed-applications-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-delayed"]')).toBeVisible();
    await expect(page.locator('th:has-text("申請書類番号")')).toBeVisible();
    await expect(page.locator('th:has-text("申請者")')).toBeVisible();
    await expect(page.locator('th:has-text("申請日")')).toBeVisible();
    await expect(page.locator('th:has-text("承認ステップ")')).toBeVisible();
    await expect(page.locator('th:has-text("承認者")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
  });

  // SCEN-221
  test("[normal] 催促通知送信処理 - 個別催促通知が正常送信される", async ({ page }) => {
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '申請承認の催促');
    await page.fill('[data-testid="notification-content"]', '承認をお待ちしております。');
    await page.selectOption('[data-testid="notification-method"]', 'メール');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="催促通知を送信しました"')).toBeVisible();
  });

  // SCEN-222
  test("[normal] 催促通知送信処理 - 一括催促通知が正常送信される", async ({ page }) => {
    await page.check('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-remind-button"]');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '一括催促通知');
    await page.fill('[data-testid="notification-content"]', '複数案件の承認をお願いします。');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="一括催促通知を送信しました"')).toBeVisible();
  });

  // SCEN-223
  test("[normal] 催促通知送信処理 - 通知履歴が正常表示される", async ({ page }) => {
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', 'テスト通知');
    await page.fill('[data-testid="notification-content"]', 'テスト内容');
    await page.click('[data-testid="send-remind-button"]');
    await page.click('[data-testid="history-button"]');
    await expect(page.locator('text="テスト通知"')).toBeVisible();
  });

  // SCEN-224
  test("[normal] 催促通知送信処理 - 緊急度レベル別での表示フィルタリング", async ({ page }) => {
    await page.selectOption('[data-testid="urgency-filter"]', '高');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="urgent-cases"]')).toContainText('3');
    
    await page.selectOption('[data-testid="urgency-filter"]', '中');
    await page.click('[data-testid="search-button"]');
    
    await page.selectOption('[data-testid="urgency-filter"]', '低');
    await page.click('[data-testid="search-button"]');
    
    await page.selectOption('[data-testid="urgency-filter"]', '全て');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="total-delayed"]')).toBeVisible();
  });

  // SCEN-225
  test("[normal] 催促通知送信処理 - 遅延日数での並び替え機能", async ({ page }) => {
    await page.click('th:has-text("遅延日数")');
    await page.waitForTimeout(500);
    
    const firstRowAfterAsc = await page.locator('#delayed-applications-tbody tr:first-child td:nth-child(6)').textContent();
    
    await page.click('th:has-text("遅延日数")');
    await page.waitForTimeout(500);
    
    const firstRowAfterDesc = await page.locator('#delayed-applications-tbody tr:first-child td:nth-child(6)').textContent();
    
    expect(firstRowAfterAsc).not.toBe(firstRowAfterDesc);
  });

  // SCEN-226
  test("[error] 催促通知送信処理 - 送信権限なしでボタン非活性化", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422392638.html");
    
    const reminderButton = page.locator('button:has-text("催促")').first();
    await expect(reminderButton).toBeDisabled();
  });

  // SCEN-227
  test("[error] 催促通知送信処理 - 承認者メールアドレス未設定でエラー", async ({ page }) => {
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', 'メールなし催促');
    await page.fill('[data-testid="notification-content"]', 'メールアドレス未設定テスト');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="承認者のメールアドレスが設定されていないため、催促通知を送信できません"')).toBeVisible();
  });

  // SCEN-228
  test("[error] 催促通知送信処理 - ネットワーク障害時の送信エラー処理", async ({ page }) => {
    await page.route('**/api/notifications/send', route => {
      route.abort('failed');
    });
    
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', 'ネットワーク障害テスト');
    await page.fill('[data-testid="notification-content"]', 'ネットワーク障害時のテスト');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="ネットワークエラーにより送信に失敗しました"')).toBeVisible();
  });

  // SCEN-229
  test("[error] 催促通知送信処理 - 重複送信防止制御", async ({ page }) => {
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '重複送信テスト');
    await page.fill('[data-testid="notification-content"]', '重複送信防止テスト');
    await page.click('[data-testid="send-remind-button"]');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'hidden' });
    
    await page.click('button:has-text("催促")');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '重複送信テスト2');
    await page.fill('[data-testid="notification-content"]', '重複送信防止テスト2');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="既に催促通知が送信済みです"')).toBeVisible();
  });

  // SCEN-230
  test("[edge] 催促通知送信処理 - 遅延申請ゼロ件時の表示", async ({ page }) => {
    await page.selectOption('[data-testid="delay-filter"]', '14日以上');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text="遅延している申請はありません"')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-remind-button"]')).toBeDisabled();
  });

  // SCEN-231
  test("[edge] 催促通知送信処理 - 大量申請での一括送信性能", async ({ page }) => {
    await page.check('[data-testid="select-all-checkbox"]');
    const startTime = Date.now();
    await page.click('[data-testid="bulk-remind-button"]');
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '大量一括送信テスト');
    await page.fill('[data-testid="notification-content"]', '1000件一括送信テスト');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="一括催促通知を送信しました"')).toBeVisible({ timeout: 300000 });
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    expect(processingTime).toBeLessThan(300);
  });

  // SCEN-232
  test("[edge] 催促通知送信処理 - 最大遅延日数での表示確認", async ({ page }) => {
    const maxDelayRow = page.locator('#delayed-applications-tbody tr').filter({ hasText: '30日以上' });
    await expect(maxDelayRow).toBeVisible();
    
    await maxDelayRow.locator('button:has-text("催促")').click();
    await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
    await page.fill('[data-testid="notification-title"]', '最大遅延催促');
    await page.fill('[data-testid="notification-content"]', '30日以上遅延している申請の催促');
    await page.click('[data-testid="send-remind-button"]');
    await expect(page.locator('text="催促通知を送信しました"')).toBeVisible();
  });

  // SCEN-233
  test("[edge] 催促通知送信処理 - 送信履歴上限到達時の処理", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("催促")');
      await page.waitForSelector('[data-testid="remind-modal"]', { state: 'visible' });
      await page.fill('[data-testid="notification-title"]', `履歴テスト${i + 1}`);
      await page.fill('[data-testid="notification-content"]', `履歴上限テスト${i + 1}`);
      await page.click('[data-testid="send-remind-button"]');
      await page.waitForSelector('[data-testid="remind-modal"]', { state: 'hidden' });
    }
    
    const reminderButton = page.locator('button:has-text("催促")').first();
    await expect(reminderButton).toBeDisabled();
    await expect(page.locator('text="送信履歴が上限に達しています"')).toBeVisible();
  });

});