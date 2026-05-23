import { test, expect } from '@playwright/test';

test.describe("処理ルート更新処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422546501.html");
  });

  test('SCEN-318: [normal] 処理ルート更新処理 - 処理ルート名変更で正常更新', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '新しい処理ルート名');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
    await expect(page.locator('[data-testid="route-name"]')).toHaveValue('新しい処理ルート名');
  });

  test('SCEN-319: [normal] 処理ルート更新処理 - 文書種別変更で正常更新', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('経費申請');
  });

  test('SCEN-320: [normal] 処理ルート更新処理 - 承認者追加で正常更新', async ({ page }) => {
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="modal-approver-select"]', '田中 太郎（部長）');
    await page.fill('[data-testid="modal-step-number"]', '2');
    await page.click('[data-testid="modal-add-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=更新完了')).toBeVisible();
    await expect(page.locator('text=田中 太郎（部長）')).toBeVisible();
  });

  test('SCEN-321: [normal] 処理ルート更新処理 - 承認者削除で正常更新', async ({ page }) => {
    await page.click('button:has-text("削除")').first();
    await page.click('button:has-text("削除")');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("更新")');
    await expect(page.locator('text=更新完了')).toBeVisible();
  });

  test('SCEN-322: [normal] 処理ルート更新処理 - 承認ステップ並び替えで正常更新', async ({ page }) => {
    await page.click('button:has-text("↑")').first();
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
  });

  test('SCEN-323: [normal] 処理ルート更新処理 - 必須承認者設定で正常更新', async ({ page }) => {
    await page.check('[data-testid="required-approval"]');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
  });

  test('SCEN-324: [normal] 処理ルート更新処理 - 代理承認許可設定で正常更新', async ({ page }) => {
    await page.check('[data-testid="proxy-approval"]');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
  });

  test('SCEN-325: [normal] 処理ルート更新処理 - 遅延検知設定変更で正常更新', async ({ page }) => {
    await page.fill('[data-testid="deadline-days"]', '48');
    await page.fill('[data-testid="warning-days"]', '24');
    await page.fill('[data-testid="escalation-days"]', '72');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
    await expect(page.locator('[data-testid="deadline-days"]')).toHaveValue('48');
  });

  test('SCEN-326: [normal] 処理ルート更新処理 - 補助金関連度設定変更で正常更新', async ({ page }) => {
    await page.selectOption('[data-testid="subsidy-relation-select"]', '中');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("はい")');
    await expect(page.locator('text=更新完了')).toBeVisible();
    await expect(page.locator('[data-testid="subsidy-relation-select"]')).toHaveValue('中');
  });

  test('SCEN-327: [edge] 処理ルート更新処理 - 処理ルート名空欄でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=処理ルート名は必須項目です')).toBeVisible();
  });

  test('SCEN-328: [edge] 処理ルート更新処理 - 処理ルート名上限文字数でバリデーション', async ({ page }) => {
    const exactLimit = 'A'.repeat(50);
    const overLimit = 'A'.repeat(51);
    
    await page.fill('[data-testid="route-name"]', exactLimit);
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=更新完了')).toBeVisible();
    
    await page.fill('[data-testid="route-name"]', overLimit);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=処理ルート名は50文字以内で入力してください')).toBeVisible();
  });

  test('SCEN-329: [error] 処理ルート更新処理 - 承認者未設定で更新エラー', async ({ page }) => {
    await page.click('button:has-text("削除")');
    await page.click('button:has-text("削除")');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=承認者を設定してください')).toBeVisible();
  });

  test('SCEN-330: [error] 処理ルート更新処理 - 必須承認者全削除で更新エラー', async ({ page }) => {
    await page.uncheck('[data-testid="required-approval"]');
    await page.click('button:has-text("削除")');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=必須承認者が設定されていません')).toBeVisible();
  });

  test('SCEN-331: [edge] 処理ルート更新処理 - 遅延検知設定負数入力でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="deadline-days"]', '-1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=遅延検知設定には正の数値を入力してください')).toBeVisible();
  });

  test('SCEN-332: [error] 処理ルート更新処理 - 存在しない文書種別選択でエラー', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', 'invalid');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=存在しない文書種別です')).toBeVisible();
  });

  test('SCEN-333: [error] 処理ルート更新処理 - 権限なしユーザーでアクセス拒否', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'noauth');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422546501.html");
    await expect(page.locator('text=この機能にアクセスする権限がありません')).toBeVisible();
  });

  test('SCEN-334: [error] 処理ルート更新処理 - 他ユーザー編集中の競合エラー', async ({ page, browser }) => {
    const userB = await browser.newPage();
    await userB.goto("/login.html");
    await userB.fill('[name="username"]', 'userb');
    await userB.fill('[name="password"]', 'test');
    await Promise.all([
      userB.waitForURL(url => !url.toString().includes('/login.html')),
      userB.click('button[type="submit"]'),
    ]);
    await userB.goto("/panels/scr-1779422546501.html");
    
    await page.fill('[data-testid="route-name"]', '変更A');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    
    await userB.fill('[data-testid="route-name"]', '変更B');
    await userB.click('[data-testid="save-button"]');
    await expect(userB.locator('text=他のユーザーが編集中のため更新できません')).toBeVisible();
    
    await userB.close();
  });

  test('SCEN-335: [error] 処理ルート更新処理 - ネットワーク切断時の更新エラー', async ({ page, context }) => {
    await page.fill('[data-testid="route-name"]', 'テスト変更');
    
    await context.setOffline(true);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=ネットワークエラー')).toBeVisible();
    
    await context.setOffline(false);
  });
});