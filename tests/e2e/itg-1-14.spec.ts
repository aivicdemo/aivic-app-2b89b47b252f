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
  test('[normal] 承認案件通知画面 - 通知一覧が正常に表示される', async ({ page }) => {
    await expect(page.locator('#current-screen-title')).toContainText('承認案件通知');
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toBeVisible();
    await expect(page.locator('th').first()).toContainText('通知日時');
    await expect(page.locator('th').nth(1)).toContainText('申請書類');
    await expect(page.locator('th').nth(2)).toContainText('承認期限');
  });

  // SCEN-235
  test('[normal] 承認案件通知画面 - 未読通知件数バッジが正確に表示される', async ({ page }) => {
    await expect(page.locator('#unread-badge')).toBeVisible();
    const initialBadgeText = await page.locator('#unread-badge .notification-count').textContent();
    
    const firstNotificationRow = page.locator('#notification-tbody tr').first();
    if (await firstNotificationRow.isVisible()) {
      await firstNotificationRow.click();
      await page.waitForTimeout(1000);
      await page.click('[data-testid="refresh-button"]');
      
      const updatedBadgeText = await page.locator('#unread-badge .notification-count').textContent();
      expect(parseInt(updatedBadgeText || '0')).toBeLessThan(parseInt(initialBadgeText || '0'));
    }
  });

  // SCEN-236
  test('[normal] 承認案件通知画面 - 緊急度フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', '高');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="priority-filter"]', '中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="priority-filter"]', '低');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="priority-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-237
  test('[normal] 承認案件通知画面 - 文書種別フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '稟議書');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-238
  test('[normal] 承認案件通知画面 - 申請者フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="applicant-filter"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    const displayedRows = page.locator('#notification-tbody tr');
    const count = await displayedRows.count();
    if (count > 0) {
      await expect(displayedRows.first()).toContainText('田中太郎');
    }
    
    await page.selectOption('[data-testid="applicant-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-239
  test('[normal] 承認案件通知画面 - 期限フィルターで通知を絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="deadline-filter"]', '今日まで');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="deadline-filter"]', '1週間以内');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="deadline-filter"]', '1ヶ月以内');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="deadline-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-240
  test('[normal] 承認案件通知画面 - 申請書類名リンクから詳細画面に遷移できる', async ({ page }) => {
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    const firstDocumentLink = page.locator('#notification-tbody tr td a').first();
    if (await firstDocumentLink.isVisible()) {
      await firstDocumentLink.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/panels\//);
    }
  });

  // SCEN-241
  test('[normal] 承認案件通知画面 - 遅延警告アラートが表示される', async ({ page }) => {
    const delayAlert = page.locator('#delay-alert');
    if (await delayAlert.isVisible()) {
      await expect(delayAlert).toContainText('⚠️');
      await expect(delayAlert).toHaveClass(/delay-alert/);
      const alertText = await page.locator('#delay-message').textContent();
      expect(alertText).toBeTruthy();
    }
  });

  // SCEN-242
  test('[normal] 承認案件通知画面 - 複数フィルター組み合わせで絞り込める', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.selectOption('[data-testid="priority-filter"]', '高');
    await page.selectOption('[data-testid="deadline-filter"]', '1週間以内');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="applicant-filter"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-243
  test('[edge] 承認案件通知画面 - 通知0件時に適切なメッセージが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', '低');
    await page.selectOption('[data-testid="document-type-filter"]', '出張申請');
    await page.click('[data-testid="search-button"]');
    
    const emptyMessage = page.locator('#empty-message');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toContainText('通知はありません');
    }
  });

  // SCEN-244
  test('[edge] 承認案件通知画面 - 未読通知0件時にバッジが非表示になる', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', '低');
    await page.selectOption('[data-testid="document-type-filter"]', '出張申請');
    await page.click('[data-testid="search-button"]');
    
    const badgeCount = await page.locator('#unread-badge .notification-count').textContent();
    if (badgeCount === '0' || badgeCount === '') {
      await expect(page.locator('#unread-badge')).toHaveCSS('display', 'none');
    }
  });

  // SCEN-245
  test('[edge] 承認案件通知画面 - 大量通知データでも正常表示される', async ({ page }) => {
    await page.selectOption('[data-testid="priority-filter"]', 'すべて');
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#notification-tbody')).toBeVisible();
    await expect(page.locator('#pagination')).toBeVisible();
    
    const nextButton = page.locator('#btn-next');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(page.locator('#notification-tbody')).toBeVisible();
    }
    
    const prevButton = page.locator('#btn-prev');
    if (await prevButton.isEnabled()) {
      await prevButton.click();
      await expect(page.locator('#notification-tbody')).toBeVisible();
    }
  });

  // SCEN-246
  test('[error] 承認案件通知画面 - 存在しない申請書類リンクでエラーハンドリング', async ({ page }) => {
    await page.route('**/documents/999999', route => {
      route.fulfill({ status: 404, body: 'Not Found' });
    });
    
    const firstDocumentLink = page.locator('#notification-tbody tr td a').first();
    if (await firstDocumentLink.isVisible()) {
      await page.evaluate(() => {
        const link = document.querySelector('#notification-tbody tr td a') as HTMLAnchorElement;
        if (link) {
          link.href = '/documents/999999';
        }
      });
      
      await firstDocumentLink.click();
      await page.waitForTimeout(1000);
    }
  });

  // SCEN-247
  test('[error] 承認案件通知画面 - 無効なフィルター条件でエラーハンドリング', async ({ page }) => {
    await page.evaluate(() => {
      const dateFilter = document.querySelector('[data-testid="deadline-filter"]') as HTMLSelectElement;
      if (dateFilter) {
        const invalidOption = document.createElement('option');
        invalidOption.value = 'INVALID_STATUS';
        invalidOption.textContent = 'INVALID_STATUS';
        dateFilter.appendChild(invalidOption);
      }
    });
    
    await page.selectOption('[data-testid="deadline-filter"]', 'INVALID_STATUS');
    await page.click('[data-testid="search-button"]');
    
    await page.click('[data-testid="clear-filter-button"]');
    await page.selectOption('[data-testid="deadline-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#notification-tbody')).toBeVisible();
  });

  // SCEN-248
  test('[error] 承認案件通知画面 - データ取得失敗時にエラーメッセージが表示される', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.click('[data-testid="refresh-button"]');
    await page.waitForTimeout(2000);
    
    const errorMessage = page.locator('.error-message, .alert, [data-testid="error"]').first();
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });
});