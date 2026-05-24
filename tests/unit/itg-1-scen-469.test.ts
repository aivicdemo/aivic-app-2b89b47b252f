import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者への通知タイミングが業務負荷と緊急度に基づいて制御され、過度な通知頻度が制限される", () => {
    // SCEN-469
    const currentTime = new Date("2024-01-15T10:00:00Z");
    const lastNotificationTime = new Date("2024-01-15T09:45:00Z");

    // 高優先度案件で通知後30分未満の場合（通常は抑制されるが緊急案件は通知される）
    const urgentApplication = {
      id: "APP001",
      priority: "high",
      createdAt: new Date("2024-01-14T10:00:00Z")
    };
    const pendingApplicationsUrgent = [urgentApplication];
    
    const result1 = determineNotificationTiming(
      pendingApplicationsUrgent,
      50,
      lastNotificationTime,
      "high"
    );
    
    // 緊急案件で24時間超過のため即座に通知
    expect(result1.shouldSendNotification).toBe(true);
    expect(result1.notificationFrequency).toBe("immediate");
    
    // 中優先度案件で30分経過後
    const lastNotificationTime2 = new Date("2024-01-15T09:15:00Z");
    const mediumApplication = {
      id: "APP002", 
      priority: "medium",
      createdAt: new Date("2024-01-15T08:00:00Z")
    };
    const pendingApplicationsMedium = [mediumApplication];
    
    const result2 = determineNotificationTiming(
      pendingApplicationsMedium,
      40,
      lastNotificationTime2,
      "medium"
    );
    
    // 中優先度は60分間隔、業務負荷80%未満なので調整なし
    expect(result2.shouldSendNotification).toBe(true);
    expect(result2.notificationFrequency).toBe("60minutes");
    expect(result2.nextNotificationTime).toEqual(new Date("2024-01-15T11:00:00Z"));
    
    // 業務負荷が高い場合の頻度調整
    const result3 = determineNotificationTiming(
      pendingApplicationsMedium,
      85,
      lastNotificationTime2,
      "medium"
    );
    
    // 業務負荷80%超のため通知頻度を半分に調整（60分→120分）
    expect(result3.notificationFrequency).toBe("120minutes");
    expect(result3.nextNotificationTime).toEqual(new Date("2024-01-15T12:00:00Z"));
    
    // 低優先度案件での通知抑制
    const recentNotification = new Date("2024-01-15T09:50:00Z");
    const lowApplication = {
      id: "APP003",
      priority: "low", 
      createdAt: new Date("2024-01-15T09:00:00Z")
    };
    const pendingApplicationsLow = [lowApplication];
    
    const result4 = determineNotificationTiming(
      pendingApplicationsLow,
      30,
      recentNotification,
      "low"
    );
    
    // 最後の通知から10分しか経過しておらず、緊急案件でもないため通知抑制
    expect(result4.shouldSendNotification).toBe(false);
    expect(result4.notificationFrequency).toBe("180minutes");
  });
});