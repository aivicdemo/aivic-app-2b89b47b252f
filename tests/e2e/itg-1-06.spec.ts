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

  // SCEN-090: 申請書類選択から処理ルート変更まで一連の操作が完了する
  test("[normal] 申請書類選択から処理ルート変更まで一連の操作が完了する", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用（田中太郎）');
    await expect(page.locator('#input-status')).toHaveValue('承認待ち');
    await expect(page.locator('#current-route')).toContainText('標準承認フロー（部長→役員）');
    await page.click('[data-testid="change-approver-button"]');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認フロー（役員直接）');
    await page.fill('[data-testid="change-reason"]', '緊急対応のため役員直接承認が必要');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('.confirmation-content')).toContainText('緊急承認フロー（役員直接）');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('.success-message')).toContainText('処理ルートが正常に変更されました');
    await expect(page.locator('#current-route')).toContainText('緊急承認フロー（役員直接）');
  });

  // SCEN-091: 承認者変更後に新しい処理ルートで変更実行できる
  test("[normal] 承認者変更後に新しい処理ルートで変更実行できる", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '稟議申請 - 設備購入（山田次郎）');
    await expect(page.locator('#current-route')).toContainText('標準承認フロー（部長→役員）');
    await page.click('button:has-text("承認者変更")');
    await page.selectOption('[data-testid="new-route-select"]', '特別承認フロー（部長→課長→役員）');
    await page.fill('[data-testid="change-reason"]', '専門的審査が必要なため課長審査を追加');
    await page.click('button:has-text("処理ルート変更確認")');
    await expect(page.locator('.route-display')).toContainText('特別承認フロー（部長→課長→役員）');
    await page.click('button:has-text("変更実行")');
    await expect(page.locator('.completion-message')).toContainText('処理ルート変更が完了しました');
    await expect(page.locator('.history-log')).toContainText('新しいルート情報');
  });

  // SCEN-092: 通知対象者選択して通知メッセージ送信が完了する
  test("[normal] 通知対象者選択して通知メッセージ送信が完了する", async ({ page }) => {
    await page.check('[data-testid="notify-applicant"]');
    await page.check('[data-testid="notify-current-approver"]');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更により承認フローが変更されました。ご確認をお願いします。');
    await page.click('[data-testid="notify-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('.send-success-message')).toContainText('通知メッセージの送信が完了しました');
  });

  // SCEN-093: 変更内容確認後にキャンセルして元画面に戻る
  test("[normal] 変更内容確認後にキャンセルして元画面に戻る", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 有給休暇（佐藤花子）');
    await page.selectOption('[data-testid="new-route-select"]', '簡易承認フロー（課長のみ）');
    await page.fill('[data-testid="change-reason"]', '軽微な申請のため簡易フローに変更');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('.confirmation-dialog')).toContainText('簡易承認フロー（課長のみ）');
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('[data-testid="application-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
  });

  // SCEN-094: 申請書類未選択で処理ルート変更実行時エラー表示
  test("[error] 申請書類未選択で処理ルート変更実行時エラー表示", async ({ page }) => {
    await expect(page.locator('[data-testid="application-select"]')).toContainText('選択してください');
    await page.click('[data-testid="change-approver-button"]');
    await expect(page.locator('.error-message')).toContainText('申請書類を選択してください');
  });

  // SCEN-095: 新しい処理ルート未選択で変更実行時エラー表示
  test("[error] 新しい処理ルート未選択で変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 会議費（鈴木一郎）');
    await expect(page.locator('[data-testid="new-route-select"]')).toContainText('処理ルートを選択してください');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('.error-message')).toContainText('新しい処理ルートを選択してください');
  });

  // SCEN-096: 変更理由未入力で処理ルート変更実行時エラー表示
  test("[error] 変更理由未入力で処理ルート変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '稟議申請 - 設備購入（山田次郎）');
    await page.selectOption('[data-testid="new-route-select"]', '緊急承認フロー（役員直接）');
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
    await page.click('button:has-text("変更実行")');
    await expect(page.locator('.error-message')).toContainText('変更理由を入力してください');
  });

  // SCEN-097: 通知対象者未選択で通知送信時エラー表示
  test("[error] 通知対象者未選択で通知送信時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '休暇申請 - 有給休暇（佐藤花子）');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認フロー（部長→役員）');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更のお知らせです');
    await page.click('button:has-text("通知送信")');
    await expect(page.locator('.error-message')).toContainText('通知対象者を選択してください');
  });

  // SCEN-098: 通知メッセージ未入力で通知送信時エラー表示
  test("[error] 通知メッセージ未入力で通知送信時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用（田中太郎）');
    await page.selectOption('[data-testid="new-route-select"]', '特別承認フロー（部長→課長→役員）');
    await page.check('[data-testid="notify-applicant"]');
    await expect(page.locator('[data-testid="notification-message"]')).toHaveValue('');
    await page.click('button:has-text("通知送信")');
    await expect(page.locator('.error-message')).toContainText('通知メッセージを入力してください');
  });

  // SCEN-099: 変更理由テキストエリア文字数上限でバリデーション
  test("[edge] 変更理由テキストエリア文字数上限でバリデーション", async ({ page }) => {
    const maxText = 'あ'.repeat(500);
    const overText = 'あ'.repeat(501);
    
    await page.fill('[data-testid="change-reason"]', maxText);
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue(maxText);
    
    await page.fill('[data-testid="change-reason"]', overText);
    await expect(page.locator('.validation-error')).toContainText('文字数上限を超えています');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('.error-message')).toContainText('文字数上限を超えています');
  });

  // SCEN-100: 通知メッセージテキストエリア文字数上限でバリデーション
  test("[edge] 通知メッセージテキストエリア文字数上限でバリデーション", async ({ page }) => {
    const maxText = 'あ'.repeat(1000);
    const overText = 'あ'.repeat(1001);
    
    await page.fill('[data-testid="notification-message"]', maxText);
    await page.click('button:has-text("保存")');
    await expect(page.locator('.save-success')).toContainText('保存されました');
    
    await page.fill('[data-testid="notification-message"]', overText);
    await page.click('button:has-text("保存")');
    await expect(page.locator('.validation-error')).toContainText('文字数上限を超えています');
  });

  // SCEN-101: 通知対象者全選択・全解除の動作確認
  test("[edge] 通知対象者全選択・全解除の動作確認", async ({ page }) => {
    await expect(page.locator('[data-testid="notify-applicant"]')).toBeVisible();
    await expect(page.locator('[data-testid="notify-current-approver"]')).toBeVisible();
    await expect(page.locator('[data-testid="notify-new-approver"]')).toBeVisible();
    await expect(page.locator('[data-testid="notify-manager"]')).toBeVisible();
    
    await page.click('button:has-text("全選択")');
    await expect(page.locator('[data-testid="notify-applicant"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-current-approver"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).toBeChecked();
    
    await page.click('button:has-text("全解除")');
    await expect(page.locator('[data-testid="notify-applicant"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-current-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).not.toBeChecked();
    
    await page.click('button:has-text("全選択")');
    await page.uncheck('[data-testid="notify-applicant"]');
    await page.uncheck('[data-testid="notify-manager"]');
    await page.click('button:has-text("全解除")');
    await expect(page.locator('[data-testid="notify-current-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).not.toBeChecked();
  });

  // SCEN-102: 同一処理ルート選択時の警告表示
  test("[edge] 同一処理ルート選択時の警告表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', '経費申請 - 出張費用（田中太郎）');
    await expect(page.locator('#current-route')).toContainText('標準承認フロー（部長→役員）');
    await page.selectOption('[data-testid="new-route-select"]', '標準承認フロー（部長→役員）');
    await page.click('button:has-text("変更")');
    await expect(page.locator('.warning-message')).toContainText('現在と同じ処理ルートが選択されています。変更する必要がありますか？');
  });
});