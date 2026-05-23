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

  // SCEN-358
  test("申請書類IDが正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="document-id"]')).toBeVisible();
    await page.fill('[data-testid="document-id"]', 'APP-2024-001');
    await expect(page.locator('[data-testid="document-id"]')).toHaveValue('APP-2024-001');
  });

  // SCEN-359
  test("文書種別選択で判定条件が変更される", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '契約書');
    await expect(page.locator('#judgment-reason')).toContainText('契約書関連の判定基準');
    await page.selectOption('[data-testid="document-type-select"]', '申請書');
    await expect(page.locator('#judgment-reason')).toContainText('申請書関連の判定基準');
  });

  // SCEN-360
  test("申請者情報が正しく表示される", async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#applicant-dept')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
  });

  // SCEN-361
  test("書類内容プレビューが表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-preview"]')).toContainText('書類内容プレビュー');
  });

  // SCEN-362
  test("電子化可能な書類で判定実行成功", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toContainText('電子化可能');
  });

  // SCEN-363
  test("電子化不可な書類で判定実行成功", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '購買申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toContainText('電子化不可');
  });

  // SCEN-364
  test("判定理由が詳細に表示される", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="judgment-reason"]')).toContainText('判定理由詳細');
  });

  // SCEN-365
  test("補助金関連度レベルが表示される", async ({ page }) => {
    await page.selectOption('[data-testid="subsidy-level-select"]', 'レベル2 (中)');
    await expect(page.locator('#subsidy-level')).toContainText('レベル2 (中)');
  });

  // SCEN-366
  test("推奨処理ルートが表示される", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="recommended-route"]')).toBeVisible();
  });

  // SCEN-367
  test("手動オーバーライドで判定結果変更", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await page.click('[data-testid="manual-override"]');
    await page.fill('[data-testid="judgment-reason"]', '特殊事情により変更');
    await expect(page.locator('#judgment-result')).toContainText('手動変更済み');
  });

  // SCEN-368
  test("承認フロー確認で遷移する", async ({ page }) => {
    await page.click('[data-testid="confirm-flow-button"]');
    await expect(page).toHaveURL(/approval-flow/);
  });

  // SCEN-369
  test("次のステップへ正常に進む", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await page.click('text=次へ');
    await expect(page).toHaveURL(/next-step/);
  });

  // SCEN-370
  test("文書種別未選択で判定実行エラー", async ({ page }) => {
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('文書種別を選択してください');
  });

  // SCEN-371
  test("不正な申請書類IDでエラー表示", async ({ page }) => {
    await page.fill('[data-testid="document-id"]', 'INVALID-ID-@#$');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('申請書類IDが正しくありません');
  });

  // SCEN-372
  test("書類内容読み込み失敗時のエラー", async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
      name: 'corrupt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data')
    });
    await expect(page.locator('.error-message')).toContainText('書類内容の読み込みに失敗しました');
  });

  // SCEN-373
  test("判定実行時のシステムエラー処理", async ({ page }) => {
    await page.route('**/api/judgment', route => route.abort());
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('システムエラーが発生しました');
  });

  // SCEN-374
  test("承認フロー確認時のエラー処理", async ({ page }) => {
    await page.route('**/api/approval-flow', route => route.abort());
    await page.click('[data-testid="confirm-flow-button"]');
    await expect(page.locator('.error-message')).toContainText('承認フロー情報の取得に失敗しました');
  });

  // SCEN-375
  test("最大文字数の申請書類IDで正常動作", async ({ page }) => {
    const maxLengthId = 'A'.repeat(255);
    await page.fill('[data-testid="document-id"]', maxLengthId);
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toContainText('電子化可能');
  });

  // SCEN-376
  test("最大サイズの書類プレビュー表示", async ({ page }) => {
    const largeContent = 'X'.repeat(10000000);
    await page.setInputFiles('input[type="file"]', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(largeContent)
    });
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  // SCEN-377
  test("判定理由の最大文字数表示", async ({ page }) => {
    const maxText = 'A'.repeat(1000);
    await page.fill('[data-testid="judgment-reason"]', maxText);
    await expect(page.locator('[data-testid="judgment-reason"]')).toHaveValue(maxText);
    
    const overMaxText = 'B'.repeat(1001);
    await page.fill('[data-testid="judgment-reason"]', overMaxText);
    const actualValue = await page.locator('[data-testid="judgment-reason"]').inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(1000);
  });
});