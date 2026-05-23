import { test, expect } from '@playwright/test';

test.describe("処理ルート変更・通知画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422283293.html");
  });

  // SCEN-090: [normal] 処理ルート変更・通知画面 - 申請書類選択から処理ルート変更まで一連の操作が完了する
  test("申請書類選択から処理ルート変更まで一連の操作が完了する", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎 - 2024/01/15');
    await page.waitForTimeout(500);
    await expect(page.locator('#current-route-display')).toContainText('現在の処理ルート');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート（部長→役員）');
    await page.fill('[data-testid="change-reason"]', '処理ルート変更が必要なため');
    await page.click('[data-testid="confirm-change-btn"]');
    await expect(page.locator('#confirmation-modal')).toBeVisible();
    await page.click('[data-testid="modal-confirm-btn"]');
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-091: [normal] 処理ルート変更・通知画面 - 承認者変更後に新しい処理ルートで変更実行できる
  test("承認者変更後に新しい処理ルートで変更実行できる", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 佐藤花子 - 2024/01/16');
    await page.click('[data-testid="change-approver-btn"]');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート（役員直接）');
    await page.fill('[data-testid="change-reason"]', '承認者変更のため');
    await page.click('[data-testid="confirm-change-btn"]');
    await expect(page.locator('#confirmation-content')).toBeVisible();
    await page.click('[data-testid="modal-confirm-btn"]');
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-092: [normal] 処理ルート変更・通知画面 - 通知対象者選択して通知メッセージ送信が完了する
  test("通知対象者選択して通知メッセージ送信が完了する", async ({ page }) => {
    await page.check('[data-testid="notify-user1"]');
    await page.check('[data-testid="notify-user2"]');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更の通知メッセージです');
    await page.click('[data-testid="send-notification-btn"]');
    await page.click('[data-testid="modal-confirm-btn"]');
    await expect(page.locator('#success-message')).toBeVisible();
  });

  // SCEN-093: [normal] 処理ルート変更・通知画面 - 変更内容確認後にキャンセルして元画面に戻る
  test("変更内容確認後にキャンセルして元画面に戻る", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '稟議申請 - 山田次郎 - 2024/01/17');
    await page.selectOption('[data-testid="new-route-select"]', '特別承認ルート（委員会経由）');
    await page.fill('[data-testid="change-reason"]', 'テスト変更');
    await page.click('[data-testid="confirm-change-btn"]');
    await expect(page.locator('#confirmation-modal')).toBeVisible();
    await page.click('[data-testid="modal-cancel-btn"]');
    await expect(page.locator('#confirmation-modal')).toBeHidden();
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
  });

  // SCEN-094: [error] 処理ルート変更・通知画面 - 申請書類未選択で処理ルート変更実行時エラー表示
  test("申請書類未選択で処理ルート変更実行時エラー表示", async ({ page }) => {
    await page.click('[data-testid="route-update-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('申請書類');
  });

  // SCEN-095: [error] 処理ルート変更・通知画面 - 新しい処理ルート未選択で変更実行時エラー表示
  test("新しい処理ルート未選択で変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎 - 2024/01/15');
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('処理ルート');
  });

  // SCEN-096: [error] 処理ルート変更・通知画面 - 変更理由未入力で処理ルート変更実行時エラー表示
  test("変更理由未入力で処理ルート変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '出張申請 - 鈴木美咲 - 2024/01/18');
    await page.selectOption('[data-testid="new-route-select"]', '簡易承認ルート（課長のみ）');
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('変更理由');
  });

  // SCEN-097: [error] 処理ルート変更・通知画面 - 通知対象者未選択で通知送信時エラー表示
  test("通知対象者未選択で通知送信時エラー表示", async ({ page }) => {
    await page.fill('[data-testid="notification-message"]', '通知メッセージのテスト');
    await page.click('[data-testid="send-notification-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('通知対象者');
  });

  // SCEN-098: [error] 処理ルート変更・通知画面 - 通知メッセージ未入力で通知送信時エラー表示
  test("通知メッセージ未入力で通知送信時エラー表示", async ({ page }) => {
    await page.check('[data-testid="notify-user1"]');
    await page.click('[data-testid="send-notification-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('通知メッセージ');
  });

  // SCEN-099: [edge] 処理ルート変更・通知画面 - 変更理由テキストエリア文字数上限でバリデーション
  test("変更理由テキストエリア文字数上限でバリデーション", async ({ page }) => {
    const longText = 'あ'.repeat(200);
    await page.fill('[data-testid="change-reason"]', longText);
    const overLimitText = longText + 'い';
    await page.fill('[data-testid="change-reason"]', overLimitText);
    await expect(page.locator('#reason-char-count')).toContainText('200');
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-100: [edge] 処理ルート変更・通知画面 - 通知メッセージテキストエリア文字数上限でバリデーション
  test("通知メッセージテキストエリア文字数上限でバリデーション", async ({ page }) => {
    const limitText = 'あ'.repeat(1000);
    await page.fill('[data-testid="notification-message"]', limitText);
    await expect(page.locator('#message-char-count')).toContainText('1000');
    const overLimitText = limitText + 'い';
    await page.fill('[data-testid="notification-message"]', overLimitText);
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-101: [edge] 処理ルート変更・通知画面 - 通知対象者全選択・全解除の動作確認
  test("通知対象者全選択・全解除の動作確認", async ({ page }) => {
    await page.click('[data-testid="select-all-btn"]');
    await expect(page.locator('[data-testid="notify-user1"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-user2"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-user3"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-user4"]')).toBeChecked();
    
    await page.click('[data-testid="deselect-all-btn"]');
    await expect(page.locator('[data-testid="notify-user1"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-user2"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-user3"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-user4"]')).not.toBeChecked();
  });

  // SCEN-102: [edge] 処理ルート変更・通知画面 - 同一処理ルート選択時の警告表示
  test("同一処理ルート選択時の警告表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎 - 2024/01/15');
    await page.waitForTimeout(500);
    const currentRouteText = await page.locator('#current-route-display').textContent();
    
    if (currentRouteText?.includes('標準承認ルート')) {
      await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート（部長→役員）');
    } else {
      await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート（役員直接）');
    }
    
    await page.click('[data-testid="execute-change-btn"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });
});