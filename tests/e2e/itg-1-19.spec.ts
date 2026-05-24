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

  // SCEN-318
  test("処理ルート名変更で正常更新", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '新しい処理ルート名');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-319
  test("文書種別変更で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-320
  test("承認者追加で正常更新", async ({ page }) => {
    await page.click('[data-testid="add-approver"]');
    await page.fill('[data-testid="modal-approver"]', '山田取締役');
    await page.fill('[data-testid="modal-position"]', '取締役');
    await page.check('[data-testid="modal-required"]');
    await page.click('[data-testid="modal-add"]');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-321
  test("承認者削除で正常更新", async ({ page }) => {
    await page.locator('[data-testid="approval-steps-table"] button').filter({ hasText: '削除' }).first().click();
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-322
  test("承認ステップ並び替えで正常更新", async ({ page }) => {
    await page.locator('[data-testid="approval-steps-table"] button').filter({ hasText: '↑' }).first().click();
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-323
  test("必須承認者設定で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="required-approval"]', '田中部長');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-324
  test("代理承認許可設定で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="proxy-approval"]', '許可');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-325
  test("遅延検知設定変更で正常更新", async ({ page }) => {
    await page.fill('[data-testid="delay-hours"]', '48');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-326
  test("補助金関連度設定変更で正常更新", async ({ page }) => {
    await page.selectOption('[data-testid="subsidy-level"]', '中');
    await page.click('[data-testid="update-button"]');
    
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // SCEN-327
  test("処理ルート名空欄でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('必須');
  });

  // SCEN-328
  test("処理ルート名上限文字数でバリデーション", async ({ page }) => {
    const maxCharText = 'a'.repeat(100);
    const overMaxCharText = 'a'.repeat(101);
    
    await page.fill('[data-testid="route-name"]', maxCharText);
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    await page.fill('[data-testid="route-name"]', overMaxCharText);
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字以内');
  });

  // SCEN-329
  test("承認者未設定で更新エラー", async ({ page }) => {
    await page.locator('[data-testid="approval-steps-table"] button').filter({ hasText: '削除' }).click({ clickCount: 3 });
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('承認者');
  });

  // SCEN-330
  test("必須承認者全削除で更新エラー", async ({ page }) => {
    await page.selectOption('[data-testid="required-approval"]', '');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('必須承認者');
  });

  // SCEN-331
  test("遅延検知設定負数入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="delay-hours"]', '-10');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('正の数値');
  });

  // SCEN-332
  test("存在しない文書種別選択でエラー", async ({ page }) => {
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="document-type"]') as HTMLSelectElement;
      if (select) {
        const option = document.createElement('option');
        option.value = 'invalid_type';
        option.text = '存在しない種別';
        select.appendChild(option);
      }
    });
    
    await page.selectOption('[data-testid="document-type"]', 'invalid_type');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('存在しない');
  });

  // SCEN-333
  test("権限なしユーザーでアクセス拒否", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'normaluser');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422546501.html");
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('権限がありません');
  });

  // SCEN-334
  test("他ユーザー編集中の競合エラー", async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto("/login.html");
    await page2.fill('[name="username"]', 'test2');
    await page2.fill('[name="password"]', 'test');
    await Promise.all([
      page2.waitForURL(url => !url.toString().includes('/login.html')),
      page2.click('button[type="submit"]'),
    ]);
    await page2.goto("/panels/scr-1779422546501.html");
    
    await page.fill('[data-testid="route-name"]', 'ユーザー1変更');
    await page2.fill('[data-testid="route-name"]', 'ユーザー2変更');
    
    await page.click('[data-testid="update-button"]');
    await page2.click('[data-testid="update-button"]');
    
    await expect(page2.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page2.locator('[data-testid="error-message"]')).toContainText('編集中');
    
    await context2.close();
  });

  // SCEN-335
  test("ネットワーク切断時の更新エラー", async ({ page, context }) => {
    await context.setOffline(true);
    
    await page.fill('[data-testid="route-name"]', '更新テスト');
    await page.click('[data-testid="update-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワーク');
    
    await context.setOffline(false);
  });

});