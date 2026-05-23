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
  test('[normal] 申請書類IDが正常に表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await expect(page.locator('[data-testid="document-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-id"]')).not.toBeEmpty();
  });

  // SCEN-359
  test('[normal] 文書種別選択で判定条件が変更される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    const firstJudgment = await page.locator('[data-testid="judgment-reason"]').textContent();
    
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    const secondJudgment = await page.locator('[data-testid="judgment-reason"]').textContent();
    
    await page.selectOption('[data-testid="document-type-select"]', '稟議申請');
    const thirdJudgment = await page.locator('[data-testid="judgment-reason"]').textContent();
    
    expect(firstJudgment).not.toBe(secondJudgment);
    expect(secondJudgment).not.toBe(thirdJudgment);
  });

  // SCEN-360
  test('[normal] 申請者情報が正しく表示される', async ({ page }) => {
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#applicant-dept')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
  });

  // SCEN-361
  test('[normal] 書類内容プレビューが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-preview"]')).not.toBeEmpty();
  });

  // SCEN-362
  test('[normal] 電子化可能な書類で判定実行成功', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toContainText('電子');
  });

  // SCEN-363
  test('[normal] 電子化不可な書類で判定実行成功', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toContainText('不可');
  });

  // SCEN-364
  test('[normal] 判定理由が詳細に表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="judgment-reason"]')).toBeVisible();
    await expect(page.locator('[data-testid="judgment-reason"]')).not.toBeEmpty();
  });

  // SCEN-365
  test('[normal] 補助金関連度レベルが表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="subsidy-level-select"]')).toBeVisible();
    const options = page.locator('[data-testid="subsidy-level-select"] option');
    await expect(options).toContainText(['レベル1 (低)', 'レベル2 (中)', 'レベル3 (高)', 'レベル4 (最高)']);
  });

  // SCEN-366
  test('[normal] 推奨処理ルートが表示される', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="recommended-route"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-route"]')).not.toBeEmpty();
  });

  // SCEN-367
  test('[normal] 手動オーバーライドで判定結果変更', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    const originalResult = await page.locator('#judgment-result').textContent();
    
    await page.click('[data-testid="manual-override"]');
    await page.fill('[data-testid="judgment-reason"]', '特別な理由により変更');
    
    const newResult = await page.locator('#judgment-result').textContent();
    expect(originalResult).not.toBe(newResult);
  });

  // SCEN-368
  test('[normal] 承認フロー確認で遷移する', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="confirm-flow-button"]');
    await expect(page).toHaveURL(/承認フロー/);
  });

  // SCEN-369
  test('[normal] 次のステップへ正常に進む', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await page.click('text=次へ');
    await expect(page).toHaveURL(/next-step/);
  });

  // SCEN-370
  test('[error] 文書種別未選択で判定実行エラー', async ({ page }) => {
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('文書種別');
  });

  // SCEN-371
  test('[error] 不正な申請書類IDでエラー表示', async ({ page }) => {
    await page.fill('[data-testid="document-id"]', 'INVALID_ID_@#$');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('申請書類IDが正しくありません');
  });

  // SCEN-372
  test('[error] 書類内容読み込み失敗時のエラー', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.setInputFiles('input[type="file"]', {
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data')
    });
    await expect(page.locator('.error-message')).toContainText('読み込み');
  });

  // SCEN-373
  test('[error] 判定実行時のシステムエラー処理', async ({ page }) => {
    await page.route('**/api/judgment', route => route.abort());
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('.error-message')).toContainText('システムエラー');
  });

  // SCEN-374
  test('[error] 承認フロー確認時のエラー処理', async ({ page }) => {
    await page.route('**/api/approval-flow', route => route.abort());
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="confirm-flow-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  // SCEN-375
  test('[edge] 最大文字数の申請書類IDで正常動作', async ({ page }) => {
    const maxId = 'A'.repeat(255);
    await page.fill('[data-testid="document-id"]', maxId);
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#judgment-result')).toBeVisible();
  });

  // SCEN-376
  test('[edge] 最大サイズの書類プレビュー表示', async ({ page }) => {
    const largeFile = Buffer.alloc(50 * 1024 * 1024);
    await page.setInputFiles('input[type="file"]', {
      name: 'large.pdf',
      mimeType: 'application/pdf',
      buffer: largeFile
    });
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  // SCEN-377
  test('[edge] 判定理由の最大文字数表示', async ({ page }) => {
    const maxText = 'A'.repeat(1000);
    await page.fill('[data-testid="judgment-reason"]', maxText);
    const displayedText = await page.locator('[data-testid="judgment-reason"]').inputValue();
    expect(displayedText).toBe(maxText);
    
    const overMaxText = 'A'.repeat(1001);
    await page.fill('[data-testid="judgment-reason"]', overMaxText);
    const limitedText = await page.locator('[data-testid="judgment-reason"]').inputValue();
    expect(limitedText.length).toBeLessThanOrEqual(1000);
  });
});