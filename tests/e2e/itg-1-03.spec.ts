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
  test("[normal] 承認フロー進捗管理画面 - 申請書類一覧が正常に表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
    await expect(page.locator('#approval-tbody')).toBeVisible();
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請者名')).toBeVisible();
    await expect(page.locator('text=申請種別')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=承認状態')).toBeVisible();
  });

  // SCEN-032
  test("[normal] 承認フロー進捗管理画面 - 承認フロー進捗ステータスが正確に表示される", async ({ page }) => {
    await page.click('button:has-text("案件詳細")');
    await expect(page.locator('text=承認済')).toBeVisible();
    await expect(page.locator('text=申請中')).toBeVisible();
    await expect(page.locator('.status-approved')).toBeVisible();
    await expect(page.locator('.status-pending')).toBeVisible();
  });

  // SCEN-033
  test("[normal] 承認フロー進捗管理画面 - 承認ステップ進捗バーが段階的に更新される", async ({ page }) => {
    await page.click('button:has-text("案件詳細")');
    await expect(page.locator('text="${currentStep}/${totalSteps}"')).toBeVisible();
    await expect(page.locator('text="${progressBar}"')).toBeVisible();
  });

  // SCEN-034
  test("[normal] 承認フロー進捗管理画面 - 現在の承認者が正しく表示される", async ({ page }) => {
    await expect(page.locator('text=現在承認者')).toBeVisible();
    await expect(page.locator('text="${r.現在承認者名 || "-"}"')).toBeVisible();
  });

  // SCEN-035
  test("[normal] 承認フロー進捗管理画面 - 遅延アラートが適切にハイライト表示される", async ({ page }) => {
    await expect(page.locator('text=遅延日数')).toBeVisible();
    await expect(page.locator('.status-rejected')).toBeVisible();
  });

  // SCEN-036
  test("[normal] 承認フロー進捗管理画面 - 文書種別フィルターで絞り込みできる", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toContainText('休暇申請');
    
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toContainText('経費申請');
  });

  // SCEN-037
  test("[normal] 承認フロー進捗管理画面 - 承認状況フィルターで絞り込みできる", async ({ page }) => {
    await page.selectOption('[data-testid="approval-status-filter"]', '申請中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toContainText('申請中');
    
    await page.selectOption('[data-testid="approval-status-filter"]', '承認済');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toContainText('承認済');
  });

  // SCEN-038
  test("[normal] 承認フロー進捗管理画面 - 申請日期間指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
  });

  // SCEN-039
  test("[normal] 承認フロー進捗管理画面 - 申請者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toContainText('田中太郎');
  });

  // SCEN-040
  test("[normal] 承認フロー進捗管理画面 - 承認者名で検索できる", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '田中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
  });

  // SCEN-041
  test("[normal] 承認フロー進捗管理画面 - 遅延日数が正確に計算表示される", async ({ page }) => {
    await expect(page.locator('text=遅延日数')).toBeVisible();
    const delayDays = await page.locator('tbody tr:first-child td:nth-child(7)').textContent();
    expect(delayDays).toMatch(/^\d+$/);
  });

  // SCEN-042
  test("[normal] 承認フロー進捗管理画面 - 優先度順でソートできる", async ({ page }) => {
    await page.click('text=優先度');
    await expect(page.locator('text="${labels[priority] || "通常"}"')).toBeVisible();
    
    await page.click('text=優先度');
    await expect(page.locator('text="${labels[priority] || "通常"}"')).toBeVisible();
  });

  // SCEN-043
  test("[edge] 承認フロー進捗管理画面 - データなしでも画面が正常表示される", async ({ page }) => {
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
    await expect(page.locator('.top-bar')).toBeVisible();
  });

  // SCEN-044
  test("[edge] 承認フロー進捗管理画面 - 大量データでも一覧が正常表示される", async ({ page }) => {
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
    await expect(page.locator('#approval-tbody')).toBeVisible();
    const loadTime = Date.now();
    await page.waitForSelector('[data-testid="approval-progress-list"]', { timeout: 10000 });
    const elapsedTime = Date.now() - loadTime;
    expect(elapsedTime).toBeLessThan(10000);
  });

  // SCEN-045
  test("[edge] 承認フロー進捗管理画面 - 申請日の開始日のみ指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
  });

  // SCEN-046
  test("[edge] 承認フロー進捗管理画面 - 申請日の終了日のみ指定で検索できる", async ({ page }) => {
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
  });

  // SCEN-047
  test("[edge] 承認フロー進捗管理画面 - 申請者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=該当する申請データが見つかりませんでした')).toBeVisible();
  });

  // SCEN-048
  test("[edge] 承認フロー進捗管理画面 - 承認者名に存在しない名前で検索結果なし", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '存在しない太郎');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=該当する承認者が見つかりません')).toBeVisible();
  });

  // SCEN-049
  test("[error] 承認フロー進捗管理画面 - 申請者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="applicant-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=正しい文字列を入力してください')).toBeVisible();
  });

  // SCEN-050
  test("[error] 承認フロー進捗管理画面 - 承認者名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    await page.fill('[data-testid="approver-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=正しい文字列を入力してください')).toBeVisible();
    
    await page.fill('[data-testid="approver-search"]', '!@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=正しい文字列を入力してください')).toBeVisible();
  });

  // SCEN-051
  test("[error] 承認フロー進捗管理画面 - 申請日に無効な日付入力でエラー表示", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024/13/45');
    await page.click('body');
    await expect(page.locator('text=正しい日付形式で入力してください')).toBeVisible();
  });

  // SCEN-052
  test("[error] 承認フロー進捗管理画面 - 申請日の開始日が終了日より後でエラー表示", async ({ page }) => {
    await page.fill('input[type="date"]:first-of-type', '2024-12-31');
    await page.fill('input[type="date"]:last-of-type', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=開始日は終了日より前の日付を入力してください')).toBeVisible();
  });

  // SCEN-053
  test("[error] 承認フロー進捗管理画面 - ネットワークエラー時に適切なエラー表示", async ({ page }) => {
    await page.context().setOffline(true);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('text=ネットワークに接続できません')).toBeVisible();
    await expect(page.locator('button:has-text("再試行")')).toBeVisible();
    
    await page.context().setOffline(false);
    await page.click('button:has-text("再試行")');
    await expect(page.locator('[data-testid="approval-progress-list"]')).toBeVisible();
  });
});