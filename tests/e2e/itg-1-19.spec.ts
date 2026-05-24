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

  test('SCEN-318: 処理ルート名変更で正常更新', async ({ page }) => {
    await page.fill('#route-name', '新しい処理ルート名');
    await page.click('#update-btn');
    await expect(page.locator('#route-name')).toHaveValue('新しい処理ルート名');
  });

  test('SCEN-319: 文書種別変更で正常更新', async ({ page }) => {
    await page.selectOption('#document-type', '休暇申請');
    await page.click('#update-btn');
    await expect(page.locator('#document-type')).toHaveValue('休暇申請');
  });

  test('SCEN-320: 承認者追加で正常更新', async ({ page }) => {
    await page.click('#add-approver-btn');
    await page.selectOption('#modal-approver', '田中部長');
    await page.fill('#modal-order', '1');
    await page.click('#modal-add-btn');
    await expect(page.locator('#approval-steps-tbody')).toContainText('田中部長');
  });

  test('SCEN-321: 承認者削除で正常更新', async ({ page }) => {
    await page.click('text=削除');
    await page.click('#update-btn');
    await expect(page.locator('#approval-steps-tbody')).not.toContainText('削除');
  });

  test('SCEN-322: 承認ステップ並び替えで正常更新', async ({ page }) => {
    await page.click('text=↑');
    await page.click('#update-btn');
    await expect(page.locator('#approval-steps-tbody')).toBeVisible();
  });

  test('SCEN-323: 必須承認者設定で正常更新', async ({ page }) => {
    await page.check('#required-approval');
    await page.click('#update-btn');
    await expect(page.locator('#required-approval')).toBeChecked();
  });

  test('SCEN-324: 代理承認許可設定で正常更新', async ({ page }) => {
    await page.check('#proxy-approval');
    await page.click('#update-btn');
    await expect(page.locator('#proxy-approval')).toBeChecked();
  });

  test('SCEN-325: 遅延検知設定変更で正常更新', async ({ page }) => {
    await page.fill('#delay-hours', '48');
    await page.click('#update-btn');
    await expect(page.locator('#delay-hours')).toHaveValue('48');
  });

  test('SCEN-326: 補助金関連度設定変更で正常更新', async ({ page }) => {
    await page.selectOption('#subsidy-level', '中');
    await page.click('#update-btn');
    await expect(page.locator('#subsidy-level')).toHaveValue('中');
  });

  test('SCEN-327: 処理ルート名空欄でバリデーション', async ({ page }) => {
    await page.fill('#route-name', '');
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('処理ルート名');
  });

  test('SCEN-328: 処理ルート名上限文字数でバリデーション', async ({ page }) => {
    await page.fill('#route-name', 'a'.repeat(101));
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('文字以内');
  });

  test('SCEN-329: 承認者未設定で更新エラー', async ({ page }) => {
    const deleteButtons = page.locator('text=削除');
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
    }
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('承認者');
  });

  test('SCEN-330: 必須承認者全削除で更新エラー', async ({ page }) => {
    await page.uncheck('#required-approval');
    const deleteButtons = page.locator('text=削除');
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
    }
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('必須承認者');
  });

  test('SCEN-331: 遅延検知設定負数入力でバリデーション', async ({ page }) => {
    await page.fill('#delay-hours', '-10');
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('正の数値');
  });

  test('SCEN-332: 存在しない文書種別選択でエラー', async ({ page }) => {
    await page.selectOption('#document-type', '');
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('文書種別');
  });

  test('SCEN-333: 権限なしユーザーでアクセス拒否', async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'guest');
    await page.fill('[name="password"]', 'guest');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422546501.html");
    await expect(page.locator('#error-message')).toContainText('権限');
  });

  test('SCEN-334: 他ユーザー編集中の競合エラー', async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto("/login.html");
    await page2.fill('[name="username"]', 'test2');
    await page2.fill('[name="password"]', 'test2');
    await Promise.all([
      page2.waitForURL(url => !url.toString().includes('/login.html')),
      page2.click('button[type="submit"]'),
    ]);
    await page2.goto("/panels/scr-1779422546501.html");
    
    await page.fill('#route-name', 'ユーザー1の変更');
    await page2.fill('#route-name', 'ユーザー2の変更');
    
    await page.click('#update-btn');
    await page2.click('#update-btn');
    
    await expect(page2.locator('#error-message')).toContainText('他のユーザー');
    
    await context2.close();
  });

  test('SCEN-335: ネットワーク切断時の更新エラー', async ({ page }) => {
    await page.context().setOffline(true);
    await page.fill('#route-name', 'オフライン更新テスト');
    await page.click('#update-btn');
    await expect(page.locator('#error-message')).toContainText('ネットワーク');
    await page.context().setOffline(false);
  });
});