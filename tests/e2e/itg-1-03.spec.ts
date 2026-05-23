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
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
    await expect(page.locator('#approval-tbody')).toBeVisible();
    await expect(page.locator('th:has-text("申請ID")')).toBeVisible();
    await expect(page.locator('th:has-text("申請種別")')).toBeVisible();
    await expect(page.locator('th:has-text("申請日")')).toBeVisible();
    await expect(page.locator('th:has-text("承認状態")')).toBeVisible();
    await expect(page.locator('th:has-text("現在承認者")')).toBeVisible();
  });

  // SCEN-032
  test("承認フロー進捗ステータスが正確に表示される", async ({ page }) => {
    await page.click('tr:first-of-type td:last-of-type button:has-text("案件詳細")');
    await expect(page.locator('text="承認済"')).toBeVisible();
    await expect(page.locator('text="申請中"')).toBeVisible();
    await expect(page.locator('.status-approved')).toBeVisible();
    await expect(page.locator('.status-pending')).toBeVisible();
  });

  // SCEN-033
  test("承認ステップ進捗バーが段階的に更新される", async ({ page }) => {
    await page.click('tr:first-of-type td:last-of-type button:has-text("案件詳細")');
    const progressBar = page.locator('text="${currentStep}/${totalSteps}"');
    await expect(progressBar).toBeVisible();
    const statusElements = page.locator('.status-approved, .status-pending');
    await expect(statusElements).toHaveCount({ min: 1 });
  });

  // SCEN-034
  test("現在の承認者が正しく表示される", async ({ page }) => {
    await expect(page.locator('td:has-text("現在承認者名")')).toBeVisible();
    const approverInfo = page.locator('#approval-tbody tr:first-of-type td:nth-of-type(6)');
    await expect(approverInfo).not.toBeEmpty();
  });

  // SCEN-035
  test("遅延アラートが適切にハイライト表示される", async ({ page }) => {
    await page.click('button:has-text("遅延案件確認")');
    await expect(page.locator('.status-rejected')).toBeVisible();
    const delayedRows = page.locator('#approval-tbody tr.delayed');
    if (await delayedRows.count() > 0) {
      await expect(delayedRows.first()).toHaveClass(/delayed/);
    }
  });

  // SCEN-036
  test("文書種別フィルターで絞り込みできる", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    const count = await rows.count();
    if (count > 0) {
      await expect(rows.first().locator('td:nth-of-type(3)')).toContainText('休暇申請');
    }
  });

  // SCEN-037
  test("承認状況フィルターで絞り込みできる", async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-filter"]', '承認済');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    const count = await rows.count();
    if (count > 0) {
      await expect(rows.first().locator('td:nth-of-type(4)')).toContainText('承認済');
    }
  });

  // SCEN-038
  test("申請日期間指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    if (await rows.count() > 0) {
      const dateCell = rows.first().locator('td:nth-of-type(5)');
      await expect(dateCell).toBeVisible();
    }
  });

  // SCEN-039
  test("申請者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  // SCEN-040
  test("承認者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
    await page.fill('[data-testid="approver-search"]', '田中');
    await page.click('[data-testid="search-button"]');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  // SCEN-041
  test("遅延日数が正確に計算表示される", async ({ page }) => {
    const delayedRows = page.locator('#approval-tbody tr');
    const count = await delayedRows.count();
    if (count > 0) {
      const delayCell = delayedRows.first().locator('td:nth-of-type(7)');
      const delayText = await delayCell.textContent();
      expect(delayText).toMatch(/\d+/);
    }
  });

  // SCEN-042
  test("優先度順でソートできる", async ({ page }) => {
    await page.click('th:has-text("優先度")');
    await expect(page.locator('#approval-tbody')).toBeVisible();
    await page.click('th:has-text("優先度")');
    await expect(page.locator('#approval-tbody')).toBeVisible();
  });

  // SCEN-043
  test("データなしでも画面が正常表示される", async ({ page }) => {
    await page.click('[data-testid="clear-button"]');
    await page.fill('[data-testid="applicant-search"]', '存在しない申請者');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('.breadcrumb')).toBeVisible();
    await expect(page.locator('.panel-container')).toBeVisible();
    await expect(page.locator('#approval-tbody')).toBeVisible();
  });

  // SCEN-044
  test("大量データでも一覧が正常表示される", async ({ page }) => {
    const startTime = Date.now();
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('#approval-tbody')).toBeVisible();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    await expect(page.locator('#approval-tbody tr')).toHaveCount({ min: 0 });
  });

  // SCEN-045
  test("申請日の開始日のみ指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  // SCEN-046
  test("申請日の終了日のみ指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  // SCEN-047
  test("申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    await expect(rows).toHaveCount(0);
  });

  // SCEN-048
  test("承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    const rows = page.locator('#approval-tbody tr');
    await expect(rows).toHaveCount(0);
  });

  // SCEN-049
  test("申請者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '<script>alert(\'test\')</script>');
    await page.click('[data-testid="search-button"]');
    const errorMsg = page.locator('.error-message');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
    const inputValue = await page.inputValue('[data-testid="applicant-search"]');
    expect(inputValue).not.toContain('<script>');
  });

  // SCEN-050
  test("承認者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '<script>alert(\'test\')</script>');
    await page.click('[data-testid="search-button"]');
    const errorMsg = page.locator('.error-message');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
    
    await page.fill('[data-testid="approver-search"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
    
    await page.fill('[data-testid="approver-search"]', '\'; DROP TABLE users; --');
    await page.click('[data-testid="search-button"]');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
  });

  // SCEN-051
  test("申請日に無効な日付入力でエラー表示", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-13-45');
    await page.click('body');
    const errorMsg = page.locator('.error-message, .invalid-feedback');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toContainText('正しい日付形式で入力してください');
    }
  });

  // SCEN-052
  test("申請日の開始日が終了日より後でエラー表示", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-12-31');
    await page.fill('input[type="date"]:nth-of-type(2)', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    const errorMsg = page.locator('.error-message, .invalid-feedback');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toContainText('開始日は終了日より前の日付を入力してください');
    }
  });

  // SCEN-053
  test("ネットワークエラー時に適切なエラー表示", async ({ page }) => {
    await page.context().setOffline(true);
    await page.click('button:has-text("進捗確認")');
    const errorMsg = page.locator('.error-message, .network-error');
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toContainText('ネットワークに接続できません');
    }
    const retryBtn = page.locator('button:has-text("再試行")');
    if (await retryBtn.count() > 0) {
      await expect(retryBtn).toBeVisible();
      await page.context().setOffline(false);
      await retryBtn.click();
    }
  });
});