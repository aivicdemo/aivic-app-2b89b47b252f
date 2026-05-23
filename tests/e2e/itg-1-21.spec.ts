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

  test("SCEN-358: 申請書類IDが正常に表示される", async ({ page }) => {
    // SCEN-358: [normal] 電子化可否判定画面 - 申請書類IDが正常に表示される
    await expect(page.locator('[data-testid="application-id-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-id-display"]')).not.toBeEmpty();
  });

  test("SCEN-359: 文書種別選択で判定条件が変更される", async ({ page }) => {
    // SCEN-359: [normal] 電子化可否判定画面 - 文書種別選択で判定条件が変更される
    await page.selectOption('[data-testid="document-type-select"]', '契約書');
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await page.selectOption('[data-testid="document-type-select"]', '報告書');
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('報告書');
  });

  test("SCEN-360: 申請者情報が正しく表示される", async ({ page }) => {
    // SCEN-360: [normal] 電子化可否判定画面 - 申請者情報が正しく表示される
    await expect(page.locator('#applicant-name')).toContainText('田中 太郎');
    await expect(page.locator('#applicant-dept')).toContainText('総務部');
    await expect(page.locator('#application-date')).toBeVisible();
  });

  test("SCEN-361: 書類内容プレビューが表示される", async ({ page }) => {
    // SCEN-361: [normal] 電子化可否判定画面 - 書類内容プレビューが表示される
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-preview"]')).not.toBeEmpty();
  });

  test("SCEN-362: 電子化可能な書類で判定実行成功", async ({ page }) => {
    // SCEN-362: [normal] 電子化可否判定画面 - 電子化可能な書類で判定実行成功
    await page.selectOption('#document-type', '一般申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toContainText('電子化可能');
  });

  test("SCEN-363: 電子化不可な書類で判定実行成功", async ({ page }) => {
    // SCEN-363: [normal] 電子化可否判定画面 - 電子化不可な書類で判定実行成功
    await page.selectOption('#document-type', '補助金申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toContainText('電子化不可');
  });

  test("SCEN-364: 判定理由が詳細に表示される", async ({ page }) => {
    // SCEN-364: [normal] 電子化可否判定画面 - 判定理由が詳細に表示される
    await expect(page.locator('[data-testid="judgment-reason"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-reason"]')).not.toBeEmpty();
  });

  test("SCEN-365: 補助金関連度レベルが表示される", async ({ page }) => {
    // SCEN-365: [normal] 電子化可否判定画面 - 補助金関連度レベルが表示される
    await expect(page.locator('[data-testid="subsidy-level"]')).toBeVisible();
    await expect(page.locator('#level-value')).toContainText('中');
  });

  test("SCEN-366: 推奨処理ルートが表示される", async ({ page }) => {
    // SCEN-366: [normal] 電子化可否判定画面 - 推奨処理ルートが表示される
    await expect(page.locator('[data-testid="recommended-route"]')).toBeVisible();
    await expect(page.locator('#route-value')).toContainText('ハイブリッド');
  });

  test("SCEN-367: 手動オーバーライドで判定結果変更", async ({ page }) => {
    // SCEN-367: [normal] 電子化可否判定画面 - 手動オーバーライドで判定結果変更
    await page.click('[data-testid="execute-judgment-button"]');
    await page.click('[data-testid="manual-override"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toBeVisible();
  });

  test("SCEN-368: 承認フロー確認で遷移する", async ({ page }) => {
    // SCEN-368: [normal] 電子化可否判定画面 - 承認フロー確認で遷移する
    await page.click('[data-testid="check-approval-flow-button"]');
    await expect(page.url()).not.toContain('scr-1779422575885');
  });

  test("SCEN-369: 次のステップへ正常に進む", async ({ page }) => {
    // SCEN-369: [normal] 電子化可否判定画面 - 次のステップへ正常に進む
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    await page.click('[data-testid="next-step-button"]');
    await expect(page.url()).not.toContain('scr-1779422575885');
  });

  test("SCEN-370: 文書種別未選択で判定実行エラー", async ({ page }) => {
    // SCEN-370: [error] 電子化可否判定画面 - 文書種別未選択で判定実行エラー
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-371: 不正な申請書類IDでエラー表示", async ({ page }) => {
    // SCEN-371: [error] 電子化可否判定画面 - 不正な申請書類IDでエラー表示
    await page.fill('#application-id-display', 'invalid-id-###');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-372: 書類内容読み込み失敗時のエラー", async ({ page }) => {
    // SCEN-372: [error] 電子化可否判定画面 - 書類内容読み込み失敗時のエラー
    await page.setInputFiles('input[type="file"]', { name: 'corrupted.pdf', mimeType: 'application/pdf', buffer: Buffer.from('corrupted') });
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-373: 判定実行時のシステムエラー処理", async ({ page }) => {
    // SCEN-373: [error] 電子化可否判定画面 - 判定実行時のシステムエラー処理
    await page.route('**/api/**', route => route.abort());
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-374: 承認フロー確認時のエラー処理", async ({ page }) => {
    // SCEN-374: [error] 電子化可否判定画面 - 承認フロー確認時のエラー処理
    await page.route('**/approval-flow/**', route => route.abort());
    await page.click('[data-testid="check-approval-flow-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-375: 最大文字数の申請書類IDで正常動作", async ({ page }) => {
    // SCEN-375: [edge] 電子化可否判定画面 - 最大文字数の申請書類IDで正常動作
    const maxLengthId = 'a'.repeat(255);
    await page.fill('#application-id-display', maxLengthId);
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="digitization-result"]')).toBeVisible();
  });

  test("SCEN-376: 最大サイズの書類プレビュー表示", async ({ page }) => {
    // SCEN-376: [edge] 電子化可否判定画面 - 最大サイズの書類プレビュー表示
    const largeFile = { name: 'large.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(10 * 1024 * 1024, 0) };
    await page.setInputFiles('input[type="file"]', largeFile);
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  test("SCEN-377: 判定理由の最大文字数表示", async ({ page }) => {
    // SCEN-377: [edge] 電子化可否判定画面 - 判定理由の最大文字数表示
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="judgment-reason"]', maxText);
    await expect(page.locator('[data-testid="judgment-reason"]')).toHaveValue(maxText);
    
    const overMaxText = 'a'.repeat(1001);
    await page.fill('[data-testid="judgment-reason"]', overMaxText);
    const actualValue = await page.locator('[data-testid="judgment-reason"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(1000);
  });

});