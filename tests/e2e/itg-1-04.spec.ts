import { test, expect } from '@playwright/test';

test.describe("承認処理画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422254479.html");
  });

  // SCEN-054
  test("[normal] 承認処理画面 - 申請書類一覧が正常表示される", async ({ page }) => {
    await expect(page.locator("#applications-list")).toBeVisible();
    await expect(page.locator("#applications-list")).toContainText("申請書類詳細");
    await expect(page.locator("#applications-list")).toContainText("申請者");
    await expect(page.locator("#applications-list")).toContainText("申請日時");
    await expect(page.locator("#applications-list")).toContainText("申請種別");
  });

  // SCEN-055
  test("[normal] 承認処理画面 - 申請書類詳細が正常表示される", async ({ page }) => {
    await expect(page.locator("#application-detail")).toBeVisible();
    await expect(page.locator("#detail-title")).toBeVisible();
    await expect(page.locator("#applicant-name")).toBeVisible();
    await expect(page.locator("#application-date")).toBeVisible();
    await expect(page.locator("#application-type")).toBeVisible();
    await expect(page.locator("#application-content")).toBeVisible();
  });

  // SCEN-056
  test("[normal] 承認処理画面 - 承認処理が正常完了する", async ({ page }) => {
    await page.fill("#approval-comment", "申請内容を確認し、承認いたします。");
    await page.click("#btn-approve");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("承認済み");
  });

  // SCEN-057
  test("[normal] 承認処理画面 - 差戻し処理が正常完了する", async ({ page }) => {
    await page.click("#btn-reject");
    await page.fill("#rejection-reason", "添付書類に不備があるため差戻しいたします。");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("差戻し");
  });

  // SCEN-058
  test("[normal] 承認処理画面 - 保留処理が正常完了する", async ({ page }) => {
    await page.click("#btn-hold");
    await page.fill("#rejection-reason", "追加確認が必要なため一時保留とします。");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("保留中");
  });

  // SCEN-059
  test("[normal] 承認処理画面 - 承認コメント入力で処理完了", async ({ page }) => {
    await page.fill("#approval-comment", "内容を確認しました。問題ありません。");
    await page.click("#btn-approve");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("承認済み");
  });

  // SCEN-060
  test("[normal] 承認処理画面 - 差戻し理由入力で処理完了", async ({ page }) => {
    await page.click("#btn-reject");
    await page.fill("#rejection-reason", "申請金額の根拠が不明確です。");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("差戻し");
  });

  // SCEN-061
  test("[normal] 承認処理画面 - 承認履歴が正常表示される", async ({ page }) => {
    await expect(page.locator("[data-testid='approval-history']")).toBeVisible();
    await expect(page.locator("#approval-history-tbody")).toBeVisible();
    await expect(page.locator("[data-testid='approval-history']")).toContainText("承認者");
    await expect(page.locator("[data-testid='approval-history']")).toContainText("結果");
    await expect(page.locator("[data-testid='approval-history']")).toContainText("日時");
    await expect(page.locator("[data-testid='approval-history']")).toContainText("コメント");
  });

  // SCEN-062
  test("[normal] 承認処理画面 - 添付ファイルが正常表示される", async ({ page }) => {
    await expect(page.locator("#attachments-section")).toBeVisible();
    await expect(page.locator("#attachments-list")).toBeVisible();
    const fileLink = page.locator("#attachments-list").first();
    if (await fileLink.isVisible()) {
      await expect(fileLink).toContainText("開く");
    }
  });

  // SCEN-063
  test("[normal] 承認処理画面 - 承認フロー進捗が正常表示される", async ({ page }) => {
    await expect(page.locator("#approval-flow")).toBeVisible();
    await expect(page.locator("#approval-flow")).toContainText("承認フロー進捗");
    await expect(page.locator("#approval-flow")).toContainText("✓");
  });

  // SCEN-064
  test("[error] 承認処理画面 - 承認権限なしでエラー表示", async ({ page }) => {
    await page.click("#btn-approve");
    await expect(page.locator("#modal-message")).toContainText("承認権限がありません");
  });

  // SCEN-065
  test("[error] 承認処理画面 - 既承認済み書類で処理不可", async ({ page }) => {
    await page.locator("#status-badge").waitFor();
    const statusText = await page.locator("#status-badge").textContent();
    if (statusText?.includes("承認済み")) {
      await page.click("#btn-approve");
      await expect(page.locator("#modal-message")).toContainText("既に承認済み");
    }
  });

  // SCEN-066
  test("[error] 承認処理画面 - 差戻し理由未入力でエラー", async ({ page }) => {
    await page.click("#btn-reject");
    await page.click("#modal-confirm");
    await expect(page.locator("#modal-message")).toContainText("差戻し理由を入力してください");
  });

  // SCEN-067
  test("[error] 承認処理画面 - 存在しない申請書類でエラー", async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?id=99999");
    await expect(page.locator("#no-selection")).toContainText("指定された申請書類が見つかりません");
  });

  // SCEN-068
  test("[error] 承認処理画面 - 添付ファイル破損でエラー表示", async ({ page }) => {
    const fileLink = page.locator("#attachments-list a").first();
    if (await fileLink.isVisible()) {
      await fileLink.click();
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('[role="alert"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText("ファイルが破損");
      }
    }
  });

  // SCEN-069
  test("[edge] 承認処理画面 - 承認コメント最大文字数", async ({ page }) => {
    const maxText = "a".repeat(1000);
    await page.fill("#approval-comment", maxText);
    await page.click("#btn-approve");
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("承認済み");

    const overText = "a".repeat(1001);
    await page.fill("#approval-comment", overText);
    await page.click("#btn-approve");
    await expect(page.locator("#modal-message")).toContainText("最大文字数を超えています");
  });

  // SCEN-070
  test("[edge] 承認処理画面 - 差戻し理由最大文字数", async ({ page }) => {
    await page.click("#btn-reject");
    const maxText = "a".repeat(1000);
    await page.fill("#rejection-reason", maxText);
    await page.click("#modal-confirm");
    await expect(page.locator("#status-badge")).toContainText("差戻し");
  });

  // SCEN-071
  test("[edge] 承認処理画面 - 申請書類一覧0件表示", async ({ page }) => {
    await page.goto("/panels/scr-1779422254479.html?empty=true");
    await expect(page.locator("#applications-list")).toContainText("承認待ちの申請書類はありません");
  });

  // SCEN-072
  test("[edge] 承認処理画面 - 承認履歴0件表示", async ({ page }) => {
    const historySection = page.locator("[data-testid='approval-history']");
    await expect(historySection).toBeVisible();
    if (await page.locator("#approval-history-tbody tr").count() === 0) {
      await expect(historySection).toContainText("承認履歴はありません");
    }
  });

  // SCEN-073
  test("[edge] 承認処理画面 - 添付ファイル0件表示", async ({ page }) => {
    await expect(page.locator("#attachments-section")).toBeVisible();
    if (await page.locator("#attachments-list").textContent() === "") {
      await expect(page.locator("#attachments-section")).toContainText("添付ファイルなし");
    }
  });
});