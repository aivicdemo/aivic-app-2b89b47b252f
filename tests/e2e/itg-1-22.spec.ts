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

  test('SCEN-378: [normal] 処理ルート設定画面 - 基本的な処理ルート作成', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート001');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('テスト処理ルート001');
  });

  test('SCEN-379: [normal] 処理ルート設定画面 - 複数承認者による順次承認ルート作成', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '順次承認テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.selectOption('[data-testid="approver-select-1"]', '佐藤花子（課長）');
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="approver-select-2"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('順次承認テストルート');
  });

  test('SCEN-380: [normal] 処理ルート設定画面 - 並列承認ルート作成', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '並列承認テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '稟議申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="approver-select-2"]', '佐藤花子（課長）');
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="approver-select-3"]', '鈴木一郎（係長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('並列承認テストルート');
  });

  test('SCEN-381: [normal] 処理ルート設定画面 - 条件分岐を含むルート作成', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '金額別承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', '購買申請');
    await page.selectOption('[data-testid="branch-condition-select"]', '申請金額');
    await page.fill('[data-testid="condition-value"]', '100000');
    await page.selectOption('[data-testid="branch-approver-select"]', '山田次郎（主任）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('金額別承認ルート');
  });

  test('SCEN-382: [normal] 処理ルート設定画面 - 代理承認者設定', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '代理承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', '契約申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.selectOption('[data-testid="substitute-approver-select"]', '佐藤花子（課長）');
    await page.fill('[data-testid="substitute-end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('代理承認ルート');
  });

  test('SCEN-383: [normal] 処理ルート設定画面 - 承認期限と遅延通知設定', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '期限設定ルート');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="approval-deadline"]', '5');
    await page.check('[data-testid="delay-notification"]');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('期限設定ルート');
  });

  test('SCEN-384: [normal] 処理ルート設定画面 - ルートプレビュー表示確認', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト承認ルート');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.selectOption('[data-testid="approver-select-1"]', '佐藤花子（課長）');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('#preview-content')).toBeVisible();
    await expect(page.locator('#preview-content')).toContainText('佐藤花子（課長）');
  });

  test('SCEN-385: [normal] 処理ルート設定画面 - ルート有効化切り替え', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '有効化テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '稟議申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="route-active"]');
    await expect(page.locator('[data-testid="route-active"]')).toBeChecked();
  });

  test('SCEN-386: [error] 処理ルート設定画面 - 処理ルート名未入力でエラー', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-387: [error] 処理ルート設定画面 - 文書種別未選択でエラー', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-388: [error] 処理ルート設定画面 - 承認者未設定でエラー', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-389: [error] 処理ルート設定画面 - 無効な承認期限でエラー', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'テスト処理ルート');
    await page.selectOption('[data-testid="document-type-select"]', '購買申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.fill('[data-testid="approval-deadline"]', '2023-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-390: [error] 処理ルート設定画面 - 承認者重複設定でエラー', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '重複テストルート');
    await page.selectOption('[data-testid="document-type-select"]', '契約申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="add-step-button"]');
    await page.selectOption('[data-testid="approver-select-2"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toContainText('同一の承認者を複数の承認段階に設定することはできません');
  });

  test('SCEN-391: [error] 処理ルート設定画面 - 存在しない承認者選択でエラー', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'エラーテストルート');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('#approver-modal');
    await page.fill('#approver-search', '存在しないユーザー');
    await page.click('button:has-text("選択")');
    await expect(page.locator('.error-message')).toContainText('指定された承認者が存在しません');
  });

  test('SCEN-392: [edge] 処理ルート設定画面 - 処理ルート名文字数上限', async ({ page }) => {
    const maxLengthName = 'あ'.repeat(50);
    const overLengthName = 'あ'.repeat(51);
    
    await page.fill('[data-testid="route-name"]', maxLengthName);
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText(maxLengthName);

    await page.fill('[data-testid="route-name"]', overLengthName);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('SCEN-393: [edge] 処理ルート設定画面 - 承認ステップ数上限', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', 'ステップ上限テスト');
    await page.selectOption('[data-testid="document-type-select"]', '稟議申請');
    
    for (let i = 0; i < 10; i++) {
      if (i > 0) await page.click('[data-testid="add-step-button"]');
      await page.selectOption(`[data-testid="approver-select-${i + 1}"]`, '田中太郎（部長）');
    }
    
    const addButton = page.locator('[data-testid="add-step-button"]');
    await expect(addButton).toBeDisabled();
  });

  test('SCEN-394: [edge] 処理ルート設定画面 - 承認期限最短設定', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '最短期限ルート');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.selectOption('[data-testid="approver-select-1"]', '佐藤花子（課長）');
    await page.fill('[data-testid="approval-deadline"]', '1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最短期限ルート');
  });

  test('SCEN-395: [edge] 処理ルート設定画面 - 承認期限最長設定', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '最長期限ルート');
    await page.selectOption('[data-testid="document-type-select"]', '購買申請');
    await page.selectOption('[data-testid="approver-select-1"]', '田中太郎（部長）');
    await page.fill('[data-testid="approval-deadline"]', '999');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('最長期限ルート');
  });

  test('SCEN-396: [edge] 処理ルート設定画面 - 大量承認者一括選択', async ({ page }) => {
    await page.fill('[data-testid="route-name"]', '大量承認者ルート');
    await page.selectOption('[data-testid="document-type-select"]', '契約申請');
    await page.click('#approver-modal');
    
    const users = ['#user1', '#user2', '#user3', '#user4'];
    for (const user of users) {
      await page.check(user);
    }
    
    await page.click('#modal-select');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="route-list"]')).toContainText('大量承認者ルート');
  });
});