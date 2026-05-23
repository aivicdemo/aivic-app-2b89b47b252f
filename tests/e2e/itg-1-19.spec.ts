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

  test("SCEN-318: 処理ルート名変更で正常更新", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '新しい処理ルート名');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="route-name"]')).toHaveValue('新しい処理ルート名');
  });

  test("SCEN-319: 文書種別変更で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('経費申請');
  });

  test("SCEN-320: 承認者追加で正常更新", async ({ page }) => {
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="modal-approver-select"]', '田中 太郎（部長）');
    await page.fill('[data-testid="modal-step-number"]', '1');
    await page.click('[data-testid="modal-add-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#approval-steps')).toContainText('田中 太郎（部長）');
  });

  test("SCEN-321: 承認者削除で正常更新", async ({ page }) => {
    await page.click('text=削除');
    await page.click('text=削除');
    await page.click('[data-testid="save-button"]');
    await page.click('text=更新');
    await expect(page.locator('#approval-steps')).not.toContainText('削除された承認者');
  });

  test("SCEN-322: 承認ステップ並び替えで正常更新", async ({ page }) => {
    await page.click('text=↑');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('#approval-steps')).toBeVisible();
  });

  test("SCEN-323: 必須承認者設定で正常更新", async ({ page }) => {
    await page.check('[data-testid="required-approval"]');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="required-approval"]')).toBeChecked();
  });

  test("SCEN-324: 代理承認許可設定で正常更新", async ({ page }) => {
    await page.check('[data-testid="proxy-approval"]');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="proxy-approval"]')).toBeChecked();
  });

  test("SCEN-325: 遅延検知設定変更で正常更新", async ({ page }) => {
    await page.fill('[data-testid="deadline-days"]', '48');
    await page.fill('[data-testid="warning-days"]', '24');
    await page.fill('[data-testid="escalation-days"]', '72');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="deadline-days"]')).toHaveValue('48');
  });

  test("SCEN-326: 補助金関連度設定変更で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="subsidy-relation-select"]', '中');
    await page.click('[data-testid="save-button"]');
    await page.click('text=はい');
    await expect(page.locator('[data-testid="subsidy-relation-select"]')).toHaveValue('中');
  });

  test("SCEN-327: 処理ルート名空欄でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=処理ルート名')).toBeVisible();
  });

  test("SCEN-328: 処理ルート名上限文字数でバリデーション", async ({ page }) => {
    const validText = 'a'.repeat(200);
    await page.fill('[data-testid="route-name"]', validText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-name"]')).toHaveValue(validText);
    
    const invalidText = 'a'.repeat(201);
    await page.fill('[data-testid="route-name"]', invalidText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=文字以内')).toBeVisible();
  });

  test("SCEN-329: 承認者未設定で更新エラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=承認者')).toBeVisible();
  });

  test("SCEN-330: 必須承認者全削除で更新エラー", async ({ page }) => {
    await page.uncheck('[data-testid="required-approval"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=必須承認者')).toBeVisible();
  });

  test("SCEN-331: 遅延検知設定負数入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="deadline-days"]', '-1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=正の数値')).toBeVisible();
  });

  test("SCEN-332: 存在しない文書種別選択でエラー", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', 'invalid_type');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=存在しない')).toBeVisible();
  });

  test("SCEN-333: 権限なしユーザーでアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'unauthorized');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422546501.html");
    await expect(page.locator('text=権限がありません')).toBeVisible();
  });

  test("SCEN-334: 他ユーザー編集中の競合エラー", async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto("/login.html");
    await page2.fill('[name="username"]', 'user2');
    await page2.fill('[name="password"]', 'test');
    await Promise.all([
      page2.waitForURL(url => !url.toString().includes('/login.html')),
      page2.click('button[type="submit"]'),
    ]);
    await page2.goto("/panels/scr-1779422546501.html");
    
    await page.fill('[data-testid="route-name"]', 'ユーザー1の変更');
    await page.click('[data-testid="save-button"]');
    
    await page2.fill('[data-testid="route-name"]', 'ユーザー2の変更');
    await page2.click('[data-testid="save-button"]');
    
    await expect(page2.locator('text=他のユーザー')).toBeVisible();
    await context2.close();
  });

  test("SCEN-335: ネットワーク切断時の更新エラー", async ({ page, context }) => {
    await context.setOffline(true);
    await page.fill('[data-testid="route-name"]', 'オフラインテスト');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=ネットワーク')).toBeVisible();
  });
});