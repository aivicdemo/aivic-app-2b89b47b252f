import { test, expect } from '@playwright/test';

test.describe("承認ルート設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422354662.html");
  });

  // SCEN-160
  test('文書種別選択から承認フロー作成', async ({ page }) => {
    await page.selectOption('#document-type', '稟議書');
    await page.fill('#flow-name', '稟議書承認フロー_テスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中部長');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '佐藤課長');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('#approver-tbody')).toContainText('田中部長');
    await expect(page.locator('#approver-tbody')).toContainText('佐藤課長');
  });

  // SCEN-161
  test('承認ステップ追加と承認者設定', async ({ page }) => {
    await page.fill('#flow-name', '新規承認ルート');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.selectOption('#approval-level', '部長');
    await page.selectOption('#proxy-approver', '佐藤花子');
    await page.click('#btn-save');
    await expect(page.locator('#approver-tbody')).toContainText('田中太郎');
  });

  // SCEN-162
  test('承認順序変更で正しく並び替え', async ({ page }) => {
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '佐藤花子');
    await page.click('#btn-select-user');
    await page.dragAndDrop('#approver-tbody tr:nth-child(2)', '#approver-tbody tr:nth-child(1)');
    await page.click('#btn-save');
    const firstRow = page.locator('#approver-tbody tr:first-child');
    await expect(firstRow).toContainText('佐藤花子');
  });

  // SCEN-163
  test('並列承認設定で同時承認', async ({ page }) => {
    await page.fill('#flow-name', '並列承認テストルート');
    await page.check('#parallel-approval');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '佐藤花子');
    await page.click('#btn-select-user');
    await page.selectOption('#required-approver-count', '2');
    await page.click('#btn-save');
    await expect(page.locator('#approver-tbody')).toContainText('田中太郎');
    await expect(page.locator('#approver-tbody')).toContainText('佐藤花子');
  });

  // SCEN-164
  test('条件分岐設定で複数パス作成', async ({ page }) => {
    await page.fill('#flow-name', '複数パステストルート');
    await page.click('#btn-condition-branch');
    await page.fill('#branch-condition-1', '申請金額 < 10万円');
    await page.fill('#approver-a', '承認者A');
    await page.fill('#branch-condition-2', '申請金額 >= 10万円');
    await page.fill('#approver-b', '承認者B');
    await page.fill('#approver-c', '承認者C');
    await page.click('#btn-save');
    await expect(page.locator('.condition-branch')).toContainText('申請金額 < 10万円');
  });

  // SCEN-165
  test('承認期限設定で通知機能', async ({ page }) => {
    await page.fill('#flow-name', '期限設定テストルート');
    await page.fill('#approval-deadline', '3');
    await page.check('#delay-notification');
    await page.selectOption('#notification-timing', '1日前');
    await page.selectOption('#notification-target', '承認者');
    await page.click('#btn-save');
    await expect(page.locator('#approval-deadline')).toHaveValue('3');
    await expect(page.locator('#delay-notification')).toBeChecked();
  });

  // SCEN-166
  test('代理承認者設定と動作確認', async ({ page }) => {
    await page.fill('#flow-name', '代理承認テストルート');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中部長');
    await page.click('#btn-select-user');
    await page.click('#btn-proxy-approver');
    await page.fill('#proxy-user-search', '佐藤課長');
    await page.click('#btn-select-proxy');
    await page.fill('#proxy-start-date', '2024-01-01');
    await page.fill('#proxy-end-date', '2024-01-31');
    await page.click('#btn-save');
    await expect(page.locator('#approver-tbody')).toContainText('田中部長');
    await expect(page.locator('#proxy-info')).toContainText('佐藤課長');
  });

  // SCEN-167
  test('承認ステップ削除で順序再整理', async ({ page }) => {
    await page.fill('#flow-name', 'ステップ削除テスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '承認者1');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '承認者2');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '承認者3');
    await page.click('#btn-select-user');
    await page.click('#approver-tbody tr:nth-child(2) button:has-text("削除")');
    await page.click('#btn-save');
    const rows = page.locator('#approver-tbody tr');
    await expect(rows.nth(0)).toContainText('承認者1');
    await expect(rows.nth(1)).toContainText('承認者3');
  });

  // SCEN-168
  test('承認フロー名未入力でエラー', async ({ page }) => {
    await page.selectOption('#document-type', '稟議書');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('承認フロー名を入力してください');
  });

  // SCEN-169
  test('文書種別未選択で保存失敗', async ({ page }) => {
    await page.fill('#flow-name', 'テストルート名');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('文書種別を選択してください');
  });

  // SCEN-170
  test('承認者未設定でステップ作成失敗', async ({ page }) => {
    await page.fill('#flow-name', 'テストルート名');
    await page.click('#btn-add-step');
    await page.click('#btn-save-step');
    await expect(page.locator('.error-message')).toContainText('承認者を設定してください');
  });

  // SCEN-171
  test('同一承認者重複設定でエラー', async ({ page }) => {
    await page.fill('#flow-name', '重複テストルート');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('同一の承認者が複数のステップに設定されています');
  });

  // SCEN-172
  test('承認期限過去日付でバリデーション', async ({ page }) => {
    await page.fill('#flow-name', '期限エラーテスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.fill('#approval-deadline-date', '2023-01-01');
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('承認期限に過去の日付は設定できません');
  });

  // SCEN-173
  test('存在しない承認者選択でエラー', async ({ page }) => {
    await page.fill('#flow-name', '存在しないユーザーテスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '存在しないユーザー');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('指定された承認者が存在しません');
  });

  // SCEN-174
  test('承認フロー名最大文字数', async ({ page }) => {
    const maxLengthText = 'a'.repeat(255);
    const overMaxLengthText = 'a'.repeat(256);
    
    await page.fill('#flow-name', maxLengthText);
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-save');
    await expect(page.locator('.success-message')).toBeVisible();
    
    await page.fill('#flow-name', overMaxLengthText);
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('最大文字数を超えています');
  });

  // SCEN-175
  test('承認ステップ最大数制限', async ({ page }) => {
    await page.fill('#flow-name', '最大ステップテスト');
    
    for (let i = 1; i <= 10; i++) {
      await page.click('#btn-add-step');
      await page.fill('#user-search', `承認者${i}`);
      await page.click('#btn-select-user');
    }
    
    await page.click('#btn-add-step');
    await expect(page.locator('.error-message')).toContainText('最大数を超えた承認ステップの追加が制限され');
    await expect(page.locator('#btn-add-step')).toBeDisabled();
  });

  // SCEN-176
  test('承認期限最小値設定', async ({ page }) => {
    await page.fill('#flow-name', '最小値テスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.fill('#approval-deadline', '1');
    await page.click('#btn-save');
    await expect(page.locator('#approval-deadline')).toHaveValue('1');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  // SCEN-177
  test('全承認者削除後の状態', async ({ page }) => {
    await page.fill('#flow-name', '全削除テスト');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '田中太郎');
    await page.click('#btn-select-user');
    await page.click('#btn-add-step');
    await page.fill('#user-search', '佐藤花子');
    await page.click('#btn-select-user');
    
    await page.click('#approver-tbody tr:nth-child(1) button:has-text("削除")');
    await page.click('#approver-tbody tr:nth-child(1) button:has-text("削除")');
    
    await expect(page.locator('#approver-tbody')).toContainText('承認者が設定されていません');
    
    await page.click('#btn-save');
    await expect(page.locator('.error-message')).toContainText('最低1名の承認者を設定してください');
  });
});