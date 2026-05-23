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
  test("[normal] 分類基準設定画面 - 分類基準新規作成が正常に完了する", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類基準');
    await page.fill('[id="input-name"]', 'TEST001');
    await page.fill('[data-testid="keywords-input"]', 'テスト用の分類基準です');
    await page.fill('[data-testid="start-date-input"]', new Date().toISOString().split('T')[0]);
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('テスト分類基準');
    await expect(page.locator('text=分類基準を保存しました')).toBeVisible();
  });

  // SCEN-303
  test("[normal] 分類基準設定画面 - 分類基準一覧表示と検索が正常に動作する", async ({ page }) => {
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.fill('[data-testid="search-input"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
  });

  // SCEN-304
  test("[normal] 分類基準設定画面 - 既存分類基準の編集が正常に保存される", async ({ page }) => {
    await page.click('text=編集');
    await page.fill('[data-testid="classification-name-input"]', '重要度A-更新');
    await page.fill('[data-testid="keywords-input"]', '150万円以上');
    await page.click('[data-testid="save-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('重要度A-更新');
  });

  // SCEN-305
  test("[normal] 分類基準設定画面 - 分類基準の削除が正常に実行される", async ({ page }) => {
    await page.click('text=削除');
    await expect(page.locator('[id="delete-modal"]')).toBeVisible();
    await page.click('[id="btn-confirm-delete"]');
    await expect(page.locator('text=削除完了')).toBeVisible();
  });

  // SCEN-306
  test("[normal] 分類基準設定画面 - 有効無効切り替えが即座に反映される", async ({ page }) => {
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.click('[data-testid="active-toggle"]');
    await expect(page.locator('[data-testid="active-toggle"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="active-toggle"]')).toBeVisible();
  });

  // SCEN-307
  test("[normal] 分類基準設定画面 - 条件プレビューが設定内容を正確に表示する", async ({ page }) => {
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類');
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請');
    await page.check('[data-testid="subsidy-high"]');
    await page.selectOption('[data-testid="route-select"]', '部長承認→役員承認');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('[id="preview-content"]')).toContainText('申請金額が100万円以上');
    await expect(page.locator('[id="preview-content"]')).toContainText('部長承認→役員承認');
  });

  // SCEN-308
  test("[error] 分類基準設定画面 - 分類基準名未入力でバリデーションエラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.selectOption('[data-testid="document-type-select"]', '予算申請');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=分類基準名が未入力')).toBeVisible();
  });

  // SCEN-309
  test("[error] 分類基準設定画面 - 重複する分類基準名でエラー表示", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', '既存分類基準');
    await page.fill('[data-testid="keywords-input"]', 'テスト条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=重複する分類基準名')).toBeVisible();
  });

  // SCEN-310
  test("[error] 分類基準設定画面 - 適用開始日が終了日より後でエラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類');
    await page.fill('[data-testid="start-date-input"]', '2024-12-31');
    await page.fill('[data-testid="end-date-input"]', '2024-01-01');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=適用開始日が終了日より後')).toBeVisible();
  });

  // SCEN-311
  test("[error] 分類基準設定画面 - キーワード条件未設定で保存エラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類基準');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=キーワード条件が未設定')).toBeVisible();
  });

  // SCEN-312
  test("[error] 分類基準設定画面 - 処理ルート未選択で保存エラー", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=処理ルート未選択')).toBeVisible();
  });

  // SCEN-313
  test("[edge] 分類基準設定画面 - 分類基準名最大文字数での保存", async ({ page }) => {
    const maxName = 'あ'.repeat(255);
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', maxName);
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText(maxName);
  });

  // SCEN-314
  test("[edge] 分類基準設定画面 - 優先度最小値最大値での設定", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="priority-slider"]', '1');
    await expect(page.locator('[id="priority-value"]')).toContainText('1');
    await page.fill('[data-testid="priority-slider"]', '999');
    await expect(page.locator('[id="priority-value"]')).toContainText('999');
  });

  // SCEN-315
  test("[edge] 分類基準設定画面 - 適用日付に過去日付を設定", async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', 'テスト分類');
    await page.fill('[data-testid="keywords-input"]', 'テスト条件');
    await page.fill('[data-testid="start-date-input"]', yesterday.toISOString().split('T')[0]);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=適用日付は本日以降の日付を設定してください')).toBeVisible();
  });

  // SCEN-316
  test("[edge] 分類基準設定画面 - キーワード条件に特殊文字を入力", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', '特殊文字テスト');
    await page.fill('[data-testid="keywords-input"]', '!@#$%^&*(){}[]|\\:;"\'<>?,./~`');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('特殊文字テスト');
  });

  // SCEN-317
  test("[edge] 分類基準設定画面 - 同一優先度の分類基準が複数存在する場合", async ({ page }) => {
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', '分類基準1');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.fill('[data-testid="keywords-input"]', 'テスト1');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await page.click('[data-testid="create-button"]');
    await page.fill('[data-testid="classification-name-input"]', '分類基準2');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.fill('[data-testid="keywords-input"]', 'テスト2');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('分類基準1');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('分類基準2');
  });
});