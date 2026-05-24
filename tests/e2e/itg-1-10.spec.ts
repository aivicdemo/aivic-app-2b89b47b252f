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

  test('SCEN-160: 文書種別選択から承認フロー作成', async ({ page }) => {
    // SCEN-160: [normal] 承認ルート設定画面 - 文書種別選択から承認フロー作成
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '稟議書承認フロー_テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '田中部長');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '佐藤課長');
    await page.click('[data-testid="modal-select-button"]');
    await page.selectOption('[data-testid="approval-type-select"]', '順次承認');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('稟議書承認フロー_テスト');
  });

  test('SCEN-161: 承認ステップ追加と承認者設定', async ({ page }) => {
    // SCEN-161: [normal] 承認ルート設定画面 - 承認ステップ追加と承認者設定
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'テスト承認ルート');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '田中');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('テスト承認ルート');
  });

  test('SCEN-162: 承認順序変更で正しく並び替え', async ({ page }) => {
    // SCEN-162: [normal] 承認ルート設定画面 - 承認順序変更で正しく並び替え
    await page.click('[data-testid="flow-list-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-steps-table"]')).toBeVisible();
  });

  test('SCEN-163: 並列承認設定で同時承認', async ({ page }) => {
    // SCEN-163: [normal] 承認ルート設定画面 - 並列承認設定で同時承認
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '並列承認テスト');
    await page.selectOption('[data-testid="approval-type-select"]', '並列承認');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '田中太郎');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '佐藤花子');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('並列承認テスト');
  });

  test('SCEN-164: 条件分岐設定で複数パス作成', async ({ page }) => {
    // SCEN-164: [normal] 承認ルート設定画面 - 条件分岐設定で複数パス作成
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '複数パステストルート');
    await page.selectOption('[data-testid="approval-type-select"]', '条件分岐');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者A');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者B');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('複数パステストルート');
  });

  test('SCEN-165: 承認期限設定で通知機能', async ({ page }) => {
    // SCEN-165: [normal] 承認ルート設定画面 - 承認期限設定で通知機能
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '期限設定テスト');
    await page.fill('[data-testid="default-deadline-input"]', '3');
    await page.check('[data-testid="delay-notification-checkbox"]');
    await page.selectOption('[data-testid="notification-timing-select"]', '期限1日前');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('期限設定テスト');
  });

  test('SCEN-166: 代理承認者設定と動作確認', async ({ page }) => {
    // SCEN-166: [normal] 承認ルート設定画面 - 代理承認者設定と動作確認
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '代理承認テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '主担当者');
    await page.click('[data-testid="modal-select-button"]');
    
    await page.click('text=代理承認者設定');
    await page.selectOption('[data-testid="delegate-approver-select"]', '代理者');
    await page.fill('[data-testid="delegate-start-date"]', '2024-01-01');
    await page.fill('[data-testid="delegate-end-date"]', '2024-01-31');
    await page.click('[data-testid="delegate-save-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('代理承認テスト');
  });

  test('SCEN-167: 承認ステップ削除で順序再整理', async ({ page }) => {
    // SCEN-167: [normal] 承認ルート設定画面 - 承認ステップ削除で順序再整理
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'ステップ削除テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', 'ステップ1');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', 'ステップ2');
    await page.click('[data-testid="modal-select-button"]');
    
    await page.click('text=削除', { first: true });
    await page.click('text=削除');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('ステップ削除テスト');
  });

  test('SCEN-168: 承認フロー名未入力でエラー', async ({ page }) => {
    // SCEN-168: [error] 承認ルート設定画面 - 承認フロー名未入力でエラー
    await page.click('[data-testid="create-flow-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者');
    await page.click('[data-testid="modal-select-button"]');
    await page.selectOption('[data-testid="approval-type-select"]', '順次承認');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認フロー名');
  });

  test('SCEN-169: 文書種別未選択で保存失敗', async ({ page }) => {
    // SCEN-169: [error] 承認ルート設定画面 - 文書種別未選択で保存失敗
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'テストフロー');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別');
  });

  test('SCEN-170: 承認者未設定でステップ作成失敗', async ({ page }) => {
    // SCEN-170: [error] 承認ルート設定画面 - 承認者未設定でステップ作成失敗
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="modal-select-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者');
  });

  test('SCEN-171: 同一承認者重複設定でエラー', async ({ page }) => {
    // SCEN-171: [error] 承認ルート設定画面 - 同一承認者重複設定でエラー
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '重複テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '田中太郎');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '田中太郎');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('同一の承認者');
  });

  test('SCEN-172: 承認期限過去日付でバリデーション', async ({ page }) => {
    // SCEN-172: [error] 承認ルート設定画面 - 承認期限過去日付でバリデーション
    await page.clock.install({ time: new Date('2024-01-15') });
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '期限エラーテスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者');
    await page.click('[data-testid="modal-select-button"]');
    await page.fill('#delegate-start-date', '2024-01-10');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付');
  });

  test('SCEN-173: 存在しない承認者選択でエラー', async ({ page }) => {
    // SCEN-173: [error] 承認ルート設定画面 - 存在しない承認者選択でエラー
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '存在しない承認者テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '存在しないユーザー999');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者が存在しません');
  });

  test('SCEN-174: 承認フロー名最大文字数', async ({ page }) => {
    // SCEN-174: [edge] 承認ルート設定画面 - 承認フロー名最大文字数
    const maxLengthName = 'a'.repeat(255);
    const overLengthName = 'a'.repeat(256);
    
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', maxLengthName);
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText(maxLengthName.substring(0, 50));
    
    await page.fill('[data-testid="flow-name-input"]', overLengthName);
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数');
  });

  test('SCEN-175: 承認ステップ最大数制限', async ({ page }) => {
    // SCEN-175: [edge] 承認ルート設定画面 - 承認ステップ最大数制限
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '最大ステップテスト');
    
    for (let i = 1; i <= 10; i++) {
      await page.click('[data-testid="add-step-button"]');
      await page.fill('[data-testid="approver-search-input"]', `承認者${i}`);
      await page.click('[data-testid="modal-select-button"]');
    }
    
    await page.click('[data-testid="add-step-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('最大数');
  });

  test('SCEN-176: 承認期限最小値設定', async ({ page }) => {
    // SCEN-176: [edge] 承認ルート設定画面 - 承認期限最小値設定
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '最小期限テスト');
    await page.fill('[data-testid="default-deadline-input"]', '1');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-routes-table"]')).toContainText('最小期限テスト');
  });

  test('SCEN-177: 全承認者削除後の状態', async ({ page }) => {
    // SCEN-177: [edge] 承認ルート設定画面 - 全承認者削除後の状態
    await page.click('[data-testid="create-flow-button"]');
    await page.fill('[data-testid="flow-name-input"]', '全削除テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者1');
    await page.click('[data-testid="modal-select-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search-input"]', '承認者2');
    await page.click('[data-testid="modal-select-button"]');
    
    await page.click('text=削除', { nth: 0 });
    await page.click('text=削除', { nth: 0 });
    
    await expect(page.locator('[data-testid="approval-steps-table"]')).toContainText('承認者が設定されていません');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('最低1名の承認者');
  });
});