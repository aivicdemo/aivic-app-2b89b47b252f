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
  test('[normal] 承認ルート設定画面 - 文書種別選択から承認フロー作成', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.click('button:has-text("新規承認ルート作成")');
    await page.fill('[data-testid="flow-name-input"]', '稟議書承認フロー_テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.click('button:has-text("選択")');
    await page.selectOption('[data-testid="approval-order-select"]', '順次承認');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toContainText('稟議書承認フロー_テスト');
  });

  // SCEN-161
  test('[normal] 承認ルート設定画面 - 承認ステップ追加と承認者設定', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '新規承認ルート_テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search"]', 'テスト承認者');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toContainText('新規承認ルート_テスト');
  });

  // SCEN-162
  test('[normal] 承認ルート設定画面 - 承認順序変更で正しく並び替え', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '順序変更テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#approval-steps')).toBeVisible();
  });

  // SCEN-163
  test('[normal] 承認ルート設定画面 - 並列承認設定で同時承認', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '並列承認テスト');
    await page.check('[data-testid="parallel-approval-checkbox"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toContainText('並列承認テスト');
  });

  // SCEN-164
  test('[normal] 承認ルート設定画面 - 条件分岐設定で複数パス作成', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '複数パステストルート');
    await page.click('[data-testid="condition-branch-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#conditional-settings')).toBeVisible();
  });

  // SCEN-165
  test('[normal] 承認ルート設定画面 - 承認期限設定で通知機能', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="approval-deadline-input"]', '3');
    await page.check('[data-testid="delay-notification-checkbox"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toBeVisible();
  });

  // SCEN-166
  test('[normal] 承認ルート設定画面 - 代理承認者設定と動作確認', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.selectOption('[data-testid="deputy-approver-select"]', '田中太郎');
    await page.fill('[data-testid="deputy-start-date"]', '2024-01-01');
    await page.fill('[data-testid="deputy-end-date"]', '2024-12-31');
    await page.click('[data-testid="save-deputy-button"]');
    await expect(page.locator('[data-testid="deputy-approver-select"]')).toContainText('田中太郎');
  });

  // SCEN-167
  test('[normal] 承認ルート設定画面 - 承認ステップ削除で順序再整理', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#approval-steps')).toBeVisible();
  });

  // SCEN-168
  test('[error] 承認ルート設定画面 - 承認フロー名未入力でエラー', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('承認フロー名');
  });

  // SCEN-169
  test('[error] 承認ルート設定画面 - 文書種別未選択で保存失敗', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('文書種別');
  });

  // SCEN-170
  test('[error] 承認ルート設定画面 - 承認者未設定でステップ作成失敗', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('承認者');
  });

  // SCEN-171
  test('[error] 承認ルート設定画面 - 同一承認者重複設定でエラー', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '重複テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('同一の承認者');
  });

  // SCEN-172
  test('[error] 承認ルート設定画面 - 承認期限過去日付でバリデーション', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '期限テスト');
    await page.fill('[data-testid="approval-deadline-input"]', '-1');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('過去の日付');
  });

  // SCEN-173
  test('[error] 承認ルート設定画面 - 存在しない承認者選択でエラー', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '存在しない承認者テスト');
    await page.fill('[data-testid="approver-search"]', '存在しないユーザー');
    await page.click('[data-testid="select-approver-button"]');
    await expect(page.locator('.modal')).toContainText('承認者が存在しません');
  });

  // SCEN-174
  test('[edge] 承認ルート設定画面 - 承認フロー名最大文字数', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    const maxText = 'a'.repeat(255);
    await page.fill('[data-testid="flow-name-input"]', maxText);
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toBeVisible();
    
    const overMaxText = 'a'.repeat(256);
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', overMaxText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('文字数');
  });

  // SCEN-175
  test('[edge] 承認ルート設定画面 - 承認ステップ最大数制限', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', 'ステップ最大数テスト');
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-step-button"]');
      await page.click('[data-testid="select-approver-button"]');
    }
    
    await page.click('[data-testid="add-step-button"]');
    await expect(page.locator('.modal')).toContainText('最大数');
  });

  // SCEN-176
  test('[edge] 承認ルート設定画面 - 承認期限最小値設定', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '最小値テスト');
    await page.fill('[data-testid="approval-deadline-input"]', '1');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#route-list-tbody')).toContainText('最小値テスト');
  });

  // SCEN-177
  test('[edge] 承認ルート設定画面 - 全承認者削除後の状態', async ({ page }) => {
    await page.click('[data-testid="create-route-button"]');
    await page.fill('[data-testid="flow-name-input"]', '全削除テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="select-approver-button"]');
    
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.modal')).toContainText('承認者を設定');
  });
});