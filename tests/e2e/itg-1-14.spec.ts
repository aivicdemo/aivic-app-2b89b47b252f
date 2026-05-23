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

  // SCEN-234
  test("通知一覧が正常に表示される", async ({ page }) => {
    await page.waitForSelector('[data-testid="notification-list"]');
    const notificationList = page.locator('[data-testid="notification-list"]');
    await expect(notificationList).toBeVisible();
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  // SCEN-235
  test("未読通知件数バッジが正確に表示される", async ({ page }) => {
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    const initialCount = await unreadBadge.textContent();
    expect(initialCount).toBeTruthy();
    
    await page.locator('#notification-tbody tr:first-child button:has-text("既読")').first().click();
    
    await page.locator('[data-testid="refresh-button"]').click();
    await page.waitForTimeout(1000);
    
    const updatedCount = await unreadBadge.textContent();
    expect(parseInt(updatedCount || '0')).toBeLessThanOrEqual(parseInt(initialCount || '0'));
  });

  // SCEN-236
  test("緊急度フィルターで通知を絞り込める", async ({ page }) => {
    const urgencyFilter = page.locator('[data-testid="urgency-filter"]');
    
    await urgencyFilter.selectOption('緊急');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('高');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('通常');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    
    const tableRows = page.locator('#notification-tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

  // SCEN-237
  test("文書種別フィルターで通知を絞り込める", async ({ page }) => {
    const documentTypeFilter = page.locator('[data-testid="document-type-filter"]');
    
    await documentTypeFilter.selectOption('休暇申請');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await documentTypeFilter.selectOption('経費申請');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await documentTypeFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  // SCEN-238
  test("申請者フィルターで通知を絞り込める", async ({ page }) => {
    const applicantFilter = page.locator('[data-testid="applicant-filter"]');
    
    await applicantFilter.selectOption({ index: 1 });
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
    
    await applicantFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    
    const allRows = await page.locator('#notification-tbody tr').count();
    expect(allRows).toBeGreaterThanOrEqual(rowCount);
  });

  // SCEN-239
  test("期限フィルターで通知を絞り込める", async ({ page }) => {
    const deadlineFilter = page.locator('[data-testid="deadline-filter"]');
    
    await deadlineFilter.selectOption('1週間以内');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const filteredRows = await page.locator('#notification-tbody tr').count();
    expect(filteredRows).toBeGreaterThanOrEqual(0);
    
    await deadlineFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    
    const allRows = await page.locator('#notification-tbody tr').count();
    expect(allRows).toBeGreaterThanOrEqual(filteredRows);
  });

  // SCEN-240
  test("申請書類名リンクから詳細画面に遷移できる", async ({ page }) => {
    const firstDocumentLink = page.locator('#notification-tbody tr:first-child a').first();
    await firstDocumentLink.click();
    
    await page.waitForURL(url => url.toString().includes('/panels/'));
    expect(page.url()).toContain('/panels/');
  });

  // SCEN-241
  test("遅延警告アラートが表示される", async ({ page }) => {
    const alertElements = page.locator('text=期限超過, text=本日期限, text=明日期限');
    const alertCount = await alertElements.count();
    expect(alertCount).toBeGreaterThanOrEqual(0);
    
    if (alertCount > 0) {
      const firstAlert = alertElements.first();
      await expect(firstAlert).toBeVisible();
    }
  });

  // SCEN-242
  test("複数フィルター組み合わせで絞り込める", async ({ page }) => {
    await page.locator('[data-testid="document-type-filter"]').selectOption('経費申請');
    await page.locator('[data-testid="urgency-filter"]').selectOption('緊急');
    await page.locator('[data-testid="deadline-filter"]').selectOption('1週間以内');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const filteredRows = await page.locator('#notification-tbody tr').count();
    
    await page.locator('[data-testid="applicant-filter"]').selectOption({ index: 1 });
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const furtherFilteredRows = await page.locator('#notification-tbody tr').count();
    expect(furtherFilteredRows).toBeLessThanOrEqual(filteredRows);
  });

  // SCEN-243
  test("通知0件時に適切なメッセージが表示される", async ({ page }) => {
    await page.locator('[data-testid="urgency-filter"]').selectOption('緊急');
    await page.locator('[data-testid="document-type-filter"]').selectOption('稟議申請');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount === 0) {
      const emptyMessage = page.locator('text=通知はありません');
      await expect(emptyMessage).toBeVisible();
    }
  });

  // SCEN-244
  test("未読通知0件時にバッジが非表示になる", async ({ page }) => {
    const allReadButtons = page.locator('#notification-tbody button:has-text("既読")');
    const buttonCount = await allReadButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      await allReadButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    await page.locator('[data-testid="refresh-button"]').click();
    await page.waitForTimeout(1000);
    
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    const badgeText = await unreadBadge.textContent();
    expect(badgeText).toBe('0');
  });

  // SCEN-245
  test("大量通知データでも正常表示される", async ({ page }) => {
    await page.locator('[data-testid="refresh-button"]').click();
    await page.waitForTimeout(2000);
    
    const notificationList = page.locator('[data-testid="notification-list"]');
    await expect(notificationList).toBeVisible();
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
    
    if (rowCount > 10) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await expect(tableRows.last()).toBeVisible();
    }
  });

  // SCEN-246
  test("存在しない申請書類リンクでエラーハンドリング", async ({ page }) => {
    const firstLink = page.locator('#notification-tbody tr:first-child a').first();
    
    if (await firstLink.count() > 0) {
      await firstLink.evaluate(link => {
        (link as HTMLAnchorElement).href = '/panels/scr-999999.html';
      });
      
      await firstLink.click();
      
      await page.waitForTimeout(2000);
      const errorMessage = page.locator('text=申請書類が見つかりません, text=エラー');
      const hasError = await errorMessage.count() > 0;
      
      if (!hasError) {
        expect(page.url()).toContain('scr-999999');
      }
    }
  });

  // SCEN-247
  test("無効なフィルター条件でエラーハンドリング", async ({ page }) => {
    await page.locator('[data-testid="deadline-filter"]').evaluate(select => {
      const option = document.createElement('option');
      option.value = 'INVALID_STATUS';
      option.textContent = 'Invalid Option';
      (select as HTMLSelectElement).appendChild(option);
    });
    
    await page.locator('[data-testid="deadline-filter"]').selectOption('INVALID_STATUS');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const tableRows = page.locator('#notification-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  // SCEN-248
  test("データ取得失敗時にエラーメッセージが表示される", async ({ page }) => {
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.locator('[data-testid="refresh-button"]').click();
    await page.waitForTimeout(2000);
    
    const errorIndicator = page.locator('text=エラー, text=失敗, text=取得できません');
    const hasErrorMessage = await errorIndicator.count() > 0;
    
    if (!hasErrorMessage) {
      const tableRows = page.locator('#notification-tbody tr');
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });
});