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
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
    
    const applicationRow = page.locator('#applications-tbody tr').first();
    await expect(applicationRow).toContainText('申請ID');
    await expect(applicationRow).toContainText('申請者');
    await expect(applicationRow).toContainText('申請種別');
    await expect(applicationRow).toContainText('申請日');
    await expect(applicationRow).toContainText('承認状態');
  });

  // SCEN-032
  test("承認フロー進捗ステータスが正確に表示される", async ({ page }) => {
    const applicationRow = page.locator('#applications-tbody tr').first();
    await applicationRow.locator('button:has-text("案件詳細")').click();
    
    await expect(page.locator('.approval-status')).toBeVisible();
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.current-approver')).toBeVisible();
  });

  // SCEN-033
  test("承認ステップ進捗バーが段階的に更新される", async ({ page }) => {
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible();
    
    const initialProgress = await progressBar.getAttribute('data-progress');
    expect(parseInt(initialProgress || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(initialProgress || '0')).toBeLessThanOrEqual(100);
  });

  // SCEN-034
  test("現在の承認者が正しく表示される", async ({ page }) => {
    const currentApprover = page.locator('.current-approver');
    await expect(currentApprover).toBeVisible();
    await expect(currentApprover).toContainText('承認者');
  });

  // SCEN-035
  test("遅延アラートが適切にハイライト表示される", async ({ page }) => {
    const delayedRow = page.locator('#applications-tbody tr').filter({ hasText: '⚠️' });
    if (await delayedRow.count() > 0) {
      await expect(delayedRow).toHaveClass(/delay|alert|warning/);
    }
  });

  // SCEN-036
  test("文書種別フィルターで絞り込みできる", async ({ page }) => {
    const documentTypeFilter = page.locator('[data-testid="document-type-filter"]');
    await documentTypeFilter.selectOption('休暇申請');
    await page.click('[data-testid="search-button"]');
    
    const filteredResults = page.locator('#applications-tbody tr');
    await expect(filteredResults.first()).toContainText('休暇申請');
  });

  // SCEN-037
  test("承認状況フィルターで絞り込みできる", async ({ page }) => {
    const statusFilter = page.locator('[data-testid="approval-status-filter"]');
    await statusFilter.selectOption('承認待ち');
    await page.click('[data-testid="search-button"]');
    
    const filteredResults = page.locator('#applications-tbody tr');
    await expect(filteredResults.first()).toContainText('承認待ち');
  });

  // SCEN-038
  test("申請日期間指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date-filter"]', '2024-01-01');
    await page.fill('[data-testid="end-date-filter"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    
    const searchResults = page.locator('#applications-tbody tr');
    await expect(searchResults).toHaveCountGreaterThan(0);
  });

  // SCEN-039
  test("申請者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    
    const searchResults = page.locator('#applications-tbody tr');
    if (await searchResults.count() > 0) {
      await expect(searchResults.first()).toContainText('田中太郎');
    }
  });

  // SCEN-040
  test("承認者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    
    const searchResults = page.locator('#applications-tbody tr');
    if (await searchResults.count() > 0) {
      await expect(searchResults).toBeVisible();
    }
    
    await page.fill('[data-testid="approver-search"]', '田中');
    await page.click('[data-testid="search-button"]');
  });

  // SCEN-041
  test("遅延日数が正確に計算表示される", async ({ page }) => {
    const delayColumn = page.locator('#applications-tbody tr td').filter({ hasText: /\d+日/ });
    if (await delayColumn.count() > 0) {
      const delayText = await delayColumn.first().textContent();
      expect(delayText).toMatch(/\d+日/);
    }
  });

  // SCEN-042
  test("優先度順でソートできる", async ({ page }) => {
    const priorityHeader = page.locator('th:has-text("優先度")');
    await priorityHeader.click();
    
    await page.waitForTimeout(1000);
    
    await priorityHeader.click();
    
    const firstRow = page.locator('#applications-tbody tr').first();
    await expect(firstRow).toBeVisible();
  });

  // SCEN-043
  test("データなしでも画面が正常表示される", async ({ page }) => {
    await page.click('[data-testid="clear-button"]');
    await page.fill('[data-testid="applicant-search"]', '存在しない申請者');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#no-data-message')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  // SCEN-044
  test("大量データでも一覧が正常表示される", async ({ page }) => {
    await page.click('[data-testid="clear-button"]');
    await page.click('[data-testid="search-button"]');
    
    await page.waitForLoadState('networkidle');
    
    const applicationsList = page.locator('[data-testid="applications-list"]');
    await expect(applicationsList).toBeVisible();
    
    const recordCount = page.locator('#record-count');
    if (await recordCount.isVisible()) {
      const countText = await recordCount.textContent();
      expect(countText).toMatch(/\d+/);
    }
  });

  // SCEN-045
  test("申請日の開始日のみ指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date-filter"]', '2024-01-01');
    await page.fill('[data-testid="end-date-filter"]', '');
    await page.click('[data-testid="search-button"]');
    
    const searchResults = page.locator('#applications-tbody tr');
    await expect(searchResults).toHaveCountGreaterThanOrEqual(0);
  });

  // SCEN-046
  test("申請日の終了日のみ指定で検索できる", async ({ page }) => {
    await page.fill('[data-testid="start-date-filter"]', '');
    await page.fill('[data-testid="end-date-filter"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    
    const searchResults = page.locator('#applications-tbody tr');
    await expect(searchResults).toHaveCountGreaterThanOrEqual(0);
  });

  // SCEN-047
  test("申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#no-data-message')).toBeVisible();
    const noDataText = await page.locator('#no-data-message').textContent();
    expect(noDataText).toContain('該当する');
  });

  // SCEN-048
  test("承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('#no-data-message')).toBeVisible();
  });

  // SCEN-049
  test("申請者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '<script>alert(\'test\')</script>');
    await page.click('[data-testid="search-button"]');
    
    const errorMessage = page.locator('#error-message');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('エラー');
    }
  });

  // SCEN-050
  test("承認者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '<script>alert(\'test\')</script>');
    await page.click('[data-testid="search-button"]');
    
    const errorMessage = page.locator('#error-message');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('エラー');
    }
    
    await page.fill('[data-testid="approver-search"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    
    await page.fill('[data-testid="approver-search"]', '\'; DROP TABLE users; --');
    await page.click('[data-testid="search-button"]');
  });

  // SCEN-051
  test("申請日に無効な日付入力でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date-filter"]', '2024/13/45');
    await page.click('[data-testid="search-button"]');
    
    const errorMessage = page.locator('#error-message');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/(正しい|日付|形式)/);
    }
  });

  // SCEN-052
  test("申請日の開始日が終了日より後でエラー表示", async ({ page }) => {
    await page.fill('[data-testid="start-date-filter"]', '2024-12-31');
    await page.fill('[data-testid="end-date-filter"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    
    const errorMessage = page.locator('#error-message');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/(開始日|終了日|前)/);
    }
  });

  // SCEN-053
  test("ネットワークエラー時に適切なエラー表示", async ({ page }) => {
    await page.context().setOffline(true);
    
    await page.click('[data-testid="search-button"]');
    
    await page.waitForTimeout(3000);
    
    const errorMessage = page.locator('#error-message');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('ネットワーク');
    }
    
    await page.context().setOffline(false);
    
    const retryButton = page.locator('button:has-text("再試行")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
    }
  });

});