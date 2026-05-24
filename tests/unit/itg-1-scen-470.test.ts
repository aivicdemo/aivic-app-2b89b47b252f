import { determineNotificationTiming } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通知タイミング設定が無効な場合、エラーが発生する", () => {
    // SCEN-470

    // 正常なケース: 緊急案件がある場合の即座通知
    const pendingApplicationsWithUrgent = [
      { priority: "high", createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) } // 25時間前作成
    ];
    const lastNotificationTime = new Date(Date.now() - 60 * 60 * 1000); // 1時間前
    const result1 = determineNotificationTiming(
      pendingApplicationsWithUrgent,
      50,
      lastNotificationTime,
      "high"
    );
    expect(result1.shouldSendNotification).toBe(true);
    expect(result1.nextNotificationTime).toEqual(new Date(Date.now()));
    expect(result1.notificationFrequency).toBe("immediate");

    // 正常なケース: 中優先度で業務負荷が高い場合の頻度調整
    const pendingApplicationsMedium = [
      { priority: "medium", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    ];
    const result2 = determineNotificationTiming(
      pendingApplicationsMedium,
      90, // 業務負荷80%超過
      new Date(Date.now() - 2 * 60 * 60 * 1000),
      "medium"
    );
    expect(result2.shouldSendNotification).toBe(true);
    const expectedDelay = 60 * 2; // 基本60分 × 2倍調整
    const expectedTime = new Date(Date.now() + expectedDelay * 60 * 1000);
    expect(result2.nextNotificationTime).toEqual(expectedTime);
    expect(result2.notificationFrequency).toBe("120minutes");

    // エラーケース: 承認待ち案件一覧が空の場合
    expect(() => determineNotificationTiming(
      [],
      50,
      new Date(),
      "medium"
    )).not.toThrow(); // ignoreなので例外は発生しない

    // エラーケース: 業務負荷レベルが0未満の場合
    expect(() => determineNotificationTiming(
      pendingApplicationsMedium,
      -10,
      new Date(),
      "medium"
    )).toThrow("業務負荷レベルは0から100の範囲で設定してください");

    // エラーケース: 業務負荷レベルが100を超える場合
    expect(() => determineNotificationTiming(
      pendingApplicationsMedium,
      150,
      new Date(),
      "medium"
    )).toThrow("業務負荷レベルは0から100の範囲で設定してください");

    // 警告ケース: 優先度が未設定の場合
    const pendingApplicationsUndefined = [
      { priority: undefined, createdAt: new Date(Date.now() - 60 * 60 * 1000) }
    ];
    const result3 = determineNotificationTiming(
      pendingApplicationsUndefined,
      50,
      new Date(Date.now() - 2 * 60 * 60 * 1000),
      undefined
    );
    // 中優先度として処理される
    expect(result3.shouldSendNotification).toBe(true);
    expect(result3.notificationFrequency).toBe("60minutes");

    // 通知抑制ケース: 30分以内の通常案件
    const result4 = determineNotificationTiming(
      [{ priority: "low", createdAt: new Date(Date.now() - 60 * 60 * 1000) }],
      30,
      new Date(Date.now() - 15 * 60 * 1000), // 15分前
      "low"
    );
    expect(result4.shouldSendNotification).toBe(false);
  });
});