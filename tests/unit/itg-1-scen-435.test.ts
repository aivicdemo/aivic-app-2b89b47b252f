import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急フラグが設定された案件が最優先で処理される", () => {
    // SCEN-435
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 緊急フラグ設定済み案件
    const applicationData = {
      id: "APP-001",
      title: "緊急設備導入申請",
      content: "災害対応のための緊急設備導入が必要です",
      approvalRoute: ["部長", "事務局長", "理事"]
    };
    
    const urgencyFlag = true;
    const deadlineDate = new Date("2024-01-20T23:59:59Z");
    const currentApprovalQueue = [
      { id: "APP-002", priority: 3, createdAt: new Date("2024-01-14T09:00:00Z") },
      { id: "APP-003", priority: 2, createdAt: new Date("2024-01-13T14:00:00Z") }
    ];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["部長", "事務局長", "理事"]);
    expect(result.processingDeadline).toEqual(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));

    // 通常案件（緊急フラグなし、期限まで余裕あり）
    const normalApplicationData = {
      id: "APP-004",
      title: "一般備品購入申請",
      content: "通常の備品購入申請です",
      approvalRoute: ["課長"]
    };

    const normalResult = processUrgentApplicationPriority(
      normalApplicationData,
      false,
      new Date("2024-01-25T23:59:59Z"),
      currentApprovalQueue
    );

    expect(normalResult.priorityLevel).toBeGreaterThan(1);
    expect(normalResult.queuePosition).toBe(2);
    expect(normalResult.notificationTargets).toEqual(["課長"]);

    // 期限切迫案件（緊急フラグなし、期限3日以内）
    const urgentByDeadlineData = {
      id: "APP-005",
      title: "期限間近申請",
      content: "期限が迫っている申請です",
      approvalRoute: ["部長", "事務局長"]
    };

    const urgentByDeadlineResult = processUrgentApplicationPriority(
      urgentByDeadlineData,
      false,
      new Date("2024-01-17T23:59:59Z"),
      currentApprovalQueue
    );

    expect(urgentByDeadlineResult.priorityLevel).toBe(1);
    expect(urgentByDeadlineResult.queuePosition).toBe(0);
    expect(urgentByDeadlineResult.notificationTargets).toEqual(["部長", "事務局長"]);
  });
});