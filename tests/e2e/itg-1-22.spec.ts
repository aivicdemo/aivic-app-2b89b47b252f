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
  test("[normal] 処理ルート設定画面 - 基本的な処理ルート作成", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート001');
    await page.selectOption('[data-testid="document-type"]', '休暇申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('テスト処理ルート001');
  });

  // SCEN-379
  test("[normal] 処理ルート設定画面 - 複数承認者による順次承認ルート作成", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '順次承認テストルート');
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('順次承認テストルート');
  });

  // SCEN-380
  test("[normal] 処理ルート設定画面 - 並列承認ルート作成", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '並列承認テストルート');
    await page.selectOption('[data-testid="document-type"]', '稟議申請');
    await page.click('[data-testid="add-step"]');
    await page.check('[class="parallel-approval"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('並列承認テストルート');
  });

  // SCEN-381
  test("[normal] 処理ルート設定画面 - 条件分岐を含むルート作成", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '金額別承認ルート');
    await page.selectOption('[data-testid="document-type"]', '購買申請');
    await page.fill('[data-testid="amount-condition"]', '100000');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('金額別承認ルート');
  });

  // SCEN-382
  test("[normal] 処理ルート設定画面 - 代理承認者設定", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '代理承認ルート');
    await page.selectOption('[data-testid="document-type"]', '休暇申請');
    await page.click('[data-testid="add-step"]');
    await page.check('[class="proxy-approval"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('代理承認ルート');
  });

  // SCEN-383
  test("[normal] 処理ルート設定画面 - 承認期限と遅延通知設定", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '期限設定ルート');
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.check('[data-testid="delay-notification"]');
    await page.fill('[data-testid="warning-days"]', '1');
    await page.check('[data-testid="escalation"]');
    await page.fill('[data-testid="escalation-days"]', '5');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('期限設定ルート');
  });

  // SCEN-384
  test("[normal] 処理ルート設定画面 - ルートプレビュー表示確認", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト承認ルート');
    await page.selectOption('[data-testid="document-type"]', '稟議申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[id="route-preview"]');
    await expect(page.locator('[id="route-preview"]')).toBeVisible();
  });

  // SCEN-385
  test("[normal] 処理ルート設定画面 - ルート有効化切り替え", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '有効化テストルート');
    await page.selectOption('[data-testid="document-type"]', '購買申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await page.check('[data-testid="route-active"]');
    await expect(page.locator('[data-testid="route-active"]')).toBeChecked();
  });

  // SCEN-386
  test("[error] 処理ルート設定画面 - 処理ルート名未入力でエラー", async ({ page }) => {
    await page.selectOption('[data-testid="document-type"]', '休暇申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=処理ルート名')).toBeVisible();
  });

  // SCEN-387
  test("[error] 処理ルート設定画面 - 文書種別未選択でエラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=文書種別')).toBeVisible();
  });

  // SCEN-388
  test("[error] 処理ルート設定画面 - 承認者未設定でエラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=承認者')).toBeVisible();
  });

  // SCEN-389
  test("[error] 処理ルート設定画面 - 無効な承認期限でエラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート');
    await page.selectOption('[data-testid="document-type"]', '稟議申請');
    await page.click('[data-testid="add-step"]');
    await page.fill('[class="approval-deadline"]', '2023-01-01');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=承認期限')).toBeVisible();
  });

  // SCEN-390
  test("[error] 処理ルート設定画面 - 承認者重複設定でエラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="document-type"]', '購買申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[id="user1"]');
    await page.click('[data-testid="add-step"]');
    await page.click('[id="user1"]');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=同一の承認者')).toBeVisible();
  });

  // SCEN-391
  test("[error] 処理ルート設定画面 - 存在しない承認者選択でエラー", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="document-type"]', '休暇申請');
    await page.click('[data-testid="add-step"]');
    await page.fill('[id="approver-search"]', 'nonexistent_user');
    await page.click('text=承認者追加');
    await expect(page.locator('text=存在しません')).toBeVisible();
  });

  // SCEN-392
  test("[edge] 処理ルート設定画面 - 処理ルート名文字数上限", async ({ page }) => {
    const maxLengthName = 'a'.repeat(50);
    const overLengthName = 'a'.repeat(51);
    
    await page.fill('[data-testid="route-name"]', maxLengthName);
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[data-testid="save-route"]');
    
    await page.fill('[data-testid="route-name"]', overLengthName);
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('text=文字数上限')).toBeVisible();
  });

  // SCEN-393
  test("[edge] 処理ルート設定画面 - 承認ステップ数上限", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'ステップ上限テスト');
    await page.selectOption('[data-testid="document-type"]', '稟議申請');
    
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-step"]');
    }
    
    const addButton = page.locator('[data-testid="add-step"]');
    await expect(addButton).toBeDisabled();
  });

  // SCEN-394
  test("[edge] 処理ルート設定画面 - 承認期限最短設定", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '最短期限テスト');
    await page.selectOption('[data-testid="document-type"]', '購買申請');
    await page.click('[data-testid="add-step"]');
    await page.fill('[class="approval-deadline"]', '1');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最短期限テスト');
  });

  // SCEN-395
  test("[edge] 処理ルート設定画面 - 承認期限最長設定", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '最長期限テスト');
    await page.selectOption('[data-testid="document-type"]', '休暇申請');
    await page.click('[data-testid="add-step"]');
    await page.fill('[class="approval-deadline"]', '999');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最長期限テスト');
  });

  // SCEN-396
  test("[edge] 処理ルート設定画面 - 大量承認者一括選択", async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '大量承認者テスト');
    await page.selectOption('[data-testid="document-type"]', '経費申請');
    await page.click('[data-testid="add-step"]');
    await page.click('[id="approver-modal"]');
    await page.click('text=全選択');
    await page.click('text=適用');
    await page.click('[data-testid="save-route"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('大量承認者テスト');
  });
});