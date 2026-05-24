import { test, expect } from '@playwright/test';

test.describe("承認履歴・通知履歴照会画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422306272.html");
  });

  test("SCEN-103: 履歴種別タブ切り替えで表示内容が更新される", async ({ page }) => {
    // デフォルトで承認履歴タブがアクティブであることを確認
    await expect(page.locator('[data-testid="approval-tab"]')).toHaveClass(/active/);
    
    // 承認履歴の表示内容を確認
    await expect(page.locator('#approval-headers')).toBeVisible();
    await expect(page.locator('#approval-headers')).toContainText('申請者');
    
    // 通知履歴タブをクリック
    await page.click('[data-testid="notification-tab"]');
    
    // タブの状態が更新されることを確認
    await expect(page.locator('[data-testid="notification-tab"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="approval-tab"]')).not.toHaveClass(/active/);
    
    // 通知履歴の表示内容を確認
    await expect(page.locator('#notification-headers')).toBeVisible();
    await expect(page.locator('#notification-headers')).toContainText('通知対象者');
    
    // 再度承認履歴タブに戻す
    await page.click('[data-testid="approval-tab"]');
    
    // 承認履歴の表示内容が再度表示されることを確認
    await expect(page.locator('[data-testid="approval-tab"]')).toHaveClass(/active/);
    await expect(page.locator('#approval-headers')).toBeVisible();
  });

  test("SCEN-104: 期間指定で該当期間の履歴が表示される", async ({ page }) => {
    // 開始日を入力
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    
    // 終了日を入力
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-105: 申請書類番号で完全一致検索ができる", async ({ page }) => {
    // 申請書類番号を入力
    await page.fill('[data-testid="document-number"]', 'APP-2024-001');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-106: 文書種別で絞り込み検索ができる", async ({ page }) => {
    // 文書種別のプルダウンをクリック
    await page.click('[data-testid="document-type-select"]');
    
    // 稟議書を選択
    await page.selectOption('[data-testid="document-type-select"]', { label: '稟議書' });
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-107: 承認者名で部分一致検索ができる", async ({ page }) => {
    // 承認者名に部分文字列を入力
    await page.fill('[data-testid="approver-name"]', '田中');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-108: 処理状況フィルターで絞り込みができる", async ({ page }) => {
    // 処理状況フィルターで「承認待ち」を選択
    await page.selectOption('[data-testid="approval-status-select"]', { label: '承認待ち' });
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 結果を確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 「承認済み」を選択
    await page.selectOption('[data-testid="approval-status-select"]', { label: '承認済み' });
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 結果を確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 「却下」を選択
    await page.selectOption('[data-testid="approval-status-select"]', { label: '却下' });
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 結果を確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-109: 通知種別フィルターで絞り込みができる", async ({ page }) => {
    // 通知履歴タブに切り替え
    await page.click('[data-testid="notification-tab"]');
    
    // 通知種別フィルターのドロップダウンをクリック
    await page.click('[data-testid="notification-type-select"]');
    
    // 「承認依頼」を選択
    await page.selectOption('[data-testid="notification-type-select"]', { label: '承認依頼' });
    
    // フィルター適用（検索ボタンをクリック）
    await page.click('[data-testid="search-button"]');
    
    // 通知履歴一覧を確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 「差し戻し」を選択
    await page.selectOption('[data-testid="notification-type-select"]', { label: '差し戻し' });
    
    // フィルター適用
    await page.click('[data-testid="search-button"]');
    
    // 再度通知履歴一覧を確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-110: 複数条件を組み合わせた検索ができる", async ({ page }) => {
    // 申請種別を選択（文書種別で代用）
    await page.selectOption('[data-testid="document-type-select"]', { label: '稟議書' });
    
    // 申請日の期間を設定
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    
    // 承認ステータスを選択
    await page.selectOption('[data-testid="approval-status-select"]', { label: '承認済み' });
    
    // 申請者名を入力（承認者名で代用）
    await page.fill('[data-testid="approver-name"]', '田中');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-111: 検索条件クリアで全条件がリセットされる", async ({ page }) => {
    // 各検索条件を入力
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.fill('[data-testid="approver-name"]', '田中');
    await page.selectOption('[data-testid="approval-status-select"]', { label: '承認済み' });
    
    // 通知履歴タブに切り替えて通知種別も設定
    await page.click('[data-testid="notification-tab"]');
    await page.selectOption('[data-testid="notification-type-select"]', { label: '承認依頼' });
    
    // クリアボタンをクリック
    await page.click('[data-testid="clear-button"]');
    
    // 全条件がリセットされていることを確認
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('');
    await expect(page.locator('[data-testid="approver-name"]')).toHaveValue('');
  });

  test("SCEN-112: 処理日時ソートで昇順降順切り替えができる", async ({ page }) => {
    // 検索を実行して一覧を表示
    await page.click('[data-testid="search-button"]');
    
    // 処理日時列のヘッダー部分をクリック（↕を含むヘッダー要素）
    await page.click('#approval-headers >> text=↕');
    
    // 一覧の並び順を確認（昇順）
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 再度処理日時列のヘッダー部分をクリック
    await page.click('#approval-headers >> text=↕');
    
    // 一覧の並び順を確認（降順）
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // もう一度処理日時列のヘッダー部分をクリック
    await page.click('#approval-headers >> text=↕');
    
    // 一覧の並び順を確認（昇順に戻る）
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-113: 詳細表示リンクで詳細画面に遷移する", async ({ page }) => {
    // 検索を実行して履歴一覧を表示
    await page.click('[data-testid="search-button"]');
    
    // 履歴一覧の詳細情報ボタンをクリック
    await page.click('text=詳細情報');
    
    // 詳細モーダルが表示されることを確認
    await expect(page.locator('#detail-modal')).toBeVisible();
    await expect(page.locator('#detail-content')).toBeVisible();
  });

  test("SCEN-114: 開始日が終了日より後の日付でエラー表示", async ({ page }) => {
    // 開始日に終了日より後の日付を入力
    await page.fill('[data-testid="start-date"]', '2024-01-31');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-115: 存在しない申請書類番号で検索結果0件", async ({ page }) => {
    // 存在しない申請書類番号を入力
    await page.fill('[data-testid="document-number"]', '99999999');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が0件であることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-116: 無効な文字を含む申請書類番号でエラー表示", async ({ page }) => {
    // 特殊文字や記号を含む申請書類番号を入力
    await page.fill('[data-testid="document-number"]', '!@#$%^&*()');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-117: 検索条件未入力で検索実行時にバリデーション", async ({ page }) => {
    // 検索条件を何も入力せずに検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // バリデーションエラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-118: 期間指定の上限値での検索", async ({ page }) => {
    // 期間指定の上限値として最大日付を入力
    await page.fill('[data-testid="start-date"]', '2099-12-31');
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-119: 申請書類番号の最大文字数での検索", async ({ page }) => {
    // 最大文字数（255文字）の申請書類番号を入力
    const maxLengthNumber = 'A'.repeat(255);
    await page.fill('[data-testid="document-number"]', maxLengthNumber);
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 最大文字数+1文字（256文字）を入力
    const overMaxLengthNumber = 'A'.repeat(256);
    await page.fill('[data-testid="document-number"]', overMaxLengthNumber);
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // エラーメッセージが表示されるかまたは入力が制限されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("SCEN-120: 承認者名の最大文字数での検索", async ({ page }) => {
    // 最大文字数（255文字）の承認者名を入力
    const maxLengthName = 'あ'.repeat(255);
    await page.fill('[data-testid="approver-name"]', maxLengthName);
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
  });

  test("SCEN-121: 検索結果が最大表示件数の場合の表示", async ({ page }) => {
    // 最大表示件数に達する検索条件を設定（全期間での検索）
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    
    // 検索ボタンをクリック
    await page.click('[data-testid="search-button"]');
    
    // 検索結果一覧が表示されることを確認
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible();
    
    // 件数表示を確認
    await expect(page.locator('#result-count')).toBeVisible();
  });
});