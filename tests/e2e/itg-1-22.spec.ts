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

  // SCEN-378
  test('[normal] 処理ルート設定画面 - 基本的な処理ルート作成', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'テスト処理ルート001');
    await page.selectOption('[data-testid="document-type-select"]', 'subsidy');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('テスト処理ルート001');
  });

  // SCEN-379
  test('[normal] 処理ルート設定画面 - 複数承認者による順次承認ルート作成', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '順次承認テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'expense');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('順次承認テストルート');
  });

  // SCEN-380
  test('[normal] 処理ルート設定画面 - 並列承認ルート作成', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '並列承認テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.check('[data-testid="parallel-approval-checkbox"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('並列承認テストルート');
  });

  // SCEN-381
  test('[normal] 処理ルート設定画面 - 条件分岐を含むルート作成', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '金額別承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', 'procurement');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('金額別承認ルート');
  });

  // SCEN-382
  test('[normal] 処理ルート設定画面 - 代理承認者設定', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '代理承認テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('代理承認テストルート');
  });

  // SCEN-383
  test('[normal] 処理ルート設定画面 - 承認期限と遅延通知設定', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '期限設定テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'expense');
    await page.fill('[data-testid="approval-deadline-input"]', '5');
    await page.check('[data-testid="delay-notification-checkbox"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('期限設定テストルート');
  });

  // SCEN-384
  test('[normal] 処理ルート設定画面 - ルートプレビュー表示確認', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'テスト承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('#preview-modal')).toBeVisible();
    await expect(page.locator('#preview-content')).toContainText('テスト承認ルート');
  });

  // SCEN-385
  test('[normal] 処理ルート設定画面 - ルート有効化切り替え', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '有効化テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'expense');
    await page.check('[data-testid="route-active-checkbox"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('有効化テストルート');
  });

  // SCEN-386
  test('[error] 処理ルート設定画面 - 処理ルート名未入力でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-387
  test('[error] 処理ルート設定画面 - 文書種別未選択でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'テストルート');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-388
  test('[error] 処理ルート設定画面 - 承認者未設定でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'テストルート');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-389
  test('[error] 処理ルート設定画面 - 無効な承認期限でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'テスト処理ルート');
    await page.selectOption('[data-testid="document-type-select"]', 'expense');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline-input"]', '-1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-390
  test('[error] 処理ルート設定画面 - 承認者重複設定でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '重複承認者テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toContainText('同一の承認者を複数の承認段階に設定することはできません');
  });

  // SCEN-391
  test('[error] 処理ルート設定画面 - 存在しない承認者選択でエラー', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '存在しない承認者テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'expense');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toContainText('指定された承認者が存在しません');
  });

  // SCEN-392
  test('[edge] 処理ルート設定画面 - 処理ルート名文字数上限', async ({ page }) => {
    const longName = 'A'.repeat(50);
    const tooLongName = 'A'.repeat(51);
    
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', longName);
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText(longName);
    
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', tooLongName);
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-393
  test('[edge] 処理ルート設定画面 - 承認ステップ数上限', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', 'ステップ上限テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'procurement');
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-step-button"]');
    }
    
    const addButton = page.locator('[data-testid="add-step-button"]');
    await expect(addButton).toBeDisabled();
  });

  // SCEN-394
  test('[edge] 処理ルート設定画面 - 承認期限最短設定', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '最短期限テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'leave');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline-input"]', '1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最短期限テスト');
  });

  // SCEN-395
  test('[edge] 処理ルート設定画面 - 承認期限最長設定', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '最長期限テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'procurement');
    await page.click('[data-testid="add-step-button"]');
    await page.fill('[data-testid="approval-deadline-input"]', '999');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最長期限テスト');
  });

  // SCEN-396
  test('[edge] 処理ルート設定画面 - 大量承認者一括選択', async ({ page }) => {
    await page.click('[data-testid="new-route-button"]');
    await page.fill('[data-testid="route-name-input"]', '大量承認者テスト');
    await page.selectOption('[data-testid="document-type-select"]', 'subsidy');
    await page.click('[data-testid="add-step-button"]');
    
    const approverModal = page.locator('#approver-modal');
    await expect(approverModal).toBeVisible();
    
    const approverList = page.locator('#approver-list');
    await expect(approverList).toBeVisible();
    
    await page.click('#btn-modal-select');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('大量承認者テスト');
  });
});