import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通知タイミング設定が無効な場合、エラーが発生する", () => {
    // SCEN-470

    const pendingApplications = [
      { id: "app1", priority: "high", createdAt: new Date("2024-01-01T09:00:00.000Z") }
    ];
    const approverWorkload = 50;
    const lastNotificationTime = new Date("2024-01-01T10:00:00.000Z");
    const applicationPriority = "";

    expect(() => determineNotificationTiming(
      pendingApplications,
      approverWorkload,
      lastNotificationTime,
      applicationPriority
    )).toThrow("優先度が未設定の案件は中優先度として処理されます");

    // 承認待ち案件が空の場合
    expect(() => determineNotificationTiming(
      [],
      approverWorkload,
      lastNotificationTime,
      "high"
    )).toThrow("承認待ち案件がないため通知は送信されません");

    // 業務負荷レベルが範囲外の場合
    expect(() => determineNotificationTiming(
      pendingApplications,
      150,
      lastNotificationTime,
      "high"
    )).toThrow("業務負荷レベルは0から100の範囲で設定してください");

    expect(() => determineNotificationTiming(
      pendingApplications,
      -10,
      lastNotificationTime,
      "high"
    )).toThrow("業務負荷レベルは0から100の範囲で設定してください");
  });
});