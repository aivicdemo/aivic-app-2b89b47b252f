import { test, expect } from '@playwright/test';

test.describe("結果通知処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422470870.html");
  });

  // SCEN-286
  test('[normal] 結果通知処理 - 承認済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await expect(page.locator('#application-tbody tr')).not.toHaveCount(0);
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=最終承認日時')).toBeVisible();
    await expect(page.locator('text=通知状況')).toBeVisible();
  });

  // SCEN-287
  test('[normal] 結果通知処理 - 却下済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'rejected');
    await page.click('#btn-search');
    await expect(page.locator('#application-tbody tr')).not.toHaveCount(0);
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=最終承認日時')).toBeVisible();
    await expect(page.locator('text=通知状況')).toBeVisible();
  });

  // SCEN-288
  test('[normal] 結果通知処理 - メール通知での結果通知送信', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知送信が完了しました')).toBeVisible();
  });

  // SCEN-289
  test('[normal] 結果通知処理 - システム内通知での結果通知送信', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-system');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'システム内通知');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', '承認結果をお知らせします。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知送信が完了しました')).toBeVisible();
  });

  // SCEN-290
  test('[normal] 結果通知処理 - SMS通知での結果通知送信', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'SMS通知');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'SMS通知テスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知送信が完了しました')).toBeVisible();
  });

  // SCEN-291
  test('[normal] 結果通知処理 - 複数通知方法選択での通知送信', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.check('#notify-sms');
    await page.check('#notify-system');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', '複数通知テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', '複数通知方法テスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知送信が完了しました')).toBeVisible();
  });

  // SCEN-292
  test('[normal] 結果通知処理 - 通知テンプレート選択変更', async ({ page }) => {
    await page.selectOption('#notification-template', 'approved');
    await expect(page.locator('#notification-template')).toHaveValue('approved');
    await page.selectOption('#notification-template', 'rejected');
    await expect(page.locator('#notification-template')).toHaveValue('rejected');
    await page.selectOption('#notification-template', 'custom');
    await expect(page.locator('#notification-template')).toHaveValue('custom');
  });

  // SCEN-293
  test('[normal] 結果通知処理 - 通知内容プレビュー表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'プレビューテスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'プレビュー表示テスト');
    await page.click('#btn-preview');
    await expect(page.locator('text=通知プレビュー')).toBeVisible();
  });

  // SCEN-294
  test('[error] 結果通知処理 - 通知方法未選択での送信エラー', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'エラーテスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', '通知方法未選択テスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知方法を選択してください')).toBeVisible();
  });

  // SCEN-295
  test('[error] 結果通知処理 - 通知テンプレート未選択での送信エラー', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.fill('#notification-subject', 'テンプレート未選択テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'テンプレート未選択エラーテスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知テンプレートを選択してください')).toBeVisible();
  });

  // SCEN-296
  test('[error] 結果通知処理 - メール送信失敗時のエラー処理', async ({ page }) => {
    await page.route('**/api/notifications/email', route => {
      route.fulfill({ status: 500, body: 'Mail server error' });
    });
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'メール送信失敗テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'メール送信エラーテスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=メール送信に失敗しました')).toBeVisible();
  });

  // SCEN-297
  test('[error] 結果通知処理 - SMS送信失敗時のエラー処理', async ({ page }) => {
    await page.route('**/api/notifications/sms', route => {
      route.fulfill({ status: 500, body: 'SMS service error' });
    });
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'SMS送信失敗テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'SMS送信エラーテスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=SMS送信に失敗しました')).toBeVisible();
  });

  // SCEN-298
  test('[edge] 結果通知処理 - 通知対象申請0件での画面表示', async ({ page }) => {
    await page.fill('#search-application-id', 'NONEXISTENT');
    await page.click('#btn-search');
    await expect(page.locator('text=通知対象の申請はありません')).toBeVisible();
    await expect(page.locator('#application-tbody tr')).toHaveCount(0);
  });

  // SCEN-299
  test('[edge] 結果通知処理 - 通知対象申請大量件数での一覧表示', async ({ page }) => {
    await page.route('**/api/applications/search', route => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `APP-${i + 1}`,
        title: `申請書類${i + 1}`,
        status: 'approved'
      }));
      route.fulfill({ status: 200, json: { data: largeDataset, total: 1000 } });
    });
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.waitForSelector('#application-tbody tr');
    const rowCount = await page.locator('#application-tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // SCEN-300
  test('[edge] 結果通知処理 - 申請者メールアドレス未設定での通知', async ({ page }) => {
    await page.route('**/api/applications/search', route => {
      route.fulfill({
        status: 200,
        json: {
          data: [{ id: 'APP-001', title: 'テスト申請', status: 'approved', applicantEmail: null }],
          total: 1
        }
      });
    });
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', 'メール未設定テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', 'メール未設定エラーテスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=申請者のメールアドレスが設定されていません')).toBeVisible();
  });

  // SCEN-301
  test('[edge] 結果通知処理 - 申請者電話番号未設定でのSMS通知', async ({ page }) => {
    await page.route('**/api/applications/search', route => {
      route.fulfill({
        status: 200,
        json: {
          data: [{ id: 'APP-001', title: 'テスト申請', status: 'approved', applicantPhone: null }],
          total: 1
        }
      });
    });
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await page.click('#application-tbody tr:first-child');
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved');
    await page.fill('#notification-subject', '電話番号未設定テスト');
    await page.fill('#sender-name', 'システム管理者');
    await page.fill('#notification-content', '電話番号未設定エラーテスト');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=申請者の電話番号が設定されていません')).toBeVisible();
  });
});