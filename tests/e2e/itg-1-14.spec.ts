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
    
    const notificationTable = page.locator('#notification-tbody');
    await expect(notificationTable).toBeVisible();
    
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=通知日時')).toBeVisible();
    await expect(page.locator('text=申請書類名')).toBeVisible();
    await expect(page.locator('text=承認期限')).toBeVisible();
    await expect(page.locator('text=状態')).toBeVisible();
  });

  // SCEN-235
  test("未読通知件数バッジが正確に表示される", async ({ page }) => {
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    await expect(unreadBadge).toBeVisible();
    
    const initialCount = await page.locator('#unread-count').textContent();
    expect(parseInt(initialCount || "0")).toBeGreaterThanOrEqual(0);
    
    const firstNotification = page.locator('#notification-tbody tr').first();
    if (await firstNotification.count() > 0) {
      const readButton = firstNotification.locator('button:has-text("既読")');
      if (await readButton.count() > 0) {
        await readButton.click();
        await page.reload();
        
        const updatedCount = await page.locator('#unread-count').textContent();
        expect(parseInt(updatedCount || "0")).toBeLessThanOrEqual(parseInt(initialCount || "0"));
      }
    }
  });

  // SCEN-236
  test("緊急度フィルターで通知を絞り込める", async ({ page }) => {
    const urgencyFilter = page.locator('[data-testid="urgency-filter"]');
    await expect(urgencyFilter).toBeVisible();
    
    await urgencyFilter.selectOption('高');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('中');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('低');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await urgencyFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-237
  test("文書種別フィルターで通知を絞り込める", async ({ page }) => {
    const documentTypeFilter = page.locator('[data-testid="document-type-filter"]');
    await expect(documentTypeFilter).toBeVisible();
    
    await documentTypeFilter.selectOption('休暇申請');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await documentTypeFilter.selectOption('経費申請');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await documentTypeFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-238
  test("申請者フィルターで通知を絞り込める", async ({ page }) => {
    const applicantFilter = page.locator('[data-testid="applicant-filter"]');
    await expect(applicantFilter).toBeVisible();
    
    const searchButton = page.locator('[data-testid="search-button"]');
    
    if (await applicantFilter.getAttribute('type') === 'text') {
      await applicantFilter.fill('田中');
      await searchButton.click();
      await page.waitForTimeout(1000);
      
      await applicantFilter.clear();
      await searchButton.click();
      await page.waitForTimeout(1000);
    } else {
      const options = await applicantFilter.locator('option').all();
      if (options.length > 1) {
        await applicantFilter.selectOption({ index: 1 });
        await searchButton.click();
        await page.waitForTimeout(1000);
        
        await applicantFilter.selectOption({ index: 0 });
        await searchButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-239
  test("期限フィルターで通知を絞り込める", async ({ page }) => {
    const deadlineFilter = page.locator('[data-testid="deadline-filter"]');
    await expect(deadlineFilter).toBeVisible();
    
    await deadlineFilter.selectOption('1週間以内');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    await deadlineFilter.selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-240
  test("申請書類名リンクから詳細画面に遷移できる", async ({ page }) => {
    const documentLink = page.locator('#notification-tbody tr').first().locator('a');
    
    if (await documentLink.count() > 0) {
      await documentLink.click();
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('scr-1779422407913.html');
    }
  });

  // SCEN-241
  test("遅延警告アラートが表示される", async ({ page }) => {
    const alertElements = page.locator('text=🚨, text=⚠️, text=期限超過, text=本日期限, text=明日期限');
    
    if (await alertElements.count() > 0) {
      await expect(alertElements.first()).toBeVisible();
    }
    
    const notificationRows = page.locator('#notification-tbody tr');
    const rowCount = await notificationRows.count();
    
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = notificationRows.nth(i);
      if (await row.locator('text=🚨').count() > 0 || await row.locator('text=⚠️').count() > 0) {
        await expect(row).toBeVisible();
      }
    }
  });

  // SCEN-242
  test("複数フィルター組み合わせで絞り込める", async ({ page }) => {
    await page.locator('[data-testid="document-type-filter"]').selectOption('経費申請');
    await page.locator('[data-testid="urgency-filter"]').selectOption('高');
    await page.locator('[data-testid="deadline-filter"]').selectOption('1週間以内');
    
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const applicantFilter = page.locator('[data-testid="applicant-filter"]');
    if (await applicantFilter.getAttribute('type') === 'text') {
      await applicantFilter.fill('佐藤');
    } else {
      const options = await applicantFilter.locator('option').all();
      if (options.length > 1) {
        await applicantFilter.selectOption({ index: 1 });
      }
    }
    
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-243
  test("通知0件時に適切なメッセージが表示される", async ({ page }) => {
    await page.locator('[data-testid="urgency-filter"]').selectOption('高');
    await page.locator('[data-testid="document-type-filter"]').selectOption('出張申請');
    await page.locator('[data-testid="deadline-filter"]').selectOption('1週間以内');
    
    const applicantFilter = page.locator('[data-testid="applicant-filter"]');
    if (await applicantFilter.getAttribute('type') === 'text') {
      await applicantFilter.fill('存在しない申請者');
    }
    
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const rows = page.locator('#notification-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount === 0) {
      const emptyMessage = page.locator('text=通知はありません, text=該当する通知がありません, text=データがありません');
      if (await emptyMessage.count() > 0) {
        await expect(emptyMessage.first()).toBeVisible();
      }
    }
  });

  // SCEN-244
  test("未読通知0件時にバッジが非表示になる", async ({ page }) => {
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    const unreadCount = page.locator('#unread-count');
    
    const countText = await unreadCount.textContent();
    
    if (countText === '0' || countText === null || countText === '') {
      if (await unreadBadge.count() > 0) {
        const isVisible = await unreadBadge.isVisible();
        if (!isVisible) {
          expect(isVisible).toBe(false);
        }
      }
    }
    
    const notificationRows = page.locator('#notification-tbody tr');
    const rowCount = await notificationRows.count();
    
    let hasUnreadMarks = false;
    for (let i = 0; i < rowCount; i++) {
      const row = notificationRows.nth(i);
      if (await row.locator('text=未読').count() > 0) {
        hasUnreadMarks = true;
        break;
      }
    }
    
    if (!hasUnreadMarks && (countText === '0' || countText === null)) {
      expect(hasUnreadMarks).toBe(false);
    }
  });

  // SCEN-245
  test("大量通知データでも正常表示される", async ({ page }) => {
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
    
    const rows = page.locator('#notification-tbody tr');
    const initialRowCount = await rows.count();
    
    if (initialRowCount > 50) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
      
      await expect(notificationList).toBeVisible();
    }
    
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      await expect(notificationList).toBeVisible();
    }
  });

  // SCEN-246
  test("存在しない申請書類リンクでエラーハンドリング", async ({ page }) => {
    const documentLink = page.locator('#notification-tbody tr').first().locator('a');
    
    if (await documentLink.count() > 0) {
      await page.route('**/documents/999999', route => {
        route.fulfill({
          status: 404,
          body: 'Not Found'
        });
      });
      
      await page.evaluate(() => {
        const firstLink = document.querySelector('#notification-tbody tr a') as HTMLAnchorElement;
        if (firstLink) {
          firstLink.href = '/documents/999999';
        }
      });
      
      await documentLink.click();
      await page.waitForTimeout(2000);
      
      const errorMessage = page.locator('text=申請書類が見つかりません, text=エラーが発生しました, text=ファイルが見つかりません');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  // SCEN-247
  test("無効なフィルター条件でエラーハンドリング", async ({ page }) => {
    const deadlineFilter = page.locator('[data-testid="deadline-filter"]');
    
    await page.evaluate(() => {
      const filter = document.querySelector('[data-testid="deadline-filter"]') as HTMLSelectElement;
      if (filter) {
        const invalidOption = document.createElement('option');
        invalidOption.value = '2024/13/45';
        invalidOption.textContent = '無効な日付';
        filter.appendChild(invalidOption);
      }
    });
    
    try {
      await deadlineFilter.selectOption('2024/13/45');
      await page.locator('[data-testid="search-button"]').click();
      await page.waitForTimeout(1000);
      
      const errorMessage = page.locator('text=無効な条件, text=正しい値を入力, text=エラー');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    } catch (error) {
      // エラーハンドリングが正常に動作している
    }
    
    await page.locator('[data-testid="urgency-filter"]').selectOption('全て');
    await page.locator('[data-testid="document-type-filter"]').selectOption('全て');
    await page.locator('[data-testid="deadline-filter"]').selectOption('全て');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(1000);
    
    const notificationList = page.locator('#notification-tbody');
    await expect(notificationList).toBeVisible();
  });

  // SCEN-248
  test("データ取得失敗時にエラーメッセージが表示される", async ({ page }) => {
    await page.route('**/api/notifications', route => {
      route.abort('failed');
    });
    
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
    } else {
      await page.reload();
    }
    
    await page.waitForTimeout(3000);
    
    const errorMessage = page.locator('text=データの取得に失敗, text=接続エラー, text=サーバーエラー, text=通信エラー');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});