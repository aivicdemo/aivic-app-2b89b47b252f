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

  test('SCEN-358: [normal] 申請書類IDが正常に表示される', async ({ page }) => {
    await page.fill('#application-id', 'APP-001');
    const displayedId = await page.locator('[data-testid="application-id"]').textContent();
    expect(displayedId).toBe('APP-001');
  });

  test('SCEN-359: [normal] 文書種別選択で判定条件が変更される', async ({ page }) => {
    await page.selectOption('#document-type', '契約書');
    const firstConditions = await page.locator('[data-testid="judgment-result"]').textContent();
    await page.selectOption('#document-type', '申請書');
    const secondConditions = await page.locator('[data-testid="judgment-result"]').textContent();
    expect(firstConditions).not.toBe(secondConditions);
  });

  test('SCEN-360: [normal] 申請者情報が正しく表示される', async ({ page }) => {
    await expect(page.locator('[data-testid="applicant-info"]')).toBeVisible();
    await expect(page.locator('#applicant-name')).toBeVisible();
    await expect(page.locator('#applicant-dept')).toBeVisible();
    await expect(page.locator('#application-date')).toBeVisible();
  });

  test('SCEN-361: [normal] 書類内容プレビューが表示される', async ({ page }) => {
    await page.selectOption('#document-type', '申請書');
    const previewArea = page.locator('[data-testid="document-preview"]');
    await expect(previewArea).toBeVisible();
  });

  test('SCEN-362: [normal] 電子化可能な書類で判定実行成功', async ({ page }) => {
    await page.fill('#application-id', 'TEST-001');
    await page.selectOption('#document-type', '報告書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toContainText('電子化可能');
  });

  test('SCEN-363: [normal] 電子化不可な書類で判定実行成功', async ({ page }) => {
    await page.fill('#application-id', 'TEST-002');
    await page.selectOption('#document-type', '契約書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="judgment-result"]')).toContainText('電子化不可');
  });

  test('SCEN-364: [normal] 判定理由が詳細に表示される', async ({ page }) => {
    await page.fill('#application-id', 'TEST-003');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    const reasonText = await page.locator('[data-testid="judgment-reason"]').textContent();
    expect(reasonText?.length ?? 0).toBeGreaterThan(10);
  });

  test('SCEN-365: [normal] 補助金関連度レベルが表示される', async ({ page }) => {
    await page.fill('#application-id', 'SUB-001');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="subsidy-level"]')).toBeVisible();
  });

  test('SCEN-366: [normal] 推奨処理ルートが表示される', async ({ page }) => {
    await page.fill('#application-id', 'ROUTE-001');
    await page.selectOption('#document-type', '報告書');
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('[data-testid="recommended-route"]')).toBeVisible();
  });

  test('SCEN-367: [normal] 手動オーバーライドで判定結果変更', async ({ page }) => {
    await page.fill('#application-id', 'OVER-001');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await page.check('[data-testid="manual-override"]');
    await page.selectOption('[data-testid="override-judgment"]', '電子化不可');
    await page.fill('[data-testid="override-reason"]', '特別な理由により変更');
    
    const overriddenResult = await page.locator('[data-testid="judgment-result"]').textContent();
    expect(overriddenResult).toContain('電子化不可');
  });

  test('SCEN-368: [normal] 承認フロー確認で遷移する', async ({ page }) => {
    await page.fill('#application-id', 'FLOW-001');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="check-approval-flow-button"]');
    
    await expect(page).toHaveURL(/\/panels\/scr-/);
  });

  test('SCEN-369: [normal] 次のステップへ正常に進む', async ({ page }) => {
    await page.fill('#application-id', 'NEXT-001');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await page.click('text=次へ');
    await expect(page).toHaveURL(/\/panels\/scr-/);
  });

  test('SCEN-370: [error] 文書種別未選択で判定実行エラー', async ({ page }) => {
    await page.fill('#application-id', 'ERROR-001');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-371: [error] 不正な申請書類IDでエラー表示', async ({ page }) => {
    await page.fill('#application-id', '');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-372: [error] 書類内容読み込み失敗時のエラー', async ({ page }) => {
    await page.fill('#application-id', 'BROKEN-FILE');
    await page.selectOption('#document-type', '申請書');
    
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({ 
        name: 'broken.pdf', 
        mimeType: 'application/pdf', 
        buffer: Buffer.from('invalid content') 
      });
    }
    
    await page.click('[data-testid="execute-judgment-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-373: [error] 判定実行時のシステムエラー処理', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    
    await page.fill('#application-id', 'SYS-ERROR');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-374: [error] 承認フロー確認時のエラー処理', async ({ page }) => {
    await page.route('**/api/approval-flow/**', route => route.abort());
    
    await page.fill('#application-id', 'FLOW-ERROR');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="check-approval-flow-button"]');
    
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('SCEN-375: [edge] 最大文字数の申請書類IDで正常動作', async ({ page }) => {
    const maxLengthId = 'A'.repeat(255);
    await page.fill('#application-id', maxLengthId);
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    await expect(page.locator('[data-testid="judgment-result"]')).toBeVisible();
  });

  test('SCEN-376: [edge] 最大サイズの書類プレビュー表示', async ({ page }) => {
    await page.fill('#application-id', 'LARGE-FILE');
    await page.selectOption('#document-type', '申請書');
    
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'A');
      await fileInput.setInputFiles({ 
        name: 'large.pdf', 
        mimeType: 'application/pdf', 
        buffer: largeBuffer 
      });
    }
    
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
  });

  test('SCEN-377: [edge] 判定理由の最大文字数表示', async ({ page }) => {
    await page.fill('#application-id', 'MAX-REASON');
    await page.selectOption('#document-type', '申請書');
    await page.click('[data-testid="execute-judgment-button"]');
    
    const maxText = 'A'.repeat(1000);
    await page.fill('[data-testid="judgment-reason"]', maxText);
    
    const reasonValue = await page.locator('[data-testid="judgment-reason"]').inputValue();
    expect(reasonValue.length).toBeLessThanOrEqual(1000);
  });
});