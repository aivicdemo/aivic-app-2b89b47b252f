import { test, expect } from '@playwright/test';

test.describe("承認判断入力画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422452973.html");
  });

  // SCEN-271: [normal] 承認判断入力画面 - 承認選択で正常に判断できる
  test('承認選択で正常に判断できる', async ({ page }) => {
    await page.click('[data-testid="decision-approve"]');
    await page.fill('#approval-comment', '内容確認済み。承認します。');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="承認処理が正常に完了"')).toBeVisible();
    await expect(page.locator('text="承認済み"')).toBeVisible();
  });

  // SCEN-272: [normal] 承認判断入力画面 - 差戻し選択で正常に判断できる
  test('差戻し選択で正常に判断できる', async ({ page }) => {
    await page.click('[data-testid="decision-return"]');
    await page.fill('#approval-comment', '追加資料が必要です。');
    await page.click('#btn-confirm');
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text="差戻し状態に更新"')).toBeVisible();
    await expect(page.locator('text="処理完了"')).toBeVisible();
  });

  // SCEN-273: [normal] 承認判断入力画面 - 却下選択で正常に判断できる
  test('却下選択で正常に判断できる', async ({ page }) => {
    await page.click('[data-testid="decision-reject"]');
    await page.fill('#approval-comment', '申請要件を満たしていません。');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="却下"')).toBeVisible();
    await expect(page.locator('text="却下通知が申請者に送信"')).toBeVisible();
  });

  // SCEN-274: [normal] 承認判断入力画面 - 条件付き承認で正常に判断できる
  test('条件付き承認で正常に判断できる', async ({ page }) => {
    await page.click('[data-testid="conditional-approval"]');
    await page.fill('[data-testid="approval-condition"]', '予算内での実施を条件とします。');
    await page.fill('#approval-comment', '条件付きで承認いたします。');
    await page.click('#btn-confirm');
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text="条件付き承認"')).toBeVisible();
    await expect(page.locator('text="申請者に通知が送信"')).toBeVisible();
  });

  // SCEN-275: [normal] 承認判断入力画面 - 承認コメント入力で正常送信
  test('承認コメント入力で正常送信', async ({ page }) => {
    await page.click('[data-testid="decision-approve"]');
    await page.fill('#approval-comment', '詳細を確認し、承認いたします。');
    await page.click('button:has-text("送信")');
    
    await expect(page.locator('text="承認処理が完了"')).toBeVisible();
  });

  // SCEN-276: [normal] 承認判断入力画面 - 添付ファイルプレビュー表示
  test('添付ファイルプレビュー表示', async ({ page }) => {
    await page.click('text="添付ファイル"');
    await page.click('text="プレビュー"');
    
    await expect(page.locator('.preview-modal')).toBeVisible();
    await page.click('button:has-text("閉じる")');
    await expect(page.locator('.preview-modal')).not.toBeVisible();
  });

  // SCEN-277: [normal] 承認判断入力画面 - 承認履歴が正常に表示される
  test('承認履歴が正常に表示される', async ({ page }) => {
    await page.click('[data-testid="approval-history"]');
    
    await expect(page.locator('text="承認履歴"')).toBeVisible();
    await expect(page.locator('text="山田主任"')).toBeVisible();
    await expect(page.locator('text="内容確認済み。承認します。"')).toBeVisible();
    await expect(page.locator('text="ステップ"')).toBeVisible();
    await expect(page.locator('text="承認者"')).toBeVisible();
    await expect(page.locator('text="結果"')).toBeVisible();
    await expect(page.locator('text="コメント"')).toBeVisible();
  });

  // SCEN-278: [error] 承認判断入力画面 - 判断未選択で送信エラー
  test('判断未選択で送信エラー', async ({ page }) => {
    await page.fill('#approval-comment', '任意のコメントです。');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="判断が未選択"')).toBeVisible();
    await expect(page.locator('text="エラー"')).toBeVisible();
  });

  // SCEN-279: [error] 承認判断入力画面 - 差戻し時コメント必須チェック
  test('差戻し時コメント必須チェック', async ({ page }) => {
    await page.click('[data-testid="decision-return"]');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="コメント必須"')).toBeVisible();
    await expect(page.locator('text="エラー"')).toBeVisible();
  });

  // SCEN-280: [error] 承認判断入力画面 - 却下時コメント必須チェック
  test('却下時コメント必須チェック', async ({ page }) => {
    await page.click('[data-testid="decision-reject"]');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="コメントが未入力"')).toBeVisible();
    await expect(page.locator('text="エラー"')).toBeVisible();
  });

  // SCEN-281: [error] 承認判断入力画面 - 権限なし申請でアクセス拒否
  test('権限なし申請でアクセス拒否', async ({ page }) => {
    await page.goto("/panels/scr-1779422326698.html");
    await page.click('text="権限対象外申請"');
    
    await expect(page.locator('text="アクセス拒否"')).toBeVisible();
    await expect(page.locator('text="承認判断入力画面にアクセスできない"')).toBeVisible();
  });

  // SCEN-282: [edge] 承認判断入力画面 - コメント最大文字数制限
  test('コメント最大文字数制限', async ({ page }) => {
    await page.click('[data-testid="decision-approve"]');
    const longComment = 'a'.repeat(501);
    await page.fill('#approval-comment', longComment);
    await page.click('#btn-confirm');
    
    const commentValue = await page.locator('#approval-comment').inputValue();
    expect(commentValue.length).toBeLessThanOrEqual(500);
  });

  // SCEN-283: [edge] 承認判断入力画面 - コメント最小文字数制限
  test('コメント最小文字数制限', async ({ page }) => {
    await page.click('[data-testid="decision-approve"]');
    await page.fill('#approval-comment', 'a');
    await page.click('#btn-confirm');
    
    await expect(page.locator('text="最小文字数に満たない"')).toBeVisible();
    await expect(page.locator('text="バリデーションエラー"')).toBeVisible();
  });

  // SCEN-284: [edge] 承認判断入力画面 - 添付ファイル0件表示
  test('添付ファイル0件表示', async ({ page }) => {
    await page.click('text="添付ファイル"');
    
    await expect(page.locator('text="添付ファイルはありません"')).toBeVisible();
  });

  // SCEN-285: [edge] 承認判断入力画面 - 承認履歴0件表示
  test('承認履歴0件表示', async ({ page }) => {
    await page.click('[data-testid="approval-history"]');
    
    await expect(page.locator('text="承認履歴はありません"')).toBeVisible();
    await expect(page.locator('text="ステップ"')).toBeVisible();
    await expect(page.locator('text="承認者"')).toBeVisible();
    await expect(page.locator('text="結果"')).toBeVisible();
  });
});