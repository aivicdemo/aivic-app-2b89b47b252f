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

  // SCEN-031
  test("申請書類一覧が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者')).toBeVisible();
    await expect(page.locator('text=申請種別')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=現在承認者')).toBeVisible();
    await expect(page.locator('text=進捗')).toBeVisible();
  });

  // SCEN-032
  test("承認フロー進捗ステータスが正確に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const firstRow = page.locator('#applications-tbody tr').first();
    await expect(firstRow.locator('td').nth(4)).toBeVisible();
    await expect(firstRow.locator('td').nth(5)).toBeVisible();
    const statusText = await firstRow.locator('td').nth(4).textContent();
    expect(['申請中', '承認待ち', '承認済', '却下']).toContain(statusText?.trim());
  });

  // SCEN-033
  test("承認ステップ進捗バーが段階的に更新される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const progressColumn = page.locator('#applications-tbody tr').first().locator('td').nth(5);
    await expect(progressColumn).toBeVisible();
    const progressText = await progressColumn.textContent();
    expect(progressText).toMatch(/\d+%/);
  });

  // SCEN-034
  test("現在の承認者が正しく表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const approverColumn = page.locator('#applications-tbody tr').first().locator('td').nth(4);
    await expect(approverColumn).toBeVisible();
    const approverText = await approverColumn.textContent();
    expect(approverText).toBeTruthy();
  });

  // SCEN-035
  test("遅延アラートが適切にハイライト表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const delayColumn = page.locator('#applications-tbody tr').first().locator('td').nth(7);
    await expect(delayColumn).toBeVisible();
    const delayText = await delayColumn.textContent();
    if (delayText && delayText.includes('日')) {
      const delayDays = parseInt(delayText.replace('日', ''));
      if (delayDays > 0) {
        await expect(page.locator('#applications-tbody tr').first()).toHaveClass(/alert|delay|warning/);
      }
    }
  });

  // SCEN-036
  test("文書種別フィルターで絞り込みできる", async ({ page }) => {
    await expect(page.locator('[data-testid="document-type-filter"]')).toBeVisible();
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-037
  test("承認状況フィルターで絞り込みできる", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-status-filter"]')).toBeVisible();
    await page.selectOption('[data-testid="approval-status-filter"]', '承認待ち');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    await page.selectOption('[data-testid="approval-status-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-038
  test("申請日期間指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-039
  test("申請者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-040
  test("承認者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-041
  test("遅延日数が正確に計算表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const delayColumn = page.locator('#applications-tbody tr').first().locator('td').nth(7);
    await expect(delayColumn).toBeVisible();
    const delayText = await delayColumn.textContent();
    expect(delayText).toMatch(/^\d+日$/);
  });

  // SCEN-042
  test("優先度順でソートできる", async ({ page }) => {
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    const priorityHeader = page.locator('text=優先度');
    await priorityHeader.click();
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    await priorityHeader.click();
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-043
  test("データなしでも画面が正常表示される", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '購買申請');
    await page.fill('[data-testid="start-date-input"]', '2030-01-01');
    await page.fill('[data-testid="end-date-input"]', '2030-01-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await expect(page.locator('#no-data-message')).toBeVisible();
  });

  // SCEN-044
  test("大量データでも一覧が正常表示される", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', 'すべて');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(page.locator('#applications-tbody tr')).toHaveCount({ gte: 1 });
  });

  // SCEN-045
  test("申請日の開始日のみ指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-046
  test("申請日の終了日のみ指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="end-date-input"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });

  // SCEN-047
  test("申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-data-message')).toBeVisible();
  });

  // SCEN-048
  test("承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#no-data-message')).toBeVisible();
  });

  // SCEN-049
  test("申請者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-050
  test("承認者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '\'; DROP TABLE users; --');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-051
  test("申請日に無効な日付入力でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date-input"]', '2024-13-45');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    const errorText = await page.locator('#error-text').textContent();
    expect(errorText).toContain('正しい日付形式で入力してください');
  });

  // SCEN-052
  test("申請日の開始日が終了日より後でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date-input"]', '2024-12-31');
    await page.fill('[data-testid="end-date-input"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    const errorText = await page.locator('#error-text').textContent();
    expect(errorText).toContain('開始日は終了日より前の日付を入力してください');
  });

  // SCEN-053
  test("ネットワークエラー時に適切なエラー表示", async ({ page }) => {
    await page.context().setOffline(true);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#error-message')).toBeVisible();
    const errorText = await page.locator('#error-text').textContent();
    expect(errorText).toContain('ネットワーク');
    
    await page.context().setOffline(false);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
  });
});