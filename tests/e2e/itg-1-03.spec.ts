import { test, expect } from '@playwright/test';

test.describe("承認フロー進捗管理画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422241190.html");
  });

  test('申請書類一覧が正常に表示される', async ({ page }) => {
    // SCEN-031
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
    await expect(page.getByText('申請種別')).toBeVisible();
    await expect(page.getByText('申請者')).toBeVisible();
    await expect(page.getByText('申請日')).toBeVisible();
    await expect(page.getByText('承認状態')).toBeVisible();
    await expect(page.getByText('現在承認者')).toBeVisible();
  });

  test('承認フロー進捗ステータスが正確に表示される', async ({ page }) => {
    // SCEN-032
    await expect(page.locator('.status-indicators')).toBeVisible();
    await expect(page.locator('.status-badge')).toBeVisible();
    await expect(page.getByText('緊急: 3件')).toBeVisible();
    await expect(page.getByText('保留: 12件')).toBeVisible();
    await expect(page.getByText('正常: 45件')).toBeVisible();
    await page.locator('tbody tr').first().locator('text=詳細').click();
    await expect(page.locator('.status-badge')).toBeVisible();
  });

  test('承認ステップ進捗バーが段階的に更新される', async ({ page }) => {
    // SCEN-033
    await expect(page.locator('.progress')).toBeVisible();
    const progressText = await page.locator('.progress').textContent();
    expect(progressText).toMatch(/\d+%/);
    await page.locator('tbody tr').first().locator('text=詳細').click();
    await expect(page.locator('.progress')).toBeVisible();
  });

  test('現在の承認者が正しく表示される', async ({ page }) => {
    // SCEN-034
    await expect(page.getByText('現在承認者')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
    const approverCell = page.locator('#applications-tbody tr td').nth(4);
    await expect(approverCell).not.toBeEmpty();
  });

  test('遅延アラートが適切にハイライト表示される', async ({ page }) => {
    // SCEN-035
    await expect(page.locator('.urgent')).toBeVisible();
    await expect(page.locator('.pending')).toBeVisible();
    await expect(page.locator('.normal')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('文書種別フィルターで絞り込みできる', async ({ page }) => {
    // SCEN-036
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('承認状況フィルターで絞り込みできる', async ({ page }) => {
    // SCEN-037
    await page.selectOption('[data-testid="approval-status-filter"]', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-filter"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('申請日期間指定で検索できる', async ({ page }) => {
    // SCEN-038
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('申請者名で検索できる', async ({ page }) => {
    // SCEN-039
    await page.fill('[data-testid="applicant-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('承認者名で検索できる', async ({ page }) => {
    // SCEN-040
    await page.fill('[data-testid="approver-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('遅延日数が正確に計算表示される', async ({ page }) => {
    // SCEN-041
    await expect(page.getByText('遅延日数')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
    const delayCell = page.locator('#applications-tbody tr td').nth(7);
    const delayText = await delayCell.textContent();
    expect(delayText).toMatch(/\d+/);
  });

  test('優先度順でソートできる', async ({ page }) => {
    // SCEN-042
    await page.click('text=優先度');
    await expect(page.locator('#applications-tbody')).toBeVisible();
    
    await page.click('text=優先度');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('データなしでも画面が正常表示される', async ({ page }) => {
    // SCEN-043
    await page.selectOption('[data-testid="document-type-filter"]', '契約書');
    await page.selectOption('[data-testid="approval-status-filter"]', '却下');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#applications-tbody')).toBeVisible();
    await expect(page.getByText('該当するデータがありません')).toBeVisible();
  });

  test('大量データでも一覧が正常表示される', async ({ page }) => {
    // SCEN-044
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.selectOption('[data-testid="approval-status-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#applications-tbody')).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.locator('#applications-tbody tr')).toHaveCount({ min: 1 });
  });

  test('申請日の開始日のみ指定で検索できる', async ({ page }) => {
    // SCEN-045
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('申請日の終了日のみ指定で検索できる', async ({ page }) => {
    // SCEN-046
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('申請者名に存在しない名前で検索結果なし', async ({ page }) => {
    // SCEN-047
    await page.fill('[data-testid="applicant-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.getByText('該当するデータがありません')).toBeVisible();
  });

  test('承認者名に存在しない名前で検索結果なし', async ({ page }) => {
    // SCEN-048
    await page.fill('[data-testid="approver-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.getByText('該当するデータがありません')).toBeVisible();
  });

  test('申請者名に特殊文字入力でエラーハンドリング', async ({ page }) => {
    // SCEN-049
    await page.fill('[data-testid="applicant-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('承認者名に特殊文字入力でエラーハンドリング', async ({ page }) => {
    // SCEN-050
    await page.fill('[data-testid="approver-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', "'; DROP TABLE users; --");
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('申請日に無効な日付入力でエラー表示', async ({ page }) => {
    // SCEN-051
    await page.fill('[data-testid="start-date"]', '2024/13/45');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('申請日の開始日が終了日より後でエラー表示', async ({ page }) => {
    // SCEN-052
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('ネットワークエラー時に適切なエラー表示', async ({ page }) => {
    // SCEN-053
    await page.context().setOffline(true);
    await page.reload();
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });
});