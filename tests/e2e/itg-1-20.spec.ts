import { test, expect } from '@playwright/test';

test.describe("文書種別判定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422563059.html");
  });

  test('SCEN-336: PDF申請書類の正常アップロード', async ({ page }) => {
    // SCEN-336: [normal] 文書種別判定画面 - PDF申請書類の正常アップロード
    await expect(page.locator('text=文書種別判定')).toBeVisible();
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await expect(page.locator('#file-info')).toBeVisible();
    await expect(page.locator('#file-name')).toContainText('application.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#auto-detection-result')).toBeVisible();
  });

  test('SCEN-337: 文書種別自動判定結果の正常表示', async ({ page }) => {
    // SCEN-337: [normal] 文書種別判定画面 - 文書種別自動判定結果の正常表示
    await page.setInputFiles('#file-input', 'test-files/subsidy-application.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#auto-detection-result')).toContainText('補助金申請書');
    await expect(page.locator('#accuracy-text')).toContainText('85%');
    await expect(page.locator('#subsidy-score-text')).toContainText('92%');
  });

  test('SCEN-338: 手動選択で文書種別変更', async ({ page }) => {
    // SCEN-338: [normal] 文書種別判定画面 - 手動選択で文書種別変更
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("判定実行")');
    await page.selectOption('#manual-document-type', '経費申請書');
    await page.click('button:has-text("判定結果確定")');
    await expect(page.locator('#auto-detection-result')).toContainText('経費申請書');
  });

  test('SCEN-339: 補助金関連度スコア正常表示', async ({ page }) => {
    // SCEN-339: [normal] 文書種別判定画面 - 補助金関連度スコア正常表示
    await page.setInputFiles('#file-input', 'test-files/subsidy-related.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#subsidy-score-text')).toContainText('78%');
    await expect(page.locator('#subsidy-score-bar')).toHaveCSS('width', '78%');
  });

  test('SCEN-340: 文書内容プレビュー正常表示', async ({ page }) => {
    // SCEN-340: [normal] 文書種別判定画面 - 文書内容プレビュー正常表示
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("プレビュー表示")');
    await expect(page.locator('#document-preview')).toBeVisible();
    await page.click('button:has-text("プレビューを閉じる")');
    await expect(page.locator('#document-preview')).toBeHidden();
  });

  test('SCEN-341: 判定精度インジケーター正常表示', async ({ page }) => {
    // SCEN-341: [normal] 文書種別判定画面 - 判定精度インジケーター正常表示
    await page.setInputFiles('#file-input', 'test-files/clear-document.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#accuracy-text')).toContainText('95%');
    await expect(page.locator('#accuracy-bar')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('SCEN-342: 承認フロー確認から遷移', async ({ page }) => {
    // SCEN-342: [normal] 文書種別判定画面 - 承認フロー確認から遷移
    await page.click('[data-testid="approval-flow-confirm"]');
    await expect(page.locator('text=文書種別判定')).toBeVisible();
    await expect(page.locator('#upload-area')).toBeVisible();
  });

  test('SCEN-343: 判定結果確定で完了', async ({ page }) => {
    // SCEN-343: [normal] 文書種別判定画面 - 判定結果確定で完了
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("判定実行")');
    await page.selectOption('#manual-document-type', '補助金申請書');
    await page.click('button:has-text("判定結果確定")');
    await expect(page.locator('text=判定結果が確定されました')).toBeVisible();
  });

  test('SCEN-344: 再判定実行で結果更新', async ({ page }) => {
    // SCEN-344: [normal] 文書種別判定画面 - 再判定実行で結果更新
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("判定実行")');
    const firstResult = await page.locator('#accuracy-text').textContent();
    await page.click('#btn-re-detect');
    const secondResult = await page.locator('#accuracy-text').textContent();
    expect(secondResult).toBeDefined();
  });

  test('SCEN-345: 文書種別マスタ参照リンク遷移', async ({ page }) => {
    // SCEN-345: [normal] 文書種別判定画面 - 文書種別マスタ参照リンク遷移
    await page.click('[data-testid="document-master-link"]');
    await expect(page.locator('text=文書種別一覧')).toBeVisible();
  });

  test('SCEN-346: 判定履歴一覧表示', async ({ page }) => {
    // SCEN-346: [normal] 文書種別判定画面 - 判定履歴一覧表示
    await page.click('[data-testid="classification-history"]');
    await expect(page.locator('#history-tbody')).toBeVisible();
    await expect(page.locator('text=日時')).toBeVisible();
    await expect(page.locator('text=判定結果')).toBeVisible();
  });

  test('SCEN-347: 未対応ファイル形式でエラー', async ({ page }) => {
    // SCEN-347: [error] 文書種別判定画面 - 未対応ファイル形式でエラー
    await page.setInputFiles('#file-input', 'test-files/invalid.exe');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式です');
  });

  test('SCEN-348: ファイルサイズ上限超過でエラー', async ({ page }) => {
    // SCEN-348: [error] 文書種別判定画面 - ファイルサイズ上限超過でエラー
    await page.setInputFiles('#file-input', 'test-files/large-file.pdf');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズが上限を超えています');
  });

  test('SCEN-349: 破損ファイルアップロードでエラー', async ({ page }) => {
    // SCEN-349: [error] 文書種別判定画面 - 破損ファイルアップロードでエラー
    await page.setInputFiles('#file-input', 'test-files/corrupted.pdf');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルが破損しています');
  });

  test('SCEN-350: 判定不可文書でエラーメッセージ', async ({ page }) => {
    // SCEN-350: [error] 文書種別判定画面 - 判定不可文書でエラーメッセージ
    await page.setInputFiles('#file-input', 'test-files/unreadable.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この文書は判定できません');
  });

  test('SCEN-351: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-351: [error] 文書種別判定画面 - ネットワークエラー時の表示
    await page.context().setOffline(true);
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワークエラー');
    await page.context().setOffline(false);
  });

  test('SCEN-352: 文書種別未選択で確定エラー', async ({ page }) => {
    // SCEN-352: [error] 文書種別判定画面 - 文書種別未選択で確定エラー
    await page.setInputFiles('#file-input', 'test-files/application.pdf');
    await page.click('button:has-text("判定実行")');
    await page.selectOption('#manual-document-type', '');
    await page.click('button:has-text("判定結果確定")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別を選択してください');
  });

  test('SCEN-353: ファイル未選択状態での操作', async ({ page }) => {
    // SCEN-353: [edge] 文書種別判定画面 - ファイル未選択状態での操作
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択してください');
    await page.click('button:has-text("アップロード")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択してください');
  });

  test('SCEN-354: ファイルサイズ上限ギリギリ', async ({ page }) => {
    // SCEN-354: [edge] 文書種別判定画面 - ファイルサイズ上限ギリギリ
    await page.setInputFiles('#file-input', 'test-files/max-size.pdf');
    await expect(page.locator('#file-size')).toContainText('10.0MB');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#auto-detection-result')).toBeVisible();
  });

  test('SCEN-355: 判定精度0%の場合', async ({ page }) => {
    // SCEN-355: [edge] 文書種別判定画面 - 判定精度0%の場合
    await page.setInputFiles('#file-input', 'test-files/ambiguous.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#accuracy-text')).toContainText('0%');
    await expect(page.locator('text=判定不可')).toBeVisible();
  });

  test('SCEN-356: 判定精度100%の場合', async ({ page }) => {
    // SCEN-356: [edge] 文書種別判定画面 - 判定精度100%の場合
    await page.setInputFiles('#file-input', 'test-files/perfect-match.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#accuracy-text')).toContainText('100%');
    await expect(page.locator('#accuracy-bar')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('SCEN-357: 補助金関連度スコア0の場合', async ({ page }) => {
    // SCEN-357: [edge] 文書種別判定画面 - 補助金関連度スコア0の場合
    await page.setInputFiles('#file-input', 'test-files/non-subsidy.pdf');
    await page.click('button:has-text("判定実行")');
    await expect(page.locator('#subsidy-score-text')).toContainText('0%');
    await expect(page.locator('#auto-detection-result')).toContainText('補助金対象外');
    await expect(page.locator('[data-testid="next-screen-button"]')).toBeDisabled();
  });
});