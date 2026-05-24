import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("業務負荷を考慮した適切なタイミングで承認者への通知が送信される", () => {
    // SCEN-468

    // 高優先度案件で業務負荷が通常レベルの場合は即座に通知
    const highPriorityApp = { 
      id: "APP-001", 
      priority: "high", 
      createdAt: new Date("2024-01-01T09:00:00Z") 
    };
    const currentTime = new Date("2024-01-02T10:00:00Z");
    const lastNotification = new Date("2024-01-01T09:00:00Z");
    
    let result = determineNotificationTiming(
      [highPriorityApp], 
      60, 
      lastNotification, 
      "high"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(currentTime);
    expect(result.notificationFrequency).toBe("immediate");

    // 中優先度案件で業務負荷が通常レベルの場合は1時間後に通知
    const mediumPriorityApp = { 
      id: "APP-002", 
      priority: "medium", 
      createdAt: new Date("2024-01-01T09:00:00Z") 
    };
    
    result = determineNotificationTiming(
      [mediumPriorityApp], 
      60, 
      lastNotification, 
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    const expectedNextTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    expect(result.nextNotificationTime).toEqual(expectedNextTime);
    expect(result.notificationFrequency).toBe("60minutes");

    // 低優先度案件で業務負荷が通常レベルの場合は3時間後に通知
    result = determineNotificationTiming(
      [{ id: "APP-003", priority: "low", createdAt: new Date("2024-01-01T09:00:00Z") }], 
      60, 
      lastNotification, 
      "low"
    );
    
    const expectedNextTimeLow = new Date(currentTime.getTime() + 180 * 60 * 1000);
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(expectedNextTimeLow);
    expect(result.notificationFrequency).toBe("180minutes");

    // 業務負荷が80%を超えている場合は通知頻度を半分に調整
    result = determineNotificationTiming(
      [mediumPriorityApp], 
      90, 
      lastNotification, 
      "medium"
    );
    
    const expectedAdjustedTime = new Date(currentTime.getTime() + 120 * 60 * 1000);
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(expectedAdjustedTime);
    expect(result.notificationFrequency).toBe("120minutes");

    // 最後の通知から30分以内で緊急案件以外の場合は通知を抑制
    const recentNotification = new Date(currentTime.getTime() - 20 * 60 * 1000);
    result = determineNotificationTiming(
      [mediumPriorityApp], 
      60, 
      recentNotification, 
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(false);

    // 承認遅延が24時間を超えた案件は優先度に関係なく即座に催促通知
    const delayedApp = { 
      id: "APP-004", 
      priority: "low", 
      createdAt: new Date("2024-01-01T09:00:00Z") 
    };
    const currentTimeDelayed = new Date("2024-01-02T10:00:00Z");
    
    result = determineNotificationTiming(
      [delayedApp], 
      60, 
      lastNotification, 
      "low"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(currentTimeDelayed);
    expect(result.notificationFrequency).toBe("immediate");
  });
});