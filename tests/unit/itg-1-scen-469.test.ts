import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者通知タイミング制御 - 過度な通知頻度が制限される", () => {
    // SCEN-469
    
    // 通常の承認待ち案件（緊急度なし）
    const normalPendingApplications = [
      { id: "app1", priority: "medium", createdAt: new Date(2024, 0, 1, 9, 0) }
    ];
    
    // 最後の通知から30分以内の場合
    const recentNotificationTime = new Date(2024, 0, 1, 10, 0);
    const currentTime = new Date(2024, 0, 1, 10, 20);
    
    let result = determineNotificationTiming(
      normalPendingApplications,
      50, // 適度な業務負荷レベル
      recentNotificationTime,
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(false);
    expect(result.nextNotificationTime).toEqual(new Date(2024, 0, 1, 11, 0));
    expect(result.notificationFrequency).toBe("60minutes");
    
    // 24時間以上遅延した緊急案件がある場合は通知抑制を無視
    const urgentPendingApplications = [
      { id: "app2", priority: "high", createdAt: new Date(2023, 11, 31, 10, 0) }
    ];
    
    result = determineNotificationTiming(
      urgentPendingApplications,
      50,
      recentNotificationTime,
      "high"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(new Date(2024, 0, 1, 10, 20));
    expect(result.notificationFrequency).toBe("immediate");
    
    // 業務負荷が80%を超えている場合の頻度調整
    result = determineNotificationTiming(
      normalPendingApplications,
      90, // 高負荷状態
      new Date(2024, 0, 1, 8, 0), // 2時間前の通知
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(new Date(2024, 0, 1, 12, 20));
    expect(result.notificationFrequency).toBe("120minutes");
  });
});