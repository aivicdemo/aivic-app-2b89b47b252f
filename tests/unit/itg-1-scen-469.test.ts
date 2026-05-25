import { determineNotificationTiming } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-469: [normal] 承認者通知タイミング制御 - 過度な通知頻度が制限される", () => {
    // 承認待ち案件のモックデータ（優先度付き）
    const pendingApplications = [
      { priority: "high", createdAt: new Date("2024-01-15T10:00:00Z") },
      { priority: "medium", createdAt: new Date("2024-01-15T11:00:00Z") },
      { priority: "low", createdAt: new Date("2024-01-15T12:00:00Z") }
    ];

    // 承認者の業務負荷レベル（80%超で高負荷）
    const approverWorkload = 85;

    // 最後の通知送信時刻（30分以内の場合は抑制される）
    const lastNotificationTime = new Date("2024-01-15T13:45:00Z");

    // 申請案件の優先度（高優先度案件は即座通知）
    const applicationPriority = "high";

    const result = determineNotificationTiming(
      pendingApplications,
      approverWorkload,
      lastNotificationTime,
      applicationPriority
    );

    // 高優先度で24時間超過案件があるため通知すべき
    expect(result.shouldSendNotification).toBe(true);

    // 次回通知時刻が計算されている（現在時刻から基準頻度後）
    expect(result.nextNotificationTime).toEqual(new Date("2024-01-15T14:15:00Z"));

    // 高優先度は即座通知だが業務負荷により調整される
    expect(result.notificationFrequency).toBe("immediate");
  });
});