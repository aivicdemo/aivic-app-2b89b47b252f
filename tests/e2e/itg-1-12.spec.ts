import { test, expect } from '@playwright/test';

test.describe("滞留案件検索処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422380305.html");
  });

  // SCEN-198
  test("全条件指定で滞留案件を正常検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="applicant-name"]', '田中太郎');
    await page.selectOption('[data-testid="assignee-select"]', '佐藤花子');
    await page.selectOption('#document-type', '休暇申請');
    await page.check('[name="priority"][value="medium"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('text=休暇申請')).toBeVisible();
  });

  // SCEN-199
  test("滞留期間のみ指定で検索", async ({ page }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();

    await page.fill('[data-testid="start-date"]', thirtyDaysAgo.toISOString().split('T')[0]);
    await page.fill('[data-testid="end-date"]', today.toISOString().split('T')[0]);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-200
  test("文書種別選択で絞込検索", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('text=休暇申請')).toBeVisible();
  });

  // SCEN-201
  test("複数承認ステップ選択で検索", async ({ page }) => {
    await page.check('[data-testid="step-manager"]');
    await page.check('[data-testid="step-director"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-202
  test("担当者指定で検索", async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', '田中太郎');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-203
  test("申請者名部分一致検索", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('text=田中')).toBeVisible();
  });

  // SCEN-204
  test("申請書類番号完全一致検索", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-205
  test("滞留日数閾値設定で検索", async ({ page }) => {
    await page.fill('#threshold-value', '7');
    await page.fill('[data-testid="threshold-slider"]', '7');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-206
  test("緊急度レベル指定で検索", async ({ page }) => {
    await page.check('[data-testid="priority-high"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    await page.check('[data-testid="priority-medium"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    await page.check('[data-testid="priority-low"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-207
  test("検索条件クリアで初期状態に戻る", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="applicant-name"]', 'テスト太郎');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');

    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-name"]')).toHaveValue('');
  });

  // SCEN-208
  test("検索結果一覧の滞留日数表示確認", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('text=滞留日数')).toBeVisible();
  });

  // SCEN-209
  test("終了日が開始日より前でエラー", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-10');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('text=終了日は開始日以降の日付を入力してください')).toBeVisible();
  });

  // SCEN-210
  test("存在しない担当者IDでエラー", async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', 'DUMMY999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('text=指定された担当者IDが存在しません')).toBeVisible();
  });

  // SCEN-211
  test("存在しない申請書類番号で0件", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'TEST-99999999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=該当する滞留案件はありません')).toBeVisible();
  });

  // SCEN-212
  test("不正な文字列入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', "'; DROP TABLE applications; --");
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('#error-message')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    await page.fill('[data-testid="applicant-name"]', "<script>alert('test')</script>");
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('#error-message')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    const longString = 'a'.repeat(1001);
    await page.fill('[data-testid="applicant-name"]', longString);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-213
  test("開始日のみ指定で検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-214
  test("終了日のみ指定で検索", async ({ page }) => {
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-215
  test("滞留日数閾値最小値で検索", async ({ page }) => {
    await page.fill('#threshold-value', '1');
    await page.fill('[data-testid="threshold-slider"]', '1');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-216
  test("滞留日数閾値最大値で検索", async ({ page }) => {
    await page.fill('#threshold-value', '999');
    await page.fill('[data-testid="threshold-slider"]', '999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-217
  test("申請者名最大文字数入力", async ({ page }) => {
    const maxLengthName = 'テスト申請者名'.repeat(10);
    await page.fill('[data-testid="applicant-name"]', maxLengthName);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-218
  test("全条件未指定で全件検索", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-219
  test("検索結果0件の表示確認", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '存在しない申請者');
    await page.fill('[data-testid="start-date"]', '1999-01-01');
    await page.fill('[data-testid="end-date"]', '1999-01-31');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=該当する滞留案件はありません')).toBeVisible();
  });
});