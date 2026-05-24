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
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('#notifications-tbody')).toBeVisible();
    await expect(page.locator('thead')).toContainText('申請書類名');
    await expect(page.locator('thead')).toContainText('申請種別');
    await expect(page.locator('thead')).toContainText('通知日時');
    await expect(page.locator('thead')).toContainText('承認期限');
  });

  // SCEN-235
  test("未読通知件数バッジが正確に表示される", async ({ page }) => {
    const badge = page.locator('#unread-badge');
    await expect(badge).toBeVisible();
    const initialCount = await badge.textContent();
    
    const firstNotification = page.locator('#notifications-tbody tr').first();
    await firstNotification.click();
    
    await page.reload();
    const updatedCount = await badge.textContent();
    expect(parseInt(updatedCount || '0')).toBe(parseInt(initialCount || '0') - 1);
  });

  // SCEN-236
  test("緊急度フィルターで通知を絞り込める", async ({ page }) => {
    await page.selectOption('#filter-priority', '高');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-priority', '中');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-priority', '低');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-priority', 'すべて');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-237
  test("文書種別フィルターで通知を絞り込める", async ({ page }) => {
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-document-type', '経費申請');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-document-type', 'すべて');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-238
  test("申請者フィルターで通知を絞り込める", async ({ page }) => {
    await page.selectOption('#filter-applicant', '田中太郎');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-applicant', 'すべて');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-239
  test("期限フィルターで通知を絞り込める", async ({ page }) => {
    await page.selectOption('#filter-deadline', '今日まで');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-deadline', '1週間以内');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-deadline', '1ヶ月以内');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-deadline', 'すべて');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-240
  test("申請書類名リンクから詳細画面に遷移できる", async ({ page }) => {
    const documentLink = page.locator('#notifications-tbody tr').first().locator('td').first().locator('a');
    await expect(documentLink).toBeVisible();
    await documentLink.click();
    await expect(page).toHaveURL(/\/panels\/scr-\d+\.html/);
  });

  // SCEN-241
  test("遅延警告アラートが表示される", async ({ page }) => {
    await expect(page.locator('#delay-alert')).toBeVisible();
    await expect(page.locator('#delay-message')).toContainText('⚠️');
    await expect(page.locator('#delay-message')).toContainText('遅延警告');
  });

  // SCEN-242
  test("複数フィルター組み合わせで絞り込める", async ({ page }) => {
    await page.selectOption('#filter-document-type', '経費申請');
    await page.selectOption('#filter-priority', '高');
    await page.selectOption('#filter-deadline', '1週間以内');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();

    await page.selectOption('#filter-applicant', '田中太郎');
    await page.click('#btn-search');
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-243
  test("通知0件時に適切なメッセージが表示される", async ({ page }) => {
    await page.selectOption('#filter-document-type', '備品購入');
    await page.selectOption('#filter-priority', '緊急');
    await page.click('#btn-search');
    await expect(page.locator('#empty-message')).toBeVisible();
    await expect(page.locator('#empty-message')).toContainText('通知はありません');
  });

  // SCEN-244
  test("未読通知0件時にバッジが非表示になる", async ({ page }) => {
    const notifications = page.locator('#notifications-tbody tr');
    const count = await notifications.count();
    
    for (let i = 0; i < count; i++) {
      await notifications.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    await page.reload();
    await expect(page.locator('#unread-badge')).not.toBeVisible();
  });

  // SCEN-245
  test("大量通知データでも正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('#notifications-tbody')).toBeVisible();
    
    const notifications = page.locator('#notifications-tbody tr');
    const count = await notifications.count();
    expect(count).toBeGreaterThan(0);
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('#notifications-tbody')).toBeVisible();
  });

  // SCEN-246
  test("存在しない申請書類リンクでエラーハンドリング", async ({ page }) => {
    await page.evaluate(() => {
      const link = document.querySelector('#notifications-tbody tr:first-child td:first-child a') as HTMLAnchorElement;
      if (link) {
        link.href = '/panels/scr-999999.html';
      }
    });
    
    const documentLink = page.locator('#notifications-tbody tr').first().locator('td').first().locator('a');
    await documentLink.click();
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('申請書類が見つかりません');
  });

  // SCEN-247
  test("無効なフィルター条件でエラーハンドリング", async ({ page }) => {
    await page.evaluate(() => {
      const deadlineSelect = document.querySelector('#filter-deadline') as HTMLSelectElement;
      if (deadlineSelect) {
        const option = document.createElement('option');
        option.value = 'invalid_date';
        option.textContent = '2024/13/45';
        deadlineSelect.appendChild(option);
      }
    });
    
    await page.selectOption('#filter-deadline', 'invalid_date');
    await page.click('#btn-search');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('エラー:');
  });

  // SCEN-248
  test("データ取得失敗時にエラーメッセージが表示される", async ({ page }) => {
    await page.route('**/api/notifications', route => route.abort());
    
    await page.click('#btn-refresh');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('エラー:');
  });
});