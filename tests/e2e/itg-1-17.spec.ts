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
  test("承認済み申請の通知対象一覧表示", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await expect(page.locator('#applications-list')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toContainText('申請者名');
  });

  // SCEN-287
  test("却下済み申請の通知対象一覧表示", async ({ page }) => {
    await page.selectOption('#select-approval-status', '却下');
    await page.click('#btn-search');
    await expect(page.locator('#applications-list')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toContainText('申請者名');
  });

  // SCEN-288
  test("メール通知での結果通知送信", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('#confirm-modal')).toBeVisible();
    await page.click('#btn-confirm-ok');
  });

  // SCEN-289
  test("システム内通知での結果通知送信", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-system');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('#confirm-modal')).toBeVisible();
    await page.click('#btn-confirm-ok');
  });

  // SCEN-290
  test("SMS通知での結果通知送信", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-sms');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('#confirm-modal')).toBeVisible();
    await page.click('#btn-confirm-ok');
  });

  // SCEN-291
  test("複数通知方法選択での通知送信", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.check('#notify-sms');
    await page.check('#notify-system');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await expect(page.locator('#confirm-modal')).toBeVisible();
    await page.click('#btn-confirm-ok');
  });

  // SCEN-292
  test("通知テンプレート選択変更", async ({ page }) => {
    await page.selectOption('#select-template', '却下通知テンプレート');
    await expect(page.locator('#select-template')).toHaveValue('却下通知テンプレート');
    await page.selectOption('#select-template', 'カスタムテンプレート');
    await expect(page.locator('#select-template')).toHaveValue('カスタムテンプレート');
  });

  // SCEN-293
  test("通知内容プレビュー表示", async ({ page }) => {
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-preview');
    await expect(page.locator('#preview-modal')).toBeVisible();
    await expect(page.locator('#preview-content')).toContainText('承認が完了しました。');
    await page.click('#btn-close-preview');
  });

  // SCEN-294
  test("通知方法未選択での送信エラー", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.fill('#notification-content', 'テスト通知内容');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知方法を選択してください')).toBeVisible();
  });

  // SCEN-295
  test("通知テンプレート未選択での送信エラー", async ({ page }) => {
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.fill('#notification-content', 'テスト通知内容');
    await page.click('#btn-send-notification');
    await expect(page.locator('text=通知テンプレートを選択してください')).toBeVisible();
  });

  // SCEN-296
  test("メール送信失敗時のエラー処理", async ({ page }) => {
    await page.route('**/api/notifications/email', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Mail server error' }) });
    });
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-ok');
    await expect(page.locator('text=メール送信に失敗しました')).toBeVisible();
  });

  // SCEN-297
  test("SMS送信失敗時のエラー処理", async ({ page }) => {
    await page.route('**/api/notifications/sms', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'SMS service error' }) });
    });
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-sms');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-ok');
    await expect(page.locator('text=SMS送信に失敗しました')).toBeVisible();
  });

  // SCEN-298
  test("通知対象申請0件での画面表示", async ({ page }) => {
    await page.selectOption('#select-approval-status', '取下げ');
    await page.click('#btn-search');
    await expect(page.locator('text=通知対象の申請はありません')).toBeVisible();
  });

  // SCEN-299
  test("通知対象申請大量件数での一覧表示", async ({ page }) => {
    await page.route('**/api/applications', route => {
      const applications = Array(1200).fill(null).map((_, i) => ({
        id: `app-${i}`,
        title: `申請書類 ${i}`,
        applicant: `申請者 ${i}`,
        approvalDate: '2024-01-01',
        status: '承認済'
      }));
      route.fulfill({ status: 200, body: JSON.stringify({ data: applications, total: 1200 }) });
    });
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await expect(page.locator('#applications-list')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toContainText('申請書類');
  });

  // SCEN-300
  test("申請者メールアドレス未設定での通知", async ({ page }) => {
    await page.route('**/api/notifications/email', route => {
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Email address not found' }) });
    });
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-email');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-ok');
    await expect(page.locator('text=メールアドレスが設定されていません')).toBeVisible();
  });

  // SCEN-301
  test("申請者電話番号未設定でのSMS通知", async ({ page }) => {
    await page.route('**/api/notifications/sms', route => {
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'Phone number not found' }) });
    });
    await page.selectOption('#select-approval-status', '承認済');
    await page.click('#btn-search');
    await page.check('#notify-sms');
    await page.selectOption('#select-template', '承認通知テンプレート');
    await page.fill('#notification-content', '承認が完了しました。');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-ok');
    await expect(page.locator('text=電話番号が設定されていません')).toBeVisible();
  });
});