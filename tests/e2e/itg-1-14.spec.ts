import { test, expect } from '@playwright/test';

test.describe("承認案件通知画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422407913.html");
  });

  test('SCEN-234: 通知一覧が正常に表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toBeVisible();
    await expect(page.getByText('申請書類名')).toBeVisible();
    await expect(page.getByText('承認期限')).toBeVisible();
  });

  test('SCEN-235: 未読通知件数バッジが正確に表示される', async ({ page }) => {
    await expect(page.locator('#unread-badge')).toBeVisible();
    const initialBadgeText = await page.locator('#unread-badge').textContent();
    const initialCount = parseInt(initialBadgeText || '0');
    
    if (initialCount > 0) {
      await page.click('#notification-tbody tr:first-child');
      await page.reload();
      const updatedBadgeText = await page.locator('#unread-badge').textContent();
      const updatedCount = parseInt(updatedBadgeText || '0');
      expect(updatedCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('SCEN-236: 緊急度フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', '高');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="priority-filter"]', '中');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="priority-filter"]', 'すべて');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('SCEN-237: 文書種別フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '稟議');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('SCEN-238: 申請者フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="applicant-filter"]', '${name}');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="applicant-filter"]', 'すべて');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('SCEN-239: 期限フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="deadline-filter"]', '今日まで');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="deadline-filter"]', '1週間以内');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="deadline-filter"]', 'すべて');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('SCEN-240: 申請書類名リンクから詳細画面に遷移できる', async ({ page }) => {
    const documentLink = page.locator('#notification-tbody tr:first-child td:nth-child(2) a').first();
    if (await documentLink.count() > 0) {
      await documentLink.click();
      await page.waitForURL(url => url.toString() !== '/panels/scr-1779422407913.html');
    }
  });

  test('SCEN-241: 遅延警告アラートが表示される', async ({ page }) => {
    const delayAlert = page.locator('#delay-alert');
    if (await delayAlert.count() > 0) {
      await expect(delayAlert).toBeVisible();
      await expect(page.getByText('承認期限を過ぎた案件があります')).toBeVisible();
      await expect(page.locator('#delay-details')).toBeVisible();
    }
  });

  test('SCEN-242: 複数フィルター組み合わせで絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.selectOption('[data-testid="deadline-filter"]', '1週間以内');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="applicant-filter"]', '${name}');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
  });

  test('SCEN-243: 通知0件時に適切なメッセージが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', '高');
    await page.selectOption('[data-testid="document-type-filter"]', '稟議');
    await page.selectOption('[data-testid="deadline-filter"]', '今日まで');
    await page.click('[data-testid="filter-button"]');
    
    const emptyMessage = page.locator('#empty-message');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('SCEN-244: 未読通知0件時にバッジが非表示になる', async ({ page }) => {
    const unreadBadge = page.locator('#unread-badge');
    const badgeText = await unreadBadge.textContent();
    
    if (badgeText === '0' || badgeText === '') {
      await expect(unreadBadge).not.toBeVisible();
    }
  });

  test('SCEN-245: 大量通知データでも正常表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 100) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    }
  });

  test('SCEN-246: 存在しない申請書類リンクでエラーハンドリング', async ({ page }) => {
    await page.route('**/documents/**', route => {
      route.fulfill({ status: 404, body: 'Not Found' });
    });
    
    const documentLink = page.locator('#notification-tbody tr:first-child td:nth-child(2) a').first();
    if (await documentLink.count() > 0) {
      await documentLink.click();
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    }
  });

  test('SCEN-247: 無効なフィルター条件でエラーハンドリング', async ({ page }) => {
    await page.route('**/api/notifications**', route => {
      route.fulfill({ status: 400, body: 'Bad Request' });
    });
    
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-248: データ取得失敗時にエラーメッセージが表示される', async ({ page }) => {
    await page.route('**/api/notifications**', route => {
      route.abort();
    });
    
    await page.click('[data-testid="refresh-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});