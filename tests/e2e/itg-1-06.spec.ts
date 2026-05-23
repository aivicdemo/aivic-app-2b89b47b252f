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

  // SCEN-090
  test("申請書類選択から処理ルート変更まで一連の操作が完了する", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP001');
    await expect(page.locator('text=経費申請 - 出張費用（田中太郎）')).toBeVisible();
    await expect(page.locator('text=標準承認フロー（部長→役員）')).toBeVisible();
    await page.click('button:has-text("承認者変更")');
    await page.selectOption('[data-testid="new-route-select"]', 'ROUTE002');
    await page.fill('[data-testid="change-reason"]', '緊急対応のため承認者を変更');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=緊急承認フロー（役員直接）')).toBeVisible();
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('text=処理ルート変更が完了しました')).toBeVisible();
  });

  // SCEN-091
  test("承認者変更後に新しい処理ルートで変更実行できる", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP002');
    await expect(page.locator('text=休暇申請 - 有給休暇（佐藤花子）')).toBeVisible();
    await page.click('[data-testid="change-approver-button"]');
    await page.selectOption('[data-testid="new-route-select"]', 'ROUTE003');
    await page.fill('[data-testid="change-reason"]', '担当者変更による承認者変更');
    await page.click('button:has-text("処理ルート変更確認")');
    await expect(page.locator('text=特別承認フロー（部長→課長→役員）')).toBeVisible();
    await page.click('button:has-text("変更実行")');
    await expect(page.locator('text=処理ルート変更が完了しました')).toBeVisible();
  });

  // SCEN-092
  test("通知対象者選択して通知メッセージ送信が完了する", async ({ page }) => {
    await page.check('[data-testid="notify-applicant"]');
    await page.check('[data-testid="notify-current-approver"]');
    await page.fill('[data-testid="notification-message"]', '処理ルート変更のお知らせです');
    await page.click('[data-testid="notify-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=通知の送信が完了しました')).toBeVisible();
  });

  // SCEN-093
  test("変更内容確認後にキャンセルして元画面に戻る", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP003');
    await page.selectOption('[data-testid="new-route-select"]', 'ROUTE004');
    await page.fill('[data-testid="change-reason"]', 'テスト用の変更理由');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('text=簡易承認フロー（課長のみ）')).toBeVisible();
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('[data-testid="application-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue('');
  });

  // SCEN-094
  test("申請書類未選択で処理ルート変更実行時エラー表示", async ({ page }) => {
    await page.click('button:has-text("承認者変更")');
    await expect(page.locator('text=申請書類を選択してください')).toBeVisible();
  });

  // SCEN-095
  test("新しい処理ルート未選択で変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP001');
    await page.fill('[data-testid="change-reason"]', '変更理由のテスト');
    await page.click('button:has-text("変更実行")');
    await expect(page.locator('text=新しい処理ルートを選択してください')).toBeVisible();
  });

  // SCEN-096
  test("変更理由未入力で処理ルート変更実行時エラー表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP001');
    await page.selectOption('[data-testid="new-route-select"]', 'ROUTE002');
    await page.click('button:has-text("変更実行")');
    await expect(page.locator('text=変更理由を入力してください')).toBeVisible();
  });

  // SCEN-097
  test("通知対象者未選択で通知送信時エラー表示", async ({ page }) => {
    await page.fill('[data-testid="notification-message"]', 'テスト通知メッセージ');
    await page.click('[data-testid="notify-button"]');
    await expect(page.locator('text=通知対象者を選択してください')).toBeVisible();
  });

  // SCEN-098
  test("通知メッセージ未入力で通知送信時エラー表示", async ({ page }) => {
    await page.check('[data-testid="notify-applicant"]');
    await page.click('[data-testid="notify-button"]');
    await expect(page.locator('text=通知メッセージを入力してください')).toBeVisible();
  });

  // SCEN-099
  test("変更理由テキストエリア文字数上限でバリデーション", async ({ page }) => {
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="change-reason"]', maxText);
    await expect(page.locator('[data-testid="change-reason"]')).toHaveValue(maxText);
    
    const overText = 'a'.repeat(1001);
    await page.fill('[data-testid="change-reason"]', overText);
    await expect(page.locator('text=文字数上限を超えています')).toBeVisible();
    
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=文字数上限を超えています')).toBeVisible();
  });

  // SCEN-100
  test("通知メッセージテキストエリア文字数上限でバリデーション", async ({ page }) => {
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="notification-message"]', maxText);
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=保存されました')).toBeVisible();
    
    const overText = 'a'.repeat(1001);
    await page.fill('[data-testid="notification-message"]', overText);
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=文字数上限を超えています')).toBeVisible();
  });

  // SCEN-101
  test("通知対象者全選択・全解除の動作確認", async ({ page }) => {
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
    await page.click('button:has-text("全解除")');
    await expect(page.locator('[data-testid="notify-current-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-new-approver"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="notify-manager"]')).not.toBeChecked();
  });

  // SCEN-102
  test("同一処理ルート選択時の警告表示", async ({ page }) => {
    await page.selectOption('[data-testid="application-select"]', 'APP001');
    await page.selectOption('[data-testid="new-route-select"]', 'ROUTE001');
    await page.click('button:has-text("変更")');
    await expect(page.locator('text=現在と同じ処理ルートが選択されています。変更する必要がありますか？')).toBeVisible();
  });
});