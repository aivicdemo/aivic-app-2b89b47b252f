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

  // SCEN-336
  test("[normal] 文書種別判定画面 - PDF申請書類の正常アップロード", async ({ page }) => {
    await page.click('[data-testid="file-select-btn"]');
    await page.setInputFiles('#file-input', {
      name: 'application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#success-message')).toBeVisible();
    await expect(page.locator('#auto-judgment-result')).toContainText('補助金申請書');
  });

  // SCEN-337
  test("[normal] 文書種別判定画面 - 文書種別自動判定結果の正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'subsidy-application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 補助金申請書')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#auto-judgment-result')).toBeVisible();
    await expect(page.locator('#accuracy-text')).toContainText('85');
    await expect(page.locator('#subsidy-score-text')).toContainText('92');
  });

  // SCEN-338
  test("[normal] 文書種別判定画面 - 手動選択で文書種別変更", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '経費申請書');
    await expect(page.locator('[data-testid="document-type-select"]')).toHaveValue('経費申請書');
    await page.click('[data-testid="confirm-result-btn"]');
    await expect(page.locator('#success-message')).toContainText('文書種別が設定されました');
  });

  // SCEN-339
  test("[normal] 文書種別判定画面 - 補助金関連度スコア正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'grant-proposal.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 科研費申請書 運営費交付金')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#subsidy-score-text')).toContainText('78');
    await expect(page.locator('#subsidy-score-bar')).toBeVisible();
  });

  // SCEN-340
  test("[normal] 文書種別判定画面 - 文書内容プレビュー正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 申請内容')
    });
    await page.click('button:has-text("プレビュー")');
    await expect(page.locator('#preview-panel')).toBeVisible();
    await expect(page.locator('#document-preview')).toContainText('申請内容');
    await page.click('#preview-panel >> text=×');
    await expect(page.locator('#preview-panel')).not.toBeVisible();
  });

  // SCEN-341
  test("[normal] 文書種別判定画面 - 判定精度インジケーター正常表示", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'clear-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 明確な補助金申請書')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#accuracy-bar')).toBeVisible();
    await expect(page.locator('#accuracy-text')).toContainText('95');
    const accuracyBar = page.locator('#accuracy-bar');
    await expect(accuracyBar).toHaveCSS('background-color', /green|#008000/);
  });

  // SCEN-342
  test("[normal] 文書種別判定画面 - 承認フロー確認から遷移", async ({ page }) => {
    await page.goto("/panels/scr-1779422354662.html");
    await page.click('text=申請案件');
    await page.click('[data-testid="approval-flow-check-btn"]');
    await expect(page).toHaveURL(/scr-1779422563059/);
    await expect(page.locator('h1')).toContainText('文書種別判定');
  });

  // SCEN-343
  test("[normal] 文書種別判定画面 - 判定結果確定で完了", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請書');
    await page.fill('textarea[name="remarks"]', '適切な文書種別です');
    await page.click('[data-testid="confirm-result-btn"]');
    await page.click('text=OK');
    await expect(page.locator('#success-message')).toContainText('判定結果が確定されました');
  });

  // SCEN-344
  test("[normal] 文書種別判定画面 - 再判定実行で結果更新", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 初回判定用')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    const initialResult = await page.locator('#auto-judgment-result').textContent();
    await page.click('[data-testid="re-judgment-btn"]');
    const updatedResult = await page.locator('#auto-judgment-result').textContent();
    expect(updatedResult).toBeDefined();
    await expect(page.locator('[data-testid="judgment-history-list"]')).toContainText('再判定');
  });

  // SCEN-345
  test("[normal] 文書種別判定画面 - 文書種別マスタ参照リンク遷移", async ({ page }) => {
    await page.click('[data-testid="document-type-master-link"]');
    await expect(page).toHaveURL(/document-master|master/);
    await expect(page.locator('h1')).toContainText('文書種別');
  });

  // SCEN-346
  test("[normal] 文書種別判定画面 - 判定履歴一覧表示", async ({ page }) => {
    await page.click('button:has-text("判定履歴")');
    await expect(page.locator('#history-panel')).toBeVisible();
    await expect(page.locator('#history-tbody')).toContainText('判定日時');
    await expect(page.locator('#history-tbody')).toContainText('文書種別');
    await expect(page.locator('#history-tbody')).toContainText('精度');
  });

  // SCEN-347
  test("[error] 文書種別判定画面 - 未対応ファイル形式でエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ executable')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対応していないファイル形式です');
  });

  // SCEN-348
  test("[error] 文書種別判定画面 - ファイルサイズ上限超過でエラー", async ({ page }) => {
    const largeBuffer = Buffer.alloc(20 * 1024 * 1024);
    await page.setInputFiles('#file-input', {
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズ上限');
  });

  // SCEN-349
  test("[error] 文書種別判定画面 - 破損ファイルアップロードでエラー", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'corrupted.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('corrupted data not pdf')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルが破損');
  });

  // SCEN-350
  test("[error] 文書種別判定画面 - 判定不可文書でエラーメッセージ", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'unreadable.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 ')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判定不可能');
  });

  // SCEN-351
  test("[error] 文書種別判定画面 - ネットワークエラー時の表示", async ({ page }) => {
    await page.context().setOffline(true);
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請書');
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワークエラー');
    await page.context().setOffline(false);
  });

  // SCEN-352
  test("[error] 文書種別判定画面 - 文書種別未選択で確定エラー", async ({ page }) => {
    await page.click('[data-testid="confirm-result-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文書種別を選択してください');
  });

  // SCEN-353
  test("[edge] 文書種別判定画面 - ファイル未選択状態での操作", async ({ page }) => {
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択');
    await page.click('#btn-file-select');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルを選択');
    await page.click('#btn-re-judgment');
    expect(page.locator('#btn-re-judgment')).toBeDefined();
  });

  // SCEN-354
  test("[edge] 文書種別判定画面 - ファイルサイズ上限ギリギリ", async ({ page }) => {
    const maxSizeBuffer = Buffer.alloc(10 * 1024 * 1024);
    await page.setInputFiles('#file-input', {
      name: 'max-size.pdf',
      mimeType: 'application/pdf',
      buffer: maxSizeBuffer
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#auto-judgment-result')).toBeVisible();
    expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  // SCEN-355
  test("[edge] 文書種別判定画面 - 判定精度0%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'unclear.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 不明な内容')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#accuracy-text')).toContainText('0%');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('判定不可');
  });

  // SCEN-356
  test("[edge] 文書種別判定画面 - 判定精度100%の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'perfect.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 補助金申請書 科研費 運営費交付金 設備整備費')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#accuracy-text')).toContainText('100%');
    await expect(page.locator('#auto-judgment-result')).toContainText('補助金申請書');
    const accuracyBar = page.locator('#accuracy-bar');
    await expect(accuracyBar).toHaveCSS('background-color', /green|#00ff00/);
  });

  // SCEN-357
  test("[edge] 文書種別判定画面 - 補助金関連度スコア0の場合", async ({ page }) => {
    await page.setInputFiles('#file-input', {
      name: 'non-subsidy.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 一般的な事務書類')
    });
    await page.click('[data-testid="execute-judgment-btn"]');
    await expect(page.locator('#subsidy-score-text')).toContainText('0');
    await expect(page.locator('#auto-judgment-result')).toContainText('その他');
    await expect(page.locator('[data-testid="confirm-result-btn"]')).toHaveAttribute('disabled', '');
  });
});