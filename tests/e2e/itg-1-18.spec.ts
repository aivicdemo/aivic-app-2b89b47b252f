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

  test('SCEN-302: 分類基準新規作成が正常に完了する', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await expect(page.locator('#form-panel')).toBeVisible();
    
    await page.fill('[data-testid="classification-name"]', 'テスト分類基準');
    await page.fill('#form-name', 'TEST001');
    await page.fill('#form-keywords', 'テスト用の分類基準です');
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=分類基準を保存しました')).toBeVisible();
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('テスト分類基準');
  });

  test('SCEN-303: 分類基準一覧表示と検索が正常に動作する', async ({ page }) => {
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    
    await page.fill('[data-testid="search-name"]', '補助金');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    
    await page.fill('[data-testid="search-name"]', '');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
  });

  test('SCEN-304: 既存分類基準の編集が正常に保存される', async ({ page }) => {
    await page.click('text=編集');
    await expect(page.locator('#form-panel')).toBeVisible();
    
    await page.fill('#form-name', '重要度A-更新');
    await page.fill('#form-keywords', '150万円以上');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=分類基準を保存しました')).toBeVisible();
    await expect(page.locator('[data-testid="classification-list"]')).toContainText('重要度A-更新');
  });

  test('SCEN-305: 分類基準の削除が正常に実行される', async ({ page }) => {
    await page.click('text=削除');
    
    await expect(page.locator('text=削除しますか')).toBeVisible();
    await page.click('text=削除');
    
    await expect(page.locator('text=削除しました')).toBeVisible();
  });

  test('SCEN-306: 有効無効切り替えが即座に反映される', async ({ page }) => {
    const switchElement = page.locator('[data-testid="active-switch"]').first();
    await switchElement.click();
    
    await page.reload();
    
    await expect(switchElement).toBeChecked();
  });

  test('SCEN-307: 条件プレビューが設定内容を正確に表示する', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', '営業部申請');
    await page.select('[data-testid="doctype-select"]', '補助金申請');
    await page.fill('[data-testid="keywords-input"]', '100万円以上');
    await page.select('[data-testid="route-select"]', '部長承認→役員承認');
    
    await page.click('text=条件プレビュー');
    
    await expect(page.locator('#condition-preview')).toContainText('100万円以上');
    await expect(page.locator('#condition-preview')).toContainText('部長承認→役員承認');
  });

  test('SCEN-308: 分類基準名未入力でバリデーションエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-keywords', '適切な条件');
    await page.select('[data-testid="doctype-select"]', '経費申請');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=分類基準名を入力してください')).toBeVisible();
  });

  test('SCEN-309: 重複する分類基準名でエラー表示', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', '既存分類基準');
    await page.fill('#form-keywords', '条件設定');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=既に同じ名前の分類基準が存在します')).toBeVisible();
  });

  test('SCEN-310: 適用開始日が終了日より後でエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=適用開始日は終了日より前の日付を設定してください')).toBeVisible();
  });

  test('SCEN-311: キーワード条件未設定で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', 'テスト分類');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=キーワード条件を設定してください')).toBeVisible();
  });

  test('SCEN-312: 処理ルート未選択で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="keywords-input"]', '適切な条件');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=処理ルートを選択してください')).toBeVisible();
  });

  test('SCEN-313: 分類基準名最大文字数での保存', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    const maxLengthName = 'a'.repeat(255);
    await page.fill('#form-name', maxLengthName);
    await page.fill('[data-testid="keywords-input"]', '有効な条件');
    await page.select('[data-testid="route-select"]', '標準承認ルート');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=分類基準を保存しました')).toBeVisible();
    
    await page.click('text=編集');
    const savedName = await page.locator('#form-name').inputValue();
    expect(savedName.length).toBe(255);
  });

  test('SCEN-314: 優先度最小値最大値での設定', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('[data-testid="priority-slider"]', '1');
    await expect(page.locator('#priority-value')).toContainText('1');
    
    await page.fill('[data-testid="priority-slider"]', '999');
    await expect(page.locator('#priority-value')).toContainText('999');
  });

  test('SCEN-315: 適用日付に過去日付を設定', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', 'テスト分類');
    await page.fill('[data-testid="keywords-input"]', '必要な条件');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    await page.fill('[data-testid="start-date"]', yesterdayStr);
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=適用日付は本日以降の日付を設定してください')).toBeVisible();
  });

  test('SCEN-316: キーワード条件に特殊文字を入力', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', '特殊文字テスト');
    await page.fill('[data-testid="keywords-input"]', '!@#$%^&*(){}[]|\\:;"\'<>?,./~`');
    await page.select('[data-testid="route-select"]', '標準承認ルート');
    
    await page.click('[data-testid="save-button"]');
    
    const isVisible = await page.locator('text=分類基準を保存しました').isVisible().catch(() => false);
    const hasError = await page.locator('text=エラー').isVisible().catch(() => false);
    
    expect(isVisible || hasError).toBe(true);
  });

  test('SCEN-317: 同一優先度の分類基準が複数存在する場合', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', '分類基準1');
    await page.fill('[data-testid="keywords-input"]', '条件1');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.select('[data-testid="route-select"]', '標準承認ルート');
    
    await page.click('[data-testid="save-button"]');
    
    await page.click('[data-testid="new-button"]');
    
    await page.fill('#form-name', '分類基準2');
    await page.fill('[data-testid="keywords-input"]', '条件2');
    await page.fill('[data-testid="priority-slider"]', '1');
    await page.select('[data-testid="route-select"]', '標準承認ルート');
    
    await page.click('[data-testid="save-button"]');
    
    const successVisible = await page.locator('text=分類基準を保存しました').isVisible().catch(() => false);
    const errorVisible = await page.locator('text=同じ優先度の分類基準が既に存在します').isVisible().catch(() => false);
    
    expect(successVisible || errorVisible).toBe(true);
  });
});