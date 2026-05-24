import { test, expect } from '@playwright/test';

test.describe("電子化可否判定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422575885.html");
  });

  test('SCEN-358: 申請書類IDが正常に表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="application-id-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-id-display"]')).toContainText('申請書類ID');
  });

  test('SCEN-359: 文書種別選択で判定条件が変更される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '契約書');
    await expect(page.locator('.content-area')).toBeVisible();
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await expect(page.locator('.content-area')).toBeVisible();
    await page.selectOption('[data-testid="document-type-select"]', '報告書');
    await expect(page.locator('.content-area')).toBeVisible();
  });

  test('SCEN-360: 申請者情報が正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toContainText('申請者名');
    await expect(page.locator('[data-testid="applicant-department"]')).toContainText('所属部署');
    await expect(page.locator('[data-testid="application-date"]')).toContainText('申請日時');
  });

  test('SCEN-361: 書類内容プレビューが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-preview"]')).toContainText('書類内容プレビュー');
  });

  test('SCEN-362: 電子化可能な書類で判定実行成功', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toContainText('電子化可能');
  });

  test('SCEN-363: 電子化不可な書類で判定実行成功', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '契約書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toContainText('電子化不可');
  });

  test('SCEN-364: 判定理由が詳細に表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="judgment-reason"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-reason"]')).toContainText('判定理由詳細');
  });

  test('SCEN-365: 補助金関連度レベルが表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="subsidy-relevance-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="subsidy-relevance-level"]')).toContainText('補助金関連度レベル');
  });

  test('SCEN-366: 推奨処理ルートが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="recommended-route"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-route"]')).toContainText('推奨処理ルート');
  });

  test('SCEN-367: 手動オーバーライドで判定結果変更', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await page.click('[data-testid="manual-override"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toBeVisible();
  });

  test('SCEN-368: 承認フロー確認で遷移する', async ({ page }) => {
    await page.click('[data-testid="approval-flow-btn"]');
    await page.waitForURL('**/panels/**');
  });

  test('SCEN-369: 次のステップへ正常に進む', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await page.click('[data-testid="next-step-btn"]');
    await page.waitForURL('**/panels/**');
  });

  test('SCEN-370: 文書種別未選択で判定実行エラー', async ({ page }) => {
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別');
  });

  test('SCEN-371: 不正な申請書類IDでエラー表示', async ({ page }) => {
    await page.fill('[data-testid="application-id-display"]', 'INVALID_ID');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('申請書類ID');
  });

  test('SCEN-372: 書類内容読み込み失敗時のエラー', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '報告書');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-373: 判定実行時のシステムエラー処理', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-374: 承認フロー確認時のエラー処理', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.click('[data-testid="approval-flow-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-375: 最大文字数の申請書類IDで正常動作', async ({ page }) => {
    const longId = 'A'.repeat(255);
    await page.fill('[data-testid="application-id-display"]', longId);
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toBeVisible();
  });

  test('SCEN-376: 最大サイズの書類プレビュー表示', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  test('SCEN-377: 判定理由の最大文字数表示', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    const reasonText = 'A'.repeat(1000);
    await expect(page.locator('[data-testid="judgment-reason"]')).toBeVisible();
  });
});