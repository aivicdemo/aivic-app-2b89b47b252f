import { test, expect } from '@playwright/test';

test.describe("承認ルート設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422354662.html");
  });

  // SCEN-160
  test("[normal] 承認ルート設定画面 - 文書種別選択から承認フロー作成", async ({ page }) => {
    await page.selectOption('#form-document-type', { label: '稟議書' });
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '稟議書承認フロー_テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '田中部長');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '佐藤課長');
    await page.click('#btn-modal-select');
    await page.uncheck('#form-parallel');
    await page.click('#btn-save');
    await page.click('button:has-text("OK")');
    await expect(page.locator('#routes-tbody')).toContainText('稟議書承認フロー_テスト');
    await expect(page.locator('#routes-tbody')).toContainText('田中部長');
    await expect(page.locator('#routes-tbody')).toContainText('佐藤課長');
  });

  // SCEN-161
  test("[normal] 承認ルート設定画面 - 承認ステップ追加と承認者設定", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', 'テスト承認ルート');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '山田');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#routes-tbody')).toContainText('テスト承認ルート');
    await expect(page.locator('#approval-steps')).toContainText('山田');
  });

  // SCEN-162
  test("[normal] 承認ルート設定画面 - 承認順序変更で正しく並び替え", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '順序変更テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者A');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者B');
    await page.click('#btn-modal-select');
    const firstStep = page.locator('#approval-steps .approval-step').first();
    const secondStep = page.locator('#approval-steps .approval-step').nth(1);
    await firstStep.dragTo(secondStep, { targetPosition: { x: 0, y: 50 } });
    await page.click('#btn-save');
    await expect(page.locator('#approval-steps .approval-step').first()).toContainText('承認者B');
    await expect(page.locator('#approval-steps .approval-step').nth(1)).toContainText('承認者A');
  });

  // SCEN-163
  test("[normal] 承認ルート設定画面 - 並列承認設定で同時承認", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '並列承認テスト');
    await page.check('#form-parallel');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '田中太郎');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '佐藤花子');
    await page.click('#btn-modal-select');
    await page.fill('input[name="required_approvers"]', '2');
    await page.click('#btn-save');
    await page.click('button:has-text("OK")');
    await expect(page.locator('#routes-tbody')).toContainText('並列承認テスト');
    await expect(page.locator('#approval-steps')).toContainText('田中太郎');
    await expect(page.locator('#approval-steps')).toContainText('佐藤花子');
  });

  // SCEN-164
  test("[normal] 承認ルート設定画面 - 条件分岐設定で複数パス作成", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '複数パステストルート');
    await page.click('button:has-text("条件分岐追加")');
    await page.fill('input[name="condition1"]', '申請金額 < 10万円');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者A');
    await page.click('#btn-modal-select');
    await page.fill('input[name="condition2"]', '申請金額 >= 10万円');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者B');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者C');
    await page.click('#btn-modal-select');
    await page.click('button:has-text("プレビュー")');
    await page.click('#btn-save');
    await expect(page.locator('#routes-tbody')).toContainText('複数パステストルート');
  });

  // SCEN-165
  test("[normal] 承認ルート設定画面 - 承認期限設定で通知機能", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-deadline', '3');
    await page.check('#form-delay-notification');
    await page.fill('input[name="notification_timing"]', '1');
    await page.selectOption('select[name="notification_targets"]', ['承認者', '申請者']);
    await page.click('#btn-save');
    await expect(page.locator('#form-deadline')).toHaveValue('3');
    await expect(page.locator('#form-delay-notification')).toBeChecked();
  });

  // SCEN-166
  test("[normal] 承認ルート設定画面 - 代理承認者設定と動作確認", async ({ page }) => {
    await page.selectOption('#form-document-type', { value: '一般申請' });
    await page.click('button:has-text("代理承認者を設定")');
    await page.fill('#approver-search', '代理承認者');
    await page.click('#btn-modal-select');
    await page.fill('input[name="proxy_start_date"]', '2024-01-01');
    await page.fill('input[name="proxy_end_date"]', '2024-01-31');
    await page.click('#btn-save');
    await page.goto("/panels/scr-1779422326698.html");
    await page.fill('input[name="title"]', 'テスト申請');
    await page.fill('textarea[name="content"]', 'テスト内容');
    await page.click('button[type="submit"]');
    await page.goto("/panels/scr-1779422254479.html");
    await expect(page.locator('.approval-list')).toContainText('テスト申請');
    await page.click('button:has-text("承認")');
    await expect(page.locator('.approval-history')).toContainText('代理承認者');
  });

  // SCEN-167
  test("[normal] 承認ルート設定画面 - 承認ステップ削除で順序再整理", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', 'ステップ削除テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', 'ステップ1');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', 'ステップ2');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', 'ステップ3');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', 'ステップ4');
    await page.click('#btn-modal-select');
    await page.locator('#approval-steps .approval-step').nth(1).locator('button:has-text("削除")').click();
    await page.click('button:has-text("削除")');
    await page.click('#btn-save');
    const steps = page.locator('#approval-steps .approval-step');
    await expect(steps.nth(0)).toContainText('ステップ1');
    await expect(steps.nth(1)).toContainText('ステップ3');
    await expect(steps.nth(2)).toContainText('ステップ4');
  });

  // SCEN-168
  test("[error] 承認ルート設定画面 - 承認フロー名未入力でエラー", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.selectOption('#form-document-type', { value: '稟議書' });
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者テスト');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('承認フロー名');
  });

  // SCEN-169
  test("[error] 承認ルート設定画面 - 文書種別未選択で保存失敗", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', 'テストルート');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('文書種別');
  });

  // SCEN-170
  test("[error] 承認ルート設定画面 - 承認者未設定でステップ作成失敗", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', 'テストルート');
    await page.click('#btn-add-step');
    await page.click('button:has-text("保存")');
    await expect(page.locator('#error-message')).toContainText('承認者');
  });

  // SCEN-171
  test("[error] 承認ルート設定画面 - 同一承認者重複設定でエラー", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '重複テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '田中太郎');
    await page.click('#btn-modal-select');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '田中太郎');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('同一の承認者が複数のステップに設定されています');
  });

  // SCEN-172
  test("[error] 承認ルート設定画面 - 承認期限過去日付でバリデーション", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '期限テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者');
    await page.click('#btn-modal-select');
    await page.fill('#form-deadline', '2023-01-01');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('承認期限に過去の日付は設定できません');
  });

  // SCEN-173
  test("[error] 承認ルート設定画面 - 存在しない承認者選択でエラー", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '存在しない承認者テスト');
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '存在しないユーザー999');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('指定された承認者が存在しません');
  });

  // SCEN-174
  test("[edge] 承認ルート設定画面 - 承認フロー名最大文字数", async ({ page }) => {
    await page.click('#btn-new-route');
    const maxLengthName = 'A'.repeat(255);
    await page.fill('#form-flow-name', maxLengthName);
    await page.selectOption('#form-document-type', { value: '一般申請' });
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者');
    await page.click('#btn-modal-select');
    await page.click('#btn-save');
    await expect(page.locator('#routes-tbody')).toContainText(maxLengthName.substring(0, 50));
    
    const overMaxName = 'B'.repeat(256);
    await page.fill('#form-flow-name', overMaxName);
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('文字数');
  });

  // SCEN-175
  test("[edge] 承認ルート設定画面 - 承認ステップ最大数制限", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '最大ステップテスト');
    
    for (let i = 1; i <= 10; i++) {
      await page.click('#btn-add-step');
      await page.fill('#approver-search', `承認者${i}`);
      await page.click('#btn-modal-select');
    }
    
    await page.click('#btn-add-step');
    await expect(page.locator('#error-message')).toContainText('最大');
  });

  // SCEN-176
  test("[edge] 承認ルート設定画面 - 承認期限最小値設定", async ({ page }) => {
    await page.click('#btn-new-route');
    await page.fill('#form-flow-name', '最小期限テスト');
    await page.selectOption('#form-document-type', { value: '一般申請' });
    await page.click('#btn-add-step');
    await page.fill('#approver-search', '承認者');
    await page.click('#btn-modal-select');
    await page.fill('#form-deadline', '1');
    await page.click('#btn-save');
    await expect(page.locator('#form-deadline')).toHaveValue('1');
  });

  // SCEN-177
  test("[edge] 承認ルート設定画面 - 全承認者削除後の状態", async ({ page }) => {
    await page.click('#routes-tbody tr:first-child');
    await page.locator('#approval-steps .approval-step').first().locator('button:has-text("削除")').click();
    await page.click('button:has-text("削除")');
    
    const remainingSteps = page.locator('#approval-steps .approval-step');
    if (await remainingSteps.count() > 0) {
      for (let i = await remainingSteps.count() - 1; i >= 0; i--) {
        await remainingSteps.nth(i).locator('button:has-text("削除")').click();
        await page.click('button:has-text("削除")');
      }
    }
    
    await expect(page.locator('#approval-steps')).toContainText('承認者が設定されていません');
    await page.click('#btn-save');
    await expect(page.locator('#error-message')).toContainText('最低1名の承認者を設定してください');
  });
});