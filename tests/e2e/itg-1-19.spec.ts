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
    // SCEN-318: [normal] 処理ルート更新処理 - 処理ルート名変更で正常更新
    await page.fill('[data-testid="route-name"]', '新しい処理ルート名');
    await page.click('[data-testid="update-button"]');
    
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="route-name"]')).toHaveValue('新しい処理ルート名');
  });

  test('SCEN-319: 文書種別変更で正常更新', async ({ page }) => {
    // SCEN-319: [normal] 処理ルート更新処理 - 文書種別変更で正常更新
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="update-button"]');
    
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('休暇申請');
  });

  test('SCEN-320: 承認者追加で正常更新', async ({ page }) => {
    // SCEN-320: [normal] 処理ルート更新処理 - 承認者追加で正常更新
    await page.click('[data-testid="add-approver-button"]');
    
    await page.selectOption('[data-testid="modal-approver-select"]', '田中 太郎 (部長)');
    await page.check('[data-testid="modal-required-checkbox"]');
    await page.check('[data-testid="modal-proxy-checkbox"]');
    
    await page.click('[data-testid="modal-add-button"]');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-steps-table"] tbody tr')).toContainText('田中 太郎');
  });

  test('SCEN-321: 承認者削除で正常更新', async ({ page }) => {
    // SCEN-321: [normal] 処理ルート更新処理 - 承認者削除で正常更新
    const deleteButton = page.locator('[data-testid="approval-steps-table"] tbody tr').first().locator('text=削除');
    await deleteButton.click();
    
    await page.click('text=削除');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=更新');
    
    await expect(page.locator('#current-screen-title')).toContainText('処理ルート更新処理');
  });

  test('SCEN-322: 承認ステップ並び替えで正常更新', async ({ page }) => {
    // SCEN-322: [normal] 処理ルート更新処理 - 承認ステップ並び替えで正常更新
    const upButton = page.locator('[data-testid="approval-steps-table"] tbody tr').nth(1).locator('text=↑');
    await upButton.click();
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-steps-table"] tbody tr').first()).toContainText('2');
  });

  test('SCEN-323: 必須承認者設定で正常更新', async ({ page }) => {
    // SCEN-323: [normal] 処理ルート更新処理 - 必須承認者設定で正常更新
    await page.click('[data-testid="add-approver-button"]');
    
    await page.selectOption('[data-testid="modal-approver-select"]', '佐藤 花子 (課長)');
    await page.check('[data-testid="modal-required-checkbox"]');
    
    await page.click('[data-testid="modal-add-button"]');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-steps-table"] tbody tr')).toContainText('佐藤 花子');
  });

  test('SCEN-324: 代理承認許可設定で正常更新', async ({ page }) => {
    // SCEN-324: [normal] 処理ルート更新処理 - 代理承認許可設定で正常更新
    await page.click('[data-testid="add-approver-button"]');
    
    await page.selectOption('[data-testid="modal-approver-select"]', '鈴木 次郎 (係長)');
    await page.check('[data-testid="modal-proxy-checkbox"]');
    
    await page.click('[data-testid="modal-add-button"]');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="approval-steps-table"] tbody tr')).toContainText('鈴木 次郎');
  });

  test('SCEN-325: 遅延検知設定変更で正常更新', async ({ page }) => {
    // SCEN-325: [normal] 処理ルート更新処理 - 遅延検知設定変更で正常更新
    await page.fill('[data-testid="deadline-days"]', '48');
    await page.fill('[data-testid="warning-days"]', '24');
    await page.fill('[data-testid="escalation-days"]', '72');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await expect(page.locator('[data-testid="deadline-days"]')).toHaveValue('48');
  });

  test('SCEN-326: 補助金関連度設定変更で正常更新', async ({ page }) => {
    // SCEN-326: [normal] 処理ルート更新処理 - 補助金関連度設定変更で正常更新
    await page.selectOption('[data-testid="subsidy-level-select"]', '中');
    
    await page.click('[data-testid="update-button"]');
    await page.click('text=はい');
    
    await expect(page.locator('[data-testid="subsidy-level-select"]')).toHaveValue('中');
  });

  test('SCEN-327: 処理ルート名空欄でバリデーション', async ({ page }) => {
    // SCEN-327: [edge] 処理ルート更新処理 - 処理ルート名空欄でバリデーション
    await page.fill('[data-testid="route-name"]', '');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('処理ルート名');
  });

  test('SCEN-328: 処理ルート名上限文字数でバリデーション', async ({ page }) => {
    // SCEN-328: [edge] 処理ルート更新処理 - 処理ルート名上限文字数でバリデーション
    const maxLengthName = 'a'.repeat(100);
    await page.fill('[data-testid="route-name"]', maxLengthName);
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).not.toBeVisible();
    
    const overLengthName = 'a'.repeat(101);
    await page.fill('[data-testid="route-name"]', overLengthName);
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('文字以内');
  });

  test('SCEN-329: 承認者未設定で更新エラー', async ({ page }) => {
    // SCEN-329: [error] 処理ルート更新処理 - 承認者未設定で更新エラー
    const deleteButtons = page.locator('[data-testid="approval-steps-table"] tbody tr button:has-text("削除")');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
      await page.click('text=削除');
    }
    
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('承認者');
  });

  test('SCEN-330: 必須承認者全削除で更新エラー', async ({ page }) => {
    // SCEN-330: [error] 処理ルート更新処理 - 必須承認者全削除で更新エラー
    const requiredApproverRows = page.locator('[data-testid="approval-steps-table"] tbody tr:has-text("はい")');
    const count = await requiredApproverRows.count();
    
    for (let i = 0; i < count; i++) {
      await requiredApproverRows.first().locator('text=削除').click();
      await page.click('text=削除');
    }
    
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('必須承認者');
  });

  test('SCEN-331: 遅延検知設定負数入力でバリデーション', async ({ page }) => {
    // SCEN-331: [edge] 処理ルート更新処理 - 遅延検知設定負数入力でバリデーション
    await page.fill('[data-testid="deadline-days"]', '-1');
    await page.fill('[data-testid="warning-days"]', '-10');
    await page.fill('[data-testid="escalation-days"]', '-999');
    
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('正の数値');
  });

  test('SCEN-332: 存在しない文書種別選択でエラー', async ({ page }) => {
    // SCEN-332: [error] 処理ルート更新処理 - 存在しない文書種別選択でエラー
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="document-type-select"]') as HTMLSelectElement;
      if (select) {
        const option = document.createElement('option');
        option.value = 'invalid_type';
        option.textContent = '存在しない種別';
        select.appendChild(option);
        select.value = 'invalid_type';
      }
    });
    
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('文書種別');
  });

  test('SCEN-333: 権限なしユーザーでアクセス拒否', async ({ page }) => {
    // SCEN-333: [error] 処理ルート更新処理 - 権限なしユーザーでアクセス拒否
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'limited_user');
    await page.fill('[name="password"]', 'limited');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    
    await page.goto("/panels/scr-1779422546501.html");
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('権限');
  });

  test('SCEN-334: 他ユーザー編集中の競合エラー', async ({ page, context }) => {
    // SCEN-334: [error] 処理ルート更新処理 - 他ユーザー編集中の競合エラー
    const page2 = await context.newPage();
    await page2.goto("/login.html");
    await page2.fill('[name="username"]', 'user2');
    await page2.fill('[name="password"]', 'test2');
    await Promise.all([
      page2.waitForURL(url => !url.toString().includes('/login.html')),
      page2.click('button[type="submit"]'),
    ]);
    await page2.goto("/panels/scr-1779422546501.html");
    
    await page.fill('[data-testid="route-name"]', 'ユーザー1の変更');
    await page.click('[data-testid="update-button"]');
    await page.click('text=OK');
    
    await page2.fill('[data-testid="route-name"]', 'ユーザー2の変更');
    await page2.click('[data-testid="update-button"]');
    
    await expect(page2.locator('#error-message')).toBeVisible();
    await expect(page2.locator('#error-text')).toContainText('他のユーザー');
  });

  test('SCEN-335: ネットワーク切断時の更新エラー', async ({ page }) => {
    // SCEN-335: [error] 処理ルート更新処理 - ネットワーク切断時の更新エラー
    await page.fill('[data-testid="route-name"]', '変更後のルート名');
    
    await page.context().setOffline(true);
    
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-text')).toContainText('ネットワーク');
  });

});