import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急案件処理 - 複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    // SCEN-436
    
    // 緊急フラグが設定された案件（災害対応）
    const urgentApplication1 = {
      id: "app001",
      title: "災害対応緊急申請",
      priority: "high",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      approvalRoute: ["課長", "部長", "事務局長"]
    };
    
    // 期限切迫案件（2日以内）
    const currentDate = new Date("2024-01-15T14:00:00Z");
    const deadlineDate = new Date("2024-01-16T17:00:00Z"); // 1日後
    
    const result = processUrgentApplicationPriority(
      urgentApplication1,
      true,
      deadlineDate,
      []
    );
    
    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["課長", "部長", "事務局長"]);
    expect(result.processingDeadline).toEqual(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    
    // 通常案件（期限まで余裕がある）
    const normalApplication = {
      id: "app002", 
      title: "通常申請",
      priority: "medium",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      approvalRoute: ["課長"]
    };
    
    const normalDeadlineDate = new Date("2024-01-25T17:00:00Z"); // 10日後
    
    const normalResult = processUrgentApplicationPriority(
      normalApplication,
      false,
      normalDeadlineDate,
      [urgentApplication1]
    );
    
    expect(normalResult.priorityLevel).toBeGreaterThan(1);
    expect(normalResult.queuePosition).toBe(1);
    expect(normalResult.notificationTargets).toEqual(["課長"]);
  });
});