import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急フラグが設定された案件が最優先で処理される", () => {
    // SCEN-435
    const applicationData = {
      id: "APP001",
      title: "緊急設備修理申請",
      category: "設備関連",
      createdAt: new Date("2024-01-10T09:00:00Z"),
      approvalRoute: ["課長", "部長", "事務局長"]
    };

    const currentDate = new Date("2024-01-10T15:00:00Z");
    const urgencyFlag = true;
    const deadlineDate = new Date("2024-01-15T17:00:00Z");
    const currentApprovalQueue = [
      { id: "APP002", priority: 3 },
      { id: "APP003", priority: 2 }
    ];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["課長", "部長", "事務局長"]);
    expect(result.processingDeadline).toEqual(new Date("2024-01-11T15:00:00Z"));

    // 期限切迫案件のテスト（緊急フラグなしでも3日以内なら緊急扱い）
    const applicationData2 = {
      id: "APP004",
      title: "通常申請",
      category: "一般事務",
      createdAt: new Date("2024-01-09T10:00:00Z"),
      approvalRoute: ["課長"]
    };

    const urgencyFlag2 = false;
    const deadlineDate2 = new Date("2024-01-12T17:00:00Z");

    const result2 = processUrgentApplicationPriority(
      applicationData2,
      urgencyFlag2,
      deadlineDate2,
      currentApprovalQueue
    );

    expect(result2.priorityLevel).toBe(1);
    expect(result2.queuePosition).toBe(0);
    expect(result2.notificationTargets).toEqual(["課長"]);
    expect(result2.processingDeadline).toEqual(new Date("2024-01-11T15:00:00Z"));

    // 通常案件のテスト
    const applicationData3 = {
      id: "APP005",
      title: "通常申請",
      category: "一般事務",
      createdAt: new Date("2024-01-08T10:00:00Z"),
      approvalRoute: ["課長"]
    };

    const urgencyFlag3 = false;
    const deadlineDate3 = new Date("2024-01-25T17:00:00Z");

    const result3 = processUrgentApplicationPriority(
      applicationData3,
      urgencyFlag3,
      deadlineDate3,
      currentApprovalQueue
    );

    expect(result3.priorityLevel).toBe(3);
    expect(result3.queuePosition).toBe(2);
    expect(result3.notificationTargets).toEqual(["課長"]);

    // エラーケース: 提出期限が過去
    expect(() => {
      processUrgentApplicationPriority(
        applicationData,
        false,
        new Date("2024-01-09T17:00:00Z"),
        currentApprovalQueue
      );
    }).toThrow("提出期限は現在日時より未来の日付を設定してください");

    // エラーケース: 承認者が設定されていない
    const applicationDataNoApprovers = {
      id: "APP006",
      title: "承認者なし申請",
      category: "一般事務",
      createdAt: new Date("2024-01-10T09:00:00Z"),
      approvalRoute: []
    };

    expect(() => {
      processUrgentApplicationPriority(
        applicationDataNoApprovers,
        true,
        deadlineDate,
        currentApprovalQueue
      );
    }).toThrow("緊急案件の処理には最低一人の承認者が必要です");
  });
});