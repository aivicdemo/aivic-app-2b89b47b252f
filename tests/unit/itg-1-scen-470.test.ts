import { determineNotificationTiming } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者通知タイミング制御 - 通知タイミング設定が無効な場合、エラーが発生する", () => {
    // SCEN-470
    
    const pendingApplications = [
      { id: "APP001", priority: "high", createdAt: new Date("2024-01-01T09:00:00") }
    ];
    const approverWorkload = 50;
    const lastNotificationTime = new Date("2024-01-01T08:00:00");
    
    // 無効な優先度設定（undefined）でエラーが発生することを確認
    expect(() => {
      determineNotificationTiming(
        pendingApplications,
        approverWorkload,
        lastNotificationTime,
        undefined as any
      );
    }).toThrow("優先度が未設定の案件は中優先度として処理されます");
    
    // 空の申請案件リストでの処理確認
    const result1 = determineNotificationTiming(
      [],
      50,
      lastNotificationTime,
      "medium"
    );
    expect(result1.shouldSendNotification).toBe(false);
    expect(result1.notificationFrequency).toBe("180minutes");
    
    // 高優先度案件で即座通知の確認
    const result2 = determineNotificationTiming(
      pendingApplications,
      30,
      new Date("2024-01-01T07:00:00"),
      "high"
    );
    expect(result2.shouldSendNotification).toBe(true);
    expect(result2.notificationFrequency).toBe("immediate");
    expect(result2.nextNotificationTime).toEqual(new Date("2024-01-01T09:00:00"));
    
    // 高負荷時の通知頻度調整確認
    const result3 = determineNotificationTiming(
      [{ id: "APP002", priority: "medium", createdAt: new Date("2024-01-01T08:00:00") }],
      90,
      new Date("2024-01-01T07:00:00"),
      "medium"
    );
    expect(result3.shouldSendNotification).toBe(true);
    expect(result3.notificationFrequency).toBe("120minutes");
    expect(result3.nextNotificationTime).toEqual(new Date("2024-01-01T11:00:00"));
  });
});