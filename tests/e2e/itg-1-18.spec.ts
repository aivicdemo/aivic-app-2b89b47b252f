import { test, expect } from '@playwright/test';

test.describe("分類基準設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422527556.html");
  });

  // SCEN-302
  test("分類基準新規作成が正常に完了する", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類基準');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.check('[data-testid="relevance-high"]');
    await page.fill('[data-testid="keywords-input"]', 'テスト用の分類基準です');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="priority-slider"]', '50');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('テスト分類基準');
  });

  // SCEN-303
  test("分類基準一覧表示と検索が正常に動作する", async ({ page }) => {
    await expect(page.locator('[data-testid="criteria-list"]')).toBeVisible();
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('テスト');
    await page.fill('[data-testid="search-input"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="criteria-list"]')).toBeVisible();
  });

  // SCEN-304
  test("既存分類基準の編集が正常に保存される", async ({ page }) => {
    await page.click('button:has-text("編集")');
    await page.fill('[data-testid="criteria-name-input"]', '重要度A-更新');
    await page.fill('[data-testid="keywords-input"]', '150万円以上');
    await page.click('[data-testid="save-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('重要度A-更新');
  });

  // SCEN-305
  test("分類基準の削除が正常に実行される", async ({ page }) => {
    await page.click('button:has-text("削除")');
    await expect(page.locator('text=削除確認')).toBeVisible();
    await page.click('button:has-text("削除")');
    await expect(page.locator('text=削除完了')).toBeVisible();
  });

  // SCEN-306
  test("有効無効切り替えが即座に反映される", async ({ page }) => {
    await expect(page.locator('[data-testid="criteria-list"]')).toBeVisible();
    const activeSwitch = page.locator('[data-testid="active-switch"]').first();
    await activeSwitch.click();
    await page.reload();
    await expect(activeSwitch).toBeVisible();
  });

  // SCEN-307
  test("条件プレビューが設定内容を正確に表示する", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.check('[data-testid="relevance-high"]');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('[id="preview-content"]')).toContainText('経費申請');
    await expect(page.locator('[id="preview-content"]')).toContainText('標準承認ルート');
  });

  // SCEN-308
  test("分類基準名未入力でバリデーションエラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-309
  test("重複する分類基準名でエラー表示", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', '既存の分類基準');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('重複');
  });

  // SCEN-310
  test("適用開始日が終了日より後でエラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="start-date-input"]', '2024-12-31');
    await page.fill('[data-testid="end-date-input"]', '2024-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-311
  test("キーワード条件未設定で保存エラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-312
  test("処理ルート未選択で保存エラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('処理ルート');
  });

  // SCEN-313
  test("分類基準名最大文字数での保存", async ({ page }) => {
    const maxLengthName = 'A'.repeat(255);
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', maxLengthName);
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText(maxLengthName);
  });

  // SCEN-314
  test("優先度最小値最大値での設定", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類最小');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '条件');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[id="priority-value"]')).toContainText('1');
    
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類最大');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '条件');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="priority-slider"]', '999');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[id="priority-value"]')).toContainText('999');
  });

  // SCEN-315
  test("適用日付に過去日付を設定", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', 'テスト分類');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '条件');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="start-date-input"]', '2023-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('本日以降');
  });

  // SCEN-316
  test("キーワード条件に特殊文字を入力", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', '特殊文字テスト');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '!@#$%^&*(){}[]|\\:;"\'<>?,./~`');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('特殊文字テスト');
  });

  // SCEN-317
  test("同一優先度の分類基準が複数存在する場合", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', '分類基準1');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '条件1');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.click('[data-testid="save-button"]');
    
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="criteria-name-input"]', '分類基準2');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[data-testid="keywords-input"]', '条件2');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('分類基準1');
    await expect(page.locator('[data-testid="criteria-list"]')).toContainText('分類基準2');
  });
});