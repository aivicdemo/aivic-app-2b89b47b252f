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
  test('[normal] 分類基準設定画面 - 分類基準新規作成が正常に完了する', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', 'テスト分類基準');
    await page.fill('[data-testid="keywords-input"]', 'TEST001');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="start-date"]', new Date().toISOString().split('T')[0]);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('分類基準を保存しました');
    await expect(page.locator('[data-testid="classification-name"]')).toContainText('テスト分類基準');
  });

  // SCEN-303
  test('[normal] 分類基準設定画面 - 分類基準一覧表示と検索が正常に動作する', async ({ page }) => {
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.fill('[data-testid="search-name"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('テスト');
    await page.fill('[data-testid="search-name"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
  });

  // SCEN-304
  test('[normal] 分類基準設定画面 - 既存分類基準の編集が正常に保存される', async ({ page }) => {
    await page.click('button:has-text("編集")');
    await page.fill('#form-name', '重要度A-更新');
    await page.fill('[data-testid="keywords-input"]', '150万円以上');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="classification-name"]')).toContainText('重要度A-更新');
  });

  // SCEN-305
  test('[normal] 分類基準設定画面 - 分類基準の削除が正常に実行される', async ({ page }) => {
    await page.click('button:has-text("削除")');
    await page.click('button:has-text("削除")');
    await expect(page.locator('body')).toContainText('削除完了');
  });

  // SCEN-306
  test('[normal] 分類基準設定画面 - 有効無効切り替えが即座に反映される', async ({ page }) => {
    await page.click('[data-testid="active-switch"]');
    await page.reload();
    await expect(page.locator('[data-testid="active-switch"]')).toBeChecked();
  });

  // SCEN-307
  test('[normal] 分類基準設定画面 - 条件プレビューが設定内容を正確に表示する', async ({ page }) => {
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', '申請金額が100万円以上');
    await page.click('#condition-preview');
    await expect(page.locator('#condition-preview')).toContainText('補助金申請');
    await expect(page.locator('#condition-preview')).toContainText('申請金額が100万円以上');
  });

  // SCEN-308
  test('[error] 分類基準設定画面 - 分類基準名未入力でバリデーションエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', 'テストキーワード');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('分類基準名を入力してください');
  });

  // SCEN-309
  test('[error] 分類基準設定画面 - 重複する分類基準名でエラー表示', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', '既存の分類基準');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', 'テストキーワード');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('重複する分類基準名');
  });

  // SCEN-310
  test('[error] 分類基準設定画面 - 適用開始日が終了日より後でエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('開始日が終了日より後');
  });

  // SCEN-311
  test('[error] 分類基準設定画面 - キーワード条件未設定で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', 'テスト分類');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('キーワード条件が未設定');
  });

  // SCEN-312
  test('[error] 分類基準設定画面 - 処理ルート未選択で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="keywords-input"]', 'テストキーワード');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('処理ルート未選択');
  });

  // SCEN-313
  test('[edge] 分類基準設定画面 - 分類基準名最大文字数での保存', async ({ page }) => {
    const maxLengthName = 'a'.repeat(255);
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', maxLengthName);
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', 'テストキーワード');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="classification-name"]')).toContainText(maxLengthName);
  });

  // SCEN-314
  test('[edge] 分類基準設定画面 - 優先度最小値最大値での設定', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.locator('[data-testid="priority-slider"]').fill('1');
    await expect(page.locator('#priority-value')).toContainText('1');
    await page.locator('[data-testid="priority-slider"]').fill('999');
    await expect(page.locator('#priority-value')).toContainText('999');
  });

  // SCEN-315
  test('[edge] 分類基準設定画面 - 適用日付に過去日付を設定', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('適用日付は本日以降の日付を設定してください');
  });

  // SCEN-316
  test('[edge] 分類基準設定画面 - キーワード条件に特殊文字を入力', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', '特殊文字テスト');
    await page.fill('[data-testid="keywords-input"]', '!@#$%^&*(){}[]|\\:;"\'<>?,./~`');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('body')).toContainText('分類基準を保存しました');
  });

  // SCEN-317
  test('[edge] 分類基準設定画面 - 同一優先度の分類基準が複数存在する場合', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', '分類基準1');
    await page.locator('[data-testid="priority-slider"]').fill('1');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', 'テスト1');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await page.click('[data-testid="new-button"]');
    await page.fill('#form-name', '分類基準2');
    await page.locator('[data-testid="priority-slider"]').fill('1');
    await page.selectOption('#form-doctype', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', 'テスト2');
    await page.selectOption('[data-testid="route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('分類基準1');
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('分類基準2');
  });
});