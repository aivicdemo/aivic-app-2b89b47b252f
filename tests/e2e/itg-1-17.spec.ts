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

  test('SCEN-286: [normal] 結果通知処理 - 承認済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await expect(page.locator('#application-tbody')).toBeVisible();
    await expect(page.locator('text=申請番号')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=最終承認日時')).toBeVisible();
    await expect(page.locator('text=通知状況')).toBeVisible();
  });

  test('SCEN-287: [normal] 結果通知処理 - 却下済み申請の通知対象一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'rejected');
    await page.click('#btn-search');
    await expect(page.locator('#application-tbody')).toBeVisible();
    await expect(page.locator('text=申請番号')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=最終承認日時')).toBeVisible();
    await expect(page.locator('text=通知状況')).toBeVisible();
  });

  test('SCEN-288: [normal] 結果通知処理 - メール通知での結果通知送信', async ({ page }) => {
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test('SCEN-289: [normal] 結果通知処理 - システム内通知での結果通知送信', async ({ page }) => {
    await page.check('#notify-system');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知送信')).toBeVisible();
  });

  test('SCEN-290: [normal] 結果通知処理 - SMS通知での結果通知送信', async ({ page }) => {
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=SMS送信完了')).toBeVisible();
  });

  test('SCEN-291: [normal] 結果通知処理 - 複数通知方法選択での通知送信', async ({ page }) => {
    await page.check('#notify-email');
    await page.check('#notify-system');
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test('SCEN-292: [normal] 結果通知処理 - 通知テンプレート選択変更', async ({ page }) => {
    await page.selectOption('#notification-template', 'rejected_notification');
    await expect(page.locator('#notification-template')).toHaveValue('rejected_notification');
    await page.click('#btn-preview');
    await expect(page.locator('text=プレビュー確認')).toBeVisible();
  });

  test('SCEN-293: [normal] 結果通知処理 - 通知内容プレビュー表示', async ({ page }) => {
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-preview');
    await expect(page.locator('text=プレビュー確認')).toBeVisible();
  });

  test('SCEN-294: [error] 結果通知処理 - 通知方法未選択での送信エラー', async ({ page }) => {
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知方法を選択してください')).toBeVisible();
  });

  test('SCEN-295: [error] 結果通知処理 - 通知テンプレート未選択での送信エラー', async ({ page }) => {
    await page.check('#notify-email');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知テンプレートを選択してください')).toBeVisible();
  });

  test('SCEN-296: [error] 結果通知処理 - メール送信失敗時のエラー処理', async ({ page }) => {
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    
    await page.route('**/send-email', route => route.abort());
    
    await page.click('#btn-send-notification');
    await expect(page.locator('text=メール送信に失敗しました')).toBeVisible();
  });

  test('SCEN-297: [error] 結果通知処理 - SMS送信失敗時のエラー処理', async ({ page }) => {
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    
    await page.route('**/send-sms', route => route.abort());
    
    await page.click('#btn-send-notification');
    await expect(page.locator('text=SMS送信に失敗しました')).toBeVisible();
  });

  test('SCEN-298: [edge] 結果通知処理 - 通知対象申請0件での画面表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'approved');
    await page.click('#btn-search');
    await expect(page.locator('text=通知対象の申請はありません')).toBeVisible();
  });

  test('SCEN-299: [edge] 結果通知処理 - 通知対象申請大量件数での一覧表示', async ({ page }) => {
    await page.selectOption('#filter-status', 'すべて');
    await page.click('#btn-search');
    await expect(page.locator('#application-tbody')).toBeVisible();
    const loadTime = await page.evaluate(() => performance.now());
    expect(loadTime).toBeLessThan(5000);
  });

  test('SCEN-300: [edge] 結果通知処理 - 申請者メールアドレス未設定での通知', async ({ page }) => {
    await page.check('#notify-email');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=メールアドレスが設定されていません')).toBeVisible();
  });

  test('SCEN-301: [edge] 結果通知処理 - 申請者電話番号未設定でのSMS通知', async ({ page }) => {
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', 'approved_notification');
    await page.fill('#notification-subject', '申請承認通知');
    await page.fill('#sender-name', '事務局長');
    await page.fill('#notification-content', '申請が承認されました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=電話番号が設定されていません')).toBeVisible();
  });
});