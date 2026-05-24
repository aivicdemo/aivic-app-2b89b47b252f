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

  // SCEN-198: [normal] 滞留案件検索処理 - 全条件指定で滞留案件を正常検索
  test('SCEN-198: 全条件指定で滞留案件を正常検索', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="applicant-name"]', 'テスト太郎');
    await page.selectOption('[data-testid="assignee-select"]', '田中太郎');
    await page.selectOption('select', '田中太郎');
    await page.click('input[name="priority"][value="high"]');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody tr')).toHaveCount(1);
    await expect(page.locator('#results-tbody')).toContainText('休暇申請');
    await expect(page.locator('#results-tbody')).toContainText('テスト太郎');
  });

  // SCEN-199: [normal] 滞留案件検索処理 - 滞留期間のみ指定で検索
  test('SCEN-199: 滞留期間のみ指定で検索', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2023-12-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody tr')).toHaveCount(1);
  });

  // SCEN-200: [normal] 滞留案件検索処理 - 文書種別選択で絞込検索
  test('SCEN-200: 文書種別選択で絞込検索', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('休暇申請');
  });

  // SCEN-201: [normal] 滞留案件検索処理 - 複数承認ステップ選択で検索
  test('SCEN-201: 複数承認ステップ選択で検索', async ({ page }) => {
    await page.check('[data-testid="step-manager"]');
    await page.check('[data-testid="step-director"]');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('1段階目');
  });

  // SCEN-202: [normal] 滞留案件検索処理 - 担当者指定で検索
  test('SCEN-202: 担当者指定で検索', async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', '田中太郎');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('田中部長');
  });

  // SCEN-203: [normal] 滞留案件検索処理 - 申請者名部分一致検索
  test('SCEN-203: 申請者名部分一致検索', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '田中');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('テスト太郎');
  });

  // SCEN-204: [normal] 滞留案件検索処理 - 申請書類番号完全一致検索
  test('SCEN-204: 申請書類番号完全一致検索', async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-205: [normal] 滞留案件検索処理 - 滞留日数閾値設定で検索
  test('SCEN-205: 滞留日数閾値設定で検索', async ({ page }) => {
    await page.fill('[data-testid="days-threshold"]', '7');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('7日');
  });

  // SCEN-206: [normal] 滞留案件検索処理 - 緊急度レベル指定で検索
  test('SCEN-206: 緊急度レベル指定で検索', async ({ page }) => {
    await page.click('[data-testid="priority-high"]');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.click('[data-testid="clear-button"]');
    await page.click('[data-testid="priority-medium"]');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.click('[data-testid="clear-button"]');
    await page.click('[data-testid="priority-low"]');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  // SCEN-207: [normal] 滞留案件検索処理 - 検索条件クリアで初期状態に戻る
  test('SCEN-207: 検索条件クリアで初期状態に戻る', async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '休暇申請');
    await page.fill('[data-testid="days-threshold"]', '30');
    await page.fill('[data-testid="applicant-name"]', 'テスト太郎');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    await page.click('[data-testid="clear-button"]');
    
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="days-threshold"]')).toHaveValue('');
    await expect(page.locator('[data-testid="applicant-name"]')).toHaveValue('');
  });

  // SCEN-208: [normal] 滞留案件検索処理 - 検索結果一覧の滞留日数表示確認
  test('SCEN-208: 検索結果一覧の滞留日数表示確認', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('7日');
    await expect(page.locator('#results-tbody tr')).toHaveCount(1);
  });

  // SCEN-209: [error] 滞留案件検索処理 - 終了日が開始日より前でエラー
  test('SCEN-209: 終了日が開始日より前でエラー', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-10');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('終了日は開始日以降の日付を入力してください');
  });

  // SCEN-210: [error] 滞留案件検索処理 - 存在しない担当者IDでエラー
  test('SCEN-210: 存在しない担当者IDでエラー', async ({ page }) => {
    await page.selectOption('[data-testid="assignee-select"]', '存在しない担当者');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された担当者IDが存在しません');
  });

  // SCEN-211: [error] 滞留案件検索処理 - 存在しない申請書類番号で0件
  test('SCEN-211: 存在しない申請書類番号で0件', async ({ page }) => {
    await page.fill('[data-testid="document-number"]', 'TEST-99999999');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toContainText('該当する滞留案件はありません');
  });

  // SCEN-212: [error] 滞留案件検索処理 - 不正な文字列入力でバリデーション
  test('SCEN-212: 不正な文字列入力でバリデーション', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', "'; DROP TABLE applications; --");
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.fill('[data-testid="applicant-name"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    await page.fill('[data-testid="applicant-name"]', 'A'.repeat(1001));
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  // SCEN-213: [edge] 滞留案件検索処理 - 開始日のみ指定で検索
  test('SCEN-213: 開始日のみ指定で検索', async ({ page }) => {
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-214: [edge] 滞留案件検索処理 - 終了日のみ指定で検索
  test('SCEN-214: 終了日のみ指定で検索', async ({ page }) => {
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-215: [edge] 滞留案件検索処理 - 滞留日数閾値最小値で検索
  test('SCEN-215: 滞留日数閾値最小値で検索', async ({ page }) => {
    await page.fill('[data-testid="days-threshold"]', '1');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    await expect(page.locator('#results-tbody')).toContainText('7日');
  });

  // SCEN-216: [edge] 滞留案件検索処理 - 滞留日数閾値最大値で検索
  test('SCEN-216: 滞留日数閾値最大値で検索', async ({ page }) => {
    await page.fill('[data-testid="days-threshold"]', '999');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-217: [edge] 滞留案件検索処理 - 申請者名最大文字数入力
  test('SCEN-217: 申請者名最大文字数入力', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', 'A'.repeat(100));
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-218: [edge] 滞留案件検索処理 - 全条件未指定で全件検索
  test('SCEN-218: 全条件未指定で全件検索', async ({ page }) => {
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    await expect(page.locator('#results-tbody tr')).toHaveCount(1);
  });

  // SCEN-219: [edge] 滞留案件検索処理 - 検索結果0件の表示確認
  test('SCEN-219: 検索結果0件の表示確認', async ({ page }) => {
    await page.fill('[data-testid="applicant-name"]', '存在しない申請者');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2020-01-31');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="record-list"]')).toContainText('該当する滞留案件はありません');
    await expect(page.locator('#result-count')).toContainText('0');
  });

});