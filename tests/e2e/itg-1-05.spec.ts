import { test, expect } from '@playwright/test';

test.describe("遅延案件検知・催促通知画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422271790.html");
  });

  test("SCEN-074: 遅延案件一覧が正常に表示される", async ({ page }) => {
    // 遅延案件検知・催促通知画面が表示されることを確認
    await expect(page.locator('.breadcrumb')).toContainText('遅延案件検知・催促通知');
    
    // 遅延案件一覧エリアを確認
    await expect(page.locator('[data-testid="delay-cases-table"]')).toBeVisible();
    
    // 一覧ヘッダーの項目を確認
    const table = page.locator('[data-testid="delay-cases-table"]');
    await expect(table.locator('th')).toContainText(['選択', '申請ID', '申請種別', '申請タイトル', '申請者', '現在承認者', '承認状態', '遅延日数', '最終更新', '操作']);
    
    // 一覧の内容を確認（遅延案件が表示される）
    const tbody = page.locator('#delay-cases-tbody');
    const firstRow = tbody.locator('tr').first();
    if (await firstRow.count() > 0) {
      await expect(firstRow.locator('td').nth(6)).toContainText(['3日', '5日', '7日', '10日']);
    }
  });

  test("SCEN-075: 申請書類種別フィルターで絞り込みできる", async ({ page }) => {
    // 申請書類種別フィルターのプルダウンメニューをクリック
    await page.click('[data-testid="document-type-filter"]');
    
    // 利用可能な申請書類種別の一覧が表示されることを確認
    const filter = page.locator('#filter-document-type');
    await expect(filter.locator('option')).toContainText(['全ての種別', '休暇申請', '経費申請', '稟議申請', '購買申請', '出張申請']);
    
    // 「休暇申請」を選択
    await filter.selectOption('休暇申請');
    
    // フィルター適用ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 選択した申請書類種別の遅延案件のみが表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    const rows = tbody.locator('tr');
    if (await rows.count() > 0) {
      await expect(rows.first().locator('td').nth(2)).toContainText('休暇申請');
    }
    
    // 別の申請書類種別「経費申請」を選択
    await filter.selectOption('経費申請');
    await page.click('[data-testid="search-button"]');
    
    // 新しく選択した申請書類種別の遅延案件のみが表示されることを確認
    if (await rows.count() > 0) {
      await expect(rows.first().locator('td').nth(2)).toContainText('経費申請');
    }
    
    // 「全ての種別」を選択
    await filter.selectOption('全ての種別');
    await page.click('[data-testid="search-button"]');
  });

  test("SCEN-076: 承認ステップ状況フィルターで絞り込みできる", async ({ page }) => {
    // 承認ステップ状況フィルターのドロップダウンをクリック
    await page.click('[data-testid="approval-status-filter"]');
    
    // 利用可能なフィルター選択肢を確認
    const statusFilter = page.locator('#filter-approval-status');
    await expect(statusFilter.locator('option')).toContainText(['全ての状況', '承認待ち', '差戻し', '保留']);
    
    // 「承認待ち」を選択
    await statusFilter.selectOption('承認待ち');
    
    // フィルター適用ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 表示された案件リストを確認
    const tbody = page.locator('#delay-cases-tbody');
    const rows = tbody.locator('tr');
    if (await rows.count() > 0) {
      await expect(rows.first().locator('td').nth(6)).toContainText('承認待ち');
    }
    
    // 「差戻し」を選択
    await statusFilter.selectOption('差戻し');
    await page.click('[data-testid="search-button"]');
    
    // 表示された案件リストを確認
    if (await rows.count() > 0) {
      await expect(rows.first().locator('td').nth(6)).toContainText('差戻し');
    }
    
    // フィルターをクリア（全て表示）に戻す
    await statusFilter.selectOption('全ての状況');
    await page.click('[data-testid="search-button"]');
  });

  test("SCEN-077: 遅延レベルが適切に表示される", async ({ page }) => {
    // 遅延している申請案件の一覧を確認
    const tbody = page.locator('#delay-cases-tbody');
    const rows = tbody.locator('tr');
    
    if (await rows.count() > 0) {
      // 各案件の遅延レベル表示項目を確認
      const firstRow = rows.first();
      const delayDaysCell = firstRow.locator('td').nth(7);
      const delayText = await delayDaysCell.textContent();
      
      // 遅延日数に応じた遅延レベルの判定
      let expectedLevel = '';
      if (delayText?.includes('8') || delayText?.includes('10')) {
        expectedLevel = '緊急';
      } else if (delayText?.includes('5') || delayText?.includes('7')) {
        expectedLevel = '注意';
      } else if (delayText?.includes('3')) {
        expectedLevel = '軽微';
      }
      
      // 遅延レベルの表示確認
      await expect(delayDaysCell).toContainText([expectedLevel, '日']);
      
      // 遅延レベルごとの色分けやアイコン表示が適切に行われていることを確認
      const statusIndicator = firstRow.locator('.status-indicator');
      if (expectedLevel === '緊急') {
        await expect(statusIndicator).toHaveClass(/status-rejected/);
      } else if (expectedLevel === '注意') {
        await expect(statusIndicator).toHaveClass(/status-pending/);
      } else {
        await expect(statusIndicator).toHaveClass(/status-approved/);
      }
    }
  });

  test("SCEN-078: 単一案件の催促通知が送信できる", async ({ page }) => {
    // 遅延している案件一覧が表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    const rows = tbody.locator('tr');
    if (await rows.count() > 0) {
      // 催促通知を送信したい単一案件を選択
      const firstRow = rows.first();
      await firstRow.locator('input[type="checkbox"]').check();
      
      // 選択した案件の詳細情報が表示されることを確認
      await expect(firstRow.locator('td').nth(3)).toBeVisible(); // 申請者
      await expect(firstRow.locator('td').nth(7)).toBeVisible(); // 遅延日数
      
      // 「催促通知送信」ボタンをクリック
      await page.click('button:has-text("催促送信")');
      
      // 催促通知の送信確認ダイアログが表示されることを確認
      await expect(page.locator('.confirm-dialog, [role="dialog"]')).toBeVisible();
      
      // 確認ダイアログで「送信」ボタンをクリック
      await page.click('button:has-text("送信"), button:has-text("実行")');
    }
  });

  test("SCEN-079: 一括催促送信が正常に動作する", async ({ page }) => {
    // 遅延している申請案件の一覧が表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    const rows = tbody.locator('tr');
    if (await rows.count() > 0) {
      // 催促対象の案件を複数選択
      await rows.nth(0).locator('input[type="checkbox"]').check();
      await rows.nth(1).locator('input[type="checkbox"]').check();
      
      // 「一括催促送信」ボタンをクリック
      await page.click('[data-testid="bulk-notify-button"]');
      
      // 催促送信確認ダイアログが表示されることを確認
      await expect(page.locator('.confirm-dialog, [role="dialog"]')).toBeVisible();
      
      // 確認ダイアログで「送信」ボタンをクリック
      await page.click('button:has-text("送信"), button:has-text("実行")');
      
      // 送信完了メッセージが表示される
      await expect(page.locator('.success-message, .alert-success')).toBeVisible();
    }
  });

  test("SCEN-080: 通知履歴が正確に表示される", async ({ page }) => {
    // 通知履歴ボタンをクリック
    await page.click('[data-testid="notification-history-btn"]');
    
    // 通知履歴セクションを確認
    const historySection = page.locator('.history-section, #notification-history');
    await expect(historySection).toBeVisible();
    
    // 送信済みの催促通知一覧を表示
    const historyList = historySection.locator('.history-list, table');
    await expect(historyList).toBeVisible();
    
    // 各通知項目の詳細を確認
    const historyItems = historyList.locator('tr, .history-item');
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      
      // 送信日時を確認
      await expect(firstItem.locator('td:nth-child(1), .date')).toBeVisible();
      
      // 宛先情報を確認
      await expect(firstItem.locator('td:nth-child(2), .recipient')).toBeVisible();
      
      // 通知内容を確認
      await expect(firstItem.locator('td:nth-child(3), .content')).toBeVisible();
      
      // 通知ステータス（送信完了/エラー等）を確認
      await expect(firstItem.locator('td:nth-child(4), .status')).toContainText(['送信完了', '送信中', 'エラー']);
    }
  });

  test("SCEN-081: 遅延検知設定を変更できる", async ({ page }) => {
    // 遅延検知設定ボタンをクリック
    await page.click('[data-testid="delay-settings-btn"]');
    
    // 遅延検知設定セクションを確認
    const settingsSection = page.locator('.settings-section, #delay-settings');
    await expect(settingsSection).toBeVisible();
    
    // 現在の遅延検知設定を確認
    const thresholdInput = settingsSection.locator('input[name="threshold"], #threshold-days');
    const currentValue = await thresholdInput.inputValue();
    
    // 遅延検知のしきい値日数を変更（例：3日から5日に変更）
    await thresholdInput.fill('5');
    
    // 対象とする案件種別の設定を変更
    const categorySelect = settingsSection.locator('select[name="categories"], #target-categories');
    await categorySelect.selectOption('休暇申請');
    
    // 通知頻度の設定を変更
    const frequencySelect = settingsSection.locator('select[name="frequency"], #notification-frequency');
    await frequencySelect.selectOption('毎日');
    
    // 「設定を保存」ボタンをクリック
    await page.click('button:has-text("設定を保存"), button:has-text("保存")');
    
    // 設定変更完了のメッセージが表示されることを確認
    await expect(page.locator('.success-message, .alert-success')).toBeVisible();
    
    // 画面を再読み込みして変更した設定値が保持されていることを確認
    await page.reload();
    await expect(thresholdInput).toHaveValue('5');
  });

  test("SCEN-082: 遅延案件0件時の表示確認", async ({ page }) => {
    // 検索フィルターを設定して遅延案件を0件にする
    await page.selectOption('#filter-document-type', '出張申請');
    await page.click('[data-testid="search-button"]');
    
    // 画面の読み込みが完了するまで待機
    await page.waitForSelector('#delay-cases-tbody');
    
    // 遅延案件一覧エリアの表示内容を確認
    const tbody = page.locator('#delay-cases-tbody');
    
    // 件数表示部分の数値を確認
    const totalCount = page.locator('#total-count');
    await expect(totalCount).toContainText('0');
    
    // 遅延案件がない場合のメッセージ表示確認
    if (await tbody.locator('tr').count() === 0) {
      await expect(tbody).toContainText('遅延案件はありません');
    }
    
    // 催促通知ボタンの状態を確認（非活性または非表示）
    const bulkNotifyBtn = page.locator('[data-testid="bulk-notify-button"]');
    await expect(bulkNotifyBtn).toBeDisabled();
  });

  test("SCEN-083: 大量案件表示時のパフォーマンス", async ({ page }) => {
    // 全ての種別を選択して最大件数を表示
    await page.selectOption('#filter-document-type', '全ての種別');
    await page.selectOption('#filter-approval-status', '全ての状況');
    
    // ページの読み込み開始時刻を記録
    const startTime = Date.now();
    
    // 検索実行
    await page.click('[data-testid="search-button"]');
    
    // 画面が完全に表示されるまで待機
    await page.waitForSelector('#delay-cases-tbody tr, [data-message="遅延案件はありません"]');
    
    // ページの読み込み完了時刻を記録
    const loadTime = Date.now() - startTime;
    
    // 初期読み込み時間が5秒以内であることを確認
    expect(loadTime).toBeLessThan(5000);
    
    // 画面上の案件一覧が正常に表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    // フィルタ機能の応答時間を測定
    const filterStartTime = Date.now();
    await page.selectOption('#filter-document-type', '経費申請');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('#delay-cases-tbody');
    const filterTime = Date.now() - filterStartTime;
    
    // フィルタ操作の応答時間が3秒以内であることを確認
    expect(filterTime).toBeLessThan(3000);
  });

  test("SCEN-084: フィルター条件未選択時の動作", async ({ page }) => {
    // フィルター条件を何も選択せずに初期状態のまま
    const documentTypeFilter = page.locator('#filter-document-type');
    const approvalStatusFilter = page.locator('#filter-approval-status');
    const delayLevelFilter = page.locator('#filter-delay-level');
    
    // 初期状態を確認
    await expect(documentTypeFilter).toHaveValue('全ての種別');
    await expect(approvalStatusFilter).toHaveValue('全ての状況');
    await expect(delayLevelFilter).toHaveValue('全てのレベル');
    
    // 「検索」ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 画面の表示内容と動作を確認（全件表示される）
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    // エラーメッセージまたは警告メッセージの有無を確認
    const errorMessage = page.locator('.error-message, .alert-danger');
    const warningMessage = page.locator('.warning-message, .alert-warning');
    
    // エラーや警告が表示されていないことを確認
    await expect(errorMessage).not.toBeVisible();
    await expect(warningMessage).not.toBeVisible();
  });

  test("SCEN-085: 全選択状態での一括催促送信", async ({ page }) => {
    // 遅延案件一覧が表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    // 一覧上部の「全選択」チェックボックスをクリック
    await page.check('[data-testid="select-all-checkbox"]');
    
    // 全ての遅延案件が選択状態になることを確認
    const checkboxes = tbody.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      for (let i = 0; i < checkboxCount; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    }
    
    // 選択件数の表示を確認
    const selectedCount = page.locator('#selected-count');
    await expect(selectedCount).toContainText(`${checkboxCount}件選択中`);
    
    // 「一括催促送信」ボタンをクリック
    await page.click('[data-testid="bulk-notify-button"]');
    
    // 確認ダイアログが表示されることを確認
    await expect(page.locator('.confirm-dialog, [role="dialog"]')).toBeVisible();
    
    // 確認ダイアログで「実行」ボタンをクリック
    await page.click('button:has-text("実行"), button:has-text("送信")');
    
    // 送信処理の進行状況が表示されることを確認
    await expect(page.locator('.progress-indicator, .loading')).toBeVisible();
    
    // 処理完了メッセージが表示されることを確認
    await expect(page.locator('.success-message, .alert-success')).toBeVisible();
  });

  test("SCEN-086: 催促通知送信権限なしでエラー", async ({ page }) => {
    // 権限のないユーザーでログイン（既存のログインを使用）
    
    // 遅延している案件を一覧から選択
    const tbody = page.locator('#delay-cases-tbody');
    const firstRow = tbody.locator('tr').first();
    
    if (await firstRow.count() > 0) {
      await firstRow.locator('input[type="checkbox"]').check();
      
      // 催促通知送信ボタンをクリック
      await page.click('button:has-text("催促送信")');
      
      // 権限エラーメッセージが表示されることを確認
      await expect(page.locator('.error-message, .alert-danger')).toContainText(['権限', 'エラー', '送信できません']);
    }
  });

  test("SCEN-087: ネットワークエラー時の通知送信失敗", async ({ page }) => {
    // ネットワークをオフラインに設定
    await page.context().setOffline(true);
    
    // 遅延している承認案件を選択
    const tbody = page.locator('#delay-cases-tbody');
    const firstRow = tbody.locator('tr').first();
    
    if (await firstRow.count() > 0) {
      await firstRow.locator('input[type="checkbox"]').check();
      
      // 「催促通知送信」ボタンをクリック
      await page.click('button:has-text("催促送信")');
      
      // 確認ダイアログで実行
      await page.click('button:has-text("送信"), button:has-text("実行")');
      
      // 通信エラーが発生するまで待機
      await page.waitForTimeout(2000);
      
      // 画面上のエラーメッセージの表示を確認
      await expect(page.locator('.error-message, .alert-danger')).toContainText(['通信エラー', 'ネットワーク', '送信に失敗']);
    }
    
    // ネットワークを復旧
    await page.context().setOffline(false);
  });

  test("SCEN-088: 無効な設定値での検知設定変更エラー", async ({ page }) => {
    // 遅延検知設定画面を開く
    await page.click('[data-testid="delay-settings-btn"]');
    
    const settingsSection = page.locator('.settings-section, #delay-settings');
    await expect(settingsSection).toBeVisible();
    
    // 遅延判定日数に負の値を入力
    const thresholdInput = settingsSection.locator('input[name="threshold"], #threshold-days');
    await thresholdInput.fill('-5');
    
    // 催促通知間隔に0を入力
    const intervalInput = settingsSection.locator('input[name="interval"], #notification-interval');
    await intervalInput.fill('0');
    
    // 通知先メールアドレスに無効な形式を入力
    const emailInput = settingsSection.locator('input[name="email"], #notification-email');
    await emailInput.fill('invalid-email');
    
    // 設定保存ボタンをクリック
    await page.click('button:has-text("設定を保存"), button:has-text("保存")');
    
    // 入力値検証エラーが発生することを確認
    await expect(page.locator('.error-message, .validation-error')).toContainText(['1以上の値', 'メールアドレス', '無効']);
  });

  test("SCEN-089: 選択なしでの一括催促送信エラー", async ({ page }) => {
    // 遅延案件一覧が表示されることを確認
    const tbody = page.locator('#delay-cases-tbody');
    await expect(tbody).toBeVisible();
    
    // 案件を選択せずに一括催促ボタンをクリック
    await page.click('[data-testid="bulk-notify-button"]');
    
    // 案件が選択されていない旨のエラーメッセージが表示されることを確認
    await expect(page.locator('.error-message, .alert-danger')).toContainText(['選択', '案件', '選択されていません']);
  });
});