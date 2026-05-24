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

  test('SCEN-090: 申請書類選択から処理ルート変更まで一連の操作が完了する', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    await expect(page.locator('#current-route-display')).toContainText('現在の処理ルート');
    await page.click('[data-testid="change-approver-btn"]');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    await page.fill('[data-testid="change-reason"]', '承認者変更のため処理ルートを変更します。');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('#confirmation-content')).toContainText('変更内容確認');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
    await expect(page.locator('#current-route-display')).toContainText('標準承認ルート');
  });

  test('SCEN-091: 承認者変更後に新しい処理ルートで変更実行できる', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    await page.click('button:has-text("承認者変更")');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート');
    await page.fill('[data-testid="change-reason"]', '緊急案件のため承認ルートを変更');
    await page.click('button:has-text("処理ルート変更実行")');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  test('SCEN-092: 通知対象者選択して通知メッセージ送信が完了する', async ({ page }) => {
    await page.check('input[name="notify-target"]:first-child');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更の通知です。確認をお願いします。');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
  });

  test('SCEN-093: 変更内容確認後にキャンセルして元画面に戻る', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    await page.fill('[data-testid="change-reason"]', 'テスト用の変更理由');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('#confirmation-modal')).toBeVisible();
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('#confirmation-modal')).toBeHidden();
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
  });

  test('SCEN-094: 申請書類未選択で処理ルート変更実行時エラー表示', async ({ page }) => {
    await page.click('[data-testid="route-update-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('申請書類を選択してください');
  });

  test('SCEN-095: 新しい処理ルート未選択で変更実行時エラー表示', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-096: 変更理由未入力で処理ルート変更実行時エラー表示', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-097: 通知対象者未選択で通知送信時エラー表示', async ({ page }) => {
    await page.fill('[data-testid="notification-message"]', '通知メッセージです');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-098: 通知メッセージ未入力で通知送信時エラー表示', async ({ page }) => {
    await page.check('input[name="notify-target"]:first-child');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-099: 変更理由テキストエリア文字数上限でバリデーション', async ({ page }) => {
    const longText = 'あ'.repeat(1001);
    await page.fill('[data-testid="change-reason"]', longText);
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('#reason-char-count')).toContainText('1001');
  });

  test('SCEN-100: 通知メッセージテキストエリア文字数上限でバリデーション', async ({ page }) => {
    const validText = 'あ'.repeat(1000);
    await page.fill('[data-testid="notification-message"]', validText);
    await expect(page.locator('#message-char-count')).toContainText('1000');
    
    const invalidText = 'あ'.repeat(1001);
    await page.fill('[data-testid="notification-message"]', invalidText);
    await page.check('input[name="notify-target"]:first-child');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-101: 通知対象者全選択・全解除の動作確認', async ({ page }) => {
    await page.click('[data-testid="select-all-btn"]');
    const checkedCount1 = await page.locator('input[name="notify-target"]:checked').count();
    expect(checkedCount1).toBeGreaterThan(0);
    
    await page.click('[data-testid="deselect-all-btn"]');
    const checkedCount2 = await page.locator('input[name="notify-target"]:checked').count();
    expect(checkedCount2).toBe(0);
    
    await page.click('[data-testid="select-all-btn"]');
    await page.uncheck('input[name="notify-target"]:first-child');
    await page.click('[data-testid="deselect-all-btn"]');
    const checkedCount3 = await page.locator('input[name="notify-target"]:checked').count();
    expect(checkedCount3).toBe(0);
  });

  test('SCEN-102: 同一処理ルート選択時の警告表示', async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 田中太郎');
    const currentRoute = await page.locator('#current-route-display').textContent();
    
    if (currentRoute?.includes('標準承認ルート')) {
      await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    } else {
      await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート');
      await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート');
    }
    
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});