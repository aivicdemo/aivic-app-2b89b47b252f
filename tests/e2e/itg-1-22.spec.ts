import { test, expect } from '@playwright/test';

test.describe("処理ルート設定画面", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    // 処理ルート設定画面へ移動
    await page.goto("/panels/scr-1779422591281.html");
  });

  test('SCEN-378: 基本的な処理ルート作成', async ({ page }) => {
    // 新規作成ボタンをクリック
    await page.click('button:text("ルート保存")');
    
    // ルート名を入力
    await page.fill('#input-route-name', 'テスト処理ルート001');
    
    // 開始ノードを設定
    await page.click('#btn-add-step');
    
    // 承認者ノードを追加し、承認者を選択
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // 処理ルートが正常に作成され、ルート一覧に表示されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('テスト処理ルート001');
  });

  test('SCEN-379: 複数承認者による順次承認ルート作成', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', '順次承認ルート');
    
    // 第1承認者を追加
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 第2承認者を追加
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user2');
    
    // 第3承認者を追加
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user3');
    
    // 保存
    await page.click('#btn-save-route');
    
    // 順次承認ルートが作成されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('順次承認ルート');
  });

  test('SCEN-380: 並列承認ルート作成', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', '並列承認テストルート');
    
    // 承認方式で「並列承認」を選択
    await page.click('.parallel-approval');
    
    // 第1承認者として「承認者A」を設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 第1承認者と同じレベルに「承認者B」を追加
    await page.click('.approver-select');
    await page.click('#user2');
    
    // 第1承認者と同じレベルに「承認者C」を追加
    await page.click('.approver-select');
    await page.click('#user3');
    
    // 保存
    await page.click('#btn-save-route');
    
    // 並列承認ルートが正常に作成されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('並列承認テストルート');
  });

  test('SCEN-381: 条件分岐を含むルート作成', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', '金額別承認ルート');
    
    // 条件分岐ノードを追加
    await page.fill('#input-amount-condition', '100000');
    
    // 条件1のルート（10万円以上）に承認者Aを設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 条件2のルート（10万円未満）に承認者Bを設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user2');
    
    // 保存
    await page.click('#btn-save-route');
    
    // 条件分岐を含むルートが正常に作成されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('金額別承認ルート');
  });

  test('SCEN-382: 代理承認者設定', async ({ page }) => {
    // 承認者を選択
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 代理承認者設定
    await page.click('.proxy-approval');
    
    // 代理承認者を選択
    await page.click('.approver-select');
    await page.click('#user2');
    
    // 設定内容を保存
    await page.click('#btn-save-route');
    
    // 代理承認者が正常に設定されることを確認
    await expect(page.locator('#approval-steps')).toContainText('代理');
  });

  test('SCEN-383: 承認期限と遅延通知設定', async ({ page }) => {
    // 承認期限を設定
    await page.fill('.approval-deadline input', '5');
    
    // 遅延通知を有効にする
    await page.check('#check-delay-notification');
    
    // 通知タイミングを設定
    await page.fill('#input-warning-days', '1');
    
    // 保存
    await page.click('#btn-save-route');
    
    // 設定が正しく反映されることを確認
    await expect(page.locator('.approval-deadline input')).toHaveValue('5');
    await expect(page.locator('#check-delay-notification')).toBeChecked();
  });

  test('SCEN-384: ルートプレビュー表示確認', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', 'テスト承認ルート');
    
    // 承認者を設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // ルートプレビューボタンをクリック
    await page.click('button:text("プレビュー")');
    
    // 設定した承認者と承認順序が視覚的に表示されることを確認
    await expect(page.locator('#route-preview')).toBeVisible();
    await expect(page.locator('#route-preview')).toContainText('田中部長');
  });

  test('SCEN-385: ルート有効化切り替え', async ({ page }) => {
    // 処理ルートの有効化切り替えボタンをクリック
    await page.click('#check-route-active');
    
    // 画面の更新
    await page.reload();
    
    // 処理ルートの状態が切り替わることを確認
    await expect(page.locator('#check-route-active')).toBeChecked();
  });

  test('SCEN-386: 処理ルート名未入力でエラー', async ({ page }) => {
    // 処理ルート名を空のままにする
    await page.fill('#input-route-name', '');
    
    // その他の必須項目を入力
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('処理ルート名');
  });

  test('SCEN-387: 文書種別未選択でエラー', async ({ page }) => {
    // 文書種別を未選択のまま残す
    await page.selectOption('#select-document-type', '');
    
    // 承認者を選択
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('文書種別');
  });

  test('SCEN-388: 承認者未設定でエラー', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', 'テストルート');
    
    // 承認段階を追加するが承認者は未設定
    await page.click('#btn-add-step');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('承認者');
  });

  test('SCEN-389: 無効な承認期限でエラー', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', 'テスト処理ルート');
    
    // 承認者を設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 承認期限に過去の日付を入力
    await page.fill('.approval-deadline input', '-1');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('承認期限');
  });

  test('SCEN-390: 承認者重複設定でエラー', async ({ page }) => {
    // 第1承認者として「田中太郎」を選択
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 第2承認者として同じ「田中太郎」を選択
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 設定保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('同一の承認者');
  });

  test('SCEN-391: 存在しない承認者選択でエラー', async ({ page }) => {
    // 承認者選択フィールドをクリック
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    
    // 存在しない承認者のIDを入力しようとする
    await page.click('#approver-search');
    await page.fill('#approver-search', '存在しないユーザー');
    
    // 承認者追加ボタンをクリック
    await page.click('button:text("承認者")');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('承認者が存在しません');
  });

  test('SCEN-392: 処理ルート名文字数上限', async ({ page }) => {
    // 文字数上限値まで文字を入力
    const limitText = 'a'.repeat(50);
    await page.fill('#input-route-name', limitText);
    await page.click('#btn-save-route');
    
    // 正常に保存されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText(limitText);
    
    // 文字数上限値を超過した文字列を入力
    const overLimitText = 'a'.repeat(51);
    await page.fill('#input-route-name', overLimitText);
    await page.click('#btn-save-route');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.card')).toContainText('文字数');
  });

  test('SCEN-393: 承認ステップ数上限', async ({ page }) => {
    // 承認ステップを順次追加していく（上限まで）
    for (let i = 0; i < 10; i++) {
      await page.click('#btn-add-step');
    }
    
    // 上限を超えて追加の承認ステップを設定しようとする
    await page.click('#btn-add-step');
    
    // 承認ステップ追加ボタンが非活性になるか確認
    await expect(page.locator('#btn-add-step')).toBeDisabled();
  });

  test('SCEN-394: 承認期限最短設定', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', '最短期限ルート');
    
    // 承認者を設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 承認期限に最短値を入力
    await page.fill('.approval-deadline input', '1');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // 設定完了メッセージが表示されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('最短期限ルート');
    await expect(page.locator('.approval-deadline input')).toHaveValue('1');
  });

  test('SCEN-395: 承認期限最長設定', async ({ page }) => {
    // ルート名を入力
    await page.fill('#input-route-name', '最長期限ルート');
    
    // 承認者を設定
    await page.click('#btn-add-step');
    await page.click('.approver-select');
    await page.click('#user1');
    
    // 承認期限に最大値を入力
    await page.fill('.approval-deadline input', '999');
    
    // 保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // 処理ルート一覧に新規作成したルートが表示されることを確認
    await expect(page.locator('#route-list-tbody')).toContainText('最長期限ルート');
    await expect(page.locator('.approval-deadline input')).toHaveValue('999');
  });

  test('SCEN-396: 大量承認者一括選択', async ({ page }) => {
    // 承認者選択セクションを表示
    await page.click('#btn-add-step');
    
    // 一括選択ボタンをクリック
    await page.click('button:text("承認者")');
    
    // 承認者一覧から全選択チェックボックスを選択
    await page.click('#approver-modal');
    
    // 適用ボタンをクリック
    await page.click('button:text("申請完了")');
    
    // 処理ルート設定の保存ボタンをクリック
    await page.click('#btn-save-route');
    
    // 大量の承認者が正常に選択されることを確認
    await expect(page.locator('#approval-steps')).toContainText('ステップ');
  });
});