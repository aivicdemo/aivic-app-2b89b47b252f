import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者の業務負荷と緊急度に応じて適切なタイミングで通知を送信する", () => {
    // SCEN-468

    // 高優先度案件で業務負荷が低い場合（即座に通知）
    const highPriorityLowLoad = determineNotificationTiming(
      [{ id: "app001", priority: "high", createdAt: new Date("2024-01-01T10:00:00Z") }],
      30,
      new Date("2024-01-01T08:00:00Z"),
      "high"
    );
    expect(highPriorityLowLoad.shouldSendNotification).toBe(true);
    expect(highPriorityLowLoad.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(highPriorityLowLoad.notificationFrequency).toBe("immediate");

    // 中優先度案件で業務負荷が標準の場合（1時間後）
    const mediumPriorityStandardLoad = determineNotificationTiming(
      [{ id: "app002", priority: "medium", createdAt: new Date("2024-01-01T10:00:00Z") }],
      50,
      new Date("2024-01-01T08:00:00Z"),
      "medium"
    );
    expect(mediumPriorityStandardLoad.shouldSendNotification).toBe(true);
    expect(mediumPriorityStandardLoad.nextNotificationTime).toEqual(new Date("2024-01-01T10:00:00Z"));
    expect(mediumPriorityStandardLoad.notificationFrequency).toBe("60minutes");

    // 業務負荷が80%超の場合（通知頻度を半分に調整）
    const highLoad = determineNotificationTiming(
      [{ id: "app003", priority: "medium", createdAt: new Date("2024-01-01T10:00:00Z") }],
      85,
      new Date("2024-01-01T08:00:00Z"),
      "medium"
    );
    expect(highLoad.shouldSendNotification).toBe(true);
    expect(highLoad.nextNotificationTime).toEqual(new Date("2024-01-01T11:00:00Z"));
    expect(highLoad.notificationFrequency).toBe("120minutes");

    // 最後の通知から30分以内で通常案件の場合（通知抑制）
    const recentNotification = determineNotificationTiming(
      [{ id: "app004", priority: "low", createdAt: new Date("2024-01-01T10:00:00Z") }],
      40,
      new Date("2024-01-01T08:45:00Z"),
      "low"
    );
    expect(recentNotification.shouldSendNotification).toBe(false);
    expect(recentNotification.nextNotificationTime).toEqual(new Date("2024-01-01T12:15:00Z"));
    expect(recentNotification.notificationFrequency).toBe("180minutes");

    // 24時間を超えた遅延案件（優先度に関係なく即座に通知）
    const delayedCase = determineNotificationTiming(
      [{ id: "app005", priority: "low", createdAt: new Date("2024-01-01T08:00:00Z") }],
      70,
      new Date("2024-01-01T06:00:00Z"),
      "low"
    );
    expect(delayedCase.shouldSendNotification).toBe(true);
    expect(delayedCase.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(delayedCase.notificationFrequency).toBe("immediate");

    // 承認待ち案件が空の場合
    const noPendingApplications = determineNotificationTiming(
      [],
      50,
      new Date("2024-01-01T08:00:00Z"),
      "medium"
    );
    expect(noPendingApplications.shouldSendNotification).toBe(false);
    expect(noPendingApplications.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00Z"));
    expect(noPendingApplications.notificationFrequency).toBe("60minutes");
  });
});