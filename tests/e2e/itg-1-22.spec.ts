import { test, expect } from '@playwright/test';

test.describe("処理ルート設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422591281.html");
  });

  test('SCEN-378: 基本的な処理ルート作成', async ({ page }) => {
    // SCEN-378
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート001');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=テスト処理ルート001')).toBeVisible();
    await expect(page.locator('text=処理ルートが正常に作成されました')).toBeVisible();
  });

  test('SCEN-379: 複数承認者による順次承認ルート作成', async ({ page }) => {
    // SCEN-379
    await page.fill('[data-testid="route-name"]', '順次承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="approval-steps"]')).toBeVisible();
    await expect(page.locator('text=順次承認')).toBeVisible();
  });

  test('SCEN-380: 並列承認ルート作成', async ({ page }) => {
    // SCEN-380
    await page.fill('[data-testid="route-name"]', '並列承認テストルート');
    await page.check('[data-testid="parallel-approval"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=並列承認テストルート')).toBeVisible();
    await expect(page.locator('text=並列承認')).toBeVisible();
  });

  test('SCEN-381: 条件分岐を含むルート作成', async ({ page }) => {
    // SCEN-381
    await page.fill('[data-testid="route-name"]', '金額別承認ルート');
    await page.selectOption('[data-testid="branch-condition-select"]', '申請金額');
    await page.selectOption('[data-testid="condition-operator-select"]', '以上');
    await page.fill('[data-testid="condition-value"]', '100000');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="route-preview"]')).toBeVisible();
    await expect(page.locator('text=条件分岐')).toBeVisible();
  });

  test('SCEN-382: 代理承認者設定', async ({ page }) => {
    // SCEN-382
    await page.click('[data-testid="add-step-button"]');
    await page.locator('.approver-setting button').first().click();
    await page.fill('[data-testid="deputy-approver-select"]', '代理承認者');
    await page.fill('[data-testid="deputy-start-date"]', '2024-01-01');
    await page.fill('[data-testid="deputy-end-date"]', '2024-12-31');
    await page.click('[data-testid="save-deputy-button"]');
    
    await expect(page.locator('text=代理承認者')).toBeVisible();
    await expect(page.locator('[data-testid="deputy-modal"]')).toBeHidden();
  });

  test('SCEN-383: 承認期限と遅延通知設定', async ({ page }) => {
    // SCEN-383
    await page.fill('[data-testid="route-name"]', '期限付きルート');
    await page.fill('[data-testid="approval-deadline"]', '5');
    await page.check('[data-testid="delay-notification"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=5日')).toBeVisible();
    await expect(page.locator('text=遅延通知')).toBeVisible();
  });

  test('SCEN-384: ルートプレビュー表示確認', async ({ page }) => {
    // SCEN-384
    await page.fill('[data-testid="route-name"]', 'テスト承認ルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="preview-button"]');
    
    await expect(page.locator('[data-testid="route-preview"]')).toBeVisible();
    await expect(page.locator('text=テスト承認ルート')).toBeVisible();
  });

  test('SCEN-385: ルート有効化切り替え', async ({ page }) => {
    // SCEN-385
    await page.fill('[data-testid="route-name"]', '切り替えテスト');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="route-active"]');
    
    const isChecked = await page.locator('[data-testid="route-active"]').isChecked();
    expect(isChecked).toBe(true);
  });

  test('SCEN-386: 処理ルート名未入力でエラー', async ({ page }) => {
    // SCEN-386
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=処理ルート名が未入力')).toBeVisible();
  });

  test('SCEN-387: 文書種別未選択でエラー', async ({ page }) => {
    // SCEN-387
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=文書種別が未選択')).toBeVisible();
  });

  test('SCEN-388: 承認者未設定でエラー', async ({ page }) => {
    // SCEN-388
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=承認者が未設定')).toBeVisible();
  });

  test('SCEN-389: 無効な承認期限でエラー', async ({ page }) => {
    // SCEN-389
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline"]', '2020-01-01');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=承認期限が無効')).toBeVisible();
  });

  test('SCEN-390: 承認者重複設定でエラー', async ({ page }) => {
    // SCEN-390
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=同一の承認者を複数の承認段階に設定することはできません')).toBeVisible();
  });

  test('SCEN-391: 存在しない承認者選択でエラー', async ({ page }) => {
    // SCEN-391
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approver-search"]', '存在しない承認者');
    await page.click('[data-testid="select-approver-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=指定された承認者が存在しません')).toBeVisible();
  });

  test('SCEN-392: 処理ルート名文字数上限', async ({ page }) => {
    // SCEN-392
    const validName = 'a'.repeat(50);
    const invalidName = 'a'.repeat(51);
    
    await page.fill('[data-testid="route-name"]', validName);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
    
    await page.fill('[data-testid="route-name"]', invalidName);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-393: 承認ステップ数上限', async ({ page }) => {
    // SCEN-393
    await page.fill('[data-testid="route-name"]', 'ステップ上限テスト');
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-step-button"]');
    }
    
    const addButton = page.locator('[data-testid="add-step-button"]');
    const isDisabled = await addButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('SCEN-394: 承認期限最短設定', async ({ page }) => {
    // SCEN-394
    await page.fill('[data-testid="route-name"]', '最短期限テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline"]', '1');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=設定完了')).toBeVisible();
    await expect(page.locator('text=1日')).toBeVisible();
  });

  test('SCEN-395: 承認期限最長設定', async ({ page }) => {
    // SCEN-395
    await page.fill('[data-testid="route-name"]', '最長期限テスト');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline"]', '999');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=999日')).toBeVisible();
  });

  test('SCEN-396: 大量承認者一括選択', async ({ page }) => {
    // SCEN-396
    await page.fill('[data-testid="route-name"]', '大量承認者テスト');
    await page.click('[data-testid="add-step-button"]');
    
    await page.click('button:text("一括選択")');
    await page.check('input[type="checkbox"][value="all"]');
    await page.click('button:text("適用")');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=100名以上')).toBeVisible();
  });
});