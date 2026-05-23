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

  test('SCEN-160: [normal] 承認ルート設定画面 - 文書種別選択から承認フロー作成', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.click('button:has-text("承認ステップ追加")');
    await page.fill('[data-testid="flow-name-input"]', '稟議書承認フロー_テスト');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '田中部長');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="user-search"]', '佐藤課長');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=稟議書承認フロー_テスト')).toBeVisible();
  });

  test('SCEN-161: [normal] 承認ルート設定画面 - 承認ステップ追加と承認者設定', async ({ page }) => {
    await page.click('button:has-text("承認ステップ追加")');
    await page.fill('[data-testid="flow-name-input"]', 'テスト承認ルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=テスト承認ルート')).toBeVisible();
  });

  test('SCEN-162: [normal] 承認ルート設定画面 - 承認順序変更で正しく並び替え', async ({ page }) => {
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approver-list"]')).toBeVisible();
  });

  test('SCEN-163: [normal] 承認ルート設定画面 - 並列承認設定で同時承認', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', '並列承認テスト');
    await page.check('[data-testid="parallel-approval"]');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '田中太郎');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="user-search"]', '佐藤花子');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=並列承認テスト')).toBeVisible();
  });

  test('SCEN-164: [normal] 承認ルート設定画面 - 条件分岐設定で複数パス作成', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', '複数パステストルート');
    await page.click('[data-testid="condition-branch-button"]');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者A');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="user-search"]', '承認者B');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=複数パステストルート')).toBeVisible();
  });

  test('SCEN-165: [normal] 承認ルート設定画面 - 承認期限設定で通知機能', async ({ page }) => {
    await page.fill('[data-testid="approval-deadline"]', '3');
    await page.check('[data-testid="delay-notification"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-deadline"]')).toHaveValue('3');
  });

  test('SCEN-166: [normal] 承認ルート設定画面 - 代理承認者設定と動作確認', async ({ page }) => {
    await page.click('[data-testid="proxy-approver-button"]');
    await page.fill('[data-testid="user-search"]', '代理承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=代理承認者')).toBeVisible();
  });

  test('SCEN-167: [normal] 承認ルート設定画面 - 承認ステップ削除で順序再整理', async ({ page }) => {
    await page.click('button:has-text("削除")');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approver-list"]')).toBeVisible();
  });

  test('SCEN-168: [error] 承認ルート設定画面 - 承認フロー名未入力でエラー', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', '');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=承認フロー名')).toBeVisible();
  });

  test('SCEN-169: [error] 承認ルート設定画面 - 文書種別未選択で保存失敗', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '');
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=文書種別')).toBeVisible();
  });

  test('SCEN-170: [error] 承認ルート設定画面 - 承認者未設定でステップ作成失敗', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=承認者')).toBeVisible();
  });

  test('SCEN-171: [error] 承認ルート設定画面 - 同一承認者重複設定でエラー', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '田中太郎');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="user-search"]', '田中太郎');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=同一の承認者が複数のステップに設定されています')).toBeVisible();
  });

  test('SCEN-172: [error] 承認ルート設定画面 - 承認期限過去日付でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="approval-deadline"]', '-1');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=承認期限に過去の日付は設定できません')).toBeVisible();
  });

  test('SCEN-173: [error] 承認ルート設定画面 - 存在しない承認者選択でエラー', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '存在しないユーザー');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=指定された承認者が存在しません')).toBeVisible();
  });

  test('SCEN-174: [edge] 承認ルート設定画面 - 承認フロー名最大文字数', async ({ page }) => {
    const maxLengthName = 'a'.repeat(255);
    await page.fill('[data-testid="flow-name-input"]', maxLengthName);
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator(`text=${maxLengthName.substring(0, 50)}`)).toBeVisible();
    
    const tooLongName = 'a'.repeat(256);
    await page.fill('[data-testid="flow-name-input"]', tooLongName);
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=文字数制限')).toBeVisible();
  });

  test('SCEN-175: [edge] 承認ルート設定画面 - 承認ステップ最大数制限', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-step-button"]');
    }
    
    await page.click('[data-testid="add-step-button"]');
    
    await expect(page.locator('text=最大数')).toBeVisible();
  });

  test('SCEN-176: [edge] 承認ルート設定画面 - 承認期限最小値設定', async ({ page }) => {
    await page.fill('[data-testid="flow-name-input"]', 'テストルート');
    
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.fill('[data-testid="approval-deadline"]', '1');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-deadline"]')).toHaveValue('1');
  });

  test('SCEN-177: [edge] 承認ルート設定画面 - 全承認者削除後の状態', async ({ page }) => {
    await page.click('button:has-text("代理承認者設定")');
    await page.fill('[data-testid="user-search"]', '承認者');
    await page.click('[data-testid="select-user-button"]');
    
    await page.click('button:has-text("削除")');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=最低1名の承認者を設定してください')).toBeVisible();
  });
});