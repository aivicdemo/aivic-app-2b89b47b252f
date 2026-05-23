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
  test("[normal] 滞留案件検索処理 - 全条件指定で滞留案件を正常検索", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="applicant-name"]', '田中太郎');
    await page.selectOption('[data-testid="assignee-select"]', '佐藤花子');
    await page.click('[data-testid="priority-high"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="stagnant-cases-table"] tbody tr')).toHaveCount({ min: 1 });
  });

  // SCEN-199
  test("[normal] 滞留案件検索処理 - 滞留期間のみ指定で検索", async ({ page }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    await page.fill('[data-testid="start-date"]', startDate);
    await page.fill('[data-testid="end-date"]', endDate);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-200
  test("[normal] 滞留案件検索処理 - 文書種別選択で絞込検索", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-201
  test("[normal] 滞留案件検索処理 - 複数承認ステップ選択で検索", async ({ page }) => {
    await page.click('[data-testid="step-1"]');
    await page.click('[data-testid="step-2"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-202
  test("[normal] 滞留案件検索処理 - 担当者指定で検索", async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', '田中太郎');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-203
  test("[normal] 滞留案件検索処理 - 申請者名部分一致検索", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-204
  test("[normal] 滞留案件検索処理 - 申請書類番号完全一致検索", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'DOC-2024-001');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-205
  test("[normal] 滞留案件検索処理 - 滞留日数閾値設定で検索", async ({ page }) => {
    await page.fill('[id="threshold-value"]', '7');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-206
  test("[normal] 滞留案件検索処理 - 緊急度レベル指定で検索", async ({ page }) => {
    await page.click('[data-testid="priority-high"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    await page.click('[data-testid="priority-normal"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');
    await page.click('[data-testid="priority-low"]');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-207
  test("[normal] 滞留案件検索処理 - 検索条件クリアで初期状態に戻る", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="applicant-name"]', 'テスト太郎');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();

    await page.click('[data-testid="clear-button"]');

    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-name"]')).toHaveValue('');
  });

  // SCEN-208
  test("[normal] 滞留案件検索処理 - 検索結果一覧の滞留日数表示確認", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="stagnant-cases-table"] thead')).toContainText('滞留日数');
  });

  // SCEN-209
  test("[error] 滞留案件検索処理 - 終了日が開始日より前でエラー", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-10');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=終了日は開始日以降の日付を入力してください')).toBeVisible();
  });

  // SCEN-210
  test("[error] 滞留案件検索処理 - 存在しない担当者IDでエラー", async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', 'DUMMY999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=指定された担当者IDが存在しません')).toBeVisible();
  });

  // SCEN-211
  test("[error] 滞留案件検索処理 - 存在しない申請書類番号で0件", async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'TEST-99999999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
    await expect(page.locator('text=該当する滞留案件はありません')).toBeVisible();
  });

  // SCEN-212
  test("[error] 滞留案件検索処理 - 不正な文字列入力でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', "'; DROP TABLE applications; --");
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=不正な文字が含まれています')).toBeVisible();

    await page.fill('[data-testid="applicant-name"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=不正な文字が含まれています')).toBeVisible();

    const longString = 'a'.repeat(1001);
    await page.fill('[data-testid="applicant-name"]', longString);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('text=文字数制限を超えています')).toBeVisible();
  });

  // SCEN-213
  test("[edge] 滞留案件検索処理 - 開始日のみ指定で検索", async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-214
  test("[edge] 滞留案件検索処理 - 終了日のみ指定で検索", async ({ page }) => {
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-215
  test("[edge] 滞留案件検索処理 - 滞留日数閾値最小値で検索", async ({ page }) => {
    await page.fill('[id="threshold-value"]', '1');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-216
  test("[edge] 滞留案件検索処理 - 滞留日数閾値最大値で検索", async ({ page }) => {
    await page.fill('[id="threshold-value"]', '999');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-217
  test("[edge] 滞留案件検索処理 - 申請者名最大文字数入力", async ({ page }) => {
    const maxLengthName = 'あ'.repeat(100);
    await page.fill('[data-testid="applicant-name"]', maxLengthName);
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-218
  test("[edge] 滞留案件検索処理 - 全条件未指定で全件検索", async ({ page }) => {
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
  });

  // SCEN-219
  test("[edge] 滞留案件検索処理 - 検索結果0件の表示確認", async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '存在しない申請者名123456');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="stagnant-cases-table"]')).toBeVisible();
    await expect(page.locator('text=該当する滞留案件はありません')).toBeVisible();
  });
});