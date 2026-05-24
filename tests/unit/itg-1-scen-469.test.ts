import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者への通知タイミングが業務負荷と緊急度に応じて適切に制御される", () => {
    // SCEN-469
    
    // 高優先度案件で業務負荷が高い場合の通知制御
    const highPriorityApplications = [
      { priority: "high", createdAt: new Date("2024-01-01T09:00:00Z") }
    ];
    const highWorkload = 85;
    const lastNotification = new Date("2024-01-01T09:15:00Z");
    
    const result1 = determineNotificationTiming(
      highPriorityApplications,
      highWorkload,
      lastNotification,
      "high"
    );
    
    // 高優先度は即座通知だが、高負荷時は頻度調整
    expect(result1.shouldSendNotification).toBe(true);
    expect(result1.notificationFrequency).toBe("immediate");
    expect(result1.nextNotificationTime).toEqual(new Date("2024-01-01T09:15:00Z"));
    
    // 中優先度案件で通常負荷の場合
    const mediumPriorityApplications = [
      { priority: "medium", createdAt: new Date("2024-01-01T08:00:00Z") }
    ];
    const normalWorkload = 50;
    const lastNotificationMedium = new Date("2024-01-01T08:00:00Z");
    
    const result2 = determineNotificationTiming(
      mediumPriorityApplications,
      normalWorkload,
      lastNotificationMedium,
      "medium"
    );
    
    // 中優先度は1時間後通知
    expect(result2.shouldSendNotification).toBe(true);
    expect(result2.notificationFrequency).toBe("60minutes");
    expect(result2.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    
    // 低優先度案件で高負荷時の頻度抑制
    const lowPriorityApplications = [
      { priority: "low", createdAt: new Date("2024-01-01T06:00:00Z") }
    ];
    const veryHighWorkload = 90;
    const lastNotificationLow = new Date("2024-01-01T06:00:00Z");
    
    const result3 = determineNotificationTiming(
      lowPriorityApplications,
      veryHighWorkload,
      lastNotificationLow,
      "low"
    );
    
    // 低優先度は通常3時間後だが、高負荷時は頻度を半分に調整（270分 = 180 * 1.5）
    expect(result3.shouldSendNotification).toBe(true);
    expect(result3.notificationFrequency).toBe("270minutes");
    expect(result3.nextNotificationTime).toEqual(new Date("2024-01-01T10:30:00Z"));
    
    // 最後の通知から30分以内の場合の通知抑制
    const recentNotification = new Date("2024-01-01T09:45:00Z");
    const currentTime = new Date("2024-01-01T10:00:00Z");
    
    const result4 = determineNotificationTiming(
      mediumPriorityApplications,
      normalWorkload,
      recentNotification,
      "medium"
    );
    
    // 30分以内は緊急案件以外通知抑制
    expect(result4.shouldSendNotification).toBe(false);
    expect(result4.notificationFrequency).toBe("60minutes");
    expect(result4.nextNotificationTime).toEqual(new Date("2024-01-01T10:00:00Z"));
  });
});