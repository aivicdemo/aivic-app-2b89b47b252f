import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者通知タイミング制御 - 業務負荷を考慮した適切なタイミングで通知が送信される", () => {
    // SCEN-468
    const pendingApplications = [
      { priority: "high", createdAt: new Date("2024-01-15T09:00:00Z") },
      { priority: "medium", createdAt: new Date("2024-01-15T10:00:00Z") }
    ];
    const approverWorkload = 85;
    const lastNotificationTime = new Date("2024-01-15T10:30:00Z");
    const applicationPriority = "medium";

    const result = determineNotificationTiming(
      pendingApplications,
      approverWorkload,
      lastNotificationTime,
      applicationPriority
    );

    expect(result.shouldSendNotification).toBe(true);
    expect(result.nextNotificationTime).toEqual(new Date("2024-01-15T13:30:00Z"));
    expect(result.notificationFrequency).toBe("120minutes");
  });
});