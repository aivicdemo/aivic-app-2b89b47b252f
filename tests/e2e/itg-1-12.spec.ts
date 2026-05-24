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
    await page.selectOption('#document-type', '休暇申請');
    await page.fill('#start-date', '2024-01-01');
    await page.fill('#end-date', '2024-01-31');
    await page.fill('#applicant-name', '田中太郎');
    await page.selectOption('#assignee', '田中太郎');
    await page.check('#step-manager');
    await page.check('[name="priority"][value="高"]');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
    await expect(page.locator('#record-list')).toContainText('申請種別');
  });

  // SCEN-199
  test("[normal] 滞留案件検索処理 - 滞留期間のみ指定で検索", async ({ page }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    await page.fill('#start-date', thirtyDaysAgo.toISOString().split('T')[0]);
    await page.fill('#end-date', today.toISOString().split('T')[0]);
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-200
  test("[normal] 滞留案件検索処理 - 文書種別選択で絞込検索", async ({ page }) => {
    await page.selectOption('#document-type', '休暇申請');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-201
  test("[normal] 滞留案件検索処理 - 複数承認ステップ選択で検索", async ({ page }) => {
    await page.check('#step-director');
    await page.check('#step-president');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-202
  test("[normal] 滞留案件検索処理 - 担当者指定で検索", async ({ page }) => {
    await page.selectOption('#assignee', '田中太郎');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-203
  test("[normal] 滞留案件検索処理 - 申請者名部分一致検索", async ({ page }) => {
    await page.fill('#applicant-name', '田中');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-204
  test("[normal] 滞留案件検索処理 - 申請書類番号完全一致検索", async ({ page }) => {
    await page.fill('#document-number', 'DOC-2024-001');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-205
  test("[normal] 滞留案件検索処理 - 滞留日数閾値設定で検索", async ({ page }) => {
    await page.fill('#threshold-value', '7');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-206
  test("[normal] 滞留案件検索処理 - 緊急度レベル指定で検索", async ({ page }) => {
    await page.check('[data-testid="priority-high"]');
    await page.click('#btn-search');
    await expect(page.locator('#results-tbody')).toBeVisible();
    
    await page.click('#btn-clear');
    await page.check('[data-testid="priority-medium"]');
    await page.click('#btn-search');
    await expect(page.locator('#results-tbody')).toBeVisible();
    
    await page.click('#btn-clear');
    await page.check('[data-testid="priority-low"]');
    await page.click('#btn-search');
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-207
  test("[normal] 滞留案件検索処理 - 検索条件クリアで初期状態に戻る", async ({ page }) => {
    await page.selectOption('#document-type', '休暇申請');
    await page.fill('#applicant-name', 'テスト太郎');
    await page.click('#btn-search');
    
    await page.click('#btn-clear');
    
    await expect(page.locator('#document-type')).toHaveValue('');
    await expect(page.locator('#applicant-name')).toHaveValue('');
  });

  // SCEN-208
  test("[normal] 滞留案件検索処理 - 検索結果一覧の滞留日数表示確認", async ({ page }) => {
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
    await expect(page.locator('#record-list')).toContainText('滞留日数');
  });

  // SCEN-209
  test("[error] 滞留案件検索処理 - 終了日が開始日より前でエラー", async ({ page }) => {
    await page.fill('#start-date', '2024-01-15');
    await page.fill('#end-date', '2024-01-10');
    await page.click('#btn-search');
    
    await expect(page.locator('#error-message')).toContainText('終了日は開始日以降の日付を入力してください');
  });

  // SCEN-210
  test("[error] 滞留案件検索処理 - 存在しない担当者IDでエラー", async ({ page }) => {
    await page.selectOption('#assignee', 'DUMMY999');
    await page.click('#btn-search');
    
    await expect(page.locator('#error-message')).toContainText('指定された担当者IDが存在しません');
  });

  // SCEN-211
  test("[error] 滞留案件検索処理 - 存在しない申請書類番号で0件", async ({ page }) => {
    await page.fill('#document-number', 'TEST-99999999');
    await page.click('#btn-search');
    
    await expect(page.locator('#result-count')).toContainText('0件');
  });

  // SCEN-212
  test("[error] 滞留案件検索処理 - 不正な文字列入力でバリデーション", async ({ page }) => {
    await page.fill('#applicant-name', "'; DROP TABLE applications; --");
    await page.click('#btn-search');
    await expect(page.locator('#error-message')).toBeVisible();
    
    await page.fill('#applicant-name', '<script>alert("test")</script>');
    await page.click('#btn-search');
    await expect(page.locator('#error-message')).toBeVisible();
    
    await page.fill('#applicant-name', 'a'.repeat(1001));
    await page.click('#btn-search');
    await expect(page.locator('#error-message')).toBeVisible();
  });

  // SCEN-213
  test("[edge] 滞留案件検索処理 - 開始日のみ指定で検索", async ({ page }) => {
    await page.fill('#start-date', '2024-01-01');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-214
  test("[edge] 滞留案件検索処理 - 終了日のみ指定で検索", async ({ page }) => {
    await page.fill('#end-date', '2024-03-31');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-215
  test("[edge] 滞留案件検索処理 - 滞留日数閾値最小値で検索", async ({ page }) => {
    await page.fill('#threshold-value', '1');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-216
  test("[edge] 滞留案件検索処理 - 滞留日数閾値最大値で検索", async ({ page }) => {
    await page.fill('#threshold-value', '999');
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-217
  test("[edge] 滞留案件検索処理 - 申請者名最大文字数入力", async ({ page }) => {
    await page.fill('#applicant-name', 'a'.repeat(100));
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-218
  test("[edge] 滞留案件検索処理 - 全条件未指定で全件検索", async ({ page }) => {
    await page.click('#btn-search');
    
    await expect(page.locator('#results-tbody')).toBeVisible();
  });

  // SCEN-219
  test("[edge] 滞留案件検索処理 - 検索結果0件の表示確認", async ({ page }) => {
    await page.fill('#applicant-name', '存在しない申請者');
    await page.fill('#start-date', '2020-01-01');
    await page.fill('#end-date', '2020-01-02');
    await page.click('#btn-search');
    
    await expect(page.locator('#record-list')).toContainText('該当する滞留案件はありません');
  });
});