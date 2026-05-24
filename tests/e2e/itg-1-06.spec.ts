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

  test("SCEN-090: 申請書類選択から処理ルート変更まで一連の操作が完了する", async ({ page }) => {
    // SCEN-090: [normal] 処理ルート変更・通知画面 - 申請書類選択から処理ルート変更まで一連の操作が完了する
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用');
    await expect(page.locator('[data-testid="application-select"]')).toHaveValue('経費申請 - 出張費用');
    await page.click('[data-testid="route-update-button"]');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート');
    await page.fill('[data-testid="change-reason"]', '承認者の長期出張のため緊急承認ルートへ変更');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('#confirmation-content')).toContainText('変更内容確認');
    await page.click('[data-testid="modal-execute-button"]');
    await expect(page.locator('#confirmation-modal')).toContainText('変更内容確認');
  });

  test("SCEN-091: 承認者変更後に新しい処理ルートで変更実行できる", async ({ page }) => {
    // SCEN-091: [normal] 処理ルート変更・通知画面 - 承認者変更後に新しい処理ルートで変更実行できる
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 年次有給休暇');
    await page.click('text=承認者変更');
    await page.selectOption('[data-testid="new-route-select"]', '部長直接承認ルート');
    await page.fill('[data-testid="change-reason"]', '通常承認者の不在による代理承認者への変更');
    await page.click('text=処理ルート変更確認');
    await expect(page.locator('#confirmation-content')).toContainText('部長直接承認ルート');
    await page.click('text=変更実行');
    await expect(page.locator('#confirmation-modal')).toContainText('変更内容確認');
  });

  test("SCEN-092: 通知対象者選択して通知メッセージ送信が完了する", async ({ page }) => {
    // SCEN-092: [normal] 処理ルート変更・通知画面 - 通知対象者選択して通知メッセージ送信が完了する
    await page.check('[data-testid="notify-applicant"]');
    await page.check('[data-testid="notify-current-approver"]');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更により承認者が変更されました。新しい承認者からの連絡をお待ちください。');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('#confirmation-modal')).toContainText('変更内容確認');
    await page.click('[data-testid="modal-execute-button"]');
  });

  test("SCEN-093: 変更内容確認後にキャンセルして元画面に戻る", async ({ page }) => {
    // SCEN-093: [normal] 処理ルート変更・通知画面 - 変更内容確認後にキャンセルして元画面に戻る
    await page.selectOption('[data-testid="application-select"]', '稟議申請 - 設備購入');
    await page.selectOption('[data-testid="new-route-select"]', '特別承認ルート');
    await page.fill('[data-testid="change-reason"]', '高額設備購入のため特別承認ルート適用');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('#confirmation-modal')).toContainText('変更内容確認');
    await page.click('[data-testid="modal-cancel-button"]');
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
  });

  test("SCEN-094: 申請書類未選択で処理ルート変更実行時エラー表示", async ({ page }) => {
    // SCEN-094: [error] 処理ルート変更・通知画面 - 申請書類未選択で処理ルート変更実行時エラー表示
    await page.click('[data-testid="route-update-button"]');
    await expect(page.locator('#error-message')).toContainText('申請書類を選択してください');
  });

  test("SCEN-095: 新しい処理ルート未選択で変更実行時エラー表示", async ({ page }) => {
    // SCEN-095: [error] 処理ルート変更・通知画面 - 新しい処理ルート未選択で変更実行時エラー表示
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 会議費');
    await page.click('[data-testid="route-update-button"]');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('#error-message')).toContainText('新しい処理ルートを選択してください');
  });

  test("SCEN-096: 変更理由未入力で処理ルート変更実行時エラー表示", async ({ page }) => {
    // SCEN-096: [error] 処理ルート変更・通知画面 - 変更理由未入力で処理ルート変更実行時エラー表示
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認ルート');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('#error-message')).toContainText('変更理由を入力してください');
  });

  test("SCEN-097: 通知対象者未選択で通知送信時エラー表示", async ({ page }) => {
    // SCEN-097: [error] 処理ルート変更・通知画面 - 通知対象者未選択で通知送信時エラー表示
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 年次有給休暇');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    await page.fill('[data-testid="change-reason"]', '通常の処理ルート変更');
    await page.fill('[data-testid="notification-message"]', '処理ルートを変更しました');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('#error-message')).toContainText('通知対象者を選択してください');
  });

  test("SCEN-098: 通知メッセージ未入力で通知送信時エラー表示", async ({ page }) => {
    // SCEN-098: [error] 処理ルート変更・通知画面 - 通知メッセージ未入力で通知送信時エラー表示
    await page.selectOption('[data-testid="application-select"]', '稟議申請 - 設備購入');
    await page.selectOption('[data-testid="new-route-select"]', '特別承認ルート');
    await page.fill('[data-testid="change-reason"]', '設備購入に関する特別承認');
    await page.check('[data-testid="notify-applicant"]');
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('#error-message')).toContainText('通知メッセージを入力してください');
  });

  test("SCEN-099: 変更理由テキストエリア文字数上限でバリデーション", async ({ page }) => {
    // SCEN-099: [edge] 処理ルート変更・通知画面 - 変更理由テキストエリア文字数上限でバリデーション
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用');
    const longText = 'あ'.repeat(1000);
    await page.fill('[data-testid="change-reason"]', longText);
    const overLimitText = 'あ'.repeat(1001);
    await page.fill('[data-testid="change-reason"]', overLimitText);
    await expect(page.locator('#reason-char-count')).toContainText('1000');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('#error-message')).toContainText('文字数上限を超えています');
  });

  test("SCEN-100: 通知メッセージテキストエリア文字数上限でバリデーション", async ({ page }) => {
    // SCEN-100: [edge] 処理ルート変更・通知画面 - 通知メッセージテキストエリア文字数上限でバリデーション
    const maxText = 'あ'.repeat(1000);
    await page.fill('[data-testid="notification-message"]', maxText);
    await expect(page.locator('#message-char-count')).toContainText('1000');
    await page.click('[data-testid="send-notification-button"]');
    
    const overLimitText = 'あ'.repeat(1001);
    await page.fill('[data-testid="notification-message"]', overLimitText);
    await page.click('[data-testid="send-notification-button"]');
    await expect(page.locator('#error-message')).toContainText('文字数上限を超えています');
  });

  test("SCEN-101: 通知対象者全選択・全解除の動作確認", async ({ page }) => {
    // SCEN-101: [edge] 処理ルート変更・通知画面 - 通知対象者全選択・全解除の動作確認
    await page.click('[data-testid="select-all-button"]');
    await expect(page.locator('[data-testid="notify-applicant"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-current-approver"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).toBeChecked();
    
    await page.click('[data-testid="deselect-all-button"]');
    await expect(page.locator('[data-testid="notify-applicant"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-current-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).not.toBeChecked();
    
    await page.click('[data-testid="select-all-button"]');
    await page.uncheck('[data-testid="notify-applicant"]');
    await page.click('[data-testid="deselect-all-button"]');
    await expect(page.locator('[data-testid="notify-current-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).not.toBeChecked();
  });

  test("SCEN-102: 同一処理ルート選択時の警告表示", async ({ page }) => {
    // SCEN-102: [edge] 処理ルート変更・通知画面 - 同一処理ルート選択時の警告表示
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認ルート');
    await page.fill('[data-testid="change-reason"]', '処理ルート確認のため');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('#error-message')).toContainText('現在と同じ処理ルートが選択されています');
  });
});