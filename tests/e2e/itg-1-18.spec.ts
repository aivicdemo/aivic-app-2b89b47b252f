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
    await page.fill('[data-testid="classification-name"]', 'テスト分類基準');
    await page.fill('#input-name', 'TEST001');
    await page.fill('#input-keywords', 'テスト用の分類基準です');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.click('[data-testid="save-button"]');
    await page.locator('text=OK').click();
    await expect(page.locator('text=分類基準を保存しました')).toBeVisible();
    await expect(page.locator('text=テスト分類基準')).toBeVisible();
  });

  test('SCEN-303: 分類基準一覧表示と検索が正常に動作する', async ({ page }) => {
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
    await page.fill('[data-testid="search-input"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="classification-list"]')).toBeVisible();
  });

  test('SCEN-304: 既存分類基準の編集が正常に保存される', async ({ page }) => {
    await page.locator('text=編集').first().click();
    await page.fill('#input-name', '重要度A-更新');
    await page.fill('#input-keywords', '金額条件を「150万円以上」');
    await page.fill('[data-testid="keyword-conditions"]', '更新された説明文');
    await page.click('[data-testid="save-button"]');
    await page.locator('text=OK').click();
    await expect(page.locator('text=重要度A-更新')).toBeVisible();
  });

  test('SCEN-305: 分類基準の削除が正常に実行される', async ({ page }) => {
    await page.locator('text=削除').first().click();
    await expect(page.locator('text=削除')).toBeVisible();
    await page.locator('text=削除').last().click();
    await expect(page.locator('text=削除完了')).toBeVisible();
  });

  test('SCEN-306: 有効無効切り替えが即座に反映される', async ({ page }) => {
    await page.click('[data-testid="active-toggle"]');
    await expect(page.locator('[data-testid="active-toggle"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-testid="active-toggle"]')).toBeVisible();
  });

  test('SCEN-307: 条件プレビューが設定内容を正確に表示する', async ({ page }) => {
    await page.fill('#input-keywords', '申請金額が100万円以上、部署が「営業部」');
    await page.select('[data-testid="processing-route-select"]', '標準承認ルート');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('#preview-content')).toContainText('申請金額が100万円以上');
    await expect(page.locator('#preview-content')).toContainText('営業部');
    await page.fill('#input-keywords', '申請金額が200万円以上、部署が「総務部」');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('#preview-content')).toContainText('申請金額が200万円以上');
    await expect(page.locator('#preview-content')).toContainText('総務部');
  });

  test('SCEN-308: 分類基準名未入力でバリデーションエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=分類基準名')).toBeVisible();
  });

  test('SCEN-309: 重複する分類基準名でエラー表示', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', '既存の分類基準名');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=重複')).toBeVisible();
  });

  test('SCEN-310: 適用開始日が終了日より後でエラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', 'テスト分類基準');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=適用開始日が終了日より後')).toBeVisible();
  });

  test('SCEN-311: キーワード条件未設定で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', 'テスト分類基準');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=キーワード条件')).toBeVisible();
  });

  test('SCEN-312: 処理ルート未選択で保存エラー', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', 'テスト分類');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=処理ルート未選択')).toBeVisible();
  });

  test('SCEN-313: 分類基準名最大文字数での保存', async ({ page }) => {
    const maxLengthName = 'a'.repeat(255);
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', maxLengthName);
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    await page.select('[data-testid="processing-route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator(`text=${maxLengthName.substring(0, 50)}`)).toBeVisible();
  });

  test('SCEN-314: 優先度最小値最大値での設定', async ({ page }) => {
    await page.fill('[data-testid="priority-input"]', '1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="priority-input"]')).toHaveValue('1');
    await page.fill('[data-testid="priority-input"]', '999');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="priority-input"]')).toHaveValue('999');
  });

  test('SCEN-315: 適用日付に過去日付を設定', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', 'テスト分類');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('[data-testid="start-date"]', yesterday.toISOString().split('T')[0]);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=適用日付は本日以降')).toBeVisible();
  });

  test('SCEN-316: キーワード条件に特殊文字を入力', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', '特殊文字テスト');
    await page.fill('[data-testid="keyword-conditions"]', '!@#$%^&*(){}[]|\\:;"\'<>?,./~`');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('text=特殊文字テスト')).toBeVisible();
  });

  test('SCEN-317: 同一優先度の分類基準が複数存在する場合', async ({ page }) => {
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', '分類基準1');
    await page.fill('[data-testid="priority-input"]', '1');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件1');
    await page.select('[data-testid="processing-route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await page.click('[data-testid="new-button"]');
    await page.fill('#input-name', '分類基準2');
    await page.fill('[data-testid="priority-input"]', '1');
    await page.fill('[data-testid="keyword-conditions"]', 'テスト条件2');
    await page.select('[data-testid="processing-route-select"]', '標準承認ルート');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=分類基準1')).toBeVisible();
    await expect(page.locator('text=分類基準2')).toBeVisible();
  });
});