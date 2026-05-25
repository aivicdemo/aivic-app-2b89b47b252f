import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急フラグが設定された案件が最優先で処理される", () => {
    // SCEN-435
    const applicationData = {
      id: "APP-001",
      title: "災害復旧対応設備申請",
      approvalRoute: ["課長", "部長", "事務局長"],
      createdAt: new Date("2024-01-15T09:00:00Z"),
      priority: "high"
    };
    
    const urgentFlag = true;
    const deadlineDate = new Date("2024-01-20T17:00:00Z");
    const currentApprovalQueue = [
      { id: "APP-002", priority: "medium", createdAt: new Date("2024-01-14T10:00:00Z") },
      { id: "APP-003", priority: "low", createdAt: new Date("2024-01-13T14:00:00Z") }
    ];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgentFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["課長", "部長", "事務局長"]);
    expect(result.processingDeadline).toEqual(new Date("2024-01-16T09:00:00Z"));
  });
});