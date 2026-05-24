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

  test('SCEN-286: 承認済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', '承認済');
    await page.click('#btn-search');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toContainText('申請者名');
    await expect(page.locator('#notification-tbody')).toContainText('最終承認日時');
    await expect(page.locator('#notification-tbody')).toContainText('通知状況');
  });

  test('SCEN-287: 却下済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', '却下');
    await page.click('#btn-search');
    await expect(page.locator('#notification-tbody')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toContainText('申請者名');
  });

  test('SCEN-288: メール通知での結果通知送信', async ({ page }) => {
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-289: システム内通知での結果通知送信', async ({ page }) => {
    await page.click('#btn-search');
    await page.check('#notify-system');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-290: SMS通知での結果通知送信', async ({ page }) => {
    await page.click('#btn-search');
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-291: 複数通知方法選択での通知送信', async ({ page }) => {
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.check('#notify-sms');
    await page.check('#notify-system');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-292: 通知テンプレート選択変更', async ({ page }) => {
    await page.selectOption('#notification-template', '却下通知テンプレート');
    await expect(page.locator('#notification-template')).toHaveValue('却下通知テンプレート');
    await page.check('#notify-email');
    await page.click('#btn-send-notification');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  test('SCEN-293: 通知内容プレビュー表示', async ({ page }) => {
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-preview');
    await expect(page.locator('#notification-preview')).toContainText('通知内容プレビュー');
  });

  test('SCEN-294: 通知方法未選択での送信エラー', async ({ page }) => {
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-295: 通知テンプレート未選択での送信エラー', async ({ page }) => {
    await page.check('#notify-email');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-296: メール送信失敗時のエラー処理', async ({ page }) => {
    await page.route('**/api/send-notification', route => route.abort());
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-297: SMS送信失敗時のエラー処理', async ({ page }) => {
    await page.route('**/api/send-sms', route => route.abort());
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-298: 通知対象申請0件での画面表示', async ({ page }) => {
    await page.fill('#search-application-id', '存在しない番号');
    await page.click('#btn-search');
    await expect(page.locator('#notification-tbody')).toBeEmpty();
  });

  test('SCEN-299: 通知対象申請大量件数での一覧表示', async ({ page }) => {
    await page.click('#btn-search');
    await expect(page.locator('#notification-list')).toBeVisible();
    await expect(page.locator('#notification-tbody')).toContainText('申請者名');
  });

  test('SCEN-300: 申請者メールアドレス未設定での通知', async ({ page }) => {
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-301: 申請者電話番号未設定でのSMS通知', async ({ page }) => {
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', '承認通知テンプレート');
    await page.click('#btn-send-notification');
    await expect(page.locator('#error-message')).toBeVisible();
  });
});