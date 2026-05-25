import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-436: 複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    // 複数の緊急案件データを準備
    const applicationData = {
      id: "APP-001",
      title: "災害復旧設備導入申請",
      approvalRoute: ["section_chief", "department_head", "director"]
    };

    const urgencyFlag = true;
    const deadlineDate = new Date("2024-01-18T17:00:00Z"); // 3日後の期限
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    const currentApprovalQueue = [
      { id: "APP-002", priority: 2, createdAt: new Date("2024-01-14T14:00:00Z") },
      { id: "APP-003", priority: 1, createdAt: new Date("2024-01-13T09:00:00Z") }
    ];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    // 緊急案件として最高優先度が設定される
    expect(result.priorityLevel).toBe(1);
    
    // 承認キューの最前列に配置される
    expect(result.queuePosition).toBe(0);
    
    // 承認ルートの全員に通知される
    expect(result.notificationTargets).toEqual(["section_chief", "department_head", "director"]);
    
    // 24時間以内の処理期限が設定される
    const expectedDeadline = new Date("2024-01-16T10:00:00Z");
    expect(result.processingDeadline).toEqual(expectedDeadline);
  });
});