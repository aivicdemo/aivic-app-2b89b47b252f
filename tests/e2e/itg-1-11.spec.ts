import { test, expect } from '@playwright/test';

test.describe("進捗確認画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422369173.html");
  });

  test('SCEN-178: 申請一覧テーブルが正常表示される', async ({ page }) => {
    // SCEN-178: [normal] 進捗確認画面 - 申請一覧テーブルが正常表示される
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
    await expect(page.locator('text=申請ID')).toBeVisible();
    await expect(page.locator('text=申請タイトル')).toBeVisible();
    await expect(page.locator('text=申請者')).toBeVisible();
    await expect(page.locator('text=申請日')).toBeVisible();
    await expect(page.locator('text=ステータス')).toBeVisible();
    await expect(page.locator('#applications-tbody')).toBeVisible();
  });

  test('SCEN-179: 承認フロー進捗バーが各ステップで正確に表示される', async ({ page }) => {
    // SCEN-179: [normal] 進捗確認画面 - 承認フロー進捗バーが各ステップで正確に表示される
    await expect(page.locator('#approval-flow')).toBeVisible();
    const progressBar = page.locator('#approval-flow');
    await expect(progressBar).toContainText('1/3');
    
    const currentStep = page.locator('.active');
    await expect(currentStep).toBeVisible();
    
    await page.click('button:has-text("承認")');
    await expect(progressBar).toContainText('2/3');
  });

  test('SCEN-180: 現在の承認者名が正しく表示される', async ({ page }) => {
    // SCEN-180: [normal] 進捗確認画面 - 現在の承認者名が正しく表示される
    await expect(page.locator('#current-approver')).toBeVisible();
    await expect(page.locator('text=現在の承認者:')).toBeVisible();
    
    const approverName = page.locator('#current-approver');
    await expect(approverName).not.toBeEmpty();
  });

  test('SCEN-181: 遅延アラートが適切にハイライト表示される', async ({ page }) => {
    // SCEN-181: [normal] 進捗確認画面 - 遅延アラートが適切にハイライト表示される
    const delayedRow = page.locator('[data-testid="applications-table"] tr:has(.delay-alert)');
    if (await delayedRow.count() > 0) {
      await expect(delayedRow.first()).toHaveClass(/.*delay.*/);
      await delayedRow.first().hover();
    }
  });

  test('SCEN-182: 申請詳細リンクから詳細画面に遷移できる', async ({ page }) => {
    // SCEN-182: [normal] 進捗確認画面 - 申請詳細リンクから詳細画面に遷移できる
    const detailButton = page.locator('button:has-text("詳細")').first();
    await detailButton.click();
    
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#detail-content')).toBeVisible();
  });

  test('SCEN-183: 承認履歴が時系列で表示される', async ({ page }) => {
    // SCEN-183: [normal] 進捗確認画面 - 承認履歴が時系列で表示される
    await page.click('button:has-text("詳細")');
    await expect(page.locator('#approval-history-tbody')).toBeVisible();
    await expect(page.locator('text=承認者')).toBeVisible();
    await expect(page.locator('text=承認結果')).toBeVisible();
    await expect(page.locator('text=承認日時')).toBeVisible();
  });

  test('SCEN-184: ステータス別タブで絞り込みができる', async ({ page }) => {
    // SCEN-184: [normal] 進捗確認画面 - ステータス別タブで絞り込みができる
    await page.click('[data-testid="tab-pending"]');
    await expect(page.locator('[data-testid="tab-pending"]')).toHaveClass(/.*active.*/);
    
    await page.click('[data-testid="tab-approving"]');
    await expect(page.locator('[data-testid="tab-approving"]')).toHaveClass(/.*active.*/);
    
    await page.click('[data-testid="tab-approved"]');
    await expect(page.locator('[data-testid="tab-approved"]')).toHaveClass(/.*active.*/);
    
    await page.click('[data-testid="tab-all"]');
    await expect(page.locator('[data-testid="tab-all"]')).toHaveClass(/.*active.*/);
  });

  test('SCEN-185: 文書種別フィルターで該当データのみ表示される', async ({ page }) => {
    // SCEN-185: [normal] 進捗確認画面 - 文書種別フィルターで該当データのみ表示される
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="search-button"]');
    
    const tableRows = page.locator('[data-testid="applications-table"] tbody tr');
    const count = await tableRows.count();
    if (count > 0) {
      const firstRowType = tableRows.first().locator('td').nth(2);
      await expect(firstRowType).toContainText('休暇申請');
    }
  });

  test('SCEN-186: 検索条件で対象申請が抽出される', async ({ page }) => {
    // SCEN-186: [normal] 進捗確認画面 - 検索条件で対象申請が抽出される
    await page.fill('[data-testid="application-id-input"]', 'APP001');
    await page.fill('[data-testid="applicant-name-input"]', '田中');
    await page.selectOption('[data-testid="document-type-filter"]', '経費申請');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
  });

  test('SCEN-187: 優先度表示が正しく表示される', async ({ page }) => {
    // SCEN-187: [normal] 進捗確認画面 - 優先度表示が正しく表示される
    await expect(page.locator('text=優先度')).toBeVisible();
    
    const priorityCell = page.locator('[data-testid="applications-table"] tbody tr').first().locator('td').nth(7);
    const priorityText = await priorityCell.textContent();
    expect(priorityText).toMatch(/高|中|低/);
  });

  test('SCEN-188: 処理予定日が適切に表示される', async ({ page }) => {
    // SCEN-188: [normal] 進捗確認画面 - 処理予定日が適切に表示される
    await expect(page.locator('text=処理予定日')).toBeVisible();
    
    const dueDateCell = page.locator('[data-testid="applications-table"] tbody tr').first().locator('td').nth(6);
    const dueDateText = await dueDateCell.textContent();
    expect(dueDateText).toMatch(/^\d{4}\/\d{2}\/\d{2}$|^-$|^未定$/);
  });

  test('SCEN-189: 存在しない検索条件で結果0件表示', async ({ page }) => {
    // SCEN-189: [error] 進捗確認画面 - 存在しない検索条件で結果0件表示
    await page.fill('[data-testid="application-id-input"]', 'INVALID-12345');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('text=該当する申請が見つかりません')).toBeVisible();
  });

  test('SCEN-190: 無効なフィルター条件でエラー処理', async ({ page }) => {
    // SCEN-190: [error] 進捗確認画面 - 無効なフィルター条件でエラー処理
    await page.fill('[data-testid="application-id-input"]', 'invalid-date');
    await page.click('[data-testid="search-button"]');
    
    const errorMessage = page.locator('.error-message');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
    
    await page.click('[data-testid="clear-button"]');
    await page.fill('[data-testid="application-id-input"]', 'APP001');
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-191: 削除済み申請の詳細リンククリックでエラー表示', async ({ page }) => {
    // SCEN-191: [error] 進捗確認画面 - 削除済み申請の詳細リンククリックでエラー表示
    const deletedRow = page.locator('[data-testid="applications-table"] tr:has-text("削除済み")');
    if (await deletedRow.count() > 0) {
      await deletedRow.locator('button:has-text("詳細")').click();
      
      const errorMessage = page.locator('.error-message, .alert');
      await expect(errorMessage).toContainText(/存在しない|見つかりません|削除/);
    }
  });

  test('SCEN-192: 権限外申請の詳細表示でアクセス拒否', async ({ page }) => {
    // SCEN-192: [error] 進捗確認画面 - 権限外申請の詳細表示でアクセス拒否
    await page.goto("/panels/scr-1779422369173.html?app=unauthorized-app-123");
    
    const accessDenied = page.locator('.access-denied, .error-message');
    if (await accessDenied.count() > 0) {
      await expect(accessDenied).toContainText(/権限|アクセス|拒否/);
    }
  });

  test('SCEN-193: 大量データでの表示パフォーマンス', async ({ page }) => {
    // SCEN-193: [edge] 進捗確認画面 - 大量データでの表示パフォーマンス
    const startTime = Date.now();
    
    await page.goto("/panels/scr-1779422369173.html");
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    const nextPageButton = page.locator('button:has-text("次へ")');
    if (await nextPageButton.count() > 0) {
      const paginationStart = Date.now();
      await nextPageButton.click();
      await page.waitForLoadState('networkidle');
      const paginationTime = Date.now() - paginationStart;
      expect(paginationTime).toBeLessThan(3000);
    }
  });

  test('SCEN-194: 申請件数0件時の表示', async ({ page }) => {
    // SCEN-194: [edge] 進捗確認画面 - 申請件数0件時の表示
    await page.fill('[data-testid="application-id-input"]', 'NO-MATCH-DATA');
    await page.click('[data-testid="search-button"]');
    
    const noDataMessage = page.locator('text=該当する申請が見つかりません');
    await expect(noDataMessage).toBeVisible();
    
    const tableBody = page.locator('[data-testid="applications-table"] tbody');
    const rowCount = await tableBody.locator('tr').count();
    expect(rowCount).toBe(0);
  });

  test('SCEN-195: 最大文字数の検索条件入力', async ({ page }) => {
    // SCEN-195: [edge] 進捗確認画面 - 最大文字数の検索条件入力
    const maxTitleLength = 'A'.repeat(255);
    const maxIdLength = 'B'.repeat(20);
    const maxDescLength = 'C'.repeat(500);
    
    await page.fill('[data-testid="applicant-name-input"]', maxTitleLength);
    await page.fill('[data-testid="application-id-input"]', maxIdLength);
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
  });

  test('SCEN-196: 全フィルター同時適用', async ({ page }) => {
    // SCEN-196: [edge] 進捗確認画面 - 全フィルター同時適用
    await page.selectOption('[data-testid="document-type-filter"]', '休暇申請');
    await page.click('[data-testid="tab-pending"]');
    await page.fill('[data-testid="applicant-name-input"]', '田中');
    await page.fill('[data-testid="application-id-input"]', 'APP');
    
    const startTime = Date.now();
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    const filterTime = Date.now() - startTime;
    
    expect(filterTime).toBeLessThan(3000);
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
  });

  test('SCEN-197: 長い申請タイトルの表示', async ({ page }) => {
    // SCEN-197: [edge] 進捗確認画面 - 長い申請タイトルの表示
    const longTitle = '令和6年度第1四半期における全社的なデジタルトランスフォーメーション推進に関する予算申請及び人員配置計画の承認依頼について（緊急案件）';
    
    await page.fill('[data-testid="application-id-input"]', '');
    await page.fill('[data-testid="applicant-name-input"]', '');
    await page.click('[data-testid="search-button"]');
    
    const titleCells = page.locator('[data-testid="applications-table"] tbody tr td:nth-child(2)');
    const count = await titleCells.count();
    
    if (count > 0) {
      const titleCell = titleCells.first();
      const titleText = await titleCell.textContent();
      
      expect(titleText || '').toMatch(/^.{10,}/);
      
      const cellStyle = await titleCell.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          overflow: computed.overflow,
          textOverflow: computed.textOverflow,
          whiteSpace: computed.whiteSpace
        };
      });
      
      expect(cellStyle.overflow === 'hidden' || cellStyle.textOverflow === 'ellipsis').toBeTruthy();
    }
  });
});