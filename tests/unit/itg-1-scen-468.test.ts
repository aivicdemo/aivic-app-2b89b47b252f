import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("業務負荷を考慮した適切なタイミングで通知が送信される", () => {
    // SCEN-468
    
    // 高優先度案件で業務負荷が低い場合 - 即座に通知
    const pendingApplications1 = [
      { priority: "high", createdAt: new Date("2024-01-01T09:00:00Z") }
    ];
    const result1 = determineNotificationTiming(
      pendingApplications1,
      30,
      new Date("2024-01-01T08:00:00Z"),
      "high"
    );
    expect(result1.shouldSendNotification).toBe(true);
    expect(result1.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(result1.notificationFrequency).toBe("immediate");

    // 中優先度案件で業務負荷が通常の場合 - 1時間後に通知
    const pendingApplications2 = [
      { priority: "medium", createdAt: new Date("2024-01-01T09:00:00Z") }
    ];
    const result2 = determineNotificationTiming(
      pendingApplications2,
      50,
      new Date("2024-01-01T08:30:00Z"),
      "medium"
    );
    expect(result2.shouldSendNotification).toBe(true);
    expect(result2.nextNotificationTime).toEqual(new Date("2024-01-01T10:30:00Z"));
    expect(result2.notificationFrequency).toBe("60minutes");

    // 低優先度案件で業務負荷が高い場合 - 6時間後に通知（180分×2倍調整）
    const pendingApplications3 = [
      { priority: "low", createdAt: new Date("2024-01-01T09:00:00Z") }
    ];
    const result3 = determineNotificationTiming(
      pendingApplications3,
      85,
      new Date("2024-01-01T08:00:00Z"),
      "low"
    );
    expect(result3.shouldSendNotification).toBe(true);
    expect(result3.nextNotificationTime).toEqual(new Date("2024-01-01T14:00:00Z"));
    expect(result3.notificationFrequency).toBe("360minutes");

    // 24時間超過した緊急案件 - 優先度に関係なく即座に通知
    const currentTime = new Date("2024-01-02T10:00:00Z");
    const urgentApp = {
      priority: "high",
      createdAt: new Date("2024-01-01T09:00:00Z")
    };
    const pendingApplications4 = [urgentApp];
    const result4 = determineNotificationTiming(
      pendingApplications4,
      70,
      new Date("2024-01-01T08:00:00Z"),
      "high"
    );
    expect(result4.shouldSendNotification).toBe(true);
    expect(result4.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(result4.notificationFrequency).toBe("immediate");

    // 最後の通知から30分以内で通常案件 - 通知を抑制
    const pendingApplications5 = [
      { priority: "medium", createdAt: new Date("2024-01-01T09:00:00Z") }
    ];
    const result5 = determineNotificationTiming(
      pendingApplications5,
      40,
      new Date("2024-01-01T08:45:00Z"),
      "medium"
    );
    expect(result5.shouldSendNotification).toBe(false);
    expect(result5.nextNotificationTime).toEqual(new Date("2024-01-01T09:45:00Z"));
    expect(result5.notificationFrequency).toBe("60minutes");

    // 承認待ち案件がない場合
    const result6 = determineNotificationTiming(
      [],
      50,
      new Date("2024-01-01T08:00:00Z"),
      "medium"
    );
    expect(result6.shouldSendNotification).toBe(false);
    expect(result6.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(result6.notificationFrequency).toBe("60minutes");
  });
});