import { test, expect } from '@playwright/test';

test.describe("結果通知処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422470870.html");
  });

  test("SCEN-286: 承認済み申請の通知対象一覧表示", async ({ page }) => {
    await page.selectOption('#filter-status', '承認済み');
    await page.click('#btn-search');
    
    await expect(page.locator('#notification-target-tbody')).toBeVisible();
    await expect(page.locator('#notification-target-tbody tr')).toHaveCountGreaterThan(0);
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await expect(firstRow.locator('td').nth(0)).toContainText('申請番号');
    await expect(firstRow.locator('td').nth(1)).toContainText('申請者名');
    await expect(firstRow.locator('td').nth(2)).toContainText('最終承認日時');
    await expect(firstRow.locator('td').nth(3)).toContainText('通知状況');
  });

  test("SCEN-287: 却下済み申請の通知対象一覧表示", async ({ page }) => {
    await page.selectOption('#filter-status', '却下');
    await page.click('#btn-search');
    
    await expect(page.locator('#notification-target-tbody')).toBeVisible();
    const rows = page.locator('#notification-target-tbody tr');
    await expect(rows).toHaveCountGreaterThan(0);
    
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(0)).not.toBeEmpty();
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty();
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty();
  });

  test("SCEN-288: メール通知での結果通知送信", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-001');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.click('#btn-send-notification');
    
    await expect(page.locator('#send-confirmation-modal')).toBeVisible();
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('[data-testid="floating-notification"]')).toContainText('通知送信が完了しました');
  });

  test("SCEN-289: システム内通知での結果通知送信", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-002');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-system');
    await page.click('#btn-send-notification');
    
    await expect(page.locator('#send-confirmation-modal')).toBeVisible();
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('[data-testid="floating-notification"]')).toContainText('システム内通知を送信しました');
  });

  test("SCEN-290: SMS通知での結果通知送信", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-003');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-sms');
    await page.click('#btn-send-notification');
    
    await expect(page.locator('#send-confirmation-modal')).toBeVisible();
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('[data-testid="floating-notification"]')).toContainText('SMS通知を送信しました');
  });

  test("SCEN-291: 複数通知方法選択での通知送信", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-004');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.check('#notify-system');
    await page.check('#notify-sms');
    
    await page.click('#btn-send-notification');
    await expect(page.locator('#send-confirmation-modal')).toBeVisible();
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('[data-testid="floating-notification"]')).toContainText('すべての通知方法で送信完了しました');
  });

  test("SCEN-292: 通知テンプレート選択変更", async ({ page }) => {
    await page.selectOption('#notification-template', '却下通知テンプレート');
    await page.click('#btn-preview');
    
    await expect(page.locator('#notification-preview')).toBeVisible();
    await expect(page.locator('#notification-preview')).toContainText('却下');
    
    await page.fill('#search-application-id', 'APP-2024-005');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('[data-testid="floating-notification"]')).toContainText('却下通知テンプレートで送信完了');
  });

  test("SCEN-293: 通知内容プレビュー表示", async ({ page }) => {
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.fill('#notification-preview', '承認結果のお知らせ\n申請番号: APP-2024-001\n申請者: 田中太郎\n承認結果: 承認済み');
    
    await page.click('#btn-preview');
    
    await expect(page.locator('#notification-preview')).toBeVisible();
    await expect(page.locator('#notification-preview')).toContainText('承認結果のお知らせ');
    await expect(page.locator('#notification-preview')).toContainText('申請番号: APP-2024-001');
    await expect(page.locator('#notification-preview')).toContainText('申請者: 田中太郎');
    await expect(page.locator('#notification-preview')).toContainText('承認結果: 承認済み');
  });

  test("SCEN-294: 通知方法未選択での送信エラー", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-006');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.click('#btn-send-notification');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('通知方法を選択してください');
  });

  test("SCEN-295: 通知テンプレート未選択での送信エラー", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-2024-007');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '');
    await page.click('#btn-send-notification');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('通知テンプレートを選択してください');
  });

  test("SCEN-296: メール送信失敗時のエラー処理", async ({ page }) => {
    await page.route('**/api/send-email', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'メール送信に失敗しました' }) });
    });
    
    await page.fill('#search-application-id', 'APP-2024-008');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('メール送信に失敗しました');
  });

  test("SCEN-297: SMS送信失敗時のエラー処理", async ({ page }) => {
    await page.route('**/api/send-sms', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'SMS送信に失敗しました' }) });
    });
    
    await page.fill('#search-application-id', 'APP-2024-009');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('SMS送信に失敗しました');
  });

  test("SCEN-298: 通知対象申請0件での画面表示", async ({ page }) => {
    await page.fill('#search-application-id', 'NONEXISTENT');
    await page.click('#btn-search');
    
    await expect(page.locator('#notification-target-tbody')).toBeVisible();
    await expect(page.locator('#notification-target-tbody')).toContainText('通知対象の申請はありません');
  });

  test("SCEN-299: 通知対象申請大量件数での一覧表示", async ({ page }) => {
    await page.selectOption('#filter-document-type', '休暇申請');
    await page.click('#btn-search');
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('#notification-target-tbody')).toBeVisible();
    const rows = page.locator('#notification-target-tbody tr');
    await expect(rows).toHaveCountGreaterThan(10);
    
    await page.locator('text=次ページ').click();
    await expect(page.locator('#notification-target-tbody tr')).toHaveCountGreaterThan(0);
  });

  test("SCEN-300: 申請者メールアドレス未設定での通知", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-NO-EMAIL');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-email');
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('メールアドレスが設定されていません');
  });

  test("SCEN-301: 申請者電話番号未設定でのSMS通知", async ({ page }) => {
    await page.fill('#search-application-id', 'APP-NO-PHONE');
    await page.click('#btn-search');
    
    const firstRow = page.locator('#notification-target-tbody tr').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    await page.check('#notify-sms');
    await page.selectOption('#notification-template', '承認完了通知テンプレート');
    await page.click('#btn-send-notification');
    await page.click('#btn-confirm-send');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('電話番号が設定されていません');
  });
});